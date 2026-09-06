import { useEffect, useState } from "react";
import { supabase } from "./supabase/client";
import { useAuth } from "./auth";

export type OnboardingStep =
  | "loading"
  | "consent"
  | "selfie"
  | "quiz"
  | "done";

/**
 * Détermine la prochaine étape d'inscription non complétée, dans
 * l'ordre : consentement (CGU + RGPD + âge) → selfie de vérification
 * (soumission, pas besoin d'attendre l'approbation pour continuer) →
 * questionnaire de personnalité → app principale.
 */
export function useOnboardingStep(): OnboardingStep {
  const { session, profile, loading: authLoading } = useAuth();
  const [step, setStep] = useState<OnboardingStep>("loading");

  useEffect(() => {
    if (authLoading) return;
    if (!session) {
      setStep("done"); // pas de session : géré par le layout (auth), pas par ce hook
      return;
    }

    let cancelled = false;

    (async () => {
      const [{ data: consents }, { data: selfie }] = await Promise.all([
        supabase
          .from("consents")
          .select("type")
          .eq("user_id", session.user.id),
        supabase
          .from("verifications")
          .select("id")
          .eq("user_id", session.user.id)
          .eq("type", "selfie")
          .maybeSingle(),
      ]);
      if (cancelled) return;

      const consentTypes = new Set((consents ?? []).map((c) => c.type));

      if (!consentTypes.has("cgu") || !consentTypes.has("data_processing")) {
        setStep("consent");
        return;
      }
      if (!selfie) {
        setStep("selfie");
        return;
      }
      if (!profile?.onboarding_completed_at) {
        setStep("quiz");
        return;
      }
      setStep("done");
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoading, session, profile]);

  return step;
}
