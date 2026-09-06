import { useState } from "react";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuth } from "../../lib/auth";
import { supabase } from "../../lib/supabase/client";
import { colors, spacing } from "../../lib/theme";

/**
 * Selfie de vérification : upload dans le bucket privé
 * `verification-selfies`, review manuelle (voir
 * docs/architecture-app-rencontre.md §10) — l'app n'attend pas
 * l'approbation pour laisser l'utilisateur continuer l'onboarding, mais
 * son profil n'apparaîtra dans aucune suggestion tant qu'il n'est pas
 * approuvé (filtre du batch, voir 0002_matching_batch.sql).
 */
export default function Selfie() {
  const { session } = useAuth();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setError("Autorise l'accès à la caméra pour continuer.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      cameraType: ImagePicker.CameraType.front,
      quality: 0.7,
    });
    if (!result.canceled) setPhotoUri(result.assets[0].uri);
  };

  const onSubmit = async () => {
    if (!session || !photoUri) return;
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(photoUri);
      const blob = await response.arrayBuffer();
      const path = `${session.user.id}/selfie-${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("verification-selfies")
        .upload(path, blob, { contentType: "image/jpeg" });
      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase.from("verifications").insert({
        user_id: session.user.id,
        type: "selfie",
        status: "pending",
        evidence_path: path,
      });
      if (insertError) throw insertError;

      router.replace("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec de l'envoi du selfie.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vérifie ton profil</Text>
      <Text style={styles.hint}>
        Un selfie simple suffit — il ne sera visible que par notre équipe de
        modération, jamais publié tel quel sur ton profil.
      </Text>

      {photoUri ? (
        <Image source={{ uri: photoUri }} style={styles.preview} />
      ) : (
        <Pressable style={styles.placeholder} onPress={takePhoto}>
          <Text style={styles.placeholderText}>Prendre un selfie</Text>
        </Pressable>
      )}

      {photoUri && (
        <Pressable style={styles.linkButton} onPress={takePhoto}>
          <Text style={styles.linkButtonText}>Reprendre la photo</Text>
        </Pressable>
      )}

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable
        style={[styles.button, !photoUri && styles.buttonDisabled]}
        onPress={onSubmit}
        disabled={!photoUri || loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.background} />
        ) : (
          <Text style={styles.buttonText}>Envoyer</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing(3), paddingTop: spacing(10), gap: spacing(2) },
  title: { fontSize: 26, fontWeight: "700", color: colors.text },
  hint: { color: colors.textMuted, lineHeight: 20 },
  placeholder: {
    height: 280,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: { color: colors.textMuted, fontWeight: "600" },
  preview: { height: 280, borderRadius: 20 },
  linkButton: { alignSelf: "center" },
  linkButtonText: { color: colors.primary, fontWeight: "600" },
  error: { color: colors.danger },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: spacing(2),
    alignItems: "center",
    marginTop: "auto",
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: colors.background, fontWeight: "700", fontSize: 16 },
});
