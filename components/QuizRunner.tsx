"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import type { SubmitResponseState } from "@/lib/actions";

interface QuizOption {
  label: string;
}

interface QuizQuestion {
  id: string;
  text: string;
  options: QuizOption[];
}

function FinalSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="tap-target flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-base font-semibold text-white shadow-lg shadow-primary/25 transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? (
        <>
          <span className="h-2.5 w-2.5 animate-ping rounded-full bg-white" />
          Analyse de tes réponses...
        </>
      ) : (
        "Voir mon portrait 🔮"
      )}
    </button>
  );
}

const initialState: SubmitResponseState = {};

export function QuizRunner({
  quizTitle,
  quizIntro,
  emoji,
  questions,
  action,
}: {
  quizTitle: string;
  quizIntro: string;
  emoji: string;
  questions: QuizQuestion[];
  action: (state: SubmitResponseState, formData: FormData) => Promise<SubmitResponseState>;
}) {
  const [state, formAction] = useActionState(action, initialState);
  // -1 = écran d'intro, 0..n-1 = questions, n = écran final (nom + validation)
  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [name, setName] = useState("");

  const total = questions.length;
  const progress = useMemo(() => {
    if (step < 0) return 0;
    return Math.min(100, Math.round((step / total) * 100));
  }, [step, total]);

  function selectOption(questionId: string, index: number) {
    setAnswers((prev) => ({ ...prev, [questionId]: index }));
    setTimeout(() => setStep((s) => s + 1), 180);
  }

  if (step === -1) {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="text-5xl">{emoji}</div>
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">{quizTitle}</h1>
          <p className="mt-2 text-sm leading-relaxed text-foreground/70">{quizIntro}</p>
        </div>
        <div className="w-full max-w-xs">
          <label htmlFor="name" className="mb-1 block text-left text-xs font-medium text-foreground/60">
            Ton prénom (facultatif, pour personnaliser ton portrait)
          </label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex : Camille"
            className="tap-target w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button
          type="button"
          onClick={() => setStep(0)}
          className="tap-target w-full max-w-xs rounded-2xl bg-primary px-6 py-4 text-base font-semibold text-white shadow-lg shadow-primary/25 transition hover:bg-primary-dark"
        >
          Commencer ({total} questions)
        </button>
        <p className="text-xs text-foreground/40">
          Pas de bonnes ou mauvaises réponses, réponds instinctivement 😉
        </p>
      </div>
    );
  }

  if (step >= 0 && step < total) {
    const question = questions[step];
    const selected = answers[question.id];
    return (
      <div className="flex flex-col gap-6">
        <div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-xs font-medium text-foreground/40">
            Question {step + 1} / {total}
          </p>
        </div>

        <h2 className="text-xl font-bold leading-snug text-foreground">{question.text}</h2>

        <div className="flex flex-col gap-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              type="button"
              onClick={() => selectOption(question.id, index)}
              className={`tap-target rounded-2xl border px-4 py-4 text-left text-sm font-medium transition ${
                selected === index
                  ? "border-primary bg-surface-muted text-primary"
                  : "border-border bg-surface text-foreground hover:border-primary/50"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="self-start text-sm font-medium text-foreground/50 hover:text-primary"
          >
            ← Question précédente
          </button>
        )}
      </div>
    );
  }

  // Écran final : validation
  return (
    <form action={formAction} className="flex flex-col gap-6 text-center">
      <input type="hidden" name="respondentName" value={name} />
      {questions.map((q) => (
        <input key={q.id} type="hidden" name={`q_${q.id}`} value={answers[q.id] ?? ""} />
      ))}

      <div className="text-5xl">🎉</div>
      <div>
        <h2 className="text-xl font-bold text-foreground">C&apos;est dans la boîte !</h2>
        <p className="mt-2 text-sm text-foreground/70">
          Tu as répondu à toutes les questions. Prêt·e à découvrir ton portrait ?
        </p>
      </div>

      {state.error && (
        <p className="rounded-xl bg-red-100 px-4 py-3 text-sm font-medium text-red-700">
          {state.error}
        </p>
      )}

      <FinalSubmitButton />

      <button
        type="button"
        onClick={() => setStep(total - 1)}
        className="text-sm font-medium text-foreground/50 hover:text-primary"
      >
        ← Revoir mes réponses
      </button>
    </form>
  );
}
