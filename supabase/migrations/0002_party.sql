-- Miroir — Phase 2 : mode Soirée (local et à distance).
-- Le mode Duo (même téléphone) ne nécessite aucune table : deux tests
-- solo joués l'un après l'autre sur le même appareil, la compatibilité
-- étant calculée à la volée à partir des deux portraits.

-- ---------------------------------------------------------------------------
-- dare_truth_prompts : catalogue public et pré-écrit d'Action ou Vérité,
-- modéré (rédigé par l'équipe, jamais par les utilisateurs). Utilisé par le
-- mode Soirée locale ET comme contenu par défaut du mode Soirée à distance.
-- ---------------------------------------------------------------------------
create table public.dare_truth_prompts (
  id uuid primary key default gen_random_uuid (),
  type text not null check (type in ('action', 'verite')),
  depth text not null check (depth in ('leger', 'ose')),
  text text not null,
  created_at timestamptz not null default now(),
  unique (type, depth, text)
);

alter table public.dare_truth_prompts enable row level security;

create policy "dare_truth_prompts: public read" on public.dare_truth_prompts
  for select using (true);

-- ---------------------------------------------------------------------------
-- rooms : un salon de Soirée à distance, identifié par un code court.
-- ---------------------------------------------------------------------------
create table public.rooms (
  id uuid primary key default gen_random_uuid (),
  code text unique not null,
  depth text not null default 'leger' check (depth in ('leger', 'ose')),
  status text not null default 'waiting' check (status in ('waiting', 'active', 'ended')),
  host_user_id uuid not null references auth.users (id) on delete cascade,
  current_player_id uuid, -- FK ajoutée après la création de `players` (dépendance circulaire)
  created_at timestamptz not null default now()
);

alter table public.rooms enable row level security;

-- Le code sert de "secret partageable" : n'importe quel utilisateur connecté
-- (anonyme inclus) peut lire un salon, ça permet de le rejoindre par code.
-- Le contenu du jeu (turns, prompts perso) reste lui strictement réservé aux
-- participants, voir plus bas.
create policy "rooms: select when authenticated" on public.rooms
  for select using (auth.role () = 'authenticated');

create policy "rooms: insert own as host" on public.rooms
  for insert with check (auth.uid () = host_user_id);

-- La policy "update" (nécessite de savoir si l'utilisateur est membre du
-- salon) est créée plus bas, une fois `players` et `is_room_member()` en place.

-- ---------------------------------------------------------------------------
-- players : les participants d'un salon (un par utilisateur et par salon).
-- ---------------------------------------------------------------------------
create table public.players (
  id uuid primary key default gen_random_uuid (),
  room_id uuid not null references public.rooms (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  skips_left integer not null default 2,
  joined_at timestamptz not null default now(),
  unique (room_id, user_id)
);

alter table public.rooms
  add constraint rooms_current_player_fk
  foreign key (current_player_id) references public.players (id) on delete set null;

-- Fonction utilitaire (SECURITY DEFINER pour éviter toute récursion RLS
-- players -> players) : est-ce que l'utilisateur courant est membre de ce
-- salon ? Réutilisée par toutes les policies "réservé aux participants".
create function public.is_room_member (target_room_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.players
    where room_id = target_room_id and user_id = auth.uid ()
  );
$$;

create policy "rooms: update by members" on public.rooms
  for update using (
    auth.uid () = host_user_id or public.is_room_member (id)
  );

alter table public.players enable row level security;

create policy "players: select room members" on public.players
  for select using (public.is_room_member (room_id));

-- Rejoindre un salon = créer sa propre ligne "players" ; aucune condition
-- d'appartenance préalable, sinon personne ne pourrait jamais rejoindre.
create policy "players: insert own" on public.players
  for insert with check (auth.uid () = user_id);

create policy "players: update own" on public.players
  for update using (auth.uid () = user_id);

-- ---------------------------------------------------------------------------
-- turns : chaque tour joué dans un salon (Action ou Vérité, réponse/preuve).
-- ---------------------------------------------------------------------------
create table public.turns (
  id uuid primary key default gen_random_uuid (),
  room_id uuid not null references public.rooms (id) on delete cascade,
  player_id uuid not null references public.players (id) on delete cascade,
  turn_type text not null check (turn_type in ('action', 'verite')),
  depth text not null check (depth in ('leger', 'ose')),
  prompt text not null,
  response_text text,
  -- Chemin vers la preuve photo dans le bucket `party-proofs` (palier Léger
  -- uniquement — jamais demandé sur le palier Osé, voir le README).
  proof_path text,
  status text not null default 'pending' check (status in ('pending', 'answered', 'skipped')),
  created_at timestamptz not null default now(),
  answered_at timestamptz
);

alter table public.turns enable row level security;

create policy "turns: select room members" on public.turns
  for select using (public.is_room_member (room_id));

create policy "turns: insert room members" on public.turns
  for insert with check (public.is_room_member (room_id));

create policy "turns: update room members" on public.turns
  for update using (public.is_room_member (room_id));

create index turns_room_id_created_at_idx on public.turns (room_id, created_at desc);

-- ---------------------------------------------------------------------------
-- room_custom_prompts : Action/Vérité ajoutés par les participants pour LEUR
-- salon uniquement — non public, non modéré (voir policies ci-dessous).
-- ---------------------------------------------------------------------------
create table public.room_custom_prompts (
  id uuid primary key default gen_random_uuid (),
  room_id uuid not null references public.rooms (id) on delete cascade,
  type text not null check (type in ('action', 'verite')),
  depth text not null check (depth in ('leger', 'ose')),
  text text not null,
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.room_custom_prompts enable row level security;

create policy "room_custom_prompts: select room members" on public.room_custom_prompts
  for select using (public.is_room_member (room_id));

create policy "room_custom_prompts: insert room members" on public.room_custom_prompts
  for insert with check (public.is_room_member (room_id) and auth.uid () = created_by);

-- ---------------------------------------------------------------------------
-- Storage : bucket dédié aux preuves photo (palier Léger uniquement).
-- Chemin attendu : `${room_id}/${turn_id}.jpg` — la policy vérifie que
-- l'utilisateur est bien membre du salon désigné par le premier segment.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('party-proofs', 'party-proofs', false)
on conflict (id) do nothing;

create policy "party-proofs: room members read" on storage.objects
  for select using (
    bucket_id = 'party-proofs'
    and public.is_room_member (((storage.foldername (name)) [1])::uuid)
  );

create policy "party-proofs: room members upload" on storage.objects
  for insert with check (
    bucket_id = 'party-proofs'
    and public.is_room_member (((storage.foldername (name)) [1])::uuid)
  );
