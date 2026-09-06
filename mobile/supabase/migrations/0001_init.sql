-- Miroir Rencontre — schéma initial. Projet Supabase dédié, distinct de
-- celui de l'app de tests de personnalité (racine du dépôt) : données
-- plus sensibles (personnalité + vérification + messages), cycle de vie
-- et conformité différents. Voir docs/architecture-app-rencontre.md à la
-- racine du dépôt pour le contexte complet.
--
-- Portée de ce scaffold : le schéma et les RLS ci-dessous couvrent le
-- MVP décrit dans l'architecture. Quelques simplifications sont notées
-- explicitement en commentaire ("TODO durcissement") pour ne pas être
-- oubliées avant mise en production.

create extension if not exists pgcrypto;
create extension if not exists pg_cron;

-- ---------------------------------------------------------------------------
-- profiles : étend auth.users. Contrairement à l'app de tests, pas de
-- compte anonyme ici — l'inscription (email + questionnaire + selfie) est
-- obligatoire avant de pouvoir apparaître dans les suggestions de qui que
-- ce soit.
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  birthdate date,
  gender text,
  seeking text[], -- genres recherchés, ex. {'femme','homme'}
  bio text,
  city text, -- granularité ville seulement, jamais de coordonnées précises stockées
  photos jsonb not null default '[]'::jsonb, -- chemins Storage (bucket privé)
  -- Vecteur de personnalité "courant" dénormalisé ici pour que le batch de
  -- matching (§ plus bas) puisse comparer tous les profils sans jointure
  -- supplémentaire. L'historique complet vit dans personality_vectors.
  personality_version integer not null default 0,
  personality_scores jsonb not null default '{}'::jsonb,
  onboarding_completed_at timestamptz,
  is_active boolean not null default true, -- désactivé si compte suspendu/bloqué en masse
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: select own" on public.profiles
  for select using (auth.uid () = id);

-- La policy "profiles: select visible candidates" (un profil suggéré ou
-- avec qui un match mutuel existe doit être lisible par l'autre partie)
-- est définie plus bas, une fois daily_matches et mutual_likes créées —
-- une policy ne peut référencer que des tables qui existent déjà.

create policy "profiles: update own" on public.profiles
  for update using (auth.uid () = id);

create function public.handle_new_user () returns trigger as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users for each row
  execute procedure public.handle_new_user ();

-- ---------------------------------------------------------------------------
-- verifications : email / selfie / âge. Table d'audit (insert-only côté
-- utilisateur, update réservé à la review) — traçabilité exigée pour la
-- vérification d'âge.
-- ---------------------------------------------------------------------------
create table public.verifications (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null check (type in ('email', 'selfie', 'age')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  evidence_path text, -- chemin Storage du selfie (bucket privé), null pour email/age
  reviewed_by uuid references public.profiles (id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.verifications enable row level security;

create policy "verifications: select own" on public.verifications
  for select using (auth.uid () = user_id);

create policy "verifications: insert own" on public.verifications
  for insert with check (auth.uid () = user_id);

-- ---------------------------------------------------------------------------
-- consents : CGU, traitement de données sensibles (personnalité), et
-- notifications — consentement RGPD distinct du consentement CGU général.
-- ---------------------------------------------------------------------------
create table public.consents (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null check (type in ('cgu', 'data_processing', 'notifications')),
  version text not null,
  accepted_at timestamptz not null default now(),
  unique (user_id, type, version)
);

alter table public.consents enable row level security;

create policy "consents: select own" on public.consents
  for select using (auth.uid () = user_id);

create policy "consents: insert own" on public.consents
  for insert with check (auth.uid () = user_id);

-- ---------------------------------------------------------------------------
-- trait_axes : catalogue des axes de personnalité (constellation). Miroir
-- de mobile/lib/matching/axes.ts — lecture publique, écriture réservée aux
-- migrations (pas de policy insert : modification par migration future
-- uniquement).
-- ---------------------------------------------------------------------------
create table public.trait_axes (
  key text primary key,
  label text not null,
  pole_a text not null,
  pole_b text not null,
  description text not null
);

alter table public.trait_axes enable row level security;

create policy "trait_axes: public read" on public.trait_axes
  for select using (true);

insert into public.trait_axes (key, label, pole_a, pole_b, description) values
  ('humour', 'Humour', 'Sérieux', 'Second degré', 'Ton rapport à la légèreté et à l''ironie au quotidien.'),
  ('energie', 'Énergie sociale', 'Cocooning', 'Grande énergie', 'Ton besoin de sorties et de stimulation sociale.'),
  ('valeurs', 'Rapport aux règles', 'Spontané', 'Structuré', 'Ta façon d''organiser ta vie et tes décisions.'),
  ('ambition', 'Ambition', 'Profiter du présent', 'Tourné vers les objectifs', 'Le poids des projets et de la réussite dans ta vie.'),
  ('attachement', 'Attachement', 'Indépendant', 'Fusionnel', 'Ton besoin de présence et de proximité en couple.'),
  ('ouverture', 'Ouverture', 'Habitudes', 'Nouveauté', 'Ton attrait pour l''inconnu et le changement.'),
  ('stabilite_emotionnelle', 'Expression émotionnelle', 'Calme', 'Intense', 'Ta façon de vivre et d''exprimer tes émotions.');

-- ---------------------------------------------------------------------------
-- onboarding_responses : réponses brutes au questionnaire d'inscription.
-- Conservées pour pouvoir recalculer personality_scores si le barème
-- évolue, sans redemander le questionnaire (voir recompute_profiles()).
-- ---------------------------------------------------------------------------
create table public.onboarding_responses (
  user_id uuid not null references public.profiles (id) on delete cascade,
  question_id text not null,
  option_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, question_id)
);

alter table public.onboarding_responses enable row level security;

create policy "onboarding_responses: select own" on public.onboarding_responses
  for select using (auth.uid () = user_id);

create policy "onboarding_responses: upsert own" on public.onboarding_responses
  for insert with check (auth.uid () = user_id);

create policy "onboarding_responses: update own" on public.onboarding_responses
  for update using (auth.uid () = user_id);

-- ---------------------------------------------------------------------------
-- personality_vectors : historique versionné du vecteur de personnalité.
-- profiles.personality_scores/personality_version reflète toujours la
-- dernière ligne insérée ici pour cet utilisateur (voir set_personality_vector()).
-- ---------------------------------------------------------------------------
create table public.personality_vectors (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references public.profiles (id) on delete cascade,
  version integer not null,
  scores jsonb not null,
  source text not null check (source in ('onboarding', 'recomputed')),
  computed_at timestamptz not null default now(),
  unique (user_id, version)
);

alter table public.personality_vectors enable row level security;

create policy "personality_vectors: select own" on public.personality_vectors
  for select using (auth.uid () = user_id);

-- RPC dédiée plutôt qu'un insert direct + update de profiles séparé : garde
-- les deux écritures atomiques et évite qu'un client écrive une version
-- incohérente avec l'historique.
create function public.set_personality_vector (p_scores jsonb, p_source text)
returns integer as $$
declare
  v_next_version integer;
begin
  select coalesce(max(version), 0) + 1 into v_next_version
  from public.personality_vectors where user_id = auth.uid ();

  insert into public.personality_vectors (user_id, version, scores, source)
  values (auth.uid (), v_next_version, p_scores, p_source);

  update public.profiles
  set personality_version = v_next_version,
      personality_scores = p_scores,
      onboarding_completed_at = coalesce(onboarding_completed_at, now())
  where id = auth.uid ();

  return v_next_version;
end;
$$ language plpgsql security definer set search_path = public;

-- ---------------------------------------------------------------------------
-- daily_matches : suggestions générées par le batch du matin
-- (generate_daily_matches(), voir 0002_matching_batch.sql). Jamais de
-- calcul à l'insertion d'un like/pass — uniquement en lecture ici.
-- ---------------------------------------------------------------------------
create table public.daily_matches (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references public.profiles (id) on delete cascade,
  candidate_id uuid not null references public.profiles (id) on delete cascade,
  batch_date date not null,
  rank integer not null,
  status text not null default 'suggested' check (status in ('suggested', 'viewed', 'liked', 'passed')),
  created_at timestamptz not null default now(),
  unique (user_id, candidate_id, batch_date)
);

alter table public.daily_matches enable row level security;

create policy "daily_matches: select own" on public.daily_matches
  for select using (auth.uid () = user_id);

create policy "daily_matches: update own status" on public.daily_matches
  for update using (auth.uid () = user_id);

-- ---------------------------------------------------------------------------
-- decisions : historique des likes/pass. Le trigger after insert
-- déclenche la détection de match mutuel (mutual_likes).
-- ---------------------------------------------------------------------------
create table public.decisions (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references public.profiles (id) on delete cascade,
  target_id uuid not null references public.profiles (id) on delete cascade,
  decision text not null check (decision in ('liked', 'passed')),
  created_at timestamptz not null default now(),
  unique (user_id, target_id),
  check (user_id <> target_id)
);

alter table public.decisions enable row level security;

create policy "decisions: select own" on public.decisions
  for select using (auth.uid () = user_id);

create policy "decisions: insert own" on public.decisions
  for insert with check (auth.uid () = user_id);

create table public.mutual_likes (
  id uuid primary key default gen_random_uuid (),
  user_low uuid not null references public.profiles (id) on delete cascade,
  user_high uuid not null references public.profiles (id) on delete cascade,
  matched_at timestamptz not null default now(),
  unique (user_low, user_high),
  check (user_low < user_high) -- paire ordonnée : une seule ligne par couple, quel que soit qui like en premier
);

alter table public.mutual_likes enable row level security;

create policy "mutual_likes: select own" on public.mutual_likes
  for select using (auth.uid () in (user_low, user_high));

-- Un profil candidat (suggéré aujourd'hui, ou avec qui un match mutuel
-- existe) doit être lisible par l'autre partie — sinon impossible
-- d'afficher son nom/bio/photos dans le fil du jour ou le chat. Définie
-- ici (plutôt que juste après la table profiles) car elle référence
-- daily_matches et mutual_likes, qui doivent déjà exister.
-- TODO durcissement : restreindre aux colonnes non sensibles (créer une
-- vue publique dédiée) plutôt qu'un accès ligne entière comme ici.
create policy "profiles: select visible candidates" on public.profiles
  for select using (
    exists (
      select 1 from public.daily_matches dm
      where dm.candidate_id = profiles.id and dm.user_id = auth.uid ()
    )
    or exists (
      select 1 from public.mutual_likes m
      where profiles.id in (m.user_low, m.user_high)
        and auth.uid () in (m.user_low, m.user_high)
    )
  );

create function public.handle_new_decision () returns trigger as $$
declare
  v_low uuid;
  v_high uuid;
begin
  if new.decision = 'liked' and exists (
    select 1 from public.decisions
    where user_id = new.target_id and target_id = new.user_id and decision = 'liked'
  ) then
    v_low := least(new.user_id, new.target_id);
    v_high := greatest(new.user_id, new.target_id);
    insert into public.mutual_likes (user_low, user_high)
    values (v_low, v_high)
    on conflict (user_low, user_high) do nothing;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_decision_created
  after insert on public.decisions for each row
  execute procedure public.handle_new_decision ();

-- ---------------------------------------------------------------------------
-- match_narratives : cache de la description narrative + snapshot des
-- axes, généré à la demande par la fonction Edge `match-narrative`
-- (mobile/supabase/functions/match-narrative). Clé de cache = la paire de
-- profils + leurs versions au moment du calcul : tant qu'aucun des deux
-- n'a changé de version, on ressert cette ligne sans rappeler le LLM.
-- ---------------------------------------------------------------------------
create table public.match_narratives (
  id uuid primary key default gen_random_uuid (),
  profile_low_id uuid not null references public.profiles (id) on delete cascade,
  profile_high_id uuid not null references public.profiles (id) on delete cascade,
  version_low integer not null,
  version_high integer not null,
  narrative_text text not null,
  axes_snapshot jsonb not null,
  model_used text not null,
  generated_at timestamptz not null default now(),
  unique (profile_low_id, profile_high_id, version_low, version_high),
  check (profile_low_id < profile_high_id)
);

alter table public.match_narratives enable row level security;

-- Lisible par les deux profils concernés (la fonction Edge écrit avec la
-- clé service_role, qui bypass RLS).
create policy "match_narratives: select if party" on public.match_narratives
  for select using (auth.uid () in (profile_low_id, profile_high_id));

-- ---------------------------------------------------------------------------
-- match_consents / conversations / messages : double opt-in obligatoire.
-- Le chat ne s'ouvre que lorsque les deux membres d'un match mutuel ont
-- explicitement consenti après avoir vu leur analyse de compatibilité.
-- ---------------------------------------------------------------------------
create table public.match_consents (
  id uuid primary key default gen_random_uuid (),
  mutual_like_id uuid not null references public.mutual_likes (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  consented_at timestamptz not null default now(),
  unique (mutual_like_id, user_id)
);

alter table public.match_consents enable row level security;

create policy "match_consents: select if party" on public.match_consents
  for select using (
    exists (
      select 1 from public.mutual_likes m
      where m.id = match_consents.mutual_like_id
        and auth.uid () in (m.user_low, m.user_high)
    )
  );

create table public.conversations (
  id uuid primary key default gen_random_uuid (),
  mutual_like_id uuid not null unique references public.mutual_likes (id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'blocked', 'closed')),
  created_at timestamptz not null default now()
);

alter table public.conversations enable row level security;

create function public.is_conversation_member (p_conversation_id uuid) returns boolean as $$
  select exists (
    select 1 from public.conversations c
    join public.mutual_likes m on m.id = c.mutual_like_id
    where c.id = p_conversation_id
      and auth.uid () in (m.user_low, m.user_high)
  );
$$ language sql security definer set search_path = public stable;

create policy "conversations: select if member" on public.conversations
  for select using (public.is_conversation_member (id));

-- RPC (SECURITY DEFINER) plutôt qu'une écriture RLS directe sur
-- match_consents + conversations, même raison que create_room()/join_room()
-- dans l'app de tests (0004_room_rpcs.sql) : deux écritures liées doivent
-- rester atomiques et cohérentes.
create function public.record_match_consent (p_mutual_like_id uuid)
returns uuid as $$
declare
  v_low uuid;
  v_high uuid;
  v_conversation_id uuid;
  v_both_consented boolean;
begin
  select user_low, user_high into v_low, v_high
  from public.mutual_likes where id = p_mutual_like_id;

  if v_low is null then
    raise exception 'Match mutuel introuvable';
  end if;
  if auth.uid () not in (v_low, v_high) then
    raise exception 'Non autorisé';
  end if;

  insert into public.match_consents (mutual_like_id, user_id)
  values (p_mutual_like_id, auth.uid ())
  on conflict (mutual_like_id, user_id) do nothing;

  select count(*) = 2 into v_both_consented
  from public.match_consents where mutual_like_id = p_mutual_like_id;

  if v_both_consented then
    insert into public.conversations (mutual_like_id)
    values (p_mutual_like_id)
    on conflict (mutual_like_id) do nothing
    returning id into v_conversation_id;

    if v_conversation_id is null then
      select id into v_conversation_id
      from public.conversations where mutual_like_id = p_mutual_like_id;
    end if;
  end if;

  return v_conversation_id; -- null tant que l'autre personne n'a pas consenti
end;
$$ language plpgsql security definer set search_path = public;

-- ---------------------------------------------------------------------------
-- blocks : créée avant messages, dont la policy d'insertion s'appuie
-- dessus pour couper l'envoi si l'un des deux membres a bloqué l'autre.
-- ---------------------------------------------------------------------------
create table public.blocks (
  id uuid primary key default gen_random_uuid (),
  blocker_id uuid not null references public.profiles (id) on delete cascade,
  blocked_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

alter table public.blocks enable row level security;

create policy "blocks: select own" on public.blocks
  for select using (auth.uid () = blocker_id);

create policy "blocks: insert own" on public.blocks
  for insert with check (auth.uid () = blocker_id);

-- SECURITY DEFINER : la policy "blocks: select own" limite chacun à ses
-- propres blocages (on ne doit pas savoir qui nous a bloqué), donc une
-- sous-requête ordinaire sur `blocks` depuis la policy d'insertion de
-- `messages` ne verrait jamais le blocage posé par l'autre membre de la
-- conversation. Cette fonction contourne volontairement cette RLS pour
-- vérifier l'existence d'un blocage entre les deux membres, sans exposer
-- lequel des deux a bloqué l'autre.
create function public.conversation_is_blocked (p_conversation_id uuid) returns boolean as $$
  select exists (
    select 1 from public.conversations c
    join public.mutual_likes m on m.id = c.mutual_like_id
    join public.blocks b on (
      (b.blocker_id = m.user_low and b.blocked_id = m.user_high)
      or (b.blocker_id = m.user_high and b.blocked_id = m.user_low)
    )
    where c.id = p_conversation_id
  );
$$ language sql security definer set search_path = public stable;

create table public.messages (
  id uuid primary key default gen_random_uuid (),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  content text not null,
  moderation_status text not null default 'ok' check (moderation_status in ('ok', 'flagged', 'removed')),
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

create policy "messages: select if member" on public.messages
  for select using (public.is_conversation_member (conversation_id));

-- L'app filtre les messages (mots-clés, anti-spam) avant l'insertion et
-- pose directement moderation_status ; TODO durcissement : revalider ce
-- filtre côté fonction Edge plutôt que de faire confiance au client pour
-- ce champ, avant mise en production.
create policy "messages: insert if member and not blocked" on public.messages
  for insert with check (
    sender_id = auth.uid ()
    and public.is_conversation_member (conversation_id)
    and not public.conversation_is_blocked (conversation_id)
  );

-- ---------------------------------------------------------------------------
-- reports : signalements, accessibles depuis n'importe quelle conversation
-- ou profil.
-- ---------------------------------------------------------------------------
create table public.reports (
  id uuid primary key default gen_random_uuid (),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  reported_id uuid not null references public.profiles (id) on delete cascade,
  conversation_id uuid references public.conversations (id) on delete set null,
  reason text not null,
  details text,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'actioned')),
  reviewed_by uuid references public.profiles (id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.reports enable row level security;

create policy "reports: select own" on public.reports
  for select using (auth.uid () = reporter_id);

create policy "reports: insert own" on public.reports
  for insert with check (auth.uid () = reporter_id);

-- La review humaine (mise à jour de status/reviewed_by) se fait depuis
-- Supabase Studio avec la clé service_role, qui bypass RLS — pas besoin
-- d'une policy update dédiée pour le MVP (voir docs/architecture-app-rencontre.md §9).

-- ---------------------------------------------------------------------------
-- push_tokens : jetons Expo Notifications (nouveau match, nouveau message).
-- ---------------------------------------------------------------------------
create table public.push_tokens (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references public.profiles (id) on delete cascade,
  expo_push_token text not null unique,
  created_at timestamptz not null default now()
);

alter table public.push_tokens enable row level security;

create policy "push_tokens: select own" on public.push_tokens
  for select using (auth.uid () = user_id);

create policy "push_tokens: insert own" on public.push_tokens
  for insert with check (auth.uid () = user_id);

create policy "push_tokens: delete own" on public.push_tokens
  for delete using (auth.uid () = user_id);
