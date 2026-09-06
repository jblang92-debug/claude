import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../lib/auth";
import { supabase } from "../../lib/supabase/client";
import { colors, spacing } from "../../lib/theme";
import { AXES } from "../../lib/matching/axes";

export default function ProfileScreen() {
  const { session, profile } = useAuth();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{profile?.display_name ?? session?.user.email}</Text>
      <Text style={styles.subtitle}>{profile?.city}</Text>

      <Text style={styles.sectionTitle}>Ton profil de personnalité</Text>
      <View style={styles.axesList}>
        {AXES.map((axis) => {
          const score = profile?.personality_scores?.[axis.key] ?? 0;
          return (
            <View key={axis.key} style={styles.axisRow}>
              <Text style={styles.axisLabel}>{axis.label}</Text>
              <Text style={styles.axisPoles}>
                {axis.poleA} {"↔"} {axis.poleB} ({score.toFixed(2)})
              </Text>
            </View>
          );
        })}
      </View>

      <Pressable style={styles.signOut} onPress={() => supabase.auth.signOut()}>
        <Text style={styles.signOutText}>Se déconnecter</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.background, padding: spacing(3), paddingTop: spacing(8), gap: spacing(1) },
  title: { fontSize: 26, fontWeight: "700", color: colors.text },
  subtitle: { color: colors.textMuted },
  sectionTitle: { color: colors.text, fontWeight: "700", marginTop: spacing(3), marginBottom: spacing(1) },
  axesList: { gap: spacing(1) },
  axisRow: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing(1.5),
    borderWidth: 1,
    borderColor: colors.border,
  },
  axisLabel: { color: colors.text, fontWeight: "600" },
  axisPoles: { color: colors.textMuted, marginTop: 2 },
  signOut: { marginTop: spacing(4), alignItems: "center", padding: spacing(2) },
  signOutText: { color: colors.danger, fontWeight: "600" },
});
