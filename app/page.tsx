import Link from "next/link";
import { CATEGORIES } from "@/lib/catalog";
import { getCurrentProfile, getGallery } from "@/lib/data";

export default async function Home() {
  const [profile, gallery] = await Promise.all([getCurrentProfile(), getGallery()]);

  return (
    <>
      <div className="brand">
        <div className="brand-mark" />
        <div className="brand-name">Miroir</div>
        {profile && profile.current_streak > 0 ? (
          <span className="streak-pill">🔥 {profile.current_streak}</span>
        ) : null}
        {gallery.length > 0 ? (
          <Link href="/galerie" className="gallery-pill">
            🗂️ <span className="count">{gallery.length}</span>
          </Link>
        ) : null}
      </div>

      <div className="hero">
        <h1>
          Découvre-toi,
          <br />
          et découvre les autres.
        </h1>
        <p>
          Choisis une catégorie, puis un test précis. Réponds en quelques
          minutes et reçois un vrai portrait — pas juste un score.
        </p>
      </div>

      <div className="cat-grid">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            href={`/categorie/${cat.id}`}
            className="cat-tile"
            style={{ "--tile-color": cat.color } as React.CSSProperties}
          >
            <span className="glow" />
            <span className="cat-emoji">{cat.emoji}</span>
            <span className="cat-name">{cat.label}</span>
          </Link>
        ))}
      </div>

      <Link href="/soiree" className="party-banner">
        <span className="party-banner-emoji">🎉</span>
        <span className="party-banner-text">
          <strong>Mode Soirée</strong>
          <span>Action ou Vérité, à plusieurs, même téléphone</span>
        </span>
        <span className="party-banner-arrow">→</span>
      </Link>

      <Link href="/soiree-distance" className="party-banner remote-variant">
        <span className="party-banner-emoji">📡</span>
        <span className="party-banner-text">
          <strong>Soirée à distance</strong>
          <span>Chacun·e sur son téléphone, avec preuves</span>
        </span>
        <span className="party-banner-arrow">→</span>
      </Link>

      <p className="footnote">
        Tes réponses restent privées. Tu peux relier un email plus tard pour
        retrouver ta collection sur un autre appareil, depuis ta galerie.
      </p>
    </>
  );
}
