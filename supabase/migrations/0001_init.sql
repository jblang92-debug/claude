-- Miroir — schéma initial (Phase 1 : tests solo, personnages, comptes légers,
-- galerie, streaks, badges). Le mode Duo et le mode Soirée (local/à distance)
-- arriveront dans une migration ultérieure avec leurs propres tables
-- (rooms, players, turns...).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- profiles : étend auth.users. Une ligne est créée automatiquement pour
-- chaque utilisateur (y compris anonyme) via le trigger plus bas.
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_test_date date,
  tests_completed integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: select own" on public.profiles
  for select using (auth.uid () = id);

create policy "profiles: update own" on public.profiles
  for update using (auth.uid () = id);

-- Le trigger d'inscription (ci-dessous) insère la ligne ; les utilisateurs
-- n'ont pas besoin d'insérer eux-mêmes.

create function public.handle_new_user () returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'display_name');
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users for each row
  execute procedure public.handle_new_user ();

-- ---------------------------------------------------------------------------
-- tests : catalogue des tests (15 questions fixes, 4-6 options chacune).
-- Contient à la fois les tests pré-écrits (chargement instantané, voir
-- supabase/seed.sql) et les tests générés à la volée puis mis en cache dès
-- la première génération (catalogue non pré-écrit, ou thème personnalisé).
-- ---------------------------------------------------------------------------
create table public.tests (
  id uuid primary key default gen_random_uuid (),
  slug text unique not null,
  category_id text, -- référence lib/catalog.ts (pas de FK : catégories gérées en code)
  title text not null,
  depth text not null check (depth in ('leger', 'profond')),
  emoji text,
  is_premium boolean not null default false,
  is_custom boolean not null default false,
  questions jsonb not null, -- [{ "q": "...", "options": ["...", ...] }] x 15
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint tests_questions_is_array check (jsonb_typeof(questions) = 'array')
);

alter table public.tests enable row level security;

-- Le catalogue est public : n'importe qui (y compris anonyme) peut le lire.
create policy "tests: public read" on public.tests
  for select using (true);

-- Écriture réservée aux utilisateurs connectés (anonyme inclus) : c'est ce
-- qui permet la mise en cache d'un test généré à la volée par le premier
-- utilisateur qui le déclenche.
create policy "tests: insert when authenticated" on public.tests
  for insert with check (auth.role () = 'authenticated');

-- ---------------------------------------------------------------------------
-- results : un run complet d'un test par un utilisateur (portrait + traits).
-- Strictement privé au propriétaire — Miroir v2 est un parcours solo, le
-- partage se fait via l'export image (Web Share API), pas via un lien public.
-- ---------------------------------------------------------------------------
create table public.results (
  id uuid primary key default gen_random_uuid (),
  test_id uuid not null references public.tests (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  answers jsonb not null, -- [ "texte de l'option choisie", ... ] x 15
  portrait text not null,
  traits jsonb not null, -- [ "trait 1", "trait 2", "trait 3", "trait 4" ]
  reaction text,
  created_at timestamptz not null default now(),
  constraint results_answers_is_array check (jsonb_typeof(answers) = 'array'),
  constraint results_traits_is_array check (jsonb_typeof(traits) = 'array')
);

alter table public.results enable row level security;

create policy "results: select own" on public.results
  for select using (auth.uid () = user_id);

create policy "results: insert own" on public.results
  for insert with check (auth.uid () = user_id);

create policy "results: update own" on public.results
  for update using (auth.uid () = user_id);

create index results_user_id_created_at_idx on public.results (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- badges : catalogue public, débloqués par seuil de tests complétés.
-- ---------------------------------------------------------------------------
create table public.badges (
  id text primary key,
  threshold integer not null,
  label text not null,
  emoji text not null,
  sort_order integer not null default 0
);

alter table public.badges enable row level security;

create policy "badges: public read" on public.badges
  for select using (true);

create table public.profile_badges (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  badge_id text not null references public.badges (id) on delete cascade,
  earned_at timestamptz not null default now(),
  primary key (profile_id, badge_id)
);

alter table public.profile_badges enable row level security;

create policy "profile_badges: select own" on public.profile_badges
  for select using (auth.uid () = profile_id);

create policy "profile_badges: insert own" on public.profile_badges
  for insert with check (auth.uid () = profile_id);
