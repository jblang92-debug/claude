-- Active la réplication temps réel (Postgres Changes) sur les tables du
-- mode Soirée à distance : c'est ce qui permet à chaque appareil connecté
-- au même salon de voir les tours, les nouveaux joueurs et les changements
-- de tour sans recharger la page.
alter publication supabase_realtime add table public.rooms;
alter publication supabase_realtime add table public.players;
alter publication supabase_realtime add table public.turns;
