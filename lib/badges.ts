// Catalogue des badges de progression, débloqués au nombre de tests
// complétés. Reflété en base (table `badges`, voir supabase/seed.sql) pour
// que profile_badges puisse y référencer une clé étrangère stable.

export interface BadgeDef {
  id: string;
  threshold: number;
  label: string;
  emoji: string;
}

export const BADGES: BadgeDef[] = [
  { id: "premier-miroir", threshold: 1, label: "Premier miroir", emoji: "🔍" },
  { id: "curieux-confirme", threshold: 3, label: "Curieux confirmé", emoji: "🧠" },
  { id: "collectionneur", threshold: 5, label: "Collectionneur", emoji: "🗂️" },
  { id: "grand-explorateur", threshold: 10, label: "Grand explorateur", emoji: "🚀" },
  { id: "maitre-du-miroir", threshold: 20, label: "Maître du miroir", emoji: "👑" },
];

/** Badges nouvellement débloqués en passant de oldCount à newCount tests complétés. */
export function newlyUnlockedBadges(oldCount: number, newCount: number): BadgeDef[] {
  return BADGES.filter((b) => b.threshold > oldCount && b.threshold <= newCount);
}
