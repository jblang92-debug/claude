export type ThemeId =
  | "amour"
  | "amitie"
  | "humour"
  | "valeurs"
  | "argent"
  | "travail"
  | "culture"
  | "profil"
  | "compatibilite";

export interface TraitDef {
  key: string;
  label: string;
}

export interface ThemeDef {
  id: ThemeId;
  label: string;
  emoji: string;
  description: string;
  // Utilisé pour orienter le ton de la génération LLM
  vibe: string;
  traits: [TraitDef, TraitDef, TraitDef, TraitDef];
}

export const THEMES: ThemeDef[] = [
  {
    id: "amour",
    label: "Amour & relations",
    emoji: "💘",
    description: "Ta façon d'aimer, de flirter et de vivre les relations.",
    vibe: "taquin, romantique, jamais gênant",
    traits: [
      { key: "romantique", label: "Romantique" },
      { key: "aventurier", label: "Aventurier·ère" },
      { key: "loyal", label: "Loyal·e" },
      { key: "independant", label: "Indépendant·e" },
    ],
  },
  {
    id: "amitie",
    label: "Amitié & fidélité",
    emoji: "🤝",
    description: "Le genre d'ami·e que tu es vraiment.",
    vibe: "chaleureux, complice, entre potes",
    traits: [
      { key: "fidele", label: "Pilier fidèle" },
      { key: "boute-en-train", label: "Boute-en-train" },
      { key: "confident", label: "Confident·e" },
      { key: "rassembleur", label: "Rassembleur·se" },
    ],
  },
  {
    id: "humour",
    label: "Humour & second degré",
    emoji: "🤪",
    description: "Ton style d'humour et ton niveau de second degré.",
    vibe: "déjanté, second degré, absurde",
    traits: [
      { key: "blagueur", label: "Blagueur·se dans l'âme" },
      { key: "pince-sans-rire", label: "Pince-sans-rire" },
      { key: "spontane", label: "Spontané·e" },
      { key: "referentiel", label: "Maître·sse des références" },
    ],
  },
  {
    id: "valeurs",
    label: "Valeurs & priorités de vie",
    emoji: "🧭",
    description: "Ce qui compte vraiment pour toi dans la vie.",
    vibe: "sincère, réfléchi mais léger",
    traits: [
      { key: "liberte", label: "En quête de liberté" },
      { key: "stabilite", label: "En quête de stabilité" },
      { key: "impact", label: "En quête d'impact" },
      { key: "plaisir", label: "En quête de plaisir" },
    ],
  },
  {
    id: "argent",
    label: "Rapport à l'argent",
    emoji: "💸",
    description: "Ta relation (parfois compliquée) avec le fric.",
    vibe: "complice, sans jugement, un peu piquant",
    traits: [
      { key: "epargnant", label: "Épargnant·e prudent·e" },
      { key: "flambeur", label: "Flambeur·se assumé·e" },
      { key: "genereux", label: "Généreux·se" },
      { key: "strategique", label: "Stratège du budget" },
    ],
  },
  {
    id: "travail",
    label: "Rapport au travail / ambition",
    emoji: "🚀",
    description: "Ta manière de bosser et de voir ta carrière.",
    vibe: "motivant, complice de bureau, pas corporate",
    traits: [
      { key: "ambitieux", label: "Ambitieux·se" },
      { key: "equilibre", label: "Amoureux·se de l'équilibre" },
      { key: "createur", label: "Créateur·ice" },
      { key: "collectif", label: "Joueur·se collectif·ve" },
    ],
  },
  {
    id: "culture",
    label: "Culture (films, musique, bouffe)",
    emoji: "🎬",
    description: "Tes goûts culturels passés au crible, en mode fun.",
    vibe: "curieux, gourmand, fan de pop culture",
    traits: [
      { key: "nostalgique", label: "Nostalgique" },
      { key: "explorateur", label: "Explorateur·ice de nouveautés" },
      { key: "esthete", label: "Esthète" },
      { key: "populaire", label: "Fan de culture populaire" },
    ],
  },
  {
    id: "profil",
    label: "Personnalité décalée (animal, élément, couleur)",
    emoji: "🦊",
    description: "Ton profil totem : animal, élément et couleur qui te correspondent.",
    vibe: "loufoque, imagé, plein de métaphores",
    traits: [
      { key: "feu", label: "Feu — fonceur·se" },
      { key: "eau", label: "Eau — intuitif·ve" },
      { key: "terre", label: "Terre — ancré·e" },
      { key: "air", label: "Air — libre penseur·se" },
    ],
  },
  {
    id: "compatibilite",
    label: "Compatibilité (à deux, entre amis)",
    emoji: "🧩",
    description: "Ton style relationnel pour voir si vous êtes raccord.",
    vibe: "joueur, taquin, pensé pour être comparé à deux",
    traits: [
      { key: "fusionnel", label: "Fusionnel·le" },
      { key: "complementaire", label: "Complémentaire" },
      { key: "franc", label: "Franc·he du collier" },
      { key: "zen", label: "Zen face aux conflits" },
    ],
  },
];

export function getTheme(id: string): ThemeDef | undefined {
  return THEMES.find((t) => t.id === id);
}
