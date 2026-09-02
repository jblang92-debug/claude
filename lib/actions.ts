"use server";

import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import { generateQuestions, generatePortrait, generateCompatibility, type GeneratedPortrait, type GeneratedCompat } from "./ai";
import { findQuizCategory, getCategory, slugify, type Depth } from "./catalog";
import { newlyUnlockedBadges } from "./badges";
import type { TestRow } from "./data";

/**
 * Charge un test depuis le cache (table `tests`) ou le génère à la volée
 * puis le met en cache pour tout le monde. C'est ce qui donne un
 * "chargement instantané" dès la deuxième personne à choisir ce test.
 */
export async function getOrCreateTest(title: string, categoryId?: string): Promise<TestRow> {
  const supabase = await createClient();
  const slug = slugify(title);

  const { data: existing } = await supabase
    .from("tests")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (existing) return existing as TestRow;

  const category = categoryId ? getCategory(categoryId) : findQuizCategory(title);
  const catalogQuiz = category?.quizzes.find((q) => q.title === title);
  const depth: Depth = catalogQuiz?.depth ?? "leger";

  const questions = await generateQuestions(title, category?.label);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: inserted, error } = await supabase
    .from("tests")
    .insert({
      slug,
      category_id: category?.id ?? null,
      title,
      depth,
      emoji: category?.emoji ?? null,
      is_custom: !catalogQuiz,
      questions,
      created_by: user?.id ?? null,
    })
    .select("*")
    .single();

  if (error) {
    // Un autre utilisateur a pu créer ce même test entre notre lecture et
    // notre écriture (ex. deux personnes choisissent le même titre en même
    // temps) : on relit simplement le résultat de la course.
    const { data: raced } = await supabase
      .from("tests")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (raced) return raced as TestRow;
    throw error;
  }
  return inserted as TestRow;
}

export interface SubmitTestState {
  error?: string;
}

function daysBetween(isoDateA: string, isoDateB: string): number {
  const a = new Date(isoDateA + "T00:00:00Z").getTime();
  const b = new Date(isoDateB + "T00:00:00Z").getTime();
  return Math.round((b - a) / 86_400_000);
}

/**
 * Enregistre les réponses, génère le portrait, met à jour streak/badges,
 * puis redirige vers la page de résultat.
 */
export async function submitTest(
  test: TestRow,
  _prevState: SubmitTestState,
  formData: FormData,
): Promise<SubmitTestState> {
  const answers: string[] = [];
  for (let i = 0; i < test.questions.length; i++) {
    const value = formData.get(`q_${i}`);
    if (typeof value !== "string" || !value) {
      return { error: "Merci de répondre à toutes les questions avant de valider." };
    }
    answers.push(value);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Session introuvable, recharge la page et réessaie." };

  let resultId: string;
  try {
    const { portrait, traits } = await generatePortrait(test.title, test.questions, answers);

    const { data: result, error: insertError } = await supabase
      .from("results")
      .insert({ test_id: test.id, user_id: user.id, answers, portrait, traits })
      .select("id")
      .single();
    if (insertError || !result) throw insertError ?? new Error("Échec de l'enregistrement du résultat");
    resultId = result.id;

    const { data: profile } = await supabase
      .from("profiles")
      .select("current_streak, longest_streak, last_test_date, tests_completed")
      .eq("id", user.id)
      .single();

    if (profile) {
      const today = new Date().toISOString().slice(0, 10);
      let newStreak = 1;
      if (profile.last_test_date) {
        const diff = daysBetween(profile.last_test_date, today);
        if (diff === 0) newStreak = profile.current_streak;
        else if (diff === 1) newStreak = profile.current_streak + 1;
        else newStreak = 1;
      }
      const newTestsCompleted = profile.tests_completed + 1;
      const newLongest = Math.max(profile.longest_streak, newStreak);

      await supabase
        .from("profiles")
        .update({
          current_streak: newStreak,
          longest_streak: newLongest,
          last_test_date: today,
          tests_completed: newTestsCompleted,
        })
        .eq("id", user.id);

      const unlocked = newlyUnlockedBadges(profile.tests_completed, newTestsCompleted);
      if (unlocked.length) {
        await supabase
          .from("profile_badges")
          .insert(unlocked.map((b) => ({ profile_id: user.id, badge_id: b.id })))
          .select();
      }
    }
  } catch (err) {
    console.error(err);
    return { error: "Impossible de générer ton portrait pour le moment. Réessaie dans un instant." };
  }

  redirect(`/resultat/${resultId}`);
}

/** Réaction ("ça te ressemble ?") sur son propre résultat. */
export async function setResultReaction(resultId: string, emoji: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("results").update({ reaction: emoji }).eq("id", resultId);
}

export interface StartCustomTestState {
  error?: string;
}

/** Crée (ou récupère) un test à partir d'un thème tapé librement, puis y redirige. */
export async function startCustomTest(
  _prevState: StartCustomTestState,
  formData: FormData,
): Promise<StartCustomTestState> {
  const title = String(formData.get("customTheme") || "").trim();
  if (!title) return { error: "Décris le thème de ton test pour continuer." };
  if (title.length > 140) return { error: "Choisis un titre un peu plus court." };

  let slug: string;
  try {
    const test = await getOrCreateTest(title);
    slug = test.slug;
  } catch (err) {
    console.error(err);
    return { error: "Impossible de générer ce test pour le moment. Réessaie dans un instant." };
  }

  redirect(`/test/${slug}`);
}

export interface LinkEmailState {
  error?: string;
  success?: boolean;
}

/**
 * Fait passer le compte anonyme à un compte permanent en y attachant un
 * email : un lien de confirmation est envoyé, et une fois cliqué, les
 * mêmes résultats/streaks/badges restent associés au même utilisateur —
 * mais accessibles depuis n'importe quel appareil.
 */
export async function linkEmail(
  _prevState: LinkEmailState,
  formData: FormData,
): Promise<LinkEmailState> {
  const email = String(formData.get("email") || "").trim();
  if (!email || !email.includes("@")) {
    return { error: "Merci d'indiquer un email valide." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ email });
  if (error) {
    return { error: "Impossible d'envoyer le lien de confirmation. Réessaie dans un instant." };
  }
  return { success: true };
}

// ---------------------------------------------------------------------------
// Mode Duo (même téléphone) : deux tests joués à la suite sur le même
// appareil. Volontairement éphémère — rien n'est enregistré en base (ni
// résultat, ni streak, ni badge), car les deux joueurs partagent la même
// session sur cet appareil et ça n'aurait pas de sens de mélanger leurs
// portraits dans une seule galerie personnelle.
// ---------------------------------------------------------------------------

export type DuoPortraitResult =
  | ({ ok: true } & GeneratedPortrait)
  | { ok: false; error: string };

export async function generateDuoPortrait(
  test: TestRow,
  answers: string[],
): Promise<DuoPortraitResult> {
  try {
    const result = await generatePortrait(test.title, test.questions, answers);
    return { ok: true, ...result };
  } catch (err) {
    console.error(err);
    return { ok: false, error: "Impossible de générer ce portrait pour le moment." };
  }
}

export type DuoCompatResult = ({ ok: true } & GeneratedCompat) | { ok: false; error: string };

export async function generateDuoCompat(
  title: string,
  portraitA: string,
  traitsA: string[],
  portraitB: string,
  traitsB: string[],
): Promise<DuoCompatResult> {
  try {
    const result = await generateCompatibility(title, portraitA, traitsA, portraitB, traitsB);
    return { ok: true, ...result };
  } catch (err) {
    console.error(err);
    return { ok: false, error: "Impossible de calculer la compatibilité pour le moment." };
  }
}
