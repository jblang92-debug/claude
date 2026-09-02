import Anthropic from "@anthropic-ai/sdk";
import { getTheme, THEMES, type ThemeId } from "./themes";
import { getQuestionBank } from "./question-bank";
import {
  PORTRAIT_BANK,
  OPENING_LINES,
  CLOSING_LINES,
  pick,
} from "./portrait-bank";
import type { ScoredTrait, TraitDef } from "./scoring";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";
const MIN_QUESTIONS = 15;
const MAX_QUESTIONS = 25;
const TARGET_QUESTIONS = 18;

function getClient(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  return new Anthropic({ apiKey });
}

export interface GeneratedOption {
  label: string;
  trait: string;
}

export interface GeneratedQuestion {
  text: string;
  options: [GeneratedOption, GeneratedOption, GeneratedOption, GeneratedOption];
}

export interface GeneratedQuiz {
  title: string;
  intro: string;
  emoji: string;
  traits: TraitDef[];
  questions: GeneratedQuestion[];
  source: "ai" | "template";
}

export interface GeneratedPortrait {
  headline: string;
  emoji: string;
  portrait: string;
  source: "ai" | "template";
}

// ---------------------------------------------------------------------------
// Génération du test (questions)
// ---------------------------------------------------------------------------

export async function generateQuiz(opts: {
  themeId?: ThemeId;
  customTheme?: string;
}): Promise<GeneratedQuiz> {
  const theme = opts.themeId ? getTheme(opts.themeId) : undefined;
  const client = getClient();

  if (client) {
    try {
      return await generateQuizWithAI(client, theme, opts.customTheme);
    } catch (err) {
      console.error("Génération IA du test impossible, repli sur le modèle local :", err);
    }
  }

  return generateQuizFromTemplate(theme, opts.customTheme);
}

async function generateQuizWithAI(
  client: Anthropic,
  theme: ReturnType<typeof getTheme>,
  customTheme?: string,
): Promise<GeneratedQuiz> {
  const themeDescription = theme
    ? `${theme.label} (${theme.description}). Ton attendu : ${theme.vibe}.`
    : `Thème libre choisi par l'utilisateur : "${customTheme}".`;

  const quizSchema = {
    type: "object" as const,
    properties: {
      title: { type: "string", description: "Titre accrocheur du test, 3 à 8 mots" },
      intro: {
        type: "string",
        description: "Une phrase d'intro fun qui donne envie de répondre",
      },
      emoji: { type: "string", description: "Un seul emoji représentatif du thème" },
      traits: {
        type: "array",
        description:
          "Exactement 4 dimensions/traits de personnalité mesurés par ce test",
        minItems: 4,
        maxItems: 4,
        items: {
          type: "object",
          properties: {
            key: {
              type: "string",
              description: "identifiant court en minuscules, sans espace ni accent",
            },
            label: { type: "string", description: "nom du trait, lisible, 1 à 3 mots" },
          },
          required: ["key", "label"],
        },
      },
      questions: {
        type: "array",
        description: `Entre ${MIN_QUESTIONS} et ${MAX_QUESTIONS} questions ludiques, à choix multiple`,
        minItems: MIN_QUESTIONS,
        maxItems: MAX_QUESTIONS,
        items: {
          type: "object",
          properties: {
            text: { type: "string", description: "la question, ton léger, tutoiement" },
            options: {
              type: "array",
              description:
                "Exactement 4 options de réponse, chacune reliée à un trait différent parmi les 4 traits définis",
              minItems: 4,
              maxItems: 4,
              items: {
                type: "object",
                properties: {
                  label: { type: "string", description: "texte court de l'option" },
                  trait: {
                    type: "string",
                    description: "doit correspondre exactement à un des `key` de traits",
                  },
                },
                required: ["label", "trait"],
              },
            },
          },
          required: ["text", "options"],
        },
      },
    },
    required: ["title", "intro", "emoji", "traits", "questions"],
  };

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 8000,
    system:
      "Tu conçois des tests de personnalité courts, fun et bienveillants pour une appli mobile destinée à mieux connaître ses proches. " +
      "Ton style est léger, chaleureux, jamais moqueur ni psychanalytique. Les questions n'ont pas de bonne ou mauvaise réponse. " +
      "Chaque question a exactement 4 options, et chaque option est reliée à l'un des 4 traits de personnalité du test (répartis le plus équitablement possible sur l'ensemble du test). " +
      "Réponds uniquement en français, avec du tutoiement.",
    messages: [
      {
        role: "user",
        content: `Crée un test de personnalité sur le thème suivant : ${themeDescription}\n\nGénère environ ${TARGET_QUESTIONS} questions (entre ${MIN_QUESTIONS} et ${MAX_QUESTIONS}), en variant les formulations et les situations évoquées.`,
      },
    ],
    tools: [
      {
        name: "submit_quiz",
        description: "Envoie le test de personnalité généré",
        input_schema: quizSchema,
      },
    ],
    tool_choice: { type: "tool", name: "submit_quiz" },
  });

  const toolUse = message.content.find(
    (c): c is Anthropic.ToolUseBlock => c.type === "tool_use",
  );
  if (!toolUse) throw new Error("Aucune réponse structurée reçue de l'IA");

  const data = toolUse.input as {
    title: string;
    intro: string;
    emoji: string;
    traits: TraitDef[];
    questions: {
      text: string;
      options: { label: string; trait: string }[];
    }[];
  };

  if (
    !data.traits ||
    data.traits.length !== 4 ||
    !data.questions ||
    data.questions.length < MIN_QUESTIONS
  ) {
    throw new Error("Réponse IA incomplète");
  }

  const validTraitKeys = new Set(data.traits.map((t) => t.key));
  const questions: GeneratedQuestion[] = data.questions
    .filter((q) => q.options?.length === 4 && q.options.every((o) => validTraitKeys.has(o.trait)))
    .slice(0, MAX_QUESTIONS)
    .map((q) => ({
      text: q.text,
      options: q.options as [GeneratedOption, GeneratedOption, GeneratedOption, GeneratedOption],
    }));

  if (questions.length < MIN_QUESTIONS) {
    throw new Error("Pas assez de questions valides générées par l'IA");
  }

  return {
    title: data.title,
    intro: data.intro,
    emoji: data.emoji || (theme?.emoji ?? "✨"),
    traits: data.traits,
    questions,
    source: "ai",
  };
}

function generateQuizFromTemplate(
  theme: ReturnType<typeof getTheme>,
  customTheme?: string,
): GeneratedQuiz {
  // Sans clé IA configurée, on s'appuie sur la banque de questions prête à
  // l'emploi. Pour un thème libre non reconnu, on retombe sur un thème
  // générique proche ("valeurs") tout en gardant le titre choisi par le créateur.
  const effectiveTheme = theme ?? THEMES.find((t) => t.id === "valeurs")!;
  const bank = getQuestionBank(effectiveTheme.id);

  const questions: GeneratedQuestion[] = bank.map((q) => ({
    text: q.text,
    options: q.options,
  }));

  const title = theme
    ? `Quel(le) ${theme.label.split(" ")[0].toLowerCase()} es-tu vraiment ?`
    : customTheme
      ? `Test : ${customTheme}`
      : effectiveTheme.label;

  const intro = theme
    ? effectiveTheme.description
    : `Un test généré sur mesure autour de "${customTheme}" (façon ${effectiveTheme.label.toLowerCase()}) — réponds sans réfléchir, avec le sourire !`;

  return {
    title,
    intro,
    emoji: effectiveTheme.emoji,
    traits: effectiveTheme.traits,
    questions,
    source: "template",
  };
}

// ---------------------------------------------------------------------------
// Génération du portrait (résultat)
// ---------------------------------------------------------------------------

export async function generatePortrait(opts: {
  quizTitle: string;
  themeLabel: string;
  emoji: string;
  vibe?: string;
  respondentName?: string | null;
  traits: TraitDef[];
  scores: ScoredTrait[];
}): Promise<GeneratedPortrait> {
  const client = getClient();

  if (client) {
    try {
      return await generatePortraitWithAI(client, opts);
    } catch (err) {
      console.error("Génération IA du portrait impossible, repli sur le modèle local :", err);
    }
  }

  return generatePortraitFromTemplate(opts);
}

async function generatePortraitWithAI(
  client: Anthropic,
  opts: {
    quizTitle: string;
    themeLabel: string;
    emoji: string;
    vibe?: string;
    respondentName?: string | null;
    traits: TraitDef[];
    scores: ScoredTrait[];
  },
): Promise<GeneratedPortrait> {
  const scoresText = opts.scores
    .map((s) => `- ${s.label} : ${s.value}%`)
    .join("\n");

  const portraitSchema = {
    type: "object" as const,
    properties: {
      headline: {
        type: "string",
        description: "Titre court et percutant du portrait (3 à 7 mots), sans guillemets",
      },
      portrait: {
        type: "string",
        description:
          "Portrait narratif de 4 à 7 phrases, chaleureux et fun, en tutoiement, qui s'appuie sur les traits dominants sans jamais donner l'impression d'un diagnostic",
      },
    },
    required: ["headline", "portrait"],
  };

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 1200,
    system:
      "Tu rédiges des portraits de personnalité fun et chaleureux à partir des résultats d'un test que quelqu'un vient de compléter. " +
      "Ton ton est léger, jamais moqueur ni psychanalytique : c'est un portrait, pas un diagnostic. Tutoiement, écriture inclusive légère si besoin. " +
      "Ne mentionne jamais de pourcentages ni de chiffres, transforme-les en langage naturel. Réponds uniquement en français.",
    messages: [
      {
        role: "user",
        content:
          `Test : "${opts.quizTitle}" (thème : ${opts.themeLabel}${opts.vibe ? `, ton : ${opts.vibe}` : ""})\n` +
          `Prénom du/de la répondant·e : ${opts.respondentName || "non renseigné"}\n\n` +
          `Résultats obtenus (dimensions mesurées, du plus au moins marqué) :\n${scoresText}\n\n` +
          `Rédige un portrait de personnalité qui met surtout en avant la ou les 2 dimensions les plus marquées, de façon fine et personnalisée.`,
      },
    ],
    tools: [
      {
        name: "submit_portrait",
        description: "Envoie le portrait de personnalité rédigé",
        input_schema: portraitSchema,
      },
    ],
    tool_choice: { type: "tool", name: "submit_portrait" },
  });

  const toolUse = message.content.find(
    (c): c is Anthropic.ToolUseBlock => c.type === "tool_use",
  );
  if (!toolUse) throw new Error("Aucune réponse structurée reçue de l'IA");

  const data = toolUse.input as { headline: string; portrait: string };
  if (!data.headline || !data.portrait) throw new Error("Portrait IA incomplet");

  return {
    headline: data.headline,
    emoji: opts.emoji,
    portrait: data.portrait,
    source: "ai",
  };
}

function generatePortraitFromTemplate(opts: {
  quizTitle: string;
  themeLabel: string;
  emoji: string;
  respondentName?: string | null;
  traits: TraitDef[];
  scores: ScoredTrait[];
}): GeneratedPortrait {
  const themeId = THEMES.find((t) => t.label === opts.themeLabel)?.id;
  const bank = themeId ? PORTRAIT_BANK[themeId] : undefined;

  const top = opts.scores[0];
  const second = opts.scores[1];

  const topEntry = bank?.[top?.key ?? ""];
  const secondEntry =
    second && second.value >= 15 ? bank?.[second.key ?? ""] : undefined;

  const opening = pick(OPENING_LINES(opts.respondentName, opts.themeLabel));
  const closing = pick(CLOSING_LINES);

  const sentences = [opening];
  if (topEntry) {
    sentences.push(topEntry.detail);
  } else if (top) {
    sentences.push(
      `Ta dimension la plus marquée est "${top.label}" : elle façonne beaucoup ta façon de répondre à ce genre de situations.`,
    );
  }
  if (secondEntry) {
    sentences.push(secondEntry.detail);
  }
  sentences.push(closing);

  const headline = topEntry?.title
    ? topEntry.title.replace(/^[^\wÀ-ÿ]+/, "").trim()
    : top
      ? top.label
      : opts.quizTitle;

  return {
    headline,
    emoji: opts.emoji,
    portrait: sentences.join(" "),
    source: "template",
  };
}
