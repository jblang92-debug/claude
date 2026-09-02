import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getBaseUrl } from "@/lib/url";
import { ShareLink } from "@/components/ShareLink";
import { TraitBars } from "@/components/TraitBars";

export default async function ResultPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const response = await db.response.findUnique({
    where: { slug },
    include: { result: true, quiz: true },
  });
  if (!response || !response.result) notFound();

  const traits = JSON.parse(response.result.traits) as {
    key: string;
    label: string;
    value: number;
  }[];

  const baseUrl = await getBaseUrl();
  const resultUrl = `${baseUrl}/r/${response.slug}`;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-5 pb-16 pt-4">
      <section className="flex flex-col items-center gap-4 rounded-3xl border border-border bg-surface/70 p-6 text-center shadow-sm backdrop-blur sm:p-8">
        <span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-medium text-foreground/50">
          Résultat de {response.respondentName || "quelqu'un de mystère"} au test &quot;
          {response.quiz.title}&quot;
        </span>
        <div className="text-5xl">{response.result.emoji}</div>
        <h1 className="text-2xl font-extrabold text-foreground">{response.result.headline}</h1>
        <p className="text-left text-sm leading-relaxed text-foreground/80 sm:text-base">
          {response.result.portrait}
        </p>
      </section>

      <section className="rounded-3xl border border-border bg-surface/70 p-6 shadow-sm backdrop-blur">
        <h2 className="mb-4 text-sm font-semibold text-foreground/80">Ton profil en un coup d&apos;œil</h2>
        <TraitBars traits={traits} />
      </section>

      <section className="rounded-3xl border border-border bg-surface/70 p-6 shadow-sm backdrop-blur">
        <h2 className="mb-3 text-sm font-semibold text-foreground/80">
          Partage ce portrait
        </h2>
        <ShareLink
          url={resultUrl}
          shareTitle={response.result.headline}
          shareText={`Découvre mon portrait "${response.result.headline}" au test "${response.quiz.title}" !`}
        />
      </section>

      <div className="text-center">
        <Link
          href="/"
          className="tap-target inline-flex items-center justify-center rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark"
        >
          Crée ton propre test
        </Link>
      </div>
    </main>
  );
}
