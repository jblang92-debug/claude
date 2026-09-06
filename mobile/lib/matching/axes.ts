/**
 * Catalogue des axes de personnalité utilisés par le matching et la
 * visualisation en constellation. Chaque axe est noté de -1 (pôle A) à
 * +1 (pôle B) — aucun axe n'a de "bon" côté, ce sont deux styles.
 *
 * Miroir de `trait_axes` côté Supabase (supabase/migrations/0001_init.sql) :
 * ce fichier est la source de vérité côté app, la table sert à la
 * localisation/évolution du catalogue sans redéployer l'app.
 */
export type AxisKey =
  | "humour"
  | "energie"
  | "valeurs"
  | "ambition"
  | "attachement"
  | "ouverture"
  | "stabilite_emotionnelle";

export interface AxisDefinition {
  key: AxisKey;
  label: string;
  poleA: string;
  poleB: string;
  description: string;
}

export const AXES: AxisDefinition[] = [
  {
    key: "humour",
    label: "Humour",
    poleA: "Sérieux",
    poleB: "Second degré",
    description: "Ton rapport à la légèreté et à l'ironie au quotidien.",
  },
  {
    key: "energie",
    label: "Énergie sociale",
    poleA: "Cocooning",
    poleB: "Grande énergie",
    description: "Ton besoin de sorties et de stimulation sociale.",
  },
  {
    key: "valeurs",
    label: "Rapport aux règles",
    poleA: "Spontané",
    poleB: "Structuré",
    description: "Ta façon d'organiser ta vie et tes décisions.",
  },
  {
    key: "ambition",
    label: "Ambition",
    poleA: "Profiter du présent",
    poleB: "Tourné vers les objectifs",
    description: "Le poids des projets et de la réussite dans ta vie.",
  },
  {
    key: "attachement",
    label: "Attachement",
    poleA: "Indépendant",
    poleB: "Fusionnel",
    description: "Ton besoin de présence et de proximité en couple.",
  },
  {
    key: "ouverture",
    label: "Ouverture",
    poleA: "Habitudes",
    poleB: "Nouveauté",
    description: "Ton attrait pour l'inconnu et le changement.",
  },
  {
    key: "stabilite_emotionnelle",
    label: "Expression émotionnelle",
    poleA: "Calme",
    poleB: "Intense",
    description: "Ta façon de vivre et d'exprimer tes émotions.",
  },
];

export const AXIS_KEYS: AxisKey[] = AXES.map((a) => a.key);

export type PersonalityScores = Record<AxisKey, number>;
