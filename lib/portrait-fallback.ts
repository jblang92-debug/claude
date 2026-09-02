// Repli local pour le portrait quand ANTHROPIC_API_KEY n'est pas configurée :
// permet de tester le parcours complet (y compris les tests pré-écrits) sans
// clé payante. Moins personnalisé que la génération IA (ne tient pas compte
// des réponses précises), mais garde le même ton chaleureux et fun.

import type { GeneratedCompat, GeneratedPortrait } from "./ai";

interface FallbackEntry {
  portrait: string;
  traits: [string, string, string, string];
}

const FALLBACK_ENTRIES: FallbackEntry[] = [
  {
    portrait:
      "Tu avances dans la vie avec une énergie qu'on remarque tout de suite. Tu sais ce que tu veux, et tu n'as pas peur de le montrer. Les gens autour de toi se sentent souvent portés par ton enthousiasme. Une belle dose de spontanéité, et ça se voit.",
    traits: ["Spontané·e", "Énergique", "Direct·e", "Chaleureux·se"],
  },
  {
    portrait:
      "Il y a chez toi un vrai mélange de douceur et de détermination. Tu prends le temps d'écouter avant d'agir, mais une fois décidé·e, rien ne t'arrête vraiment. Tes proches savent qu'ils peuvent compter sur toi dans les moments qui comptent.",
    traits: ["Attentif·ve", "Déterminé·e", "Fiable", "Posé·e"],
  },
  {
    portrait:
      "Tu as ce truc en plus : une curiosité qui te pousse toujours à voir les choses sous un autre angle. Rien ne t'ennuie plus que la routine, et ça se sent dans ta façon d'aborder les gens comme les situations. Un vrai esprit libre.",
    traits: ["Curieux·se", "Original·e", "Adaptable", "Vif·ve"],
  },
  {
    portrait:
      "Ton sens de l'humour est probablement la première chose qu'on retient de toi. Tu sais désamorcer les tensions et transformer un moment banal en souvenir marquant. Derrière la légèreté, il y a aussi une vraie sensibilité, plus discrète.",
    traits: ["Drôle", "Sensible", "Sociable", "Généreux·se"],
  },
  {
    portrait:
      "Tu fonctionnes beaucoup à l'instinct, et il te trompe rarement. Il y a une forme de sérénité chez toi, même quand tout s'accélère autour. Les gens viennent naturellement te parler quand ça ne va pas — tu sais mettre à l'aise, sans forcer.",
    traits: ["Intuitif·ve", "Serein·e", "Rassurant·e", "Authentique"],
  },
  {
    portrait:
      "Ambitieux·se sans jamais perdre ton côté humain, tu avances avec méthode mais pas sans passion. Tu aimes les défis, surtout ceux que personne d'autre n'ose relever. Une belle capacité à te relever vite, aussi, quand ça ne se passe pas comme prévu.",
    traits: ["Ambitieux·se", "Passionné·e", "Résilient·e", "Méthodique"],
  },
];

let cursor = Math.floor(Math.random() * FALLBACK_ENTRIES.length);

function pickFallback(): FallbackEntry {
  const entry = FALLBACK_ENTRIES[cursor % FALLBACK_ENTRIES.length];
  cursor++;
  return entry;
}

export function fallbackPortrait(): GeneratedPortrait {
  const entry = pickFallback();
  return { portrait: entry.portrait, traits: [...entry.traits] };
}

const COMPAT_TEXTS = [
  "Vous vous complétez plus que vous ne le pensez : là où l'un fonce, l'autre pose les bonnes questions.",
  "Une belle énergie commune se dégage de vos deux profils, avec juste assez de différences pour ne jamais s'ennuyer.",
  "Vos points communs sautent aux yeux, et vos différences donnent plutôt du relief à la relation.",
  "Vous n'abordez pas les choses pareil, mais c'est justement ce qui rend le duo intéressant.",
  "Un vrai équilibre : ce qui manque à l'un, l'autre semble l'avoir en réserve.",
];

/** Repli local (sans IA) pour la compatibilité en mode Duo. */
export function fallbackCompat(): GeneratedCompat {
  const percent = 55 + Math.floor(Math.random() * 40); // 55-94, jamais trop bas ni parfait
  const compatText = COMPAT_TEXTS[Math.floor(Math.random() * COMPAT_TEXTS.length)];
  return { percent, compatText };
}
