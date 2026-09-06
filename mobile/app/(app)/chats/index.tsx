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
import { useAuth } from "../../../lib/auth";
import { supabase } from "../../../lib/supabase/client";
import { colors, spacing } from "../../../lib/theme";

interface ConversationRow {
  id: string;
  status: string;
  mutual_like: { user_low: string; user_high: string };
  otherProfile?: { display_name: string | null };
}

export default function Conversations() {
  const { session } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["conversations", session?.user.id],
    enabled: Boolean(session),
    queryFn: async () => {
      const { data: conversations, error } = await supabase
        .from("conversations")
        .select("id, status, mutual_like:mutual_likes(user_low, user_high)")
        .order("created_at", { ascending: false });
      if (error) throw error;

      const rows = conversations as unknown as ConversationRow[];
      const otherIds = rows.map((c) =>
        c.mutual_like.user_low === session!.user.id ? c.mutual_like.user_high : c.mutual_like.user_low,
      );
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name")
        .in("id", otherIds.length ? otherIds : ["00000000-0000-0000-0000-000000000000"]);

      return rows.map((c) => {
        const otherId =
          c.mutual_like.user_low === session!.user.id ? c.mutual_like.user_high : c.mutual_like.user_low;
        return {
          ...c,
          otherProfile: profiles?.find((p) => p.id === otherId),
        };
      });
    },
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Messages</Text>
      <FlatList
        data={data ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: spacing(1.5), paddingTop: spacing(2) }}
        ListEmptyComponent={<Text style={styles.hint}>Pas encore de conversation.</Text>}
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            onPress={() => router.push(`/(app)/chats/${item.id}`)}
          >
            <Text style={styles.rowName}>{item.otherProfile?.display_name ?? "Profil Miroir"}</Text>
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
  hint: { color: colors.textMuted, marginTop: spacing(2) },
  row: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing(2),
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowName: { color: colors.text, fontWeight: "600", fontSize: 16 },
});
