import type { ThemeId } from "./themes";

export interface BankOption {
  label: string;
  trait: string;
}

export interface BankQuestion {
  text: string;
  options: [BankOption, BankOption, BankOption, BankOption];
}

// Banque de questions "toutes prêtes", utilisée quand la génération par IA
// n'est pas disponible (pas de clé API) ou pour compléter rapidement un test.
// Chaque option est reliée à l'un des 4 traits du thème (voir lib/themes.ts).
export const QUESTION_BANK: Record<ThemeId, BankQuestion[]> = {
  amour: [
    {
      text: "Un premier rendez-vous parfait pour toi, c'est plutôt...",
      options: [
        { label: "Un dîner aux chandelles, plein d'attentions", trait: "romantique" },
        { label: "Une activité insolite qu'on n'a jamais tentée", trait: "aventurier" },
        { label: "Un endroit simple où on peut vraiment se parler", trait: "loyal" },
        { label: "Un truc court, histoire de voir si le courant passe", trait: "independant" },
      ],
    },
    {
      text: "Ton geste romantique préféré ?",
      options: [
        { label: "Un mot doux glissé sans prévenir", trait: "romantique" },
        { label: "Un road trip surprise", trait: "aventurier" },
        { label: "Être là, sans faute, à chaque coup dur", trait: "loyal" },
        { label: "Respecter à fond mon espace perso", trait: "independant" },
      ],
    },
    {
      text: "En couple, ce qui te fait le plus flipper c'est...",
      options: [
        { label: "Que la magie s'essouffle avec le temps", trait: "romantique" },
        { label: "Que ça devienne trop routinier", trait: "aventurier" },
        { label: "Qu'on se mente sur un truc important", trait: "loyal" },
        { label: "Perdre qui je suis en dehors du couple", trait: "independant" },
      ],
    },
    {
      text: "Un texto sans réponse depuis 3h, tu penses...",
      options: [
        { label: "J'espère qu'iel pense à moi autant que moi à lui", trait: "romantique" },
        { label: "Tant pis, j'ai plein d'autres trucs à vivre", trait: "aventurier" },
        { label: "Iel doit avoir une bonne raison, je fais confiance", trait: "loyal" },
        { label: "Aucun stress, chacun sa vie", trait: "independant" },
      ],
    },
    {
      text: "Ta définition de la fidélité ?",
      options: [
        { label: "Ne penser qu'à une seule personne, corps et âme", trait: "romantique" },
        { label: "Rester ouvert·e tant que rien n'est officiel", trait: "aventurier" },
        { label: "Un engagement qu'on ne trahit jamais", trait: "loyal" },
        { label: "Être honnête, même si ça bouscule les cases", trait: "independant" },
      ],
    },
    {
      text: "Le lendemain d'une dispute, tu...",
      options: [
        { label: "Écris un mot pour tout remettre à plat", trait: "romantique" },
        { label: "Proposes de sortir pour changer d'air", trait: "aventurier" },
        { label: "Prends le temps d'en reparler calmement", trait: "loyal" },
        { label: "As besoin d'un peu de recul avant de revenir", trait: "independant" },
      ],
    },
    {
      text: "Sur une appli de rencontre, ta bio ressemblerait à...",
      options: [
        { label: "\"Je crois encore aux grandes histoires\"", trait: "romantique" },
        { label: "\"Partant·e pour à peu près tout, testez-moi\"", trait: "aventurier" },
        { label: "\"Loyal·e jusqu'au bout, promis\"", trait: "loyal" },
        { label: "\"Épanoui·e seul·e, ravi·e si ça matche quand même\"", trait: "independant" },
      ],
    },
    {
      text: "Ce qui te fait vraiment craquer chez quelqu'un ?",
      options: [
        { label: "Sa capacité à te faire sentir unique", trait: "romantique" },
        { label: "Son goût du risque et de la nouveauté", trait: "aventurier" },
        { label: "Sa fiabilité à toute épreuve", trait: "loyal" },
        { label: "Son indépendance et sa liberté d'esprit", trait: "independant" },
      ],
    },
    {
      text: "Ta love language, celle qui te ressemble le plus ?",
      options: [
        { label: "Les mots doux", trait: "romantique" },
        { label: "Le temps passé à vivre des trucs ensemble", trait: "aventurier" },
        { label: "Les petites attentions du quotidien", trait: "loyal" },
        { label: "Le respect du temps pour soi", trait: "independant" },
      ],
    },
    {
      text: "Un an après le début d'une relation, tu espères...",
      options: [
        { label: "Que les papillons soient toujours là", trait: "romantique" },
        { label: "Avoir déjà vécu 100 aventures ensemble", trait: "aventurier" },
        { label: "Avoir construit une vraie confiance solide", trait: "loyal" },
        { label: "Que chacun ait gardé sa liberté", trait: "independant" },
      ],
    },
    {
      text: "Ta pire angoisse en amour ?",
      options: [
        { label: "Ne plus ressentir ce frisson du début", trait: "romantique" },
        { label: "M'ennuyer", trait: "aventurier" },
        { label: "Être trahi·e", trait: "loyal" },
        { label: "Me perdre dans l'autre", trait: "independant" },
      ],
    },
    {
      text: "Si ton crush t'ignore une soirée entière ?",
      options: [
        { label: "Je me remets en question toute la nuit", trait: "romantique" },
        { label: "Je discute avec quelqu'un d'autre, la soirée continue", trait: "aventurier" },
        { label: "Je m'inquiète, j'espère que tout va bien pour lui", trait: "loyal" },
        { label: "Aucun souci, je passe une super soirée quand même", trait: "independant" },
      ],
    },
    {
      text: "Le cadeau qui te touche le plus ?",
      options: [
        { label: "Une déclaration écrite à la main", trait: "romantique" },
        { label: "Un billet pour une destination surprise", trait: "aventurier" },
        { label: "Un objet qui prouve qu'on m'écoute depuis longtemps", trait: "loyal" },
        { label: "Du temps libre offert, rien que pour moi", trait: "independant" },
      ],
    },
    {
      text: "Dans un couple, le plus important c'est...",
      options: [
        { label: "La passion", trait: "romantique" },
        { label: "La complicité et le fun", trait: "aventurier" },
        { label: "La confiance", trait: "loyal" },
        { label: "Le respect de l'autonomie de chacun", trait: "independant" },
      ],
    },
    {
      text: "Ta vision d'une relation qui dure ?",
      options: [
        { label: "Une grande histoire d'amour qui ne s'éteint pas", trait: "romantique" },
        { label: "Une aventure qui ne s'arrête jamais", trait: "aventurier" },
        { label: "Une équipe solide, unie contre vents et marées", trait: "loyal" },
        { label: "Deux personnes épanouies qui avancent main dans la main", trait: "independant" },
      ],
    },
  ],
  amitie: [
    {
      text: "Dans ton groupe d'amis, on te décrit comme...",
      options: [
        { label: "Celui/celle qui répond toujours présent·e", trait: "fidele" },
        { label: "Celui/celle qui met l'ambiance", trait: "boute-en-train" },
        { label: "Celui/celle à qui on confie tout", trait: "confident" },
        { label: "Celui/celle qui organise les sorties de groupe", trait: "rassembleur" },
      ],
    },
    {
      text: "Un·e ami·e t'appelle en pleine nuit, tu...",
      options: [
        { label: "Décroches immédiatement, sans hésiter", trait: "fidele" },
        { label: "Proposes de transformer ça en aventure nocturne", trait: "boute-en-train" },
        { label: "Écoutes tout, sans jamais juger", trait: "confident" },
        { label: "Appelles aussitôt le reste de la bande pour aider", trait: "rassembleur" },
      ],
    },
    {
      text: "Ta plus grande qualité en amitié ?",
      options: [
        { label: "Je ne lâche jamais mes proches", trait: "fidele" },
        { label: "Je sais toujours faire rire tout le monde", trait: "boute-en-train" },
        { label: "Je garde les secrets comme un coffre-fort", trait: "confident" },
        { label: "Je rassemble les gens qui ne se connaissent pas encore", trait: "rassembleur" },
      ],
    },
    {
      text: "Le pire pour toi dans une amitié ?",
      options: [
        { label: "Qu'on se perde de vue avec le temps", trait: "fidele" },
        { label: "Que ce soit trop sérieux, sans jamais rigoler", trait: "boute-en-train" },
        { label: "Qu'on ne puisse pas tout se dire", trait: "confident" },
        { label: "Que le groupe se fragmente en clans", trait: "rassembleur" },
      ],
    },
    {
      text: "Un ami traverse une rupture difficile, tu...",
      options: [
        { label: "Débarques chez lui/elle avec des plats faits maison", trait: "fidele" },
        { label: "L'emmènes en soirée pour lui changer les idées", trait: "boute-en-train" },
        { label: "Passes des heures à l'écouter au téléphone", trait: "confident" },
        { label: "Organises une soirée avec toute la bande pour le/la soutenir", trait: "rassembleur" },
      ],
    },
    {
      text: "Ton rôle typique dans un groupe de vacances ?",
      options: [
        { label: "Celui/celle qui veille à ce que personne ne soit oublié", trait: "fidele" },
        { label: "Celui/celle qui propose les idées les plus folles", trait: "boute-en-train" },
        { label: "Celui/celle vers qui on vient se confier le soir", trait: "confident" },
        { label: "Celui/celle qui organise le planning et les activités", trait: "rassembleur" },
      ],
    },
    {
      text: "Un secret qu'on te confie, c'est...",
      options: [
        { label: "Une preuve de confiance que je protège toute ma vie", trait: "fidele" },
        { label: "L'occasion d'un fou rire complice", trait: "boute-en-train" },
        { label: "Un moment que je prends très au sérieux", trait: "confident" },
        { label: "Quelque chose que je garde, sauf si ça peut aider le groupe", trait: "rassembleur" },
      ],
    },
    {
      text: "Après une longue période sans se voir, tu...",
      options: [
        { label: "Reprends comme si on s'était quittés la veille", trait: "fidele" },
        { label: "Organises direct une soirée de retrouvailles mémorable", trait: "boute-en-train" },
        { label: "Prends des nouvelles en profondeur, un par un", trait: "confident" },
        { label: "Recrées l'occasion de réunir tout le monde", trait: "rassembleur" },
      ],
    },
    {
      text: "Le meilleur souvenir entre amis pour toi ?",
      options: [
        { label: "Un moment où quelqu'un a tout lâché pour m'aider", trait: "fidele" },
        { label: "Un fou rire inoubliable, les larmes aux yeux", trait: "boute-en-train" },
        { label: "Une conversation sincère qui a tout changé", trait: "confident" },
        { label: "Une grande réunion improvisée avec tout le monde", trait: "rassembleur" },
      ],
    },
    {
      text: "Si un ami se trompe complètement, tu...",
      options: [
        { label: "Le/la soutiens quoi qu'il arrive, publiquement", trait: "fidele" },
        { label: "Dédramatises avec humour pour alléger le moment", trait: "boute-en-train" },
        { label: "Lui en parles en privé, avec douceur", trait: "confident" },
        { label: "Rassembles les autres pour trouver une solution ensemble", trait: "rassembleur" },
      ],
    },
    {
      text: "Ta façon d'exprimer que tu tiens à quelqu'un ?",
      options: [
        { label: "En étant là, chaque fois, sans faillir", trait: "fidele" },
        { label: "En créant des souvenirs et des délires ensemble", trait: "boute-en-train" },
        { label: "En prenant le temps de vraiment l'écouter", trait: "confident" },
        { label: "En l'intégrant à tous mes cercles", trait: "rassembleur" },
      ],
    },
    {
      text: "Un nouveau arrive dans le groupe, tu...",
      options: [
        { label: "Veilles discrètement à ce qu'il/elle se sente bien", trait: "fidele" },
        { label: "Le/la chambres gentiment pour briser la glace", trait: "boute-en-train" },
        { label: "Lui poses plein de questions pour le/la connaître", trait: "confident" },
        { label: "L'inclus tout de suite dans toutes les sorties", trait: "rassembleur" },
      ],
    },
    {
      text: "Ce que tes amis diraient de toi en un mot ?",
      options: [
        { label: "\"Fiable\"", trait: "fidele" },
        { label: "\"Marrant·e\"", trait: "boute-en-train" },
        { label: "\"À l'écoute\"", trait: "confident" },
        { label: "\"Fédérateur/fédératrice\"", trait: "rassembleur" },
      ],
    },
    {
      text: "Pour toi, une vraie amitié se reconnaît quand...",
      options: [
        { label: "Elle résiste aux années et à la distance", trait: "fidele" },
        { label: "On peut rire de tout ensemble", trait: "boute-en-train" },
        { label: "On peut tout se dire sans filtre", trait: "confident" },
        { label: "Elle crée un vrai esprit de groupe", trait: "rassembleur" },
      ],
    },
    {
      text: "Le samedi soir idéal entre amis ?",
      options: [
        { label: "Une soirée cocooning, juste nous et nos habitudes", trait: "fidele" },
        { label: "Une sortie improbable dont on parlera pendant des mois", trait: "boute-en-train" },
        { label: "Une discussion à cœur ouvert autour d'un repas", trait: "confident" },
        { label: "Une grande soirée avec tout le monde réuni", trait: "rassembleur" },
      ],
    },
  ],
  humour: [
    {
      text: "Ton type d'humour préféré ?",
      options: [
        { label: "Les blagues bien lourdes qu'on ne peut pas rater", trait: "blagueur" },
        { label: "Une remarque sèche balancée sans sourire", trait: "pince-sans-rire" },
        { label: "Un fou rire qui part de nulle part", trait: "spontane" },
        { label: "Une référence culte que seuls certains captent", trait: "referentiel" },
      ],
    },
    {
      text: "En soirée, tu es plutôt du genre à...",
      options: [
        { label: "Enchaîner les vannes toute la soirée", trait: "blagueur" },
        { label: "Placer UNE réplique qui tue, l'air de rien", trait: "pince-sans-rire" },
        { label: "Partir dans un délire improvisé avec les autres", trait: "spontane" },
        { label: "Sortir une réf que seuls 2 potes comprennent", trait: "referentiel" },
      ],
    },
    {
      text: "Ta réaction favorite face à une situation gênante ?",
      options: [
        { label: "En rire à voix haute, direct", trait: "blagueur" },
        { label: "Un commentaire pince-sans-rire qui détend tout le monde", trait: "pince-sans-rire" },
        { label: "Improviser un truc totalement absurde", trait: "spontane" },
        { label: "Citer une scène de film culte qui colle parfaitement", trait: "referentiel" },
      ],
    },
    {
      text: "Ton style de blague signature ?",
      options: [
        { label: "Le jeu de mots assumé (et un peu nul)", trait: "blagueur" },
        { label: "L'ironie fine que personne ne voit venir", trait: "pince-sans-rire" },
        { label: "L'improvisation totale, sans filet", trait: "spontane" },
        { label: "Le clin d'œil à une série ou un meme", trait: "referentiel" },
      ],
    },
    {
      text: "Tu fais rire les gens surtout parce que...",
      options: [
        { label: "Tu multiplies les vannes sans t'arrêter", trait: "blagueur" },
        { label: "Ton ton pince-sans-rire surprend tout le monde", trait: "pince-sans-rire" },
        { label: "Tu dis des trucs improbables sans réfléchir", trait: "spontane" },
        { label: "Tu as toujours LA référence parfaite", trait: "referentiel" },
      ],
    },
    {
      text: "Un ami rate son entrée en public, tu...",
      options: [
        { label: "Le/la charries gentiment devant tout le monde", trait: "blagueur" },
        { label: "Fais un commentaire pince-sans-rire hilarant", trait: "pince-sans-rire" },
        { label: "Rebondis avec un truc encore plus absurde", trait: "spontane" },
        { label: "Compares la scène à un film ou une série culte", trait: "referentiel" },
      ],
    },
    {
      text: "Ton humour préféré à regarder ?",
      options: [
        { label: "Les sketchs qui enchaînent les blagues", trait: "blagueur" },
        { label: "L'humour anglais, pince-sans-rire au possible", trait: "pince-sans-rire" },
        { label: "L'impro et le stand-up sans filet", trait: "spontane" },
        { label: "Les parodies bourrées de références", trait: "referentiel" },
      ],
    },
    {
      text: "Ce qui te fait le plus rire au monde ?",
      options: [
        { label: "Une bonne vieille blague classique bien placée", trait: "blagueur" },
        { label: "Un ton complètement neutre sur un truc absurde", trait: "pince-sans-rire" },
        { label: "Un moment complètement improvisé et incontrôlable", trait: "spontane" },
        { label: "Un clin d'œil que seuls les initiés comprennent", trait: "referentiel" },
      ],
    },
    {
      text: "Ton meilleur souvenir d'humour entre amis ?",
      options: [
        { label: "Une session de vannes qui a duré des heures", trait: "blagueur" },
        { label: "Une phrase dite sans sourciller qui a scotché tout le monde", trait: "pince-sans-rire" },
        { label: "Un délire parti en vrille, personne ne s'y attendait", trait: "spontane" },
        { label: "Une private joke qui dure depuis des années", trait: "referentiel" },
      ],
    },
    {
      text: "Face à un silence gênant, tu...",
      options: [
        { label: "Balances direct une vanne pour détendre", trait: "blagueur" },
        { label: "Lâches une phrase sobre qui fait mouche", trait: "pince-sans-rire" },
        { label: "Improvises un truc complètement décalé", trait: "spontane" },
        { label: "Sors une réf qui casse l'ambiance dans le bon sens", trait: "referentiel" },
      ],
    },
    {
      text: "Sur les réseaux, tu es plutôt...",
      options: [
        { label: "Le/la roi/reine du jeu de mots dans les commentaires", trait: "blagueur" },
        { label: "L'auteur·ice de légendes hyper sèches et drôles", trait: "pince-sans-rire" },
        { label: "Celui/celle qui poste sans filtre selon l'humeur", trait: "spontane" },
        { label: "Le/la spécialiste des memes bien placés", trait: "referentiel" },
      ],
    },
    {
      text: "Un inconnu ne comprend pas ta blague, tu...",
      options: [
        { label: "En enchaînes une autre direct", trait: "blagueur" },
        { label: "Restes impassible, comme si de rien n'était", trait: "pince-sans-rire" },
        { label: "Rebondis avec autre chose d'improvisé", trait: "spontane" },
        { label: "Expliques la référence, ravi·e de partager", trait: "referentiel" },
      ],
    },
    {
      text: "Ton talent caché en société ?",
      options: [
        { label: "Sortir la blague parfaite au bon moment", trait: "blagueur" },
        { label: "Garder un visage impassible en disant un truc énorme", trait: "pince-sans-rire" },
        { label: "Improviser des sketches avec n'importe qui", trait: "spontane" },
        { label: "Repérer toutes les références cachées d'un film", trait: "referentiel" },
      ],
    },
    {
      text: "Quel type de comique tu serais ?",
      options: [
        { label: "Un·e humoriste de one-man/woman show bien rythmé", trait: "blagueur" },
        { label: "Un·e maître·sse du flegme so British", trait: "pince-sans-rire" },
        { label: "Un·e improvisateur·ice pur jus", trait: "spontane" },
        { label: "Un·e scénariste bourré·e de clins d'œil", trait: "referentiel" },
      ],
    },
    {
      text: "Le compliment sur ton humour que tu entends le plus ?",
      options: [
        { label: "\"T'as toujours une blague sous le coude\"", trait: "blagueur" },
        { label: "\"Ton flegme me tue à chaque fois\"", trait: "pince-sans-rire" },
        { label: "\"On sait jamais ce que tu vas sortir\"", trait: "spontane" },
        { label: "\"T'as toujours LA référence parfaite\"", trait: "referentiel" },
      ],
    },
  ],
  valeurs: [
    {
      text: "Ce qui te motive le plus au réveil ?",
      options: [
        { label: "L'idée de faire ce que je veux, quand je veux", trait: "liberte" },
        { label: "Le sentiment d'avoir un cadre solide et rassurant", trait: "stabilite" },
        { label: "L'envie de faire bouger les choses autour de moi", trait: "impact" },
        { label: "Les petits plaisirs simples qui m'attendent", trait: "plaisir" },
      ],
    },
    {
      text: "Ton rêve de vie idéale ressemble à...",
      options: [
        { label: "Aucune contrainte, je vais où le vent me porte", trait: "liberte" },
        { label: "Une routine sereine avec des bases solides", trait: "stabilite" },
        { label: "Une vie qui laisse une trace utile", trait: "impact" },
        { label: "Une vie pleine de moments savoureux", trait: "plaisir" },
      ],
    },
    {
      text: "Face à un choix de carrière, tu privilégies...",
      options: [
        { label: "La liberté d'organiser mon temps comme je veux", trait: "liberte" },
        { label: "La sécurité d'un poste stable", trait: "stabilite" },
        { label: "Le sens et l'utilité de ce que je fais", trait: "impact" },
        { label: "Le plaisir que ça me procure au quotidien", trait: "plaisir" },
      ],
    },
    {
      text: "Ce qui te ferait le plus regretter ta vie plus tard ?",
      options: [
        { label: "Avoir été trop enfermé·e dans un cadre", trait: "liberte" },
        { label: "Avoir pris trop de risques inutiles", trait: "stabilite" },
        { label: "Ne pas avoir aidé les autres autour de moi", trait: "impact" },
        { label: "Ne pas avoir assez profité", trait: "plaisir" },
      ],
    },
    {
      text: "Un imprévu bouscule tous tes plans, tu penses...",
      options: [
        { label: "Tant mieux, ça casse la routine !", trait: "liberte" },
        { label: "Ça m'angoisse un peu, j'aime savoir où je vais", trait: "stabilite" },
        { label: "Comment je peux transformer ça en opportunité utile", trait: "impact" },
        { label: "Voyons le bon côté, ça va être marrant", trait: "plaisir" },
      ],
    },
    {
      text: "Ton dimanche idéal ?",
      options: [
        { label: "Partir à l'aventure sans plan précis", trait: "liberte" },
        { label: "Une routine douce, à la maison", trait: "stabilite" },
        { label: "Faire du bénévolat ou un projet utile", trait: "impact" },
        { label: "Un bon brunch entre potes, sans stress", trait: "plaisir" },
      ],
    },
    {
      text: "Ce que tu voudrais qu'on retienne de toi ?",
      options: [
        { label: "\"Iel a toujours vécu à sa façon\"", trait: "liberte" },
        { label: "\"On pouvait toujours compter sur lui/elle\"", trait: "stabilite" },
        { label: "\"Iel a changé les choses autour de lui/elle\"", trait: "impact" },
        { label: "\"On passait toujours de bons moments ensemble\"", trait: "plaisir" },
      ],
    },
    {
      text: "Le mot qui résonne le plus fort en toi ?",
      options: [
        { label: "Liberté", trait: "liberte" },
        { label: "Sécurité", trait: "stabilite" },
        { label: "Sens", trait: "impact" },
        { label: "Plaisir", trait: "plaisir" },
      ],
    },
    {
      text: "Dans un projet de groupe, ce qui compte le plus pour toi ?",
      options: [
        { label: "Garder de la souplesse dans l'organisation", trait: "liberte" },
        { label: "Avoir un plan clair et fiable", trait: "stabilite" },
        { label: "Que le résultat serve vraiment à quelque chose", trait: "impact" },
        { label: "Que ce soit agréable à vivre pour tout le monde", trait: "plaisir" },
      ],
    },
    {
      text: "Un an sans contraintes financières, tu ferais...",
      options: [
        { label: "Je partirais explorer le monde sans billet retour", trait: "liberte" },
        { label: "Je sécuriserais mon avenir en premier", trait: "stabilite" },
        { label: "Je lancerais un projet qui aide les autres", trait: "impact" },
        { label: "Je m'offrirais plein de belles expériences", trait: "plaisir" },
      ],
    },
    {
      text: "Ce que tu ne supportes pas du tout ?",
      options: [
        { label: "Qu'on m'impose un cadre trop rigide", trait: "liberte" },
        { label: "L'incertitude permanente", trait: "stabilite" },
        { label: "L'indifférence face aux problèmes des autres", trait: "impact" },
        { label: "Une vie trop sérieuse, sans légèreté", trait: "plaisir" },
      ],
    },
    {
      text: "Ta plus grande fierté serait...",
      options: [
        { label: "D'avoir vécu exactement comme je le voulais", trait: "liberte" },
        { label: "D'avoir construit quelque chose de durable", trait: "stabilite" },
        { label: "D'avoir eu un impact positif sur les autres", trait: "impact" },
        { label: "D'avoir savouré chaque instant", trait: "plaisir" },
      ],
    },
    {
      text: "Comment tu choisis où vivre ?",
      options: [
        { label: "Là où je me sens libre de bouger facilement", trait: "liberte" },
        { label: "Un endroit stable, proche de mes repères", trait: "stabilite" },
        { label: "Un endroit où je peux être utile à ma communauté", trait: "impact" },
        { label: "Un endroit agréable à vivre au quotidien", trait: "plaisir" },
      ],
    },
    {
      text: "Ta réaction face à une règle qui te semble absurde ?",
      options: [
        { label: "Je cherche comment la contourner en douceur", trait: "liberte" },
        { label: "Je la respecte, ça évite les problèmes", trait: "stabilite" },
        { label: "Je propose de la changer pour le bien de tous", trait: "impact" },
        { label: "J'en ris et je passe à autre chose", trait: "plaisir" },
      ],
    },
    {
      text: "Ce qui te rend le plus fier·ère aujourd'hui ?",
      options: [
        { label: "Mon indépendance", trait: "liberte" },
        { label: "Ma constance", trait: "stabilite" },
        { label: "Ce que j'apporte aux autres", trait: "impact" },
        { label: "Ma capacité à profiter de la vie", trait: "plaisir" },
      ],
    },
  ],
  argent: [
    {
      text: "Tu reçois une prime inattendue, tu...",
      options: [
        { label: "La places direct sur un livret", trait: "epargnant" },
        { label: "Te fais un plaisir immédiat, sans culpabiliser", trait: "flambeur" },
        { label: "Invites tes proches pour partager la bonne nouvelle", trait: "genereux" },
        { label: "Calcules le meilleur moyen de la faire fructifier", trait: "strategique" },
      ],
    },
    {
      text: "Ton rapport à la carte bancaire ?",
      options: [
        { label: "Je regarde mon solde avant chaque achat", trait: "epargnant" },
        { label: "Je paie sans trop y penser", trait: "flambeur" },
        { label: "Je paie souvent pour les autres aussi", trait: "genereux" },
        { label: "Je compare toujours pour avoir le meilleur prix", trait: "strategique" },
      ],
    },
    {
      text: "Face à une envie de folie shopping, tu...",
      options: [
        { label: "Attends d'être sûr·e que c'est raisonnable", trait: "epargnant" },
        { label: "Craques, la vie est courte", trait: "flambeur" },
        { label: "Penses d'abord à faire plaisir à un proche", trait: "genereux" },
        { label: "Cherches le meilleur plan avant d'acheter", trait: "strategique" },
      ],
    },
    {
      text: "Ton objectif financier numéro 1 ?",
      options: [
        { label: "Avoir un gros matelas de sécurité", trait: "epargnant" },
        { label: "Profiter un maximum, maintenant", trait: "flambeur" },
        { label: "Pouvoir aider mes proches si besoin", trait: "genereux" },
        { label: "Faire fructifier intelligemment ce que je gagne", trait: "strategique" },
      ],
    },
    {
      text: "Entre amis, quand l'addition arrive, tu...",
      options: [
        { label: "Vérifies que chacun paie bien sa part", trait: "epargnant" },
        { label: "Proposes de payer sans même compter", trait: "flambeur" },
        { label: "Insistes pour régler toute la note", trait: "genereux" },
        { label: "Sors ton appli pour tout diviser au centime près", trait: "strategique" },
      ],
    },
    {
      text: "Le mot qui te vient en pensant à l'argent ?",
      options: [
        { label: "Sécurité", trait: "epargnant" },
        { label: "Liberté", trait: "flambeur" },
        { label: "Partage", trait: "genereux" },
        { label: "Stratégie", trait: "strategique" },
      ],
    },
    {
      text: "Un ami te demande de lui prêter de l'argent, tu...",
      options: [
        { label: "Réfléchis longuement avant de te décider", trait: "epargnant" },
        { label: "Dis oui tout de suite, sans trop compter", trait: "flambeur" },
        { label: "Lui donnes plutôt que de lui prêter", trait: "genereux" },
        { label: "Établis un plan de remboursement clair ensemble", trait: "strategique" },
      ],
    },
    {
      text: "Tes vacances de rêve niveau budget ?",
      options: [
        { label: "Je pose un budget strict et je m'y tiens", trait: "epargnant" },
        { label: "Je me fais plaisir sans trop calculer", trait: "flambeur" },
        { label: "Je paie volontiers pour toute la bande", trait: "genereux" },
        { label: "Je traque les meilleurs bons plans avant de partir", trait: "strategique" },
      ],
    },
    {
      text: "Comment tu gères tes fins de mois ?",
      options: [
        { label: "Je garde toujours une réserve de côté", trait: "epargnant" },
        { label: "Je vis au jour le jour, ça s'arrange toujours", trait: "flambeur" },
        { label: "Je fais attention à ne jamais manquer si un proche a besoin", trait: "genereux" },
        { label: "Je suis mon budget dans une appli très précisément", trait: "strategique" },
      ],
    },
    {
      text: "Gagner au loto, ta première pensée ?",
      options: [
        { label: "Je place l'essentiel pour l'avenir", trait: "epargnant" },
        { label: "Je m'offre enfin tout ce dont je rêve", trait: "flambeur" },
        { label: "Je pense d'abord à qui je pourrais aider", trait: "genereux" },
        { label: "Je planifie un investissement malin", trait: "strategique" },
      ],
    },
    {
      text: "Ton style de shopping ?",
      options: [
        { label: "Je n'achète que ce qui est vraiment nécessaire", trait: "epargnant" },
        { label: "J'achète sur un coup de cœur", trait: "flambeur" },
        { label: "J'achète souvent des cadeaux pour les autres", trait: "genereux" },
        { label: "Je compare tout avant de sortir ma carte", trait: "strategique" },
      ],
    },
    {
      text: "Ce qui te stresse le plus côté finances ?",
      options: [
        { label: "Ne plus avoir d'épargne de sécurité", trait: "epargnant" },
        { label: "Devoir me priver de quoi que ce soit", trait: "flambeur" },
        { label: "Ne pas pouvoir aider quelqu'un dans le besoin", trait: "genereux" },
        { label: "Faire un mauvais calcul ou un mauvais placement", trait: "strategique" },
      ],
    },
    {
      text: "Ta relation avec les soldes ?",
      options: [
        { label: "J'achète seulement ce qui était déjà prévu", trait: "epargnant" },
        { label: "J'en profite à fond, tant pis pour le budget", trait: "flambeur" },
        { label: "J'en profite pour faire des cadeaux", trait: "genereux" },
        { label: "Je traque LA meilleure affaire du magasin", trait: "strategique" },
      ],
    },
    {
      text: "Si tu devais donner un conseil sur l'argent ?",
      options: [
        { label: "\"Mets toujours un peu de côté\"", trait: "epargnant" },
        { label: "\"Profites-en, on ne l'emporte pas avec soi\"", trait: "flambeur" },
        { label: "\"Partage, ça revient toujours\"", trait: "genereux" },
        { label: "\"Fais toujours tes calculs avant d'agir\"", trait: "strategique" },
      ],
    },
    {
      text: "Ton app financière préférée ferait quoi ?",
      options: [
        { label: "M'alerter dès que je dépasse mon budget épargne", trait: "epargnant" },
        { label: "Me suggérer des expériences sympas à vivre", trait: "flambeur" },
        { label: "Me proposer de faire un don ou un cadeau", trait: "genereux" },
        { label: "M'afficher des graphiques d'investissement détaillés", trait: "strategique" },
      ],
    },
  ],
  travail: [
    {
      text: "Ce qui te fait vibrer au travail ?",
      options: [
        { label: "Gravir les échelons et viser plus haut", trait: "ambitieux" },
        { label: "Finir ma journée à une heure raisonnable", trait: "equilibre" },
        { label: "Inventer des solutions originales", trait: "createur" },
        { label: "Réussir un projet en équipe", trait: "collectif" },
      ],
    },
    {
      text: "Ton dimanche soir avant la reprise ?",
      options: [
        { label: "Je planifie déjà mes objectifs de la semaine", trait: "ambitieux" },
        { label: "Je profite à fond, le travail attendra lundi", trait: "equilibre" },
        { label: "J'ai plein d'idées nouvelles qui me trottent en tête", trait: "createur" },
        { label: "J'ai hâte de retrouver mes collègues", trait: "collectif" },
      ],
    },
    {
      text: "Une promotion s'annonce mais demande plus d'heures, tu...",
      options: [
        { label: "Fonces, l'ambition avant tout", trait: "ambitieux" },
        { label: "Réfléchis à deux fois pour préserver ton équilibre", trait: "equilibre" },
        { label: "Acceptes si ça te laisse de la liberté créative", trait: "createur" },
        { label: "Demandes d'abord ce que ça change pour l'équipe", trait: "collectif" },
      ],
    },
    {
      text: "Ton style de travail idéal ?",
      options: [
        { label: "Des objectifs clairs et ambitieux à atteindre", trait: "ambitieux" },
        { label: "Un rythme flexible qui respecte ma vie perso", trait: "equilibre" },
        { label: "De la liberté pour expérimenter et innover", trait: "createur" },
        { label: "Beaucoup de travail d'équipe et d'échanges", trait: "collectif" },
      ],
    },
    {
      text: "Ce que tu détestes le plus au travail ?",
      options: [
        { label: "Stagner sans évoluer", trait: "ambitieux" },
        { label: "Les horaires à rallonge", trait: "equilibre" },
        { label: "Devoir suivre des process trop rigides", trait: "createur" },
        { label: "Travailler seul·e, isolé·e des autres", trait: "collectif" },
      ],
    },
    {
      text: "Dans 10 ans, tu te vois plutôt...",
      options: [
        { label: "À un poste à responsabilités", trait: "ambitieux" },
        { label: "Avec un équilibre de vie parfait", trait: "equilibre" },
        { label: "En train de créer mon propre projet", trait: "createur" },
        { label: "Entouré·e d'une équipe soudée", trait: "collectif" },
      ],
    },
    {
      text: "Comment tu réagis face à un objectif ambitieux ?",
      options: [
        { label: "J'adore le défi, je m'y donne à fond", trait: "ambitieux" },
        { label: "Je le fais sans sacrifier mon temps perso", trait: "equilibre" },
        { label: "Je cherche une façon originale de l'atteindre", trait: "createur" },
        { label: "Je propose de le relever à plusieurs", trait: "collectif" },
      ],
    },
    {
      text: "Ce qui te motive à te lever le matin ?",
      options: [
        { label: "Avancer vers mes objectifs de carrière", trait: "ambitieux" },
        { label: "L'équilibre entre ma vie pro et perso", trait: "equilibre" },
        { label: "L'envie de créer quelque chose de nouveau", trait: "createur" },
        { label: "Retrouver mes collègues et avancer ensemble", trait: "collectif" },
      ],
    },
    {
      text: "Ton pire cauchemar professionnel ?",
      options: [
        { label: "Ne jamais évoluer dans ma carrière", trait: "ambitieux" },
        { label: "Ne plus avoir de temps pour moi", trait: "equilibre" },
        { label: "Faire toujours la même chose, sans créativité", trait: "createur" },
        { label: "Travailler avec une équipe qui ne communique pas", trait: "collectif" },
      ],
    },
    {
      text: "Comment tu définirais la réussite ?",
      options: [
        { label: "Atteindre des objectifs toujours plus hauts", trait: "ambitieux" },
        { label: "Être épanoui·e à la fois au travail et en dehors", trait: "equilibre" },
        { label: "Avoir créé quelque chose dont je suis fier·ère", trait: "createur" },
        { label: "Avoir contribué à la réussite d'une équipe", trait: "collectif" },
      ],
    },
    {
      text: "Ton environnement de travail idéal ?",
      options: [
        { label: "Stimulant, avec de vrais défis à relever", trait: "ambitieux" },
        { label: "Serein, avec des horaires respectés", trait: "equilibre" },
        { label: "Créatif, où on peut sortir des sentiers battus", trait: "createur" },
        { label: "Convivial, avec une bonne ambiance d'équipe", trait: "collectif" },
      ],
    },
    {
      text: "Face à un échec professionnel, tu...",
      options: [
        { label: "Rebondis tout de suite pour viser encore plus haut", trait: "ambitieux" },
        { label: "Prends du recul, ça ne définit pas toute ma vie", trait: "equilibre" },
        { label: "En tires une nouvelle idée à explorer", trait: "createur" },
        { label: "En parles avec ton équipe pour avancer ensemble", trait: "collectif" },
      ],
    },
    {
      text: "Ce que tes collègues diraient de toi ?",
      options: [
        { label: "\"Iel vise toujours plus haut\"", trait: "ambitieux" },
        { label: "\"Iel sait poser ses limites\"", trait: "equilibre" },
        { label: "\"Iel a toujours des idées originales\"", trait: "createur" },
        { label: "\"Iel tire toute l'équipe vers le haut\"", trait: "collectif" },
      ],
    },
    {
      text: "Un projet parfait pour toi ressemble à...",
      options: [
        { label: "Un défi ambitieux avec un vrai enjeu", trait: "ambitieux" },
        { label: "Un projet cadré, sans débordement d'horaires", trait: "equilibre" },
        { label: "Une page blanche à imaginer de zéro", trait: "createur" },
        { label: "Une belle aventure collective", trait: "collectif" },
      ],
    },
    {
      text: "Ta motivation numéro 1 au travail ?",
      options: [
        { label: "Progresser et me dépasser", trait: "ambitieux" },
        { label: "Me sentir bien, sans négliger le reste de ma vie", trait: "equilibre" },
        { label: "Exprimer ma créativité", trait: "createur" },
        { label: "Faire partie d'une belle aventure humaine", trait: "collectif" },
      ],
    },
  ],
  culture: [
    {
      text: "Ton film à revoir en boucle ?",
      options: [
        { label: "Un classique que je connais par cœur", trait: "nostalgique" },
        { label: "La toute dernière sortie dont tout le monde parle", trait: "explorateur" },
        { label: "Un film d'auteur visuellement magnifique", trait: "esthete" },
        { label: "Un blockbuster que tout le monde adore", trait: "populaire" },
      ],
    },
    {
      text: "Ta playlist du moment ressemble à...",
      options: [
        { label: "Les tubes de mon adolescence", trait: "nostalgique" },
        { label: "Des artistes que personne ne connaît encore", trait: "explorateur" },
        { label: "Des morceaux recherchés, presque secrets", trait: "esthete" },
        { label: "Les hits du moment, sans complexe", trait: "populaire" },
      ],
    },
    {
      text: "Au restaurant, tu commandes plutôt...",
      options: [
        { label: "Le plat qui me rappelle mon enfance", trait: "nostalgique" },
        { label: "Le plat le plus insolite de la carte", trait: "explorateur" },
        { label: "Le plat le plus soigné visuellement", trait: "esthete" },
        { label: "Le classique que tout le monde adore", trait: "populaire" },
      ],
    },
    {
      text: "Un dimanche pluvieux, tu regardes...",
      options: [
        { label: "Une série que tu as déjà vue mille fois", trait: "nostalgique" },
        { label: "Un film étranger dont personne n'a entendu parler", trait: "explorateur" },
        { label: "Un documentaire artistique bien construit", trait: "esthete" },
        { label: "La série la plus populaire du moment", trait: "populaire" },
      ],
    },
    {
      text: "Ton rapport à la nouveauté culturelle ?",
      options: [
        { label: "Je préfère les valeurs sûres que j'aime déjà", trait: "nostalgique" },
        { label: "Je suis toujours en train de chercher du neuf", trait: "explorateur" },
        { label: "Je cherche la qualité, pas la nouveauté à tout prix", trait: "esthete" },
        { label: "Je suis ce que tout le monde regarde ou écoute", trait: "populaire" },
      ],
    },
    {
      text: "Le concert de tes rêves ?",
      options: [
        { label: "Un groupe culte de mon adolescence", trait: "nostalgique" },
        { label: "Un artiste émergent que personne ne connaît encore", trait: "explorateur" },
        { label: "Une performance artistique unique et rare", trait: "esthete" },
        { label: "Le plus gros festival avec les têtes d'affiche du moment", trait: "populaire" },
      ],
    },
    {
      text: "Ta bibliothèque/étagère préférée contient...",
      options: [
        { label: "Des livres que je relis depuis toujours", trait: "nostalgique" },
        { label: "Des auteurs que je découvre en premier", trait: "explorateur" },
        { label: "De belles éditions, soigneusement choisies", trait: "esthete" },
        { label: "Les best-sellers du moment", trait: "populaire" },
      ],
    },
    {
      text: "Ta série culte ?",
      options: [
        { label: "Celle que je regardais ado", trait: "nostalgique" },
        { label: "Une pépite obscure que peu de gens connaissent", trait: "explorateur" },
        { label: "Une série visuellement somptueuse", trait: "esthete" },
        { label: "Celle dont absolument tout le monde parle", trait: "populaire" },
      ],
    },
    {
      text: "En vacances, tu choisis un lieu culturel...",
      options: [
        { label: "Qui te rappelle de bons souvenirs", trait: "nostalgique" },
        { label: "Complètement inconnu, hors des sentiers battus", trait: "explorateur" },
        { label: "Réputé pour sa beauté architecturale", trait: "esthete" },
        { label: "Incontournable, que tout le monde visite", trait: "populaire" },
      ],
    },
    {
      text: "Le plat qui te fait fondre de nostalgie/curiosité ?",
      options: [
        { label: "Le plat de ma grand-mère", trait: "nostalgique" },
        { label: "Une cuisine du monde jamais goûtée", trait: "explorateur" },
        { label: "Un plat gastronomique délicat", trait: "esthete" },
        { label: "Un classique que tout le monde adore commander", trait: "populaire" },
      ],
    },
    {
      text: "Ta manière de découvrir de la musique ?",
      options: [
        { label: "Je réécoute mes classiques", trait: "nostalgique" },
        { label: "Je fouille les plateformes pour trouver des pépites", trait: "explorateur" },
        { label: "Je cherche des artistes au style vraiment unique", trait: "esthete" },
        { label: "Je suis les charts et les recommandations populaires", trait: "populaire" },
      ],
    },
    {
      text: "Quand un ami te recommande un film, tu...",
      options: [
        { label: "Préfères souvent un film que tu connais déjà", trait: "nostalgique" },
        { label: "Es toujours partant·e pour découvrir un ovni", trait: "explorateur" },
        { label: "Regardes d'abord si c'est bien filmé", trait: "esthete" },
        { label: "Le regardes si tout le monde en parle", trait: "populaire" },
      ],
    },
    {
      text: "Ton style musical dominant ?",
      options: [
        { label: "Les classiques intemporels", trait: "nostalgique" },
        { label: "Les scènes émergentes et alternatives", trait: "explorateur" },
        { label: "Les productions soignées et originales", trait: "esthete" },
        { label: "La pop et les hits du moment", trait: "populaire" },
      ],
    },
    {
      text: "Ton excursion culturelle idéale ?",
      options: [
        { label: "Retourner dans un lieu chargé de souvenirs", trait: "nostalgique" },
        { label: "Explorer un endroit dont personne ne parle", trait: "explorateur" },
        { label: "Visiter un musée d'art contemporain", trait: "esthete" },
        { label: "Voir l'attraction la plus visitée de la ville", trait: "populaire" },
      ],
    },
    {
      text: "Ce qui définit le mieux tes goûts culturels ?",
      options: [
        { label: "Fidèle à ce que j'aime depuis toujours", trait: "nostalgique" },
        { label: "Toujours en quête de nouveauté", trait: "explorateur" },
        { label: "Exigeant·e sur la qualité et l'esthétique", trait: "esthete" },
        { label: "Connecté·e à ce qui plaît au plus grand nombre", trait: "populaire" },
      ],
    },
  ],
  profil: [
    {
      text: "Face à un problème urgent, ton instinct te pousse à...",
      options: [
        { label: "Foncer et agir tout de suite", trait: "feu" },
        { label: "Ressentir la situation avant d'agir", trait: "eau" },
        { label: "Poser un plan solide, étape par étape", trait: "terre" },
        { label: "Prendre du recul pour voir la vue d'ensemble", trait: "air" },
      ],
    },
    {
      text: "Dans un groupe, ton énergie ressemble à...",
      options: [
        { label: "Une flamme qui embrase l'ambiance", trait: "feu" },
        { label: "Une vague qui s'adapte à tout le monde", trait: "eau" },
        { label: "Un roc sur lequel les autres s'appuient", trait: "terre" },
        { label: "Une brise qui apporte des idées nouvelles", trait: "air" },
      ],
    },
    {
      text: "Ton lieu ressourçant préféré ?",
      options: [
        { label: "Au bord d'un feu de camp", trait: "feu" },
        { label: "Face à l'océan ou une rivière", trait: "eau" },
        { label: "En pleine forêt, les pieds dans l'herbe", trait: "terre" },
        { label: "En haut d'une montagne, à contempler l'horizon", trait: "air" },
      ],
    },
    {
      text: "Ta façon de gérer tes émotions ?",
      options: [
        { label: "Je les exprime intensément, sur le moment", trait: "feu" },
        { label: "Je les ressens profondément, en silence", trait: "eau" },
        { label: "Je les canalise avec calme et patience", trait: "terre" },
        { label: "Je prends de la distance pour les analyser", trait: "air" },
      ],
    },
    {
      text: "Un ami te décrit en une image, ce serait...",
      options: [
        { label: "Un volcan plein d'énergie", trait: "feu" },
        { label: "Une rivière tranquille mais profonde", trait: "eau" },
        { label: "Une montagne stable et rassurante", trait: "terre" },
        { label: "Un vent qui souffle de nouvelles idées", trait: "air" },
      ],
    },
    {
      text: "Ta manière d'aborder un nouveau projet ?",
      options: [
        { label: "Je me lance avec passion, sans attendre", trait: "feu" },
        { label: "Je laisse mon intuition guider mes choix", trait: "eau" },
        { label: "Je construis les fondations avant tout", trait: "terre" },
        { label: "J'explore plein d'idées avant de choisir", trait: "air" },
      ],
    },
    {
      text: "Ton animal totem se reconnaîtrait à...",
      options: [
        { label: "Sa fougue et son audace", trait: "feu" },
        { label: "Sa sensibilité et son intuition", trait: "eau" },
        { label: "Sa fiabilité et son calme", trait: "terre" },
        { label: "Sa liberté et sa curiosité", trait: "air" },
      ],
    },
    {
      text: "En conflit, tu as tendance à...",
      options: [
        { label: "Réagir vite et fort, sur l'instant", trait: "feu" },
        { label: "Absorber la tension avant d'y répondre", trait: "eau" },
        { label: "Rester ferme et posé·e", trait: "terre" },
        { label: "Prendre de la hauteur pour désamorcer", trait: "air" },
      ],
    },
    {
      text: "Ta couleur intuitive ?",
      options: [
        { label: "Rouge ou orange, chaude et intense", trait: "feu" },
        { label: "Bleu profond, apaisant", trait: "eau" },
        { label: "Vert ou marron, ancré dans la nature", trait: "terre" },
        { label: "Blanc ou jaune pâle, léger et clair", trait: "air" },
      ],
    },
    {
      text: "Ta saison préférée ?",
      options: [
        { label: "L'été, intense et brûlant", trait: "feu" },
        { label: "L'automne, doux et mélancolique", trait: "eau" },
        { label: "L'hiver, calme et solide", trait: "terre" },
        { label: "Le printemps, léger et renouvelé", trait: "air" },
      ],
    },
    {
      text: "Comment les autres te perçoivent en premier ?",
      options: [
        { label: "Comme quelqu'un de passionné·e et intense", trait: "feu" },
        { label: "Comme quelqu'un de doux et à l'écoute", trait: "eau" },
        { label: "Comme quelqu'un de solide et fiable", trait: "terre" },
        { label: "Comme quelqu'un de libre et original", trait: "air" },
      ],
    },
    {
      text: "Ta façon de prendre une décision importante ?",
      options: [
        { label: "Sur un coup de tête, guidé·e par l'envie", trait: "feu" },
        { label: "En suivant ce que ressent mon cœur", trait: "eau" },
        { label: "Après avoir pesé le pour et le contre calmement", trait: "terre" },
        { label: "En explorant toutes les options possibles", trait: "air" },
      ],
    },
    {
      text: "Ton élément préféré au naturel ?",
      options: [
        { label: "Le feu qui danse et réchauffe", trait: "feu" },
        { label: "L'eau qui coule et s'adapte", trait: "eau" },
        { label: "La terre qui nourrit et stabilise", trait: "terre" },
        { label: "L'air qui circule et libère", trait: "air" },
      ],
    },
    {
      text: "Ce que les gens aiment le plus chez toi ?",
      options: [
        { label: "Mon énergie contagieuse", trait: "feu" },
        { label: "Ma capacité à comprendre les autres", trait: "eau" },
        { label: "Ma présence rassurante", trait: "terre" },
        { label: "Ma liberté d'esprit", trait: "air" },
      ],
    },
    {
      text: "Ton super-pouvoir imaginaire serait...",
      options: [
        { label: "Contrôler le feu", trait: "feu" },
        { label: "Communiquer avec les océans", trait: "eau" },
        { label: "Faire pousser une forêt entière", trait: "terre" },
        { label: "Voler et voir le monde d'en haut", trait: "air" },
      ],
    },
  ],
  compatibilite: [
    {
      text: "Dans une relation (amicale ou amoureuse), tu es plutôt...",
      options: [
        { label: "On fait tout ensemble, sans se lâcher", trait: "fusionnel" },
        { label: "On se complète, chacun avec ses forces", trait: "complementaire" },
        { label: "On se dit tout, cash, sans filtre", trait: "franc" },
        { label: "On garde son calme, même dans le désaccord", trait: "zen" },
      ],
    },
    {
      text: "Un désaccord éclate entre vous, tu...",
      options: [
        { label: "En parles tout de suite, on ne se quitte jamais fâchés", trait: "fusionnel" },
        { label: "Laisses chacun apporter sa vision pour trouver l'équilibre", trait: "complementaire" },
        { label: "Dis directement ce qui ne va pas", trait: "franc" },
        { label: "Prends du recul avant d'en reparler calmement", trait: "zen" },
      ],
    },
    {
      text: "Ton binôme idéal serait quelqu'un qui...",
      options: [
        { label: "Partage absolument tout avec toi", trait: "fusionnel" },
        { label: "A des qualités différentes des tiennes", trait: "complementaire" },
        { label: "Te dit toujours la vérité, même si ça pique", trait: "franc" },
        { label: "Reste calme peu importe la situation", trait: "zen" },
      ],
    },
    {
      text: "Un week-end à deux, tu préfères...",
      options: [
        { label: "Ne rien planifier séparément, tout faire ensemble", trait: "fusionnel" },
        { label: "Que chacun propose une activité qu'il aime", trait: "complementaire" },
        { label: "Dire clairement ce que tu as envie de faire", trait: "franc" },
        { label: "Improviser tranquillement, sans pression", trait: "zen" },
      ],
    },
    {
      text: "Ce que tu attends le plus d'une relation ?",
      options: [
        { label: "Une vraie fusion, une connexion totale", trait: "fusionnel" },
        { label: "Un équilibre entre nos différences", trait: "complementaire" },
        { label: "Une honnêteté totale, sans tabou", trait: "franc" },
        { label: "Une sérénité qui dure dans le temps", trait: "zen" },
      ],
    },
    {
      text: "Face à un silence de l'autre, tu penses...",
      options: [
        { label: "Il/elle me manque déjà, j'ai hâte qu'on se reparle", trait: "fusionnel" },
        { label: "Chacun a besoin de son espace, c'est normal", trait: "complementaire" },
        { label: "Je vais lui demander directement ce qui se passe", trait: "franc" },
        { label: "Je ne m'inquiète pas, tout ira bien", trait: "zen" },
      ],
    },
    {
      text: "Comment tu gères les habitudes différentes de l'autre ?",
      options: [
        { label: "J'essaie de m'aligner sur les siennes", trait: "fusionnel" },
        { label: "J'apprécie qu'on soit différents, ça équilibre", trait: "complementaire" },
        { label: "Je lui dis franchement ce qui me dérange", trait: "franc" },
        { label: "Je m'adapte sans faire de vagues", trait: "zen" },
      ],
    },
    {
      text: "Le meilleur compliment qu'on te fasse en duo ?",
      options: [
        { label: "\"On dirait que vous êtes connectés en permanence\"", trait: "fusionnel" },
        { label: "\"Vous vous complétez à merveille\"", trait: "complementaire" },
        { label: "\"Avec vous deux, tout est clair et transparent\"", trait: "franc" },
        { label: "\"Rien ne semble jamais vous déstabiliser\"", trait: "zen" },
      ],
    },
    {
      text: "Ta façon de célébrer une réussite à deux ?",
      options: [
        { label: "On fête ça ensemble, immédiatement", trait: "fusionnel" },
        { label: "Chacun apporte sa touche à la célébration", trait: "complementaire" },
        { label: "On se dit franchement ce qu'on a ressenti", trait: "franc" },
        { label: "On savoure ça tranquillement, sans en faire trop", trait: "zen" },
      ],
    },
    {
      text: "Quand l'autre a une mauvaise idée, tu...",
      options: [
        { label: "La soutiens quand même, par solidarité", trait: "fusionnel" },
        { label: "Proposes une alternative qui combine vos idées", trait: "complementaire" },
        { label: "Le lui dis cash, sans détour", trait: "franc" },
        { label: "Laisses filer, ce n'est pas si grave", trait: "zen" },
      ],
    },
    {
      text: "Ton style de communication en couple/amitié ?",
      options: [
        { label: "On se comprend souvent sans même parler", trait: "fusionnel" },
        { label: "On équilibre nos façons différentes de communiquer", trait: "complementaire" },
        { label: "On se parle cash, tout le temps", trait: "franc" },
        { label: "On communique calmement, sans jamais s'emporter", trait: "zen" },
      ],
    },
    {
      text: "Ce qui pourrait faire capoter une relation pour toi ?",
      options: [
        { label: "Un manque de proximité et de connexion", trait: "fusionnel" },
        { label: "Trop de ressemblance, pas assez d'équilibre", trait: "complementaire" },
        { label: "Des non-dits qui s'accumulent", trait: "franc" },
        { label: "Trop de tensions et de conflits", trait: "zen" },
      ],
    },
    {
      text: "Dans un jeu en équipe, tu es plutôt...",
      options: [
        { label: "Toujours collé·e à ton coéquipier", trait: "fusionnel" },
        { label: "À chercher comment vos styles se complètent", trait: "complementaire" },
        { label: "À dire directement ta stratégie", trait: "franc" },
        { label: "Toujours calme, peu importe le score", trait: "zen" },
      ],
    },
    {
      text: "Ta pire crainte dans une relation proche ?",
      options: [
        { label: "S'éloigner l'un de l'autre", trait: "fusionnel" },
        { label: "Ne plus se sentir complémentaires", trait: "complementaire" },
        { label: "Se mentir ou se cacher des choses", trait: "franc" },
        { label: "Vivre dans un conflit permanent", trait: "zen" },
      ],
    },
    {
      text: "Comment tu décrirais ton duo idéal ?",
      options: [
        { label: "Deux âmes connectées en permanence", trait: "fusionnel" },
        { label: "Deux forces différentes qui s'équilibrent", trait: "complementaire" },
        { label: "Deux personnes qui se disent tout, toujours", trait: "franc" },
        { label: "Deux personnes sereines, quoi qu'il arrive", trait: "zen" },
      ],
    },
  ],
};

export function getQuestionBank(theme: ThemeId): BankQuestion[] {
  return QUESTION_BANK[theme];
}
