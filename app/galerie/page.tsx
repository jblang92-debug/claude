import Link from "next/link";
import { getCurrentProfile, getGallery, getBadgesWithStatus } from "@/lib/data";
import { getCategory } from "@/lib/catalog";
import { buildCharacter, resultSeed } from "@/lib/character";
import { LinkEmailForm } from "@/components/LinkEmailForm";

export default async function GalleryPage() {
  const [profile, gallery, badges] = await Promise.all([
    getCurrentProfile(),
    getGallery(),
    getBadgesWithStatus(),
  ]);

  return (
    <>
      <div className="back-row">
        <Link href="/" className="link-btn">
          ← Accueil
        </Link>
      </div>
      <div className="hero">
        <h1 style={{ fontSize: 30 }}>Ma collection</h1>
        <p>
          {gallery.length} personnage{gallery.length > 1 ? "s" : ""} obtenu
          {gallery.length > 1 ? "s" : ""}. Série actuelle : 🔥{" "}
          {profile?.current_streak ?? 0}
        </p>
      </div>

      <span className="field-label">Badges</span>
      <div className="badges-row">
        {badges.map((b) => (
          <div key={b.id} className={`badge-item ${b.unlocked ? "unlocked" : ""}`}>
            <div className="badge-emoji">{b.emoji}</div>
            <div className="badge-label">{b.label}</div>
            <div className="badge-req">{b.unlocked ? "Débloqué" : `${b.threshold} tests`}</div>
          </div>
        ))}
      </div>

      <span className="field-label" style={{ marginTop: 8 }}>
        Résultats
      </span>
      {gallery.length === 0 ? (
        <p className="footnote" style={{ marginTop: 0, textAlign: "left" }}>
          Aucun résultat pour le moment. Fais ton premier test pour commencer
          ta collection !
        </p>
      ) : (
        <div className="gallery-grid">
          {gallery.map((entry) => {
            const category = entry.test.category_id ? getCategory(entry.test.category_id) : undefined;
            const color = category?.color ?? "#F5C518";
            const emoji = category?.emoji ?? entry.test.emoji ?? null;
            const seed = resultSeed(entry.id, entry.test.slug);
            const char = buildCharacter(seed, color, emoji, entry.id);
            return (
              <Link
                key={entry.id}
                href={`/resultat/${entry.id}`}
                className="gallery-card"
                style={{ "--tier-color": char.tierColor } as React.CSSProperties}
              >
                {entry.reaction ? <span className="gallery-reaction">{entry.reaction}</span> : null}
                <span className="gallery-char" dangerouslySetInnerHTML={{ __html: char.svg }} />
                <div className="gallery-nick">{char.nickname}</div>
                <div className="gallery-theme">{entry.test.title}</div>
              </Link>
            );
          })}
        </div>
      )}

      <div className="divider-note">Ton compte</div>
      <LinkEmailForm />
    </>
  );
}
