import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { submitResponse } from "@/lib/actions";
import { QuizRunner } from "@/components/QuizRunner";

export default async function RespondPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const quiz = await db.quiz.findUnique({
    where: { slug },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!quiz) notFound();

  const questions = quiz.questions.map((q) => ({
    id: q.id,
    text: q.text,
    options: (JSON.parse(q.options) as { label: string }[]).map((o) => ({
      label: o.label,
    })),
  }));

  const action = submitResponse.bind(null, quiz.slug);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-5 pb-16 pt-4">
      <div className="rounded-3xl border border-border bg-surface/70 p-6 shadow-sm backdrop-blur sm:p-8">
        <QuizRunner
          quizTitle={quiz.title}
          quizIntro={quiz.intro}
          emoji={quiz.emoji}
          questions={questions}
          action={action}
        />
      </div>
    </main>
  );
}
