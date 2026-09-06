import type { AxisKey } from "./axes";

export interface QuestionOption {
  id: string;
  label: string;
  /** Contribution à chaque axe touché par cette option, entre -1 et 1. */
  weights: Partial<Record<AxisKey, number>>;
}

export interface OnboardingQuestion {
  id: string;
  prompt: string;
  options: QuestionOption[];
}

/**
 * Questionnaire d'inscription (première version, à ajuster). 21 questions,
 * 3 par axe, ton chaleureux et direct — même esprit que
 * `lib/preseeded-tests.ts` côté app de tests, adapté à la rencontre.
 *
 * Le scoring (voir scoring.ts) est une moyenne pondérée déterministe :
 * aucun appel IA n'intervient dans ce calcul.
 */
export const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  // --- humour ---
  {
    id: "humour_1",
    prompt: "Un rendez-vous commence par un fou rire gênant. Toi :",
    options: [
      { id: "a", label: "Tu restes concentré·e, on est là pour se connaître sérieusement", weights: { humour: -1 } },
      { id: "b", label: "Tu souris poliment et tu passes à autre chose", weights: { humour: -0.4 } },
      { id: "c", label: "Tu embraies avec une vanne pour détendre l'atmosphère", weights: { humour: 0.4 } },
      { id: "d", label: "Tu en rajoutes une couche, l'ironie c'est ton langage d'amour", weights: { humour: 1 } },
    ],
  },
  {
    id: "humour_2",
    prompt: "Ton style d'humour préféré :",
    options: [
      { id: "a", label: "Pas vraiment client, je préfère les discussions de fond", weights: { humour: -1 } },
      { id: "b", label: "Les jeux de mots gentils et les private jokes", weights: { humour: -0.4 } },
      { id: "c", label: "L'autodérision, se moquer de soi avant les autres", weights: { humour: 0.4 } },
      { id: "d", label: "Le second degré permanent, rien n'est jamais tout à fait sérieux", weights: { humour: 1 } },
    ],
  },
  {
    id: "humour_3",
    prompt: "On se moque gentiment de toi devant tout le monde :",
    options: [
      { id: "a", label: "Ça me vexe un peu, j'aime qu'on prenne les choses au sérieux", weights: { humour: -1 } },
      { id: "b", label: "Je fais bonne figure mais j'aurais préféré éviter", weights: { humour: -0.4 } },
      { id: "c", label: "Je relance direct, c'est un jeu", weights: { humour: 0.4 } },
      { id: "d", label: "J'adore ça, plus c'est absurde mieux c'est", weights: { humour: 1 } },
    ],
  },

  // --- énergie sociale ---
  {
    id: "energie_1",
    prompt: "Ton vendredi soir idéal :",
    options: [
      { id: "a", label: "Canapé, plaid, zéro sollicitation", weights: { energie: -1 } },
      { id: "b", label: "Dîner tranquille avec une ou deux personnes proches", weights: { energie: -0.4 } },
      { id: "c", label: "Un bar avec un groupe d'amis qui s'agrandit au fil de la soirée", weights: { energie: 0.4 } },
      { id: "d", label: "Sortir jusqu'au bout de la nuit, plus on est nombreux mieux c'est", weights: { energie: 1 } },
    ],
  },
  {
    id: "energie_2",
    prompt: "Après une semaine épuisante, tu recharges tes batteries en :",
    options: [
      { id: "a", label: "Ne voyant absolument personne pendant 48h", weights: { energie: -1 } },
      { id: "b", label: "Voyant une personne à la fois, jamais en groupe", weights: { energie: -0.4 } },
      { id: "c", label: "Enchaînant les activités avec des gens différents", weights: { energie: 0.4 } },
      { id: "d", label: "Organisant quelque chose pour un maximum de monde", weights: { energie: 1 } },
    ],
  },
  {
    id: "energie_3",
    prompt: "Dans une soirée où tu ne connais presque personne :",
    options: [
      { id: "a", label: "Tu restes près de la seule personne que tu connais", weights: { energie: -1 } },
      { id: "b", label: "Tu attends qu'on vienne vers toi", weights: { energie: -0.4 } },
      { id: "c", label: "Tu vas facilement vers les autres", weights: { energie: 0.4 } },
      { id: "d", label: "Tu connais déjà la moitié de la salle avant la fin de soirée", weights: { energie: 1 } },
    ],
  },

  // --- valeurs / rapport aux règles ---
  {
    id: "valeurs_1",
    prompt: "Un week-end sans aucun plan prévu à l'avance :",
    options: [
      { id: "a", label: "Ça me stresse, j'ai besoin d'un minimum de structure", weights: { valeurs: 1 } },
      { id: "b", label: "Je préfère avoir au moins une idée en tête", weights: { valeurs: 0.4 } },
      { id: "c", label: "Ça me va, je m'organise au fil de l'eau", weights: { valeurs: -0.4 } },
      { id: "d", label: "C'est exactement ce qu'il me faut, la spontanéité totale", weights: { valeurs: -1 } },
    ],
  },
  {
    id: "valeurs_2",
    prompt: "Ta façon de gérer ton quotidien (agenda, tâches, budget) :",
    options: [
      { id: "a", label: "Tout est planifié et suivi de près", weights: { valeurs: 1 } },
      { id: "b", label: "J'ai des repères mais je m'adapte", weights: { valeurs: 0.4 } },
      { id: "c", label: "Je gère au feeling, ça marche plutôt bien", weights: { valeurs: -0.4 } },
      { id: "d", label: "Aucune structure, je vis au jour le jour", weights: { valeurs: -1 } },
    ],
  },
  {
    id: "valeurs_3",
    prompt: "Un projet de voyage à deux, tu imagines plutôt :",
    options: [
      { id: "a", label: "Un itinéraire détaillé, réservé à l'avance", weights: { valeurs: 1 } },
      { id: "b", label: "Les grandes lignes fixées, le reste ouvert", weights: { valeurs: 0.4 } },
      { id: "c", label: "Une destination et on verra sur place", weights: { valeurs: -0.4 } },
      { id: "d", label: "Sac à dos et improvisation totale", weights: { valeurs: -1 } },
    ],
  },

  // --- ambition ---
  {
    id: "ambition_1",
    prompt: "Dans 5 ans, ce qui compte le plus pour toi :",
    options: [
      { id: "a", label: "Profiter du moment présent, sans trop me projeter", weights: { ambition: -1 } },
      { id: "b", label: "Un bon équilibre, sans me mettre la pression", weights: { ambition: -0.4 } },
      { id: "c", label: "Avoir avancé sur des objectifs clairs", weights: { ambition: 0.4 } },
      { id: "d", label: "Avoir construit quelque chose de solide et ambitieux", weights: { ambition: 1 } },
    ],
  },
  {
    id: "ambition_2",
    prompt: "Ton rapport au travail :",
    options: [
      { id: "a", label: "Un moyen de vivre, pas le centre de ma vie", weights: { ambition: -1 } },
      { id: "b", label: "Important mais pas envahissant", weights: { ambition: -0.4 } },
      { id: "c", label: "Une vraie source de motivation personnelle", weights: { ambition: 0.4 } },
      { id: "d", label: "Une priorité que j'assume, même si ça prend du temps", weights: { ambition: 1 } },
    ],
  },
  {
    id: "ambition_3",
    prompt: "On te propose une opportunité excitante mais risquée :",
    options: [
      { id: "a", label: "Je préfère la stabilité, merci", weights: { ambition: -1 } },
      { id: "b", label: "J'y réfléchis longuement avant de trancher", weights: { ambition: -0.4 } },
      { id: "c", label: "Je suis plutôt tenté·e si le jeu en vaut la chandelle", weights: { ambition: 0.4 } },
      { id: "d", label: "Je fonce, le risque fait partie du jeu", weights: { ambition: 1 } },
    ],
  },

  // --- attachement ---
  {
    id: "attachement_1",
    prompt: "En couple, ton rythme idéal de contact au quotidien :",
    options: [
      { id: "a", label: "Chacun sa vie, on se retrouve quand ça arrive naturellement", weights: { attachement: -1 } },
      { id: "b", label: "Un message de temps en temps suffit", weights: { attachement: -0.4 } },
      { id: "c", label: "On se donne des nouvelles régulièrement dans la journée", weights: { attachement: 0.4 } },
      { id: "d", label: "J'aime être en contact quasi continu", weights: { attachement: 1 } },
    ],
  },
  {
    id: "attachement_2",
    prompt: "Ton ou ta partenaire part une semaine sans toi. Tu ressens :",
    options: [
      { id: "a", label: "Un vrai soulagement, du temps pour moi", weights: { attachement: -1 } },
      { id: "b", label: "Aucun souci particulier", weights: { attachement: -0.4 } },
      { id: "c", label: "Un petit manque, j'ai hâte que ça revienne", weights: { attachement: 0.4 } },
      { id: "d", label: "Un manque marqué dès les premiers jours", weights: { attachement: 1 } },
    ],
  },
  {
    id: "attachement_3",
    prompt: "Ta vision d'une relation qui dure :",
    options: [
      { id: "a", label: "Deux vies bien séparées qui se croisent souvent", weights: { attachement: -1 } },
      { id: "b", label: "De l'autonomie, avec des moments à deux réguliers", weights: { attachement: -0.4 } },
      { id: "c", label: "Beaucoup de temps partagé, en gardant un peu d'espace", weights: { attachement: 0.4 } },
      { id: "d", label: "Une vie très imbriquée, presque tout en commun", weights: { attachement: 1 } },
    ],
  },

  // --- ouverture ---
  {
    id: "ouverture_1",
    prompt: "Un restaurant à la cuisine que tu ne connais pas du tout :",
    options: [
      { id: "a", label: "Je préfère une valeur sûre", weights: { ouverture: -1 } },
      { id: "b", label: "Je regarde d'abord la carte avant de me décider", weights: { ouverture: -0.4 } },
      { id: "c", label: "Je tente volontiers, la découverte me plaît", weights: { ouverture: 0.4 } },
      { id: "d", label: "J'adore, plus c'est dépaysant mieux c'est", weights: { ouverture: 1 } },
    ],
  },
  {
    id: "ouverture_2",
    prompt: "Face à un changement soudain de programme :",
    options: [
      { id: "a", label: "Ça me déstabilise, je préfère m'y tenir", weights: { ouverture: -1 } },
      { id: "b", label: "Je m'adapte mais avec un temps d'ajustement", weights: { ouverture: -0.4 } },
      { id: "c", label: "Aucun souci, ça fait partie du jeu", weights: { ouverture: 0.4 } },
      { id: "d", label: "Je trouve ça excitant, l'imprévu me stimule", weights: { ouverture: 1 } },
    ],
  },
  {
    id: "ouverture_3",
    prompt: "Tes loisirs sur les deux dernières années :",
    options: [
      { id: "a", label: "Toujours les mêmes, j'y trouve mon compte", weights: { ouverture: -1 } },
      { id: "b", label: "Surtout les mêmes, avec quelques essais", weights: { ouverture: -0.4 } },
      { id: "c", label: "J'ai testé pas mal de nouvelles choses", weights: { ouverture: 0.4 } },
      { id: "d", label: "Une liste de nouveautés impossible à tenir", weights: { ouverture: 1 } },
    ],
  },

  // --- stabilité émotionnelle / expression ---
  {
    id: "emotion_1",
    prompt: "Quand quelque chose te touche fort (bonne ou mauvaise nouvelle) :",
    options: [
      { id: "a", label: "Je le vis surtout intérieurement, calmement", weights: { stabilite_emotionnelle: -1 } },
      { id: "b", label: "Je le montre un peu, sans en faire trop", weights: { stabilite_emotionnelle: -0.4 } },
      { id: "c", label: "Ça se voit clairement sur mon visage et dans ma voix", weights: { stabilite_emotionnelle: 0.4 } },
      { id: "d", label: "Je l'exprime pleinement, sans retenue", weights: { stabilite_emotionnelle: 1 } },
    ],
  },
  {
    id: "emotion_2",
    prompt: "En cas de désaccord avec un·e proche :",
    options: [
      { id: "a", label: "Je reste calme et pose les choses posément", weights: { stabilite_emotionnelle: -1 } },
      { id: "b", label: "Je discute posément, sauf si ça persiste", weights: { stabilite_emotionnelle: -0.4 } },
      { id: "c", label: "Le ton peut monter un peu avant de se calmer", weights: { stabilite_emotionnelle: 0.4 } },
      { id: "d", label: "Ça peut vite devenir intense des deux côtés", weights: { stabilite_emotionnelle: 1 } },
    ],
  },
  {
    id: "emotion_3",
    prompt: "On te décrirait plutôt comme quelqu'un :",
    options: [
      { id: "a", label: "Posé·e, difficile à déstabiliser", weights: { stabilite_emotionnelle: -1 } },
      { id: "b", label: "Globalement stable, avec de rares écarts", weights: { stabilite_emotionnelle: -0.4 } },
      { id: "c", label: "Expressif·ve, on sait vite ce que je ressens", weights: { stabilite_emotionnelle: 0.4 } },
      { id: "d", label: "Intense, mes émotions prennent beaucoup de place", weights: { stabilite_emotionnelle: 1 } },
    ],
  },
];
