// Génération procédurale et déterministe du personnage visuel associé à un
// résultat : à partir d'un "seed" (dérivé de l'identifiant du résultat), la
// même forme, les mêmes couleurs, le même surnom et la même rareté sont
// toujours reproduits — revisiter un résultat affiche exactement le même
// personnage. Porté depuis le prototype de référence (aucune dépendance au
// DOM : utilisable aussi bien côté serveur que client).

export interface BuiltCharacter {
  svg: string;
  tier: "Commun" | "Rare" | "Épique" | "Légendaire";
  tierColor: string;
  nickname: string;
  secondary: string;
}

function seededRng(seedStr: string): () => number {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

const BLOB_PATHS = [
  "M80,18 C112,16 142,42 144,76 C146,110 118,146 82,144 C46,142 16,112 18,76 C20,40 48,20 80,18 Z",
  "M74,20 C106,12 140,34 146,68 C152,102 130,138 96,146 C62,154 24,132 18,96 C12,60 42,28 74,20 Z",
  "M84,22 C118,26 142,56 138,90 C134,124 100,148 66,142 C32,136 12,102 20,68 C28,34 50,18 84,22 Z",
  "M78,16 C108,10 144,30 148,64 C152,98 134,136 98,146 C62,156 22,138 14,102 C6,66 28,24 78,16 Z",
];

const NICK_NOUNS = ["Voyageur", "Gardien", "Funambule", "Alchimiste", "Corsaire", "Poète", "Stratège", "Danseur", "Explorateur", "Sentinelle", "Vagabond", "Oracle", "Artisan", "Aventurier", "Complice", "Rêveur"];
const NICK_ADJ = ["Solaire", "Nocturne", "Espiègle", "Tranquille", "Flamboyant", "Discret", "Électrique", "Intrépide", "Mystérieux", "Chaleureux", "Sauvage", "Lumineux", "Insaisissable", "Généreux", "Curieux", "Facétieux"];

interface Tier {
  name: BuiltCharacter["tier"];
  min: number;
  color: string | null;
  particles: number;
  ring: boolean;
}

const TIERS: Tier[] = [
  { name: "Commun", min: 0, color: null, particles: 0, ring: false },
  { name: "Rare", min: 0.62, color: null, particles: 4, ring: true },
  { name: "Épique", min: 0.87, color: "#B18CFF", particles: 7, ring: true },
  { name: "Légendaire", min: 0.97, color: "#FFD24C", particles: 11, ring: true },
];

function rollTier(roll: number, secondary: string): Tier & { color: string } {
  let tier = TIERS[0];
  for (const t of TIERS) {
    if (roll >= t.min) tier = t;
  }
  return { ...tier, color: tier.color || secondary };
}

/**
 * uid : identifiant unique pour éviter les collisions de <defs> quand
 * plusieurs personnages sont affichés en même temps (ex. écran de
 * compatibilité en mode Duo).
 */
export function buildCharacter(
  seedStr: string,
  color: string,
  emoji?: string | null,
  uid?: string,
): BuiltCharacter {
  const resolvedUid = uid || seedStr.replace(/[^a-zA-Z0-9]/g, "").slice(0, 12) || "char";
  const rng = seededRng(seedStr || "default");
  const path = pick(rng, BLOB_PATHS);
  const eyeStyle = pick(rng, ["round", "sleepy", "wink", "wide"]);
  const mouthStyle = pick(rng, ["smile", "grin", "smirk", "oh"]);
  const pattern = pick(rng, ["dots", "freckles", "plain"]);
  const palette = ["#F5C518", "#FF6B6B", "#5EE6C5", "#B18CFF"].filter(
    (c) => c.toLowerCase() !== (color || "").toLowerCase(),
  );
  const secondary = pick(rng, palette.length ? palette : ["#F5C518"]);
  const tilt = Math.round((rng() - 0.5) * 12);
  const nickname = `${pick(rng, NICK_NOUNS)} ${pick(rng, NICK_ADJ)}`;
  const tier = rollTier(rng(), secondary);

  let eyes = "";
  if (eyeStyle === "round") eyes = `<circle cx="65" cy="75" r="6" fill="#170F2B"/><circle cx="97" cy="75" r="6" fill="#170F2B"/><circle cx="67" cy="73" r="1.6" fill="#fff"/><circle cx="99" cy="73" r="1.6" fill="#fff"/>`;
  else if (eyeStyle === "sleepy") eyes = `<path d="M58,76 Q65,68 72,76" stroke="#170F2B" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M90,76 Q97,68 104,76" stroke="#170F2B" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  else if (eyeStyle === "wink") eyes = `<circle cx="65" cy="75" r="6" fill="#170F2B"/><circle cx="67" cy="73" r="1.6" fill="#fff"/><path d="M90,75 Q97,70 104,75" stroke="#170F2B" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  else eyes = `<circle cx="65" cy="75" r="8" fill="#170F2B"/><circle cx="97" cy="75" r="8" fill="#170F2B"/><circle cx="67" cy="72" r="2.2" fill="#fff"/><circle cx="99" cy="72" r="2.2" fill="#fff"/>`;

  let mouth = "";
  if (mouthStyle === "smile") mouth = `<path d="M62,92 Q81,106 100,92" stroke="#170F2B" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  else if (mouthStyle === "grin") mouth = `<path d="M60,90 Q81,112 102,90 Q81,101 60,90 Z" fill="#170F2B"/>`;
  else if (mouthStyle === "smirk") mouth = `<path d="M65,94 Q85,100 98,88" stroke="#170F2B" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  else mouth = `<ellipse cx="81" cy="96" rx="7" ry="9" fill="#170F2B"/>`;

  let deco = "";
  if (pattern === "dots") {
    for (let i = 0; i < 5; i++) {
      const dx = 35 + rng() * 90;
      const dy = 32 + rng() * 45;
      deco += `<circle cx="${dx.toFixed(1)}" cy="${dy.toFixed(1)}" r="4" fill="url(#body-${resolvedUid})" opacity="0.5"/>`;
    }
  } else if (pattern === "freckles") {
    for (let i = 0; i < 4; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const dx = 81 + side * (18 + rng() * 8);
      const dy = 82 + rng() * 8;
      deco += `<circle cx="${dx.toFixed(1)}" cy="${dy.toFixed(1)}" r="1.6" fill="#170F2B" opacity="0.4"/>`;
    }
  }

  let sparkles = "";
  for (let i = 0; i < tier.particles; i++) {
    const ang = rng() * Math.PI * 2;
    const dist = 78 + rng() * 30;
    const sx = 82 + Math.cos(ang) * dist;
    const sy = 84 + Math.sin(ang) * dist * 0.9;
    const s = 3 + rng() * 4;
    sparkles += `<path transform="translate(${sx.toFixed(1)},${sy.toFixed(1)})" d="M0,-${s} L${s * 0.3},-${s * 0.3} L${s},0 L${s * 0.3},${s * 0.3} L0,${s} L-${s * 0.3},${s * 0.3} L-${s},0 L-${s * 0.3},-${s * 0.3} Z" fill="${tier.color}" opacity="${(0.55 + rng() * 0.4).toFixed(2)}"/>`;
  }

  const badge = emoji
    ? `<circle cx="136" cy="28" r="17" fill="#170F2B"/><circle cx="136" cy="28" r="17" fill="none" stroke="${tier.color}" stroke-width="2"/><text x="136" y="34" font-size="16" text-anchor="middle">${emoji}</text>`
    : "";
  const ring = tier.ring
    ? `<circle cx="82" cy="86" r="86" fill="none" stroke="${tier.color}" stroke-width="2" opacity="0.55" stroke-dasharray="3 5"/>`
    : "";

  const svg = `
    <svg viewBox="0 0 172 180" width="150" height="157" style="overflow:visible;">
      <defs>
        <linearGradient id="body-${resolvedUid}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${color}"/>
          <stop offset="100%" stop-color="${secondary}"/>
        </linearGradient>
        <radialGradient id="halo-${resolvedUid}" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stop-color="${color}" stop-opacity="0.55"/>
          <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <ellipse cx="86" cy="90" rx="86" ry="86" fill="url(#halo-${resolvedUid})"/>
      ${ring}
      ${sparkles}
      <g transform="translate(4,4) rotate(${tilt} 82 90)">
        <ellipse cx="82" cy="152" rx="46" ry="8" fill="#000" opacity="0.18"/>
        <rect x="52" y="130" width="10" height="22" rx="5" fill="url(#body-${resolvedUid})"/>
        <rect x="76" y="134" width="10" height="24" rx="5" fill="url(#body-${resolvedUid})"/>
        <rect x="100" y="130" width="10" height="22" rx="5" fill="url(#body-${resolvedUid})"/>
        <path d="${path}" fill="url(#body-${resolvedUid})"/>
        <path d="${path}" fill="none" stroke="#170F2B" stroke-opacity="0.12" stroke-width="2"/>
        ${deco}
        ${eyes}
        ${mouth}
      </g>
      ${badge}
    </svg>
  `;

  return { svg, tier: tier.name, tierColor: tier.color, nickname, secondary };
}

/** Seed stable pour un résultat donné : toujours le même personnage à la revisite. */
export function resultSeed(resultId: string, testSlug: string): string {
  return `${testSlug}|${resultId}`;
}
