"use client";

import { useActionState, useRef, useState } from "react";
import type { GeneratedQuestion } from "@/lib/ai";
import type { SubmitTestState } from "@/lib/actions";

const initialState: SubmitTestState = {};

export function QuizRunner({
  title,
  emoji,
  questions,
  action,
}: {
  title: string;
  emoji: string | null;
  questions: GeneratedQuestion[];
  action: (state: SubmitTestState, formData: FormData) => Promise<SubmitTestState>;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const formRef = useRef<HTMLFormElement>(null);

  const total = questions.length;

  function selectOption(index: number, optionText: string) {
    setAnswers((prev) => ({ ...prev, [index]: optionText }));
    if (index + 1 < total) {
      setTimeout(() => setStep(index + 1), 220);
    } else {
      setTimeout(() => formRef.current?.requestSubmit(), 220);
    }
  }

  if (pending) {
    return (
      <div className="loading-screen">
        <div className="spin-blob" />
        <h3>On dessine ton portrait…</h3>
        <p>Analyse des réponses</p>
      </div>
    );
  }

  const question = questions[step];
  const selected = answers[step];

  return (
    <form ref={formRef} action={formAction}>
      {questions.map((_, i) => (
        <input key={i} type="hidden" name={`q_${i}`} value={answers[i] ?? ""} />
      ))}

      {step === 0 && emoji ? (
        <div className="field-label" style={{ fontSize: 20, marginBottom: 8 }}>
          {emoji} {title}
        </div>
      ) : null}

      <div className="progress-dots">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className={`dot ${i < step ? "done" : ""}`} />
        ))}
      </div>
      <div className="q-count">
        Question {step + 1} / {total}
      </div>
      <div className="q-text">{question.q}</div>

      <div className="options">
        {question.options.map((opt, i) => (
          <button
            key={i}
            type="button"
            className={`option ${selected === opt ? "chosen" : ""}`}
            onClick={() => selectOption(step, opt)}
          >
            <span className="badge">{String.fromCharCode(65 + i)}</span>
            <span>{opt}</span>
          </button>
        ))}
      </div>

      {state.error ? <div className="error-box warn">{state.error}</div> : null}

      <div className="quiz-nav">
        {step > 0 ? (
          <button type="button" className="link-btn" onClick={() => setStep(step - 1)}>
            ← Question précédente
          </button>
        ) : (
          <span />
        )}
      </div>
    </form>
  );
}
