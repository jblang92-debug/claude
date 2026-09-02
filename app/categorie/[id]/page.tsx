import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategory } from "@/lib/catalog";
import { slugify } from "@/lib/catalog";
import { PRESEEDED_TESTS } from "@/lib/preseeded-tests";
import { CustomThemeForm } from "@/components/CustomThemeForm";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ depth?: string }>;
}) {
  const { id } = await params;
  const { depth } = await searchParams;
  const category = getCategory(id);
  if (!category) notFound();

  const activeDepth = depth === "leger" || depth === "profond" ? depth : "tous";
  const quizzes = category.quizzes.filter(
    (q) => activeDepth === "tous" || q.depth === activeDepth,
  );

  return (
    <>
      <div className="back-row">
        <Link href="/" className="link-btn">
          ← Toutes les catégories
        </Link>
      </div>
      <div className="category-tag" style={{ "--tile-color": category.color } as React.CSSProperties}>
        {category.emoji} {category.label}
      </div>
      <div className="hero">
        <h1 style={{ fontSize: 30 }}>Quel test veux-tu faire ?</h1>
      </div>

      <span className="field-label">Selon ton envie du moment</span>
      <div className="chips" style={{ marginBottom: 20 }}>
        <Link href={`/categorie/${id}`} className={`chip ${activeDepth === "tous" ? "selected" : ""}`}>
          Tous
        </Link>
        <Link
          href={`/categorie/${id}?depth=leger`}
          className={`chip ${activeDepth === "leger" ? "selected" : ""}`}
        >
          ☀️ Léger
        </Link>
        <Link
          href={`/categorie/${id}?depth=profond`}
          className={`chip ${activeDepth === "profond" ? "selected" : ""}`}
        >
          🌊 Profond
        </Link>
      </div>

      {quizzes.length === 0 ? (
        <p className="footnote" style={{ marginTop: 0, textAlign: "left" }}>
          Aucun test {activeDepth === "leger" ? "léger" : "profond"} dans cette
          catégorie pour l&apos;instant — essaie l&apos;autre humeur, ou écris
          ton propre test ci-dessous.
        </p>
      ) : null}
      <div className="quiz-list">
        {quizzes.map((q) => (
          <Link
            key={q.title}
            href={`/test/${slugify(q.title)}`}
            className="quiz-card"
            style={{ "--tile-color": category.color } as React.CSSProperties}
          >
            <span className="qi">{category.emoji}</span>
            <span className="qt">
              {q.title}
              <span className="depth-tag">{q.depth === "profond" ? "🌊 profond" : "☀️ léger"}</span>
            </span>
            <span className="arrow">{PRESEEDED_TESTS[q.title] ? "⚡" : "✨"}</span>
          </Link>
        ))}
      </div>

      <CustomThemeForm />
    </>
  );
}
