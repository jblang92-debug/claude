import Link from "next/link";
import { notFound } from "next/navigation";
import { getTestBySlug } from "@/lib/data";
import { getOrCreateTest } from "@/lib/actions";
import { findCatalogQuizBySlug, getCategory } from "@/lib/catalog";
import { DuoRunner } from "@/components/DuoRunner";

export default async function DuoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let test = await getTestBySlug(slug);

  if (!test) {
    const catalogEntry = findCatalogQuizBySlug(slug);
    if (!catalogEntry) notFound();
    try {
      test = await getOrCreateTest(catalogEntry.title, catalogEntry.category.id);
    } catch {
      return (
        <div className="loading-screen">
          <h3>Oups, la génération a échoué</h3>
          <p>Réessaie dans un instant en rechargeant la page.</p>
          <Link href="/" className="link-btn">
            ← Retour à l&apos;accueil
          </Link>
        </div>
      );
    }
  }

  const category = test.category_id ? getCategory(test.category_id) : undefined;

  return (
    <DuoRunner
      test={test}
      categoryColor={category?.color ?? "#F5C518"}
      categoryEmoji={category?.emoji ?? test.emoji ?? null}
    />
  );
}
