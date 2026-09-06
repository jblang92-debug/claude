-- Écritures atomiques pour créer/rejoindre un salon (mode Soirée à distance).
--
-- En diagnostic de production, une écriture directe dans `players` depuis le
-- client (protégée par la policy RLS "players: insert own") échouait de
-- façon persistante pour une session anonyme tout juste créée, alors que
-- auth.uid() se résolvait correctement juste avant (y compris en réessayant
-- plusieurs fois avec un court délai) — mais fonctionnait de façon fiable
-- une fois auth.uid() résolu et l'écriture faite dans la même fonction
-- SECURITY DEFINER, sans aller-retour HTTP séparé entre les deux. On passe
-- donc par ces deux fonctions plutôt que par des écritures RLS séparées.

create or replace function public.create_room(room_code text, player_name text)
returns public.rooms
language plpgsql
security definer
set search_path = public
as $$
declare
  new_room public.rooms;
begin
  if auth.uid() is null then
    raise exception 'Utilisateur non authentifié';
  end if;

  insert into public.rooms (code, host_user_id)
  values (room_code, auth.uid())
  returning * into new_room;

  insert into public.players (room_id, user_id, name)
  values (new_room.id, auth.uid(), player_name);

  return new_room;
end;
$$;

grant execute on function public.create_room(text, text) to anon, authenticated;

create or replace function public.join_room(target_code text, player_name text)
returns public.rooms
language plpgsql
security definer
set search_path = public
as $$
declare
  target_room public.rooms;
begin
  if auth.uid() is null then
    raise exception 'Utilisateur non authentifié';
  end if;

  select * into target_room from public.rooms where code = target_code;
  if target_room.id is null then
    raise exception 'Aucun salon ne correspond à ce code';
  end if;

  insert into public.players (room_id, user_id, name)
  values (target_room.id, auth.uid(), player_name)
  on conflict (room_id, user_id) do update set name = excluded.name;

  return target_room;
end;
$$;

grant execute on function public.join_room(text, text) to anon, authenticated;
