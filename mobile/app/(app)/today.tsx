import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuth } from "../../lib/auth";
import { supabase } from "../../lib/supabase/client";
import { colors, spacing } from "../../lib/theme";
import type { DailyMatch } from "../../lib/types";

/**
 * Fil de suggestions du jour — 3 à 5 profils, générés par le batch
 * `generate_daily_matches()` (voir supabase/migrations/0002_matching_batch.sql).
 * Aucun scroll infini, aucun calcul ici : uniquement une lecture.
 */
export default function Today() {
  const { session } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ["daily-matches", session?.user.id],
    enabled: Boolean(session),
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from("daily_matches")
        .select("*, candidate:profiles!daily_matches_candidate_id_fkey(*)")
        .eq("user_id", session!.user.id)
        .eq("batch_date", today)
        .order("rank");
      if (error) throw error;
      return data as unknown as DailyMatch[];
    },
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Impossible de charger tes suggestions.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Aujourd'hui</Text>
      <Text style={styles.subtitle}>
        {data?.length
          ? `${data.length} nouvelle${data.length > 1 ? "s" : ""} suggestion${data.length > 1 ? "s" : ""}`
          : "Reviens demain matin pour de nouvelles suggestions."}
      </Text>

      <FlatList
        data={data ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: spacing(2), paddingTop: spacing(2) }}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => router.push(`/(app)/match/${item.candidate_id}`)}
          >
            <Text style={styles.cardName}>
              {item.candidate?.display_name ?? "Profil Miroir"}
            </Text>
            <Text style={styles.cardCity}>{item.candidate?.city}</Text>
            {item.candidate?.bio && (
              <Text style={styles.cardBio} numberOfLines={2}>
                {item.candidate.bio}
              </Text>
            )}
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing(3), paddingTop: spacing(8) },
  center: { flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 28, fontWeight: "700", color: colors.text },
  subtitle: { color: colors.textMuted, marginTop: spacing(0.5) },
  errorText: { color: colors.danger },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing(2.5),
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardName: { color: colors.text, fontSize: 20, fontWeight: "700" },
  cardCity: { color: colors.textMuted, marginTop: spacing(0.5) },
  cardBio: { color: colors.text, marginTop: spacing(1) },
});
