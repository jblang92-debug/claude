// Miroir en Deno de mobile/lib/matching/{axes,similarity}.ts, pour les
// fonctions Edge (qui ne peuvent pas importer directement le code de
// l'app React Native). Garder les deux synchronisés si les axes ou les
// seuils changent — le fichier source de vérité conceptuel reste
// mobile/lib/matching/, dupliqué ici volontairement plutôt qu'un lien
// symbolique, plus robuste au déploiement Supabase (chaque fonction Edge
// n'embarque que supabase/functions/**).

export const AXIS_KEYS = [
  "humour",
  "energie",
  "valeurs",
  "ambition",
  "attachement",
  "ouverture",
  "stabilite_emotionnelle",
] as const;

export type AxisKey = (typeof AXIS_KEYS)[number];
export type PersonalityScores = Record<string, number>;

export interface AxisComparison {
  axis: string;
  scoreA: number;
  scoreB: number;
  gap: number;
}

export function compareAxes(
  a: PersonalityScores,
  b: PersonalityScores,
): AxisComparison[] {
  return AXIS_KEYS.filter((axis) => axis in a && axis in b).map((axis) => ({
    axis,
    scoreA: a[axis],
    scoreB: b[axis],
    gap: Math.abs(a[axis] - b[axis]),
  }));
}

/** Paire ordonnée stable, cohérente avec la contrainte SQL profile_low_id < profile_high_id. */
export function orderedPair(idA: string, idB: string): [string, string] {
  return idA < idB ? [idA, idB] : [idB, idA];
}
