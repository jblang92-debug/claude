import Link from "next/link";
import { CreateRoomForm } from "@/components/CreateRoomForm";
import { JoinRoomForm } from "@/components/JoinRoomForm";

export default function SoireeDistancePage() {
  return (
    <>
      <div className="back-row">
        <Link href="/" className="link-btn">
          ← Accueil
        </Link>
      </div>
      <div className="hero">
        <h1 style={{ fontSize: 30 }}>📡 Soirée à distance</h1>
        <p>
          Chacun·e sur son téléphone, un salon partagé en temps réel : Action
          ou Vérité, avec preuves photo sur le palier léger.
        </p>
      </div>

      <span className="field-label">Créer un nouveau salon</span>
      <CreateRoomForm />

      <div className="divider-note">ou</div>

      <span className="field-label">Rejoindre un salon existant</span>
      <JoinRoomForm />
    </>
  );
}
