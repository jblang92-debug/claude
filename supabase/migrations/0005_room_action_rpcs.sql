-- Comme pour create_room()/join_room() (0004), les autres actions du salon
-- écrivaient directement dans les tables protégées par RLS depuis le
-- navigateur, ce qui pouvait échouer de façon persistante. On les fait
-- passer par des fonctions SECURITY DEFINER qui vérifient elles-mêmes les
-- autorisations (équivalent des policies RLS) et écrivent dans la même
-- transaction que la résolution de auth.uid().

create or replace function public.start_game(target_room_id uuid, chosen_depth text)
returns public.rooms
language plpgsql
security definer
set search_path = public
as $$
declare
  target_room public.rooms;
  first_player_id uuid;
  player_count integer;
begin
  select * into target_room from public.rooms where id = target_room_id;
  if target_room.id is null then
    raise exception 'Salon introuvable';
  end if;
  if auth.uid() is distinct from target_room.host_user_id then
    raise exception 'Seul·e l''hôte peut lancer la partie';
  end if;

  select count(*) into player_count from public.players where room_id = target_room_id;
  if player_count < 2 then
    raise exception 'Il faut au moins 2 joueur·ses pour lancer la partie';
  end if;

  select id into first_player_id
  from public.players
  where room_id = target_room_id
  order by joined_at asc
  limit 1;

  update public.rooms
  set depth = chosen_depth, status = 'active', current_player_id = first_player_id
  where id = target_room_id
  returning * into target_room;

  return target_room;
end;
$$;

grant execute on function public.start_game(uuid, text) to anon, authenticated;

create or replace function public.choose_turn(target_room_id uuid, p_turn_type text, p_depth text, p_prompt text)
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

  insert into public.turns (room_id, player_id, turn_type, depth, prompt)
  values (target_room_id, my_player_id, p_turn_type, p_depth, p_prompt)
  returning * into new_turn;

  return new_turn;
end;
$$;

grant execute on function public.choose_turn(uuid, text, text, text) to anon, authenticated;

create or replace function public.skip_turn(target_turn_id uuid, new_prompt text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  target_turn public.turns;
  my_player public.players;
  updated_player public.players;
  updated_turn public.turns;
begin
  select * into target_turn from public.turns where id = target_turn_id;
  if target_turn.id is null then
    raise exception 'Tour introuvable';
  end if;

  select * into my_player from public.players where id = target_turn.player_id;
  if my_player.user_id is distinct from auth.uid() then
    raise exception 'Ce n''est pas ton tour';
  end if;
  if my_player.skips_left <= 0 then
    raise exception 'Plus de passes disponibles';
  end if;

  update public.players set skips_left = skips_left - 1
  where id = my_player.id
  returning * into updated_player;

  update public.turns set prompt = new_prompt
  where id = target_turn_id
  returning * into updated_turn;

  return json_build_object('player', updated_player, 'turn', updated_turn);
end;
$$;

grant execute on function public.skip_turn(uuid, text) to anon, authenticated;

create or replace function public.submit_turn(
  target_turn_id uuid,
  p_response_text text,
  p_proof_path text,
  p_next_player_id uuid
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  target_turn public.turns;
  my_player public.players;
  updated_turn public.turns;
  updated_room public.rooms;
begin
  select * into target_turn from public.turns where id = target_turn_id;
  if target_turn.id is null then
    raise exception 'Tour introuvable';
  end if;

  select * into my_player from public.players where id = target_turn.player_id;
  if my_player.user_id is distinct from auth.uid() then
    raise exception 'Ce n''est pas ton tour';
  end if;

  update public.turns
  set status = 'answered', response_text = p_response_text, proof_path = p_proof_path, answered_at = now()
  where id = target_turn_id
  returning * into updated_turn;

  update public.rooms
  set current_player_id = p_next_player_id
  where id = target_turn.room_id
  returning * into updated_room;

  return json_build_object('turn', updated_turn, 'room', updated_room);
end;
$$;

grant execute on function public.submit_turn(uuid, text, text, uuid) to anon, authenticated;

create or replace function public.add_custom_prompt(target_room_id uuid, p_type text, p_depth text, p_text text)
returns public.room_custom_prompts
language plpgsql
security definer
set search_path = public
as $$
declare
  my_player_id uuid;
  new_prompt public.room_custom_prompts;
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

  insert into public.room_custom_prompts (room_id, type, depth, text, created_by)
  values (target_room_id, p_type, p_depth, p_text, auth.uid())
  returning * into new_prompt;

  return new_prompt;
end;
$$;

grant execute on function public.add_custom_prompt(uuid, text, text, text) to anon, authenticated;
