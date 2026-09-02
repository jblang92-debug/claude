import { createClient } from "./supabase/server";
import { BADGES } from "./badges";
import type { GeneratedQuestion } from "./ai";

export interface Profile {
  id: string;
  display_name: string | null;
  current_streak: number;
  longest_streak: number;
  last_test_date: string | null;
  tests_completed: number;
  created_at: string;
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return data as Profile | null;
}

export interface GalleryEntry {
  id: string;
  portrait: string;
  traits: string[];
  reaction: string | null;
  created_at: string;
  test: {
    title: string;
    slug: string;
    category_id: string | null;
    emoji: string | null;
  };
}

export async function getGallery(): Promise<GalleryEntry[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("results")
    .select("id, portrait, traits, reaction, created_at, test:tests(title, slug, category_id, emoji)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (data ?? []) as unknown as GalleryEntry[];
}

export interface ResultDetail extends GalleryEntry {
  answers: string[];
  test: GalleryEntry["test"] & { questions: GeneratedQuestion[] };
}

export async function getResult(id: string): Promise<ResultDetail | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("results")
    .select(
      "id, portrait, traits, reaction, answers, created_at, test:tests(title, slug, category_id, emoji, questions)",
    )
    .eq("id", id)
    .maybeSingle();
  return (data as unknown as ResultDetail) ?? null;
}

export interface TestRow {
  id: string;
  slug: string;
  category_id: string | null;
  title: string;
  depth: "leger" | "profond";
  emoji: string | null;
  is_premium: boolean;
  is_custom: boolean;
  questions: GeneratedQuestion[];
}

export async function getTestBySlug(slug: string): Promise<TestRow | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("tests").select("*").eq("slug", slug).maybeSingle();
  return (data as TestRow) ?? null;
}

export interface BadgeWithStatus {
  id: string;
  threshold: number;
  label: string;
  emoji: string;
  unlocked: boolean;
}

export async function getBadgesWithStatus(): Promise<BadgeWithStatus[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let earnedIds = new Set<string>();
  if (user) {
    const { data: earned } = await supabase
      .from("profile_badges")
      .select("badge_id")
      .eq("profile_id", user.id);
    earnedIds = new Set((earned ?? []).map((e) => e.badge_id));
  }

  return BADGES.map((b) => ({ ...b, unlocked: earnedIds.has(b.id) }));
}
