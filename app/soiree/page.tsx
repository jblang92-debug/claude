import Link from "next/link";
import { getPartyPrompts } from "@/lib/data";
import { PartyRunner } from "@/components/PartyRunner";

export default async function SoireePage() {
  const prompts = await getPartyPrompts();

  if (prompts.length === 0) {
    return (
      <div className="loading-screen">
        <h3>Le catalogue Action ou Vérité est introuvable</h3>
        <p>Vérifie ta connexion, ou recharge la page dans un instant.</p>
        <Link href="/" className="link-btn">
          ← Retour à l&apos;accueil
        </Link>
      </div>
    );
  }

  return <PartyRunner prompts={prompts} />;
}
