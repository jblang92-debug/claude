import { AXIS_KEYS, type AxisKey, type PersonalityScores } from "./axes";
import { ONBOARDING_QUESTIONS } from "./questionnaire";

/** Version du barème — à incrémenter si les poids ou les questions changent. */
export const SCORING_VERSION = 1;

export type OnboardingAnswers = Record<string, string>; // questionId -> optionId

/**
 * Calcule le vecteur de personnalité à partir des réponses au
 * questionnaire d'inscription. Déterministe, aucun appel IA — voir
 * docs/architecture-app-rencontre.md §5 : c'est un choix de coût et de
 * fiabilité, pas seulement de simplicité.
 *
 * Pour chaque axe, on moyenne les contributions des questions qui le
 * touchent (le nombre de questions par axe peut varier), puis on
 * clampe à [-1, 1].
 */
export function scoreOnboardingAnswers(
  answers: OnboardingAnswers,
): PersonalityScores {
  const sums: Record<AxisKey, number> = Object.fromEntries(
    AXIS_KEYS.map((k) => [k, 0]),
  ) as Record<AxisKey, number>;
  const counts: Record<AxisKey, number> = Object.fromEntries(
    AXIS_KEYS.map((k) => [k, 0]),
  ) as Record<AxisKey, number>;

  for (const question of ONBOARDING_QUESTIONS) {
    const chosenOptionId = answers[question.id];
    if (!chosenOptionId) continue;
    const option = question.options.find((o) => o.id === chosenOptionId);
    if (!option) continue;

    for (const [axis, weight] of Object.entries(option.weights) as [
      AxisKey,
      number,
    ][]) {
      sums[axis] += weight;
      counts[axis] += 1;
    }
  }

  const scores = {} as PersonalityScores;
  for (const axis of AXIS_KEYS) {
    const average = counts[axis] > 0 ? sums[axis] / counts[axis] : 0;
    scores[axis] = clamp(average, -1, 1);
  }
  return scores;
}

/** Le questionnaire est jugé complet si chaque axe a au moins une réponse. */
export function isOnboardingComplete(answers: OnboardingAnswers): boolean {
  return ONBOARDING_QUESTIONS.every((q) => Boolean(answers[q.id]));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
