-- Storage : photos de profil (bucket privé, visibilité alignée sur
-- "profiles: select visible candidates") et selfies de vérification
-- (bucket privé, accès restreint au propriétaire — la review humaine se
-- fait avec la clé service_role, qui bypass RLS). Convention de chemin :
-- {user_id}/{fichier}, comme party-proofs dans l'app de tests.

insert into storage.buckets (id, name, public)
values ('profile-photos', 'profile-photos', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('verification-selfies', 'verification-selfies', false)
on conflict (id) do nothing;

create policy "profile-photos: select own or visible" on storage.objects
  for select using (
    bucket_id = 'profile-photos' and (
      (storage.foldername (name))[1] = auth.uid ()::text
      or exists (
        select 1 from public.daily_matches dm
        where dm.user_id = auth.uid () and dm.candidate_id::text = (storage.foldername (name))[1]
      )
      or exists (
        select 1 from public.mutual_likes m
        where (storage.foldername (name))[1] in (m.user_low::text, m.user_high::text)
          and auth.uid () in (m.user_low, m.user_high)
      )
    )
  );

create policy "profile-photos: insert own" on storage.objects
  for insert with check (
    bucket_id = 'profile-photos' and (storage.foldername (name))[1] = auth.uid ()::text
  );

create policy "profile-photos: delete own" on storage.objects
  for delete using (
    bucket_id = 'profile-photos' and (storage.foldername (name))[1] = auth.uid ()::text
  );

create policy "verification-selfies: select own" on storage.objects
  for select using (
    bucket_id = 'verification-selfies' and (storage.foldername (name))[1] = auth.uid ()::text
  );

create policy "verification-selfies: insert own" on storage.objects
  for insert with check (
    bucket_id = 'verification-selfies' and (storage.foldername (name))[1] = auth.uid ()::text
  );
