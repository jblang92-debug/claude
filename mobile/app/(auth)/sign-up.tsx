import { useState } from "react";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase/client";
import { colors, spacing } from "../../lib/theme";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    const { error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    // Le trigger handle_new_user crée la ligne profiles ; l'index.tsx
    // racine redirige ensuite automatiquement vers l'onboarding.
    router.replace("/");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Créer un compte</Text>
      <Text style={styles.hint}>
        Vérification d'âge (18+) et de profil à suivre juste après.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        placeholderTextColor={colors.textMuted}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable style={styles.button} onPress={onSubmit} disabled={loading}>
        {loading ? (
          <ActivityIndicator color={colors.background} />
        ) : (
          <Text style={styles.buttonText}>Continuer</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing(3), paddingTop: spacing(10), gap: spacing(1.5) },
  title: { fontSize: 28, fontWeight: "700", color: colors.text },
  hint: { color: colors.textMuted, marginBottom: spacing(2) },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing(1.5),
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  error: { color: colors.danger },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: spacing(2),
    alignItems: "center",
    marginTop: spacing(1),
  },
  buttonText: { color: colors.background, fontWeight: "700", fontSize: 16 },
});
