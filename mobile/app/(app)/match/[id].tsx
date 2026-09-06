import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuth } from "../../../lib/auth";
import { supabase } from "../../../lib/supabase/client";
import { colors, spacing } from "../../../lib/theme";
import { Constellation } from "../../../components/Constellation";
import type { AxisComparison, Profile } from "../../../lib/types";

/**
 * Détail d'un match : narrative générée à la demande (fonction Edge
 * `match-narrative`, avec cache côté serveur) + constellation + décision
 * like/pass, puis double opt-in explicite si le like est réciproque —
 * voir docs/architecture-app-rencontre.md §7-8.
 */
export default function MatchDetail() {
  const { id: candidateId } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [decision, setDecision] = useState<"liked" | "passed" | null>(null);
  const [mutualLikeId, setMutualLikeId] = useState<string | null>(null);
  const [consentSent, setConsentSent] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const candidateQuery = useQuery({
    queryKey: ["profile", candidateId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", candidateId)
        .single();
      if (error) throw error;
      return data as Profile;
    },
  });

  const narrativeQuery = useQuery({
    queryKey: ["match-narrative", candidateId],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("match-narrative", {
        body: { candidateId },
      });
      if (error) throw error;
      return data as { narrativeText: string; axesSnapshot: AxisComparison[] };
    },
  });

  const decideMutation = useMutation({
    mutationFn: async (nextDecision: "liked" | "passed") => {
      const { error } = await supabase.from("decisions").insert({
        user_id: session!.user.id,
        target_id: candidateId,
        decision: nextDecision,
      });
      if (error) throw error;

      await supabase
        .from("daily_matches")
        .update({ status: nextDecision })
        .eq("user_id", session!.user.id)
        .eq("candidate_id", candidateId);

      if (nextDecision === "liked") {
        const [low, high] = [session!.user.id, candidateId as string].sort();
        const { data: mutual } = await supabase
          .from("mutual_likes")
          .select("id")
          .eq("user_low", low)
          .eq("user_high", high)
          .maybeSingle();
        if (mutual) setMutualLikeId(mutual.id);
      }
      return nextDecision;
    },
    onSuccess: (nextDecision) => {
      setDecision(nextDecision);
      queryClient.invalidateQueries({ queryKey: ["daily-matches"] });
    },
  });

  const consentMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("record_match_consent", {
        p_mutual_like_id: mutualLikeId,
      });
      if (error) throw error;
      return data as string | null;
    },
    onSuccess: (newConversationId) => {
      setConsentSent(true);
      if (newConversationId) setConversationId(newConversationId);
    },
  });

  if (candidateQuery.isLoading || narrativeQuery.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (candidateQuery.error || narrativeQuery.error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Impossible de charger ce match.</Text>
      </View>
    );
  }

  const candidate = candidateQuery.data!;
  const narrative = narrativeQuery.data!;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{candidate.display_name ?? "Profil Miroir"}</Text>
      <Text style={styles.city}>{candidate.city}</Text>

      <View style={styles.constellationWrap}>
        <Constellation axesSnapshot={narrative.axesSnapshot} />
      </View>

      <Text style={styles.narrative}>{narrative.narrativeText}</Text>

      {!decision && (
        <View style={styles.actions}>
          <Pressable
            style={[styles.button, styles.buttonSecondary]}
            onPress={() => decideMutation.mutate("passed")}
            disabled={decideMutation.isPending}
          >
            <Text style={styles.buttonSecondaryText}>Passer</Text>
          </Pressable>
          <Pressable
            style={[styles.button, styles.buttonPrimary]}
            onPress={() => decideMutation.mutate("liked")}
            disabled={decideMutation.isPending}
          >
            <Text style={styles.buttonPrimaryText}>Ça me plaît</Text>
          </Pressable>
        </View>
      )}

      {decision === "passed" && (
        <Text style={styles.hint}>Suggestion passée — direction le fil du jour.</Text>
      )}

      {decision === "liked" && mutualLikeId && !consentSent && (
        <Pressable
          style={[styles.button, styles.buttonPrimary, styles.buttonFull]}
          onPress={() => consentMutation.mutate()}
          disabled={consentMutation.isPending}
        >
          <Text style={styles.buttonPrimaryText}>C'est réciproque — je veux discuter</Text>
        </Pressable>
      )}

      {decision === "liked" && !mutualLikeId && (
        <Text style={styles.hint}>Ton intérêt a été enregistré. On te préviendra si c'est réciproque.</Text>
      )}

      {consentSent && conversationId && (
        <Pressable
          style={[styles.button, styles.buttonPrimary, styles.buttonFull]}
          onPress={() => router.push(`/(app)/chats/${conversationId}`)}
        >
          <Text style={styles.buttonPrimaryText}>Ouvrir la conversation</Text>
        </Pressable>
      )}

      {consentSent && !conversationId && (
        <Text style={styles.hint}>
          En attente que {candidate.display_name ?? "l'autre personne"} confirme aussi vouloir discuter.
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.background, padding: spacing(3), paddingTop: spacing(8), gap: spacing(2) },
  center: { flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 26, fontWeight: "700", color: colors.text },
  city: { color: colors.textMuted },
  constellationWrap: { alignItems: "center", marginVertical: spacing(2) },
  narrative: { color: colors.text, fontSize: 16, lineHeight: 24 },
  actions: { flexDirection: "row", gap: spacing(1.5), marginTop: spacing(2) },
  button: { flex: 1, borderRadius: 16, paddingVertical: spacing(2), alignItems: "center" },
  buttonFull: { flex: undefined, marginTop: spacing(2) },
  buttonPrimary: { backgroundColor: colors.primary },
  buttonPrimaryText: { color: colors.background, fontWeight: "700" },
  buttonSecondary: { borderWidth: 1, borderColor: colors.border },
  buttonSecondaryText: { color: colors.text, fontWeight: "600" },
  hint: { color: colors.textMuted, marginTop: spacing(2), textAlign: "center" },
  errorText: { color: colors.danger },
});
