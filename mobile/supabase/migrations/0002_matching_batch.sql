-- Pipeline de matching par batch (docs/architecture-app-rencontre.md §6) :
-- deux jobs plpgsql, planifiés via pg_cron, aucun appel LLM dans ce
-- chemin. La génération de la description narrative (LLM) reste dans la
-- fonction Edge `match-narrative`, déclenchée à la demande — jamais ici.

create table public.batch_runs (
  id uuid primary key default gen_random_uuid (),
  job_name text not null,
  started_at timestamptz not null,
  finished_at timestamptz not null,
  details jsonb not null default '{}'::jsonb
);

alter table public.batch_runs enable row level security;
-- Pas de policy select : ces logs sont un outil d'observabilité interne,
-- consultés depuis Supabase Studio avec la clé service_role (qui bypass
-- RLS), pas depuis l'app.

-- ---------------------------------------------------------------------------
-- Comparaison de vecteurs de personnalité, en miroir de
-- mobile/lib/matching/similarity.ts (mêmes seuils : écart moyen cible
-- ~0.5, écart maximum toléré par axe 1.6/2).
-- ---------------------------------------------------------------------------
create function public.personality_mean_gap (a jsonb, b jsonb) returns numeric as $$
declare
  v_key text;
  v_sum numeric := 0;
  v_count integer := 0;
begin
  for v_key in select key from public.trait_axes loop
    if (a ? v_key) and (b ? v_key) then
      v_sum := v_sum + abs((a ->> v_key)::numeric - (b ->> v_key)::numeric);
      v_count := v_count + 1;
    end if;
  end loop;
  if v_count = 0 then
    return null;
  end if;
  return v_sum / v_count;
end;
$$ language plpgsql stable;

create function public.personality_max_gap (a jsonb, b jsonb) returns numeric as $$
declare
  v_key text;
  v_max numeric := 0;
begin
  for v_key in select key from public.trait_axes loop
    if (a ? v_key) and (b ? v_key) then
      v_max := greatest(v_max, abs((a ->> v_key)::numeric - (b ->> v_key)::numeric));
    end if;
  end loop;
  return v_max;
end;
$$ language plpgsql stable;

-- ---------------------------------------------------------------------------
-- recompute_profiles() : recalcul nocturne. Pour le MVP, le scoring est
-- entièrement déterminé par les réponses au questionnaire (voir
-- set_personality_vector(), appelée directement par l'app à la fin de
-- l'onboarding) — il n'y a donc rien à recalculer tant qu'aucun signal
-- comportemental n'est intégré. Ce job existe et tourne dès maintenant
-- pour que l'architecture batch soit en place sans rien à changer le
-- jour où l'affinement comportemental (v2) est activé.
-- ---------------------------------------------------------------------------
create function public.recompute_profiles () returns void as $$
declare
  v_started timestamptz := now();
begin
  insert into public.batch_runs (job_name, started_at, finished_at, details)
  values ('recompute_profiles', v_started, now(), jsonb_build_object('note', 'no-op MVP : voir commentaire de la fonction'));
end;
$$ language plpgsql security definer set search_path = public;

-- ---------------------------------------------------------------------------
-- generate_daily_matches() : suggestions du jour, 3 à 5 par utilisateur
-- actif et vérifié. Filtre sur préférences déclarées (ville, genre
-- recherché réciproque, écart d'âge), exclut blocages/décisions déjà
-- prises, classe par écart moyen le plus proche de 0.5 (ni jumeaux
-- parfaits, ni trop éloignés — voir similarity.ts côté app pour le
-- raisonnement). Aucun texte n'est généré ici, uniquement des rangs.
-- ---------------------------------------------------------------------------
create function public.generate_daily_matches () returns void as $$
declare
  v_user record;
  v_batch_date date := current_date;
  v_started timestamptz := now();
begin
  for v_user in
    select p.id, p.city, p.gender, p.seeking, p.birthdate, p.personality_scores
    from public.profiles p
    where p.is_active
      and p.onboarding_completed_at is not null
      and exists (
        select 1 from public.verifications v
        where v.user_id = p.id and v.type = 'selfie' and v.status = 'approved'
      )
      and exists (
        select 1 from public.verifications v
        where v.user_id = p.id and v.type = 'age' and v.status = 'approved'
      )
  loop
    insert into public.daily_matches (user_id, candidate_id, batch_date, rank, status)
    select
      v_user.id,
      c.id,
      v_batch_date,
      row_number() over (
        order by abs(public.personality_mean_gap (v_user.personality_scores, c.personality_scores) - 0.5)
      ),
      'suggested'
    from public.profiles c
    where c.id <> v_user.id
      and c.is_active
      and c.onboarding_completed_at is not null
      and exists (
        select 1 from public.verifications v
        where v.user_id = c.id and v.type = 'selfie' and v.status = 'approved'
      )
      and exists (
        select 1 from public.verifications v
        where v.user_id = c.id and v.type = 'age' and v.status = 'approved'
      )
      -- ville : granularité seule disponible (pas de coordonnées stockées, choix RGPD)
      and (v_user.city is null or c.city is null or c.city = v_user.city)
      -- préférence de genre réciproque : si l'un des deux n'a rien déclaré, on ne filtre pas dessus
      and (v_user.seeking is null or c.gender is null or c.gender = any (v_user.seeking))
      and (c.seeking is null or v_user.gender is null or v_user.gender = any (c.seeking))
      -- écart d'âge : plafond fixe par défaut pour le MVP, en attendant des
      -- préférences explicites (min/max) à ajouter au profil plus tard
      and abs(extract(year from age(v_user.birthdate, c.birthdate))) <= 15
      and public.personality_max_gap (v_user.personality_scores, c.personality_scores) <= 1.6
      and not exists (
        select 1 from public.blocks b
        where (b.blocker_id = v_user.id and b.blocked_id = c.id)
           or (b.blocker_id = c.id and b.blocked_id = v_user.id)
      )
      and not exists (
        select 1 from public.decisions d
        where d.user_id = v_user.id and d.target_id = c.id
      )
    order by abs(public.personality_mean_gap (v_user.personality_scores, c.personality_scores) - 0.5)
    limit 5
    on conflict (user_id, candidate_id, batch_date) do nothing;
  end loop;

  insert into public.batch_runs (job_name, started_at, finished_at, details)
  values ('generate_daily_matches', v_started, now(), jsonb_build_object('batch_date', v_batch_date));
end;
$$ language plpgsql security definer set search_path = public;

-- ---------------------------------------------------------------------------
-- Planification. Heures en UTC — à ajuster une fois le fuseau cible du
-- lancement connu (le brief vise un matin en heure locale des
-- utilisateurs, donc potentiellement plusieurs jobs décalés par fuseau
-- une fois l'app internationale ; un seul suffit tant qu'on cible un pays).
-- ---------------------------------------------------------------------------
select cron.schedule ('recompute-profiles-nightly', '0 3 * * *', $$select public.recompute_profiles();$$);
select cron.schedule ('generate-daily-matches-morning', '0 7 * * *', $$select public.generate_daily_matches();$$);
