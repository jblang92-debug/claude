// Contenu pré-écrit et modéré d'Action ou Vérité, porté depuis le prototype
// de référence. Injecté en base via supabase/seed.sql (table
// `dare_truth_prompts`) — jamais de contenu généré par les utilisateurs ici,
// voir lib/party-content.ts vs. les prompts perso par salon (non publics).

import { seededRng, pick } from "./character";

export type PartyType = "action" | "verite";
export type PartyDepth = "leger" | "ose";

export interface PartyPrompt {
  type: PartyType;
  depth: PartyDepth;
  text: string;
}

const VERITE_LEGER = [
  "Quelle est la dernière chose ridicule que tu as googlée ?",
  "Quel est ton pire mensonge pour éviter une sortie ?",
  "Quelle chanson honteuse connais-tu par cœur ?",
  "Quel est ton plus grand échec de cuisine ?",
  "Qui, dans ce groupe, ferait le meilleur agent secret ?",
  "Quelle est ta pire habitude que tu n'assumes jamais ?",
  "Quel est le compliment le plus bizarre qu'on t'ait fait ?",
  "Quelle appli passes-tu le plus de temps à scroller sans but ?",
  "Quel est ton talent le plus inutile ?",
  "Quelle est la dernière chose pour laquelle tu as menti sur ton âge, ton avis ou tes goûts ?",
  "Quel est ton plus grand \"fail\" en public ?",
  "Si tu devais échanger de vie avec quelqu'un du groupe pour une semaine, qui choisirais-tu ?",
  "Quel est le film que tu prétends adorer mais que tu trouves nul ?",
  "Quelle est la chose la plus étrange que tu aies mangée par curiosité ?",
  "Quel est ton plus grand regret culinaire de cette année ?",
];

const ACTION_LEGER = [
  "Imite ton animal préféré pendant 15 secondes",
  "Fais une imitation de quelqu'un du groupe, les autres devinent qui",
  "Parle avec un accent au choix jusqu'à ton prochain tour",
  "Raconte une blague, si personne ne rit tu bois une gorgée / gages",
  "Danse 20 secondes sans musique",
  "Laisse le groupe poster un statut à ta place (sous contrôle, rien de gênant)",
  "Fais 10 pompes ou un défi physique au choix du groupe",
  "Chante le refrain d'une chanson au hasard",
  "Fais deviner un mot en mimant, sans parler",
  "Échange un vêtement avec ton voisin pendant 3 tours",
  "Improvise une pub pour un objet dans la pièce",
  "Fais un compliment sincère à chaque personne du groupe",
];

const VERITE_OSE = [
  "Quel est le compliment qui te fait le plus fondre ?",
  "Quelle est la qualité que tu trouves la plus irrésistible chez quelqu'un ?",
  "Raconte ton rendez-vous le plus mémorable, en bien ou en mal",
  "Quel est ton genre de flirt : direct, taquin ou discret ?",
  "Quelle est la dernière fois où tu as eu un coup de cœur soudain ?",
  "Quel geste tout simple te fait complètement craquer chez quelqu'un ?",
  "As-tu déjà eu le béguin pour quelqu'un dans cette pièce, présent ou passé ?",
  "Quelle est ta définition d'une soirée romantique parfaite ?",
  "Quel est le message le plus osé que tu aies envoyé ou reçu (sans détails explicites) ?",
  "Préfères-tu qu'on te drague avec des mots ou avec des gestes ?",
  "Quelle est la chose la plus séduisante que quelqu'un ait faite pour toi ?",
  "As-tu un type précis, physique ou de personnalité ? Décris-le",
];

const ACTION_OSE = [
  "Fais un compliment sincère et un peu troublant à la personne à ta droite",
  "Regarde quelqu'un du groupe droit dans les yeux pendant 20 secondes sans rire",
  "Envoie un message vocal charmeur à quelqu'un de ton choix, en dehors du groupe",
  "Raconte à voix haute le début d'un scénario de rendez-vous parfait, improvisé",
  "Fais un slow de 15 secondes avec la personne de ton choix dans le groupe",
  "Chuchote un compliment à l'oreille de ton voisin",
  "Décris, sans nommer qui, ton type physique idéal en 3 mots",
  "Propose un \"cul sec\" romantique : trinque avec quelqu'un en le regardant dans les yeux",
  "Fais deviner au groupe ton dernier crush à base d'indices seulement",
  "Improvise une déclaration extravagante à un objet de la pièce, façon grand amour",
];

export const PARTY_CONTENT: PartyPrompt[] = [
  ...VERITE_LEGER.map((text): PartyPrompt => ({ type: "verite", depth: "leger", text })),
  ...ACTION_LEGER.map((text): PartyPrompt => ({ type: "action", depth: "leger", text })),
  ...VERITE_OSE.map((text): PartyPrompt => ({ type: "verite", depth: "ose", text })),
  ...ACTION_OSE.map((text): PartyPrompt => ({ type: "action", depth: "ose", text })),
];

export const PARTY_NICK_NOUNS = ["Casse-cou", "Séducteur·rice", "Provocateur·rice", "Stratège", "Frimeur·se", "Sage", "Farceur·se", "Charmeur·se"];
export const PARTY_NICK_ADJ = ["Audacieux·se", "Charmeur·se", "Mystérieux·se", "Espiègle", "Intense", "Taquin·e", "Magnétique", "Imprévisible"];

/** Surnom de circonstance, déterministe par prénom (même prénom -> même surnom pendant la partie). */
export function partyNickname(name: string): string {
  const rng = seededRng(name + "-party");
  return `${pick(rng, PARTY_NICK_NOUNS)} ${pick(rng, PARTY_NICK_ADJ)}`;
}
