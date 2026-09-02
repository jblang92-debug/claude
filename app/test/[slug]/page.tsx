import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCreatorId } from "@/lib/creator";
import { getBaseUrl } from "@/lib/url";
import { ShareLink } from "@/components/ShareLink";

export default async function QuizManagePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const quiz = await db.quiz.findUnique({
    where: { slug },
    include: {
      responses: {
        where: { submittedAt: { not: null } },
        orderBy: { submittedAt: "desc" },
        include: { result: true },
      },
      _count: { select: { questions: true } },
    },
  });
  if (!quiz) notFound();

  const creatorId = await getCreatorId();
  const isOwner = creatorId !== null && creatorId === quiz.creatorId;
  const baseUrl = await getBaseUrl();
  const respondUrl = `${baseUrl}/t/${quiz.slug}`;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-5 pb-16 pt-4">
      <section className="rounded-3xl border border-border bg-surface/70 p-6 text-center shadow-sm backdrop-blur">
        <div className="text-4xl">{quiz.emoji}</div>
        <h1 className="mt-2 text-2xl font-extrabold text-foreground">{quiz.title}</h1>
        <p className="mt-2 text-sm text-foreground/70">{quiz.intro}</p>
        <p className="mt-1 text-xs text-foreground/40">{quiz._count.questions} questions</p>
      </section>

      {isOwner ? (
        <>
          <section className="rounded-3xl border border-border bg-surface/70 p-6 shadow-sm backdrop-blur">
            <h2 className="text-sm font-semibold text-foreground/80">
              Ton test est prêt ! Envoie ce lien pour recueillir des réponses :
            </h2>
            <div className="mt-3">
              <ShareLink
                url={respondUrl}
                shareTitle={quiz.title}
                shareText={`Réponds à mon test "${quiz.title}" et découvre ton portrait !`}
              />
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-surface/70 p-6 shadow-sm backdrop-blur">
            <h2 className="text-sm font-semibold text-foreground/80">
              Réponses reçues ({quiz.responses.length})
            </h2>
            {quiz.responses.length === 0 ? (
              <p className="mt-3 text-sm text-foreground/50">
                Personne n&apos;a encore répondu. Dès que quelqu&apos;un valide ses
                réponses, son portrait apparaîtra ici.
              </p>
            ) : (
              <ul className="mt-3 flex flex-col gap-2">
                {quiz.responses.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`/r/${r.slug}`}
                      className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 text-sm transition hover:border-primary"
                    >
                      <span className="font-medium text-foreground">
                        {r.respondentName || "Quelqu'un de mystère"}
                      </span>
                      <span className="text-foreground/40">
                        {r.result ? r.result.headline : "Voir le portrait →"}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      ) : (
        <section className="rounded-3xl border border-border bg-surface/70 p-6 text-center shadow-sm backdrop-blur">
          <p className="text-sm text-foreground/70">
            Ce lien est réservé au créateur du test. Tu as reçu ce test et tu veux
            y répondre ?
          </p>
          <Link
            href={`/t/${quiz.slug}`}
            className="tap-target mt-4 inline-flex items-center justify-center rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            Répondre au test
          </Link>
        </section>
      )}

      <div className="text-center">
        <Link href="/" className="text-sm font-medium text-primary hover:underline">
          ← Créer un autre test
        </Link>
      </div>
    </main>
  );
}
