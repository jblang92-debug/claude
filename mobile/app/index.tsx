import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../lib/auth";
import { useOnboardingStep } from "../lib/onboarding-status";

/**
 * Porte d'entrée : redirige vers le bon groupe de routes selon l'état
 * d'authentification et d'inscription. N'affiche jamais de contenu
 * elle-même.
 */
export default function Index() {
  const { session, loading: authLoading } = useAuth();
  const step = useOnboardingStep();

  if (authLoading || (session && step === "loading")) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!session) return <Redirect href="/(auth)/welcome" />;
  if (step === "consent") return <Redirect href="/(onboarding)/consent" />;
  if (step === "selfie") return <Redirect href="/(onboarding)/selfie" />;
  if (step === "quiz") return <Redirect href="/(onboarding)/quiz" />;
  return <Redirect href="/(app)/today" />;
}
