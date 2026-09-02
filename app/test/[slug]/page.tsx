import Link from "next/link";
import { notFound } from "next/navigation";
import { getTestBySlug } from "@/lib/data";
import { getOrCreateTest, submitTest } from "@/lib/actions";
import { findCatalogQuizBySlug } from "@/lib/catalog";
import { QuizRunner } from "@/components/QuizRunner";

export default async function TestPage({
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

  const action = submitTest.bind(null, test);

  return (
    <QuizRunner
      title={test.title}
      emoji={test.emoji}
      questions={test.questions}
      action={action}
    />
  );
}
