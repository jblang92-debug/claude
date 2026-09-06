import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../../lib/theme";

export default function Welcome() {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>Miroir</Text>
        <Text style={styles.subtitle}>
          On ne matche pas sur une photo, on matche sur qui tu es vraiment.
        </Text>
      </View>

      <View style={styles.actions}>
        <Link href="/(auth)/sign-up" style={[styles.button, styles.buttonPrimary]}>
          <Text style={styles.buttonPrimaryText}>Créer un compte</Text>
        </Link>
        <Link href="/(auth)/sign-in" style={[styles.button, styles.buttonSecondary]}>
          <Text style={styles.buttonSecondaryText}>J'ai déjà un compte</Text>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing(3),
    justifyContent: "space-between",
    paddingTop: spacing(12),
    paddingBottom: spacing(6),
  },
  title: {
    fontSize: 40,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing(2),
  },
  subtitle: {
    fontSize: 18,
    color: colors.textMuted,
    lineHeight: 26,
  },
  actions: { gap: spacing(1.5) },
  button: {
    borderRadius: 16,
    paddingVertical: spacing(2),
    alignItems: "center",
    textAlign: "center",
  },
  buttonPrimary: { backgroundColor: colors.primary },
  buttonPrimaryText: { color: colors.background, fontWeight: "700", fontSize: 16 },
  buttonSecondary: { borderWidth: 1, borderColor: colors.border },
  buttonSecondaryText: { color: colors.text, fontWeight: "600", fontSize: 16 },
});
