import { Redirect } from "expo-router";

/**
 * Porte d'entrée : redirige toujours vers le groupe (app), qui applique
 * lui-même la garde de connexion/onboarding (voir lib/require-onboarded.tsx)
 * — une seule source de vérité pour cette logique, plutôt que dupliquée
 * ici et dans le layout de (app).
 */
export default function Index() {
  return <Redirect href="/(app)/today" />;
}
