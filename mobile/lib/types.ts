import type { PersonalityScores } from "./matching/axes";

export interface Profile {
  id: string;
  display_name: string | null;
  birthdate: string | null;
  gender: string | null;
  seeking: string[] | null;
  bio: string | null;
  city: string | null;
  photos: string[];
  personality_version: number;
  personality_scores: PersonalityScores;
  onboarding_completed_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface DailyMatch {
  id: string;
  user_id: string;
  candidate_id: string;
  batch_date: string;
  rank: number;
  status: "suggested" | "viewed" | "liked" | "passed";
  created_at: string;
  candidate?: Profile;
}

export interface AxisComparison {
  axis: string;
  scoreA: number;
  scoreB: number;
  gap: number;
}

export interface MutualLike {
  id: string;
  user_low: string;
  user_high: string;
  matched_at: string;
}

export interface Conversation {
  id: string;
  mutual_like_id: string;
  status: "active" | "blocked" | "closed";
  created_at: string;
  other_profile?: Profile;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  moderation_status: "ok" | "flagged" | "removed";
  created_at: string;
}
