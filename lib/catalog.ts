// Catalogue des catégories et des tests proposés dans l'appli. La liste des
// tests (titre + profondeur) est gérée ici, en code ; leur contenu (15
// questions) vit en base (table `tests`) — pré-écrit pour certains (voir
// lib/preseeded-tests.ts et supabase/seed.sql), généré puis mis en cache à
// la première sélection pour les autres.

export type Depth = "leger" | "profond";

export interface CatalogQuiz {
  title: string;
  depth: Depth;
}

export interface Category {
  id: string;
  label: string;
  emoji: string;
  color: string;
  quizzes: CatalogQuiz[];
}

export const CATEGORIES: Category[] = [
  {
    id: "amour",
    label: "Amour & relations",
    emoji: "💘",
    color: "#FF6B6B",
    quizzes: [
      { title: "Quel·le amant·e es-tu ?", depth: "leger" },
      { title: "Sexuellement, qui es-tu ?", depth: "profond" },
      { title: "Es-tu plutôt cœur ou raison en amour ?", depth: "leger" },
      { title: "Quel type de partenaire te correspond vraiment ?", depth: "leger" },
      { title: "De quoi rêves-tu secrètement en amour ?", depth: "profond" },
    ],
  },
  {
    id: "amitie",
    label: "Amitié",
    emoji: "🤝",
    color: "#5EE6C5",
    quizzes: [
      { title: "Quel ami es-tu dans un groupe ?", depth: "leger" },
      { title: "Es-tu du genre à tout sauver ou à t'effacer ?", depth: "profond" },
      { title: "Ton amitié résisterait-elle à tout ?", depth: "leger" },
      { title: "Que caches-tu même à tes meilleurs amis ?", depth: "profond" },
    ],
  },
  {
    id: "aventure",
    label: "Aventure & survie",
    emoji: "🏝️",
    color: "#F5C518",
    quizzes: [
      { title: "Sur une île déserte, survivrais-tu ?", depth: "leger" },
      { title: "Ferais-tu un bon chef d'expédition ?", depth: "leger" },
      { title: "Quel style d'aventurier es-tu ?", depth: "leger" },
      { title: "Quelle peur inavouée te freine vraiment ?", depth: "profond" },
    ],
  },
  {
    id: "humour",
    label: "Humour",
    emoji: "😂",
    color: "#B18CFF",
    quizzes: [
      { title: "Quel type d'humour as-tu ?", depth: "leger" },
      { title: "Es-tu la personne la plus drôle de la pièce, ou tu le crois juste ?", depth: "leger" },
      { title: "De quoi ris-tu en cachette ?", depth: "profond" },
    ],
  },
  {
    id: "valeurs",
    label: "Valeurs de vie",
    emoji: "🧭",
    color: "#5EE6C5",
    quizzes: [
      { title: "Qu'est-ce qui te définit vraiment ?", depth: "profond" },
      { title: "Quelle est ta boussole intérieure ?", depth: "profond" },
      { title: "Quel rêve d'enfance n'as-tu jamais réalisé ?", depth: "profond" },
    ],
  },
  {
    id: "argent",
    label: "Rapport à l'argent",
    emoji: "💰",
    color: "#F5C518",
    quizzes: [
      { title: "Dépensier·ère ou économe dans l'âme ?", depth: "leger" },
      { title: "Quel est ton rapport secret à l'argent ?", depth: "profond" },
      { title: "Quel est ton petit plaisir coupable financier ?", depth: "leger" },
    ],
  },
  {
    id: "travail",
    label: "Travail & ambition",
    emoji: "🚀",
    color: "#FF6B6B",
    quizzes: [
      { title: "Quel type de collègue es-tu ?", depth: "leger" },
      { title: "Es-tu fait·e pour diriger, ou pour inspirer en coulisses ?", depth: "leger" },
      { title: "Que ferais-tu si l'échec n'existait pas ?", depth: "profond" },
    ],
  },
  {
    id: "culture",
    label: "Culture",
    emoji: "🎬",
    color: "#B18CFF",
    quizzes: [
      { title: "Quel personnage de film es-tu vraiment ?", depth: "leger" },
      { title: "Ta bande-son personnelle te ressemble-t-elle ?", depth: "leger" },
      { title: "Quelle guilty pleasure culturelle caches-tu ?", depth: "leger" },
    ],
  },
];

export function getCategory(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

export function findQuizCategory(title: string): Category | undefined {
  return CATEGORIES.find((c) => c.quizzes.some((q) => q.title === title));
}

/** Retrouve un test du catalogue à partir de son slug (utilisé pour la génération paresseuse). */
export function findCatalogQuizBySlug(
  slug: string,
): { title: string; depth: Depth; category: Category } | undefined {
  for (const category of CATEGORIES) {
    const quiz = category.quizzes.find((q) => slugify(q.title) === slug);
    if (quiz) return { title: quiz.title, depth: quiz.depth, category };
  }
  return undefined;
}

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
