"use server";

import { redirect } from "next/navigation";
import { db } from "./db";
import { generateQuiz, generatePortrait } from "./ai";
import { computeTraitScores, type TraitDef } from "./scoring";
import { generateSlug } from "./slug";
import { getOrCreateCreatorId } from "./creator";
import { getTheme, type ThemeId } from "./themes";

export interface CreateQuizState {
  error?: string;
}

export async function createQuiz(
  _prevState: CreateQuizState,
  formData: FormData,
): Promise<CreateQuizState> {
  const themeIdRaw = String(formData.get("theme") || "").trim();
  const customTheme = String(formData.get("customTheme") || "").trim();

  if (!themeIdRaw && !customTheme) {
    return { error: "Choisis un thème ou décris le tien pour continuer." };
  }

  const theme = themeIdRaw ? getTheme(themeIdRaw) : undefined;
  if (!theme && !customTheme) {
    return { error: "Thème invalide." };
  }

  let generated;
  try {
    generated = await generateQuiz({
      themeId: theme?.id as ThemeId | undefined,
      customTheme: customTheme || undefined,
    });
  } catch (err) {
    console.error(err);
    return { error: "Impossible de générer le test pour le moment. Réessaie dans un instant." };
  }

  const creatorId = await getOrCreateCreatorId();
  const slug = generateSlug();

  let quizSlug: string;
  try {
    const quiz = await db.quiz.create({
      data: {
        slug,
        theme: theme?.id ?? "custom",
        title: generated.title,
        intro: generated.intro,
        emoji: generated.emoji,
        traits: JSON.stringify(generated.traits),
        creatorId,
        questions: {
          create: generated.questions.map((q, index) => ({
            order: index,
            text: q.text,
            type: "choice",
            options: JSON.stringify(q.options),
          })),
        },
      },
    });
    quizSlug = quiz.slug;
  } catch (err) {
    console.error(err);
    return { error: "Impossible d'enregistrer ton test pour le moment. Réessaie dans un instant." };
  }

  redirect(`/test/${quizSlug}`);
}

export interface SubmitResponseState {
  error?: string;
}

export async function submitResponse(
  quizSlug: string,
  _prevState: SubmitResponseState,
  formData: FormData,
): Promise<SubmitResponseState> {
  const quiz = await db.quiz.findUnique({
    where: { slug: quizSlug },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!quiz) return { error: "Ce test n'existe pas ou plus." };

  const respondentName = String(formData.get("respondentName") || "").trim() || null;

  const answers = new Map<string, number>();
  for (const q of quiz.questions) {
    const raw = formData.get(`q_${q.id}`);
    if (raw === null) {
      return { error: "Merci de répondre à toutes les questions avant de valider." };
    }
    const optionIndex = Number(raw);
    const options = JSON.parse(q.options) as { label: string; trait: string }[];
    if (Number.isNaN(optionIndex) || optionIndex < 0 || optionIndex >= options.length) {
      return { error: "Une réponse est invalide, merci de réessayer." };
    }
    answers.set(q.id, optionIndex);
  }

  const traits = JSON.parse(quiz.traits) as TraitDef[];
  const questionsForScoring = quiz.questions.map((q) => ({
    id: q.id,
    options: JSON.parse(q.options) as { label: string; trait: string }[],
  }));
  const scores = computeTraitScores(traits, questionsForScoring, answers);
  const themeDef = getTheme(quiz.theme);

  let responseSlug: string;
  try {
    const portrait = await generatePortrait({
      quizTitle: quiz.title,
      themeLabel: themeDef?.label ?? quiz.title,
      emoji: quiz.emoji,
      vibe: themeDef?.vibe,
      respondentName,
      traits,
      scores,
    });

    responseSlug = generateSlug();

    await db.response.create({
      data: {
        slug: responseSlug,
        quizId: quiz.id,
        respondentName,
        submittedAt: new Date(),
        answers: {
          create: Array.from(answers.entries()).map(([questionId, value]) => ({
            questionId,
            value: String(value),
          })),
        },
        result: {
          create: {
            headline: portrait.headline,
            portrait: portrait.portrait,
            emoji: portrait.emoji,
            traits: JSON.stringify(scores),
          },
        },
      },
    });
  } catch (err) {
    console.error(err);
    return { error: "Impossible de générer ton portrait pour le moment. Réessaie dans un instant." };
  }

  redirect(`/r/${responseSlug}`);
}
