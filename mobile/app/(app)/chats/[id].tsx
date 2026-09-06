import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAuth } from "../../../lib/auth";
import { supabase } from "../../../lib/supabase/client";
import { colors, spacing } from "../../../lib/theme";
import type { Message } from "../../../lib/types";

export default function ChatDetail() {
  const { id: conversationId } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");

  const conversationQuery = useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("id, mutual_like:mutual_likes(user_low, user_high)")
        .eq("id", conversationId)
        .single();
      if (error) throw error;
      return data as unknown as {
        id: string;
        mutual_like: { user_low: string; user_high: string };
      };
    },
  });

  const messagesQuery = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Message[];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient]);

  const otherId = conversationQuery.data
    ? conversationQuery.data.mutual_like.user_low === session?.user.id
      ? conversationQuery.data.mutual_like.user_high
      : conversationQuery.data.mutual_like.user_low
    : null;

  const sendMessage = async () => {
    const content = draft.trim();
    if (!content || !session) return;
    setDraft("");
    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: session.user.id,
      content,
    });
    if (error) Alert.alert("Message non envoyé", error.message);
    queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
  };

  const blockUser = () => {
    if (!otherId || !session) return;
    Alert.alert("Bloquer cette personne ?", "Elle ne pourra plus te contacter.", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Bloquer",
        style: "destructive",
        onPress: async () => {
          await supabase.from("blocks").insert({ blocker_id: session.user.id, blocked_id: otherId });
        },
      },
    ]);
  };

  const reportUser = () => {
    if (!otherId || !session) return;
    Alert.alert("Signaler cette personne ?", "Notre équipe va examiner la conversation.", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Signaler",
        onPress: async () => {
          await supabase.from("reports").insert({
            reporter_id: session.user.id,
            reported_id: otherId,
            conversation_id: conversationId,
            reason: "signalé depuis la conversation",
          });
          Alert.alert("Signalement envoyé");
        },
      },
    ]);
  };

  if (messagesQuery.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <Pressable onPress={reportUser}>
          <Text style={styles.headerAction}>Signaler</Text>
        </Pressable>
        <Pressable onPress={blockUser}>
          <Text style={[styles.headerAction, styles.headerActionDanger]}>Bloquer</Text>
        </Pressable>
      </View>

      <FlatList
        data={messagesQuery.data ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing(2), gap: spacing(1) }}
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.sender_id === session?.user.id ? styles.bubbleMine : styles.bubbleTheirs,
            ]}
          >
            <Text
              style={[
                styles.bubbleText,
                item.sender_id === session?.user.id && styles.bubbleTextMine,
              ]}
            >
              {item.content}
            </Text>
          </View>
        )}
      />

      <View style={styles.composer}>
        <TextInput
          style={styles.input}
          placeholder="Écris un message..."
          placeholderTextColor={colors.textMuted}
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={sendMessage}
        />
        <Pressable style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Envoyer</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing(2),
    padding: spacing(2),
    paddingTop: spacing(6),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerAction: { color: colors.textMuted, fontWeight: "600" },
  headerActionDanger: { color: colors.danger },
  bubble: { maxWidth: "80%", borderRadius: 16, padding: spacing(1.5) },
  bubbleMine: { alignSelf: "flex-end", backgroundColor: colors.primary },
  bubbleTheirs: { alignSelf: "flex-start", backgroundColor: colors.surface },
  bubbleText: { color: colors.text },
  bubbleTextMine: { color: colors.background },
  composer: { flexDirection: "row", gap: spacing(1), padding: spacing(2), borderTopWidth: 1, borderTopColor: colors.border },
  input: { flex: 1, backgroundColor: colors.surface, borderRadius: 12, padding: spacing(1.5), color: colors.text },
  sendButton: { backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: spacing(2), justifyContent: "center" },
  sendButtonText: { color: colors.background, fontWeight: "700" },
});
