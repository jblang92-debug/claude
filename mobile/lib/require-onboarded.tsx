import type { ReactNode } from "react";
import { Redirect } from "expo-router";
import { useAuth } from "./auth";
import { useOnboardingStep } from "./onboarding-status";

/**
 * Garde d'accès pour le groupe (app) : redirige vers la connexion ou
 * l'étape d'onboarding manquante. Placée au niveau du layout du groupe
 * (pas seulement à la racine "/") pour s'appliquer quelle que soit la
 * route par laquelle on entre — sans ça, se déconnecter depuis un écran
 * de ce groupe ne redirigeait nulle part (la vérification ne tournait
 * qu'au tout premier chargement de l'app).
 */
export function RequireOnboarded({ children }: { children: ReactNode }) {
  const { session, loading: authLoading } = useAuth();
  const step = useOnboardingStep();

  if (authLoading || (session && step === "loading")) return null;
  if (!session) return <Redirect href="/(auth)/welcome" />;
  if (step === "consent") return <Redirect href="/(onboarding)/consent" />;
  if (step === "selfie") return <Redirect href="/(onboarding)/selfie" />;
  if (step === "quiz") return <Redirect href="/(onboarding)/quiz" />;
  return <>{children}</>;
}
