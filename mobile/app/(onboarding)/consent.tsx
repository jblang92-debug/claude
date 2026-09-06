import { useState } from "react";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAuth } from "../../lib/auth";
import { supabase } from "../../lib/supabase/client";
import { colors, spacing } from "../../lib/theme";

const CGU_VERSION = "1.0";

/**
 * Consentement RGPD (CGU + traitement des données de personnalité,
 * sensibles au sens RGPD) et vérification d'âge 18+, traçable via une
 * ligne `verifications` de type "age" — voir
 * docs/architecture-app-rencontre.md §10.
 */
export default function Consent() {
  const { session } = useAuth();
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [acceptedCgu, setAcceptedCgu] = useState(false);
  const [acceptedData, setAcceptedData] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    if (!session) return;

    const d = parseInt(day, 10);
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);
    if (!d || !m || !y || y < 1900) {
      setError("Date de naissance invalide.");
      return;
    }
    const birthdate = new Date(Date.UTC(y, m - 1, d));
    const age = computeAge(birthdate);
    if (age < 18) {
      setError("Miroir est réservé aux 18 ans et plus.");
      return;
    }
    if (!acceptedCgu || !acceptedData) {
      setError("Les deux consentements sont nécessaires pour continuer.");
      return;
    }

    setLoading(true);
    const isoDate = birthdate.toISOString().slice(0, 10);

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ birthdate: isoDate })
      .eq("id", session.user.id);

    const { error: verificationError } = await supabase
      .from("verifications")
      .insert({
        user_id: session.user.id,
        type: "age",
        status: "approved", // auto-approuvé pour le MVP : déclaratif, tracé et daté ; vérification poussée (pièce d'identité) en v2
      });

    const { error: consentsError } = await supabase.from("consents").insert([
      { user_id: session.user.id, type: "cgu", version: CGU_VERSION },
      { user_id: session.user.id, type: "data_processing", version: CGU_VERSION },
    ]);

    setLoading(false);

    const firstError = profileError || verificationError || consentsError;
    if (firstError) {
      setError(firstError.message);
      return;
    }

    router.replace("/");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Avant de continuer</Text>

      <Text style={styles.label}>Ta date de naissance</Text>
      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.inputSmall]}
          placeholder="JJ"
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
          maxLength={2}
          value={day}
          onChangeText={setDay}
        />
        <TextInput
          style={[styles.input, styles.inputSmall]}
          placeholder="MM"
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
          maxLength={2}
          value={month}
          onChangeText={setMonth}
        />
        <TextInput
          style={[styles.input, styles.inputYear]}
          placeholder="AAAA"
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
          maxLength={4}
          value={year}
          onChangeText={setYear}
        />
      </View>

      <Checkbox
        checked={acceptedCgu}
        onToggle={() => setAcceptedCgu((v) => !v)}
        label="J'accepte les CGU, y compris la modération et le signalement d'abus."
      />
      <Checkbox
        checked={acceptedData}
        onToggle={() => setAcceptedData((v) => !v)}
        label="J'accepte que mes réponses au questionnaire de personnalité (données sensibles) soient utilisées pour générer mes suggestions de match."
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable style={styles.button} onPress={onSubmit} disabled={loading}>
        {loading ? (
          <ActivityIndicator color={colors.background} />
        ) : (
          <Text style={styles.buttonText}>Continuer</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

function computeAge(birthdate: Date): number {
  const now = new Date();
  let age = now.getUTCFullYear() - birthdate.getUTCFullYear();
  const hasHadBirthdayThisYear =
    now.getUTCMonth() > birthdate.getUTCMonth() ||
    (now.getUTCMonth() === birthdate.getUTCMonth() && now.getUTCDate() >= birthdate.getUTCDate());
  if (!hasHadBirthdayThisYear) age -= 1;
  return age;
}

function Checkbox({
  checked,
  onToggle,
  label,
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <Pressable style={styles.checkboxRow} onPress={onToggle}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]} />
      <Text style={styles.checkboxLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.background, padding: spacing(3), paddingTop: spacing(10), gap: spacing(1.5) },
  title: { fontSize: 26, fontWeight: "700", color: colors.text, marginBottom: spacing(1) },
  label: { color: colors.textMuted, marginTop: spacing(1) },
  row: { flexDirection: "row", gap: spacing(1) },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing(1.5),
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputSmall: { width: 64, textAlign: "center" },
  inputYear: { width: 96, textAlign: "center" },
  checkboxRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing(1.5), marginTop: spacing(1.5) },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: colors.border, marginTop: 2 },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkboxLabel: { color: colors.text, flex: 1, lineHeight: 20 },
  error: { color: colors.danger, marginTop: spacing(1) },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: spacing(2),
    alignItems: "center",
    marginTop: spacing(2),
  },
  buttonText: { color: colors.background, fontWeight: "700", fontSize: 16 },
});
