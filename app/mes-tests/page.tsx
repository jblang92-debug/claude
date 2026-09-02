import Link from "next/link";
import { db } from "@/lib/db";
import { getCreatorId } from "@/lib/creator";

export default async function MyQuizzesPage() {
  const creatorId = await getCreatorId();

  const quizzes = creatorId
    ? await db.quiz.findMany({
        where: { creatorId },
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { responses: { where: { submittedAt: { not: null } } } },
          },
        },
      })
    : [];

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-5 pb-16 pt-4">
      <h1 className="text-2xl font-extrabold text-foreground">Mes tests</h1>

      {quizzes.length === 0 ? (
        <section className="flex flex-col items-center gap-4 rounded-3xl border border-border bg-surface/70 p-8 text-center shadow-sm backdrop-blur">
          <span className="text-4xl">🗂️</span>
          <p className="text-sm text-foreground/70">
            Tu n&apos;as pas encore créé de test sur ce navigateur. Une fois que tu
            en crées un, il apparaîtra ici avec toutes les réponses reçues.
          </p>
          <Link
            href="/"
            className="tap-target inline-flex items-center justify-center rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            Créer mon premier test
          </Link>
        </section>
      ) : (
        <ul className="flex flex-col gap-3">
          {quizzes.map((quiz) => (
            <li key={quiz.id}>
              <Link
                href={`/test/${quiz.slug}`}
                className="flex items-center gap-4 rounded-2xl border border-border bg-surface/70 p-4 shadow-sm backdrop-blur transition hover:border-primary"
              >
                <span className="text-3xl">{quiz.emoji}</span>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{quiz.title}</p>
                  <p className="text-xs text-foreground/50">
                    {quiz._count.responses} réponse
                    {quiz._count.responses > 1 ? "s" : ""} reçue
                    {quiz._count.responses > 1 ? "s" : ""}
                  </p>
                </div>
                <span className="text-foreground/30">→</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
