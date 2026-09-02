import Link from "next/link";
import { notFound } from "next/navigation";
import { getResult } from "@/lib/data";
import { getCategory } from "@/lib/catalog";
import { buildCharacter, resultSeed } from "@/lib/character";
import { ReactionPicker } from "@/components/ReactionPicker";
import { ShareCharacterButton } from "@/components/ShareCharacterButton";

export default async function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getResult(id);
  if (!result) notFound();

  const category = result.test.category_id ? getCategory(result.test.category_id) : undefined;
  const color = category?.color ?? "#F5C518";
  const emoji = category?.emoji ?? result.test.emoji ?? null;
  const seed = resultSeed(result.id, result.test.slug);
  const char = buildCharacter(seed, color, emoji);

  return (
    <>
      <div
        className="card-frame"
        style={{ "--c1": color, "--c2": char.secondary } as React.CSSProperties}
      >
        <span className="tier-badge" style={{ "--tier-color": char.tierColor } as React.CSSProperties}>
          {char.tier}
        </span>
        <div className="character-wrap" dangerouslySetInnerHTML={{ __html: char.svg }} />
        <h2 className="nickname">{char.nickname}</h2>
        <div className="card-theme">{result.test.title}</div>
      </div>

      <div className="result-traits" style={{ justifyContent: "center" }}>
        {result.traits.map((t) => (
          <span key={t} className="trait">
            {t}
          </span>
        ))}
      </div>
      <div className="result-body">{result.portrait}</div>

      <ReactionPicker resultId={result.id} initialReaction={result.reaction} />

      <ShareCharacterButton
        seed={seed}
        color={color}
        emoji={emoji}
        theme={result.test.title}
        portrait={result.portrait}
        traits={result.traits}
      />
      {category ? (
        <Link
          href={`/categorie/${category.id}`}
          className="btn-ghost-full"
          style={{ display: "block", textAlign: "center" }}
        >
          🔮 Découvrir un autre test de cette catégorie
        </Link>
      ) : null}

      <Link href="/" className="btn btn-primary" style={{ display: "block", textAlign: "center", textDecoration: "none" }}>
        Faire un autre test
      </Link>
      <Link
        href="/galerie"
        className="link-btn"
        style={{ display: "flex", justifyContent: "center", width: "100%", marginTop: 16 }}
      >
        Voir ma collection
      </Link>
    </>
  );
}
