import { AXIS_KEYS, type AxisKey, type PersonalityScores } from "./axes";

/**
 * Score interne de tri entre deux vecteurs de personnalité, utilisé
 * uniquement pour classer les candidats du batch quotidien — jamais
 * affiché tel quel à l'utilisateur (pas de "% de compatibilité", voir
 * docs/architecture-app-rencontre.md). Une distance euclidienne moyenne
 * suffit à ce stade : simple, stable, sans dépendance à pgvector pour un
 * nombre d'axes aussi restreint.
 *
 * Volontairement *pas* une pure similarité ("plus proche = mieux") :
 * une différence modérée sur certains axes (ex. énergie sociale) crée
 * souvent une dynamique intéressante plutôt qu'un problème, donc on ne
 * cherche pas à matcher des jumeaux parfaits — juste à exclure les
 * écarts extrêmes sur chaque axe (`MAX_ACCEPTABLE_GAP`).
 */
const MAX_ACCEPTABLE_GAP = 1.6; // sur une échelle de -1 à 1, donc gap max possible = 2

export interface AxisComparison {
  axis: AxisKey;
  scoreA: number;
  scoreB: number;
  gap: number;
}

export function compareAxes(
  a: PersonalityScores,
  b: PersonalityScores,
): AxisComparison[] {
  return AXIS_KEYS.map((axis) => ({
    axis,
    scoreA: a[axis],
    scoreB: b[axis],
    gap: Math.abs(a[axis] - b[axis]),
  }));
}

/**
 * true si le profil est un candidat exploitable pour la suggestion du
 * jour (aucun axe avec un écart extrême). Ne filtre pas sur les
 * préférences déclarées (âge/genre/ville) : ça reste la responsabilité
 * de la requête SQL du batch, cette fonction ne juge que la
 * personnalité.
 */
export function isViableCandidate(
  a: PersonalityScores,
  b: PersonalityScores,
): boolean {
  return compareAxes(a, b).every((c) => c.gap <= MAX_ACCEPTABLE_GAP);
}

/**
 * Score de tri interne (plus petit = suggestion à privilégier). Combine
 * une pénalité sur les écarts extrêmes et une légère préférence pour la
 * diversité (deux profils identiques sur tous les axes ne génèrent pas
 * une dynamique plus riche qu'un léger contraste).
 */
export function internalRankScore(
  a: PersonalityScores,
  b: PersonalityScores,
): number {
  const comparisons = compareAxes(a, b);
  const meanGap =
    comparisons.reduce((sum, c) => sum + c.gap, 0) / comparisons.length;

  // Cible un écart moyen modéré (~0.5) plutôt que zéro : pénalise à la
  // fois les jumeaux parfaits et les profils trop éloignés.
  const idealMeanGap = 0.5;
  return Math.abs(meanGap - idealMeanGap);
}

/**
 * Snapshot des positions des deux profils sur chaque axe, tel que
 * stocké dans `match_narratives.axes_snapshot` et consommé par le
 * composant de constellation (aucune donnée supplémentaire à
 * recalculer côté client).
 */
export function buildAxesSnapshot(
  a: PersonalityScores,
  b: PersonalityScores,
): AxisComparison[] {
  return compareAxes(a, b);
}

/** Ordonne une paire d'ids de profils pour une clé de cache stable (A,B) == (B,A). */
export function orderedPair(
  idA: string,
  idB: string,
): [string, string] {
  return idA < idB ? [idA, idB] : [idB, idA];
}
