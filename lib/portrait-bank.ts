import type { ThemeId } from "./themes";

interface TraitPortrait {
  title: string;
  detail: string;
}

export const PORTRAIT_BANK: Record<ThemeId, Record<string, TraitPortrait>> = {
  amour: {
    romantique: {
      title: "Le cœur romantique",
      detail:
        "Tu aimes les grands gestes et les petites attentions qui font chavirer le cœur. Pour toi, l'amour se savoure comme une belle histoire qu'on prend le temps d'écrire.",
    },
    aventurier: {
      title: "Le cœur aventurier",
      detail:
        "Tu as besoin que ça bouge, que ça surprenne, que ça pétille. L'amour, pour toi, c'est une aventure qu'on choisit de vivre à fond, jamais une routine.",
    },
    loyal: {
      title: "Le cœur loyal",
      detail:
        "Ta présence rassure et ta parole est un roc sur lequel on peut compter. Quand tu t'engages, c'est pour de vrai, sans demi-mesure.",
    },
    independant: {
      title: "Le cœur libre",
      detail:
        "Tu sais aimer sans jamais te perdre toi-même. Ton équilibre entre toi et l'autre est précieux, et c'est justement ce qui rend tes relations saines et durables.",
    },
  },
  amitie: {
    fidele: {
      title: "Le pilier du groupe",
      detail:
        "On sait qu'on peut compter sur toi, quoi qu'il arrive. Tu es de celles et ceux qui ne lâchent jamais, même quand les années passent.",
    },
    "boute-en-train": {
      title: "L'âme de la fête",
      detail:
        "Avec toi, l'ambiance monte toujours d'un cran. Tu transformes les moments ordinaires en souvenirs qu'on raconte encore des années après.",
    },
    confident: {
      title: "L'oreille qui compte",
      detail:
        "Les gens se confient à toi naturellement, parce que tu sais écouter sans juger. Ta discrétion et ta douceur en font un refuge pour tes proches.",
    },
    rassembleur: {
      title: "Le ciment de la bande",
      detail:
        "Tu es celui ou celle qui connecte tout le monde et qui fait vivre le groupe. Sans toi, beaucoup de belles soirées n'existeraient tout simplement pas.",
    },
  },
  humour: {
    blagueur: {
      title: "Le/la stand-uppeur·se du groupe",
      detail:
        "Tu ne rates jamais une occasion de placer une bonne blague. Ton humour direct et généreux met tout le monde de bonne humeur en un rien de temps.",
    },
    "pince-sans-rire": {
      title: "Le flegme légendaire",
      detail:
        "Tu balances des punchlines sans même sourire, et c'est ce qui les rend encore plus drôles. Ton humour pince-sans-rire surprend et fait toujours mouche.",
    },
    spontane: {
      title: "L'improvisateur·ice né·e",
      detail:
        "Chez toi, l'humour jaillit sans prévenir, souvent là où on l'attend le moins. Avec toi, personne ne sait jamais ce qui va se passer, et c'est ça qui est génial.",
    },
    referentiel: {
      title: "L'encyclopédie ambulante",
      detail:
        "Tu as toujours LA référence parfaite au bon moment. Ton humour construit des private jokes qui deviennent des classiques dans ton entourage.",
    },
  },
  valeurs: {
    liberte: {
      title: "L'esprit libre",
      detail:
        "Rien ne t'effraie plus qu'un horizon bouché. Tu avances dans la vie en gardant toujours une porte ouverte vers l'imprévu et la liberté.",
    },
    stabilite: {
      title: "Le bâtisseur de repères",
      detail:
        "Tu préfères construire du solide plutôt que courir après des promesses fragiles. Cette stabilité que tu cultives devient une vraie force pour toi et pour ceux qui t'entourent.",
    },
    impact: {
      title: "Le cœur engagé",
      detail:
        "Ce qui te fait avancer, c'est l'idée de laisser une trace positive. Tu ne fais jamais les choses juste pour toi, mais toujours en pensant à ce qu'elles apportent aux autres.",
    },
    plaisir: {
      title: "L'épicurien·ne assumé·e",
      detail:
        "Tu sais savourer chaque instant sans culpabiliser. Cette capacité à profiter pleinement de la vie est contagieuse pour tous ceux qui t'entourent.",
    },
  },
  argent: {
    epargnant: {
      title: "Le/la stratège de l'épargne",
      detail:
        "Tu préfères la sécurité d'un matelas bien rempli à l'euphorie d'une dépense impulsive. Cette prudence te permet de dormir tranquille, même quand la vie surprend.",
    },
    flambeur: {
      title: "Le cœur généreux avec soi-même",
      detail:
        "Tu préfères profiter maintenant plutôt que d'attendre un hypothétique 'plus tard'. Cette envie de te faire plaisir sans te freiner fait aussi ton charme.",
    },
    genereux: {
      title: "Le portefeuille généreux",
      detail:
        "Pour toi, l'argent prend tout son sens quand il est partagé. Tu es de celles et ceux qui pensent naturellement aux autres avant de penser à eux-mêmes.",
    },
    strategique: {
      title: "Le calculateur malin",
      detail:
        "Tu ne dépenses jamais sans avoir réfléchi à la meilleure option. Ton sens de la stratégie financière fait souvent de toi la personne qu'on consulte avant un achat important.",
    },
  },
  travail: {
    ambitieux: {
      title: "Le/la conquérant·e",
      detail:
        "Tu vises toujours plus haut, et rien ne te fait plus peur que la stagnation. Cette ambition qui t'anime est le moteur de toutes tes réussites.",
    },
    equilibre: {
      title: "Le/la sage de l'équilibre",
      detail:
        "Tu sais qu'une carrière réussie ne vaut rien sans une vie épanouie à côté. Cet équilibre que tu protèges fait de toi quelqu'un de solide sur la durée.",
    },
    createur: {
      title: "L'esprit créatif",
      detail:
        "Tu as besoin de liberté pour inventer, tester, réinventer. Les cadres trop rigides t'étouffent, alors que les idées neuves te font vibrer.",
    },
    collectif: {
      title: "Le/la fédérateur·ice d'équipe",
      detail:
        "Pour toi, une réussite qui ne se partage pas n'a pas beaucoup de saveur. Tu tires toute une équipe vers le haut, presque sans t'en rendre compte.",
    },
  },
  culture: {
    nostalgique: {
      title: "Le cœur nostalgique",
      detail:
        "Tu chéris ce qui a marqué ton histoire et tu y reviens avec plaisir. Cette fidélité à tes classiques est une vraie source de réconfort.",
    },
    explorateur: {
      title: "Le/la dénicheur·se de pépites",
      detail:
        "Tu es toujours en quête de la prochaine découverte, celle que personne n'a encore repérée. Ta curiosité culturelle n'a jamais de limite.",
    },
    esthete: {
      title: "L'esthète exigeant·e",
      detail:
        "Tu cherches la qualité et la beauté avant tout, plus que la nouveauté ou la popularité. Ce goût affirmé fait de toi une référence pour ton entourage.",
    },
    populaire: {
      title: "Le/la fan de culture populaire",
      detail:
        "Tu aimes ce qui rassemble et fait vibrer le plus grand nombre. Partager les mêmes références que tout le monde, c'est ta façon à toi de créer du lien.",
    },
  },
  profil: {
    feu: {
      title: "🔥 Le Feu — fonceur·se",
      detail:
        "Ton énergie brûle intensément et entraîne tout le monde avec toi. Ton animal totem serait un renard flamboyant, ta couleur un rouge éclatant : tu fonces, tu vis, tu enflammes.",
    },
    eau: {
      title: "🌊 L'Eau — intuitif·ve",
      detail:
        "Tu ressens les choses avant même de les comprendre, et tu t'adaptes à tout avec une grâce naturelle. Ton animal totem serait un dauphin, ta couleur un bleu profond et apaisant.",
    },
    terre: {
      title: "🌳 La Terre — ancré·e",
      detail:
        "Tu es le repère solide sur lequel les autres s'appuient sans même y penser. Ton animal totem serait un ours tranquille, ta couleur un vert profond, enraciné.",
    },
    air: {
      title: "🌬️ L'Air — libre penseur·se",
      detail:
        "Ton esprit voyage plus vite que tout le reste et tes idées surprennent toujours. Ton animal totem serait un aigle, ta couleur un blanc lumineux, léger comme le vent.",
    },
  },
  compatibilite: {
    fusionnel: {
      title: "Le mode fusion",
      detail:
        "Tu vis les relations à fond, en connexion presque permanente avec l'autre. Cette proximité que tu recherches crée des liens d'une intensité rare.",
    },
    complementaire: {
      title: "Le mode complémentaire",
      detail:
        "Tu t'épanouis dans une relation où chacun apporte ce que l'autre n'a pas. Cet équilibre entre vos différences est justement ta plus grande force relationnelle.",
    },
    franc: {
      title: "Le mode franc-jeu",
      detail:
        "Tu préfères tout dire, quitte à bousculer, plutôt que de laisser les non-dits s'installer. Cette honnêteté sans filtre fait de toi quelqu'un de rare et précieux.",
    },
    zen: {
      title: "Le mode zen",
      detail:
        "Rien ne semble jamais vraiment te déstabiliser, même dans les moments de tension. Ta sérénité apaise naturellement les personnes qui t'entourent.",
    },
  },
};

export const OPENING_LINES = (name: string | undefined | null, themeLabel: string) => {
  const who = name && name.trim() ? name.trim() : "Toi";
  return [
    `${who}, voici ton portrait "${themeLabel}", tout frais sorti du four.`,
    `Alors ${who}, après avoir passé tes réponses au crible, voici ce qu'on a découvert.`,
    `${who}, prépare-toi : ton portrait "${themeLabel}" est plutôt révélateur.`,
    `On a analysé chacune de tes réponses, ${who}, et voici le résultat.`,
    `${who}, ton profil "${themeLabel}" est enfin prêt !`,
    `Le verdict est tombé, ${who} : voici ton portrait du jour.`,
  ];
};

export const CLOSING_LINES = [
  "En tout cas, une chose est sûre : il n'y a pas deux portraits identiques, et le tien te va à merveille.",
  "Bref, tu es unique, et ce petit portrait n'en est qu'un reflet parmi tant d'autres facettes.",
  "Et ça, ce n'est qu'un aperçu de tout ce qui fait de toi quelqu'un d'unique.",
  "À prendre avec le sourire, bien sûr — mais on n'est pas passés très loin de la vérité, non ?",
  "Voilà pour ce petit coup de projecteur sur toi. Partage-le, ça devrait faire sourire du monde.",
  "Ce portrait n'est qu'un début : la vraie histoire, c'est toi qui continues de l'écrire.",
];

export function pick<T>(arr: T[], seed?: number): T {
  const idx =
    seed !== undefined
      ? Math.abs(seed) % arr.length
      : Math.floor(Math.random() * arr.length);
  return arr[idx];
}
