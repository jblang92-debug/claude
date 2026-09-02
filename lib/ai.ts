import Anthropic from "@anthropic-ai/sdk";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";
const QUESTIONS_COUNT = 15;

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY n'est pas configurée : impossible de générer ce test ou ce portrait.",
    );
  }
  return new Anthropic({ apiKey });
}

export interface GeneratedQuestion {
  q: string;
  options: string[];
}

/** Génère les 15 questions d'un test à partir de son titre (catalogue ou thème libre). */
export async function generateQuestions(
  title: string,
  categoryLabel?: string,
): Promise<GeneratedQuestion[]> {
  const client = getClient();

  const schema = {
    type: "object" as const,
    properties: {
      questions: {
        type: "array",
        minItems: QUESTIONS_COUNT,
        maxItems: QUESTIONS_COUNT,
        items: {
          type: "object",
          properties: {
            q: { type: "string", description: "texte de la question" },
            options: {
              type: "array",
              minItems: 4,
              maxItems: 6,
              items: { type: "string" },
              description: "options de réponse, variées et bien différenciées",
            },
          },
          required: ["q", "options"],
        },
      },
    },
    required: ["questions"],
  };

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 4000,
    system:
      "Tu conçois des tests de personnalité fun pour une appli mobile, en français, avec un ton complice, direct et amusant, jamais moqueur ni vulgaire — même sur des sujets plus intimes, reste suggestif et fun, jamais explicite. Pas de bonne ou mauvaise réponse.",
    messages: [
      {
        role: "user",
        content: `Titre du test : "${title}"${categoryLabel ? ` (catégorie : ${categoryLabel})` : ""}.\nGénère exactement ${QUESTIONS_COUNT} questions à choix multiples, chacune avec 4 à 6 options variées et bien différenciées, pour révéler des facettes différentes de la personnalité.`,
      },
    ],
    tools: [
      {
        name: "submit_questions",
        description: "Envoie les questions du test générées",
        input_schema: schema,
      },
    ],
    tool_choice: { type: "tool", name: "submit_questions" },
  });

  const toolUse = message.content.find(
    (c): c is Anthropic.ToolUseBlock => c.type === "tool_use",
  );
  if (!toolUse) throw new Error("Aucune réponse structurée reçue de l'IA");

  const data = toolUse.input as { questions: GeneratedQuestion[] };
  if (!data.questions || data.questions.length < QUESTIONS_COUNT) {
    throw new Error("Réponse IA incomplète : pas assez de questions générées");
  }
  return data.questions.slice(0, QUESTIONS_COUNT);
}

export interface GeneratedPortrait {
  portrait: string;
  traits: string[];
}

/**
 * Génère le portrait narratif + 4 traits à partir des réponses données.
 * Sans ANTHROPIC_API_KEY, retombe sur une petite banque de portraits
 * prêts à l'emploi (lib/portrait-fallback.ts) — moins personnalisé, mais
 * permet de tester tout le parcours sans clé payante.
 */
export async function generatePortrait(
  title: string,
  questions: GeneratedQuestion[],
  answers: string[],
): Promise<GeneratedPortrait> {
  if (!process.env.ANTHROPIC_API_KEY) {
    const { fallbackPortrait } = await import("./portrait-fallback");
    return fallbackPortrait();
  }

  const client = getClient();

  const qa = questions
    .map((q, i) => `Q: ${q.q}\nRéponse choisie : ${answers[i]}`)
    .join("\n\n");

  const schema = {
    type: "object" as const,
    properties: {
      portrait: {
        type: "string",
        description:
          "portrait de personnalité chaleureux, perspicace et amusant (pas un diagnostic, pas un score), 4 à 6 phrases, à la deuxième personne (tu), jamais explicite ni cru même sur un sujet intime",
      },
      traits: {
        type: "array",
        minItems: 4,
        maxItems: 4,
        items: { type: "string" },
        description: "4 traits de caractère courts (2-3 mots chacun) qui ressortent des réponses",
      },
    },
    required: ["portrait", "traits"],
  };

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 1200,
    system:
      "Tu rédiges des portraits de personnalité fun et chaleureux à partir des réponses données à un test. Ton ton est léger, jamais moqueur ni psychanalytique : c'est un portrait, pas un diagnostic. Tutoiement. Réponds uniquement en français.",
    messages: [
      {
        role: "user",
        content: `Voici les réponses d'une personne à un test de personnalité intitulé "${title}" :\n\n${qa}\n\nRédige son portrait.`,
      },
    ],
    tools: [
      {
        name: "submit_portrait",
        description: "Envoie le portrait de personnalité rédigé",
        input_schema: schema,
      },
    ],
    tool_choice: { type: "tool", name: "submit_portrait" },
  });

  const toolUse = message.content.find(
    (c): c is Anthropic.ToolUseBlock => c.type === "tool_use",
  );
  if (!toolUse) throw new Error("Aucune réponse structurée reçue de l'IA");

  const data = toolUse.input as GeneratedPortrait;
  if (!data.portrait || !data.traits || data.traits.length !== 4) {
    throw new Error("Portrait IA incomplet");
  }
  return data;
}
