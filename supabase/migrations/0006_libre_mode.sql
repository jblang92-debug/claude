-- Mode Soirée à distance : palier "Libre" (une personne écrit la question/le
-- défi pour une autre, qui y répond ensuite) + preuve photo/vidéo autorisée
-- sur tous les paliers (plus seulement Léger).

alter table public.rooms drop constraint rooms_depth_check;
alter table public.rooms add constraint rooms_depth_check check (depth in ('leger', 'ose', 'libre'));

alter table public.turns drop constraint turns_depth_check;
alter table public.turns add constraint turns_depth_check check (depth in ('leger', 'ose', 'libre'));

alter table public.turns drop constraint turns_status_check;
alter table public.turns add constraint turns_status_check
  check (status in ('awaiting_prompt', 'pending', 'answered', 'skipped'));

-- En mode Libre, le prompt n'existe pas encore à la création du tour : il
-- est écrit par la personne désignée (`author_player_id`), pas piochée dans
-- un catalogue.
alter table public.turns alter column prompt drop not null;
alter table public.turns add column author_player_id uuid references public.players (id) on delete set null;

-- ---------------------------------------------------------------------------
-- choose_turn_libre : la personne dont c'est le tour choisit Action/Vérité
-- ET qui va lui écrire le défi — le tour reste "awaiting_prompt" tant que
-- cette personne n'a pas répondu.
-- ---------------------------------------------------------------------------
create or replace function public.choose_turn_libre(
  target_room_id uuid,
  p_turn_type text,
  p_author_player_id uuid
)
returns public.turns
language plpgsql
security definer
set search_path = public
as $$
declare
  my_player_id uuid;
  new_turn public.turns;
begin
  if auth.uid() is null then
    raise exception 'Utilisateur non authentifié';
  end if;

  select id into my_player_id
  from public.players
  where room_id = target_room_id and user_id = auth.uid();
  if my_player_id is null then
    raise exception 'Tu ne fais pas partie de ce salon';
  end if;

  if not exists (select 1 from public.players where id = p_author_player_id and room_id = target_room_id) then
    raise exception 'Ce·tte joueur·se ne fait pas partie de ce salon';
  end if;

  insert into public.turns (room_id, player_id, turn_type, depth, prompt, status, author_player_id)
  values (target_room_id, my_player_id, p_turn_type, 'libre', null, 'awaiting_prompt', p_author_player_id)
  returning * into new_turn;

  return new_turn;
end;
$$;

grant execute on function public.choose_turn_libre(uuid, text, uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- write_libre_prompt : la personne désignée écrit le défi/la question, ce
-- qui fait passer le tour en "pending" — prêt à être répondu normalement.
-- ---------------------------------------------------------------------------
create or replace function public.write_libre_prompt(target_turn_id uuid, p_prompt text)
returns public.turns
language plpgsql
security definer
set search_path = public
as $$
declare
  target_turn public.turns;
  author_player public.players;
  updated_turn public.turns;
begin
  select * into target_turn from public.turns where id = target_turn_id;
  if target_turn.id is null then
    raise exception 'Tour introuvable';
  end if;
  if target_turn.status is distinct from 'awaiting_prompt' then
    raise exception 'Ce tour n''attend plus de contenu';
  end if;

  select * into author_player from public.players where id = target_turn.author_player_id;
  if author_player.user_id is distinct from auth.uid() then
    raise exception 'Ce n''est pas à toi d''écrire ce défi';
  end if;

  update public.turns
  set prompt = p_prompt, status = 'pending'
  where id = target_turn_id
  returning * into updated_turn;

  return updated_turn;
end;
$$;

grant execute on function public.write_libre_prompt(uuid, text) to anon, authenticated;
