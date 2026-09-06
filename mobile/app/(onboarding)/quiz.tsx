import { useMemo, useState } from "react";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuth } from "../../lib/auth";
import { supabase } from "../../lib/supabase/client";
import { colors, spacing } from "../../lib/theme";
import { ONBOARDING_QUESTIONS } from "../../lib/matching/questionnaire";
import { scoreOnboardingAnswers, isOnboardingComplete } from "../../lib/matching/scoring";

export default function Quiz() {
  const { session, refreshProfile } = useAuth();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const question = ONBOARDING_QUESTIONS[index];
  const progress = useMemo(
    () => (index + 1) / ONBOARDING_QUESTIONS.length,
    [index],
  );

  const selectOption = async (optionId: string) => {
    const nextAnswers = { ...answers, [question.id]: optionId };
    setAnswers(nextAnswers);

    if (index < ONBOARDING_QUESTIONS.length - 1) {
      setIndex(index + 1);
      return;
    }

    if (!isOnboardingComplete(nextAnswers) || !session) return;

    setSubmitting(true);
    setError(null);
    try {
      const responses = Object.entries(nextAnswers).map(([questionId, chosenOptionId]) => ({
        user_id: session.user.id,
        question_id: questionId,
        option_id: chosenOptionId,
      }));
      const { error: responsesError } = await supabase
        .from("onboarding_responses")
        .upsert(responses, { onConflict: "user_id,question_id" });
      if (responsesError) throw responsesError;

      const scores = scoreOnboardingAnswers(nextAnswers);
      const { error: rpcError } = await supabase.rpc("set_personality_vector", {
        p_scores: scores,
        p_source: "onboarding",
      });
      if (rpcError) throw rpcError;

      await refreshProfile();
      router.replace("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec de l'enregistrement.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitting) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.hint}>On prépare ton profil...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <Text style={styles.counter}>
        {index + 1} / {ONBOARDING_QUESTIONS.length}
      </Text>
      <Text style={styles.prompt}>{question.prompt}</Text>

      <View style={styles.options}>
        {question.options.map((option) => (
          <Pressable
            key={option.id}
            style={styles.option}
            onPress={() => selectOption(option.id)}
          >
            <Text style={styles.optionText}>{option.label}</Text>
          </Pressable>
        ))}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing(3), paddingTop: spacing(10), gap: spacing(2) },
  center: { flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center", gap: spacing(2) },
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: colors.surface, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: colors.primary },
  counter: { color: colors.textMuted, fontWeight: "600" },
  prompt: { color: colors.text, fontSize: 22, fontWeight: "700", lineHeight: 30 },
  options: { gap: spacing(1.5) },
  option: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing(2),
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionText: { color: colors.text, fontSize: 15, lineHeight: 21 },
  error: { color: colors.danger },
  hint: { color: colors.textMuted },
});
