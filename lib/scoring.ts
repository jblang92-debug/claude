export interface TraitDef {
  key: string;
  label: string;
}

export interface ScoredTrait {
  key: string;
  label: string;
  value: number; // 0-100
}

interface QuestionLike {
  id: string;
  options: { label: string; trait: string }[];
}

/**
 * Calcule la répartition des traits (0-100) à partir des réponses.
 * Chaque réponse "vote" pour le trait de l'option choisie ; le score final
 * est la part relative des votes obtenus par chaque trait.
 */
export function computeTraitScores(
  traits: TraitDef[],
  questions: QuestionLike[],
  answers: Map<string, number>,
): ScoredTrait[] {
  const counts = new Map<string, number>(traits.map((t) => [t.key, 0]));
  let total = 0;

  for (const q of questions) {
    const optionIndex = answers.get(q.id);
    if (optionIndex === undefined) continue;
    const option = q.options[optionIndex];
    if (!option) continue;
    counts.set(option.trait, (counts.get(option.trait) ?? 0) + 1);
    total += 1;
  }

  return traits
    .map((t) => ({
      key: t.key,
      label: t.label,
      value: total > 0 ? Math.round(((counts.get(t.key) ?? 0) / total) * 100) : 0,
    }))
    .sort((a, b) => b.value - a.value);
}
