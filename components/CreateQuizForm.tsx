"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createQuiz, type CreateQuizState } from "@/lib/actions";
import { THEMES } from "@/lib/themes";

function SubmitButton() {
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
          Génération de ton test...
        </>
      ) : (
        "Créer mon test ✨"
      )}
    </button>
  );
}

const initialState: CreateQuizState = {};

export function CreateQuizForm() {
  const [state, formAction] = useActionState(createQuiz, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <fieldset className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <legend className="sr-only">Choisis un thème</legend>
        {THEMES.map((theme) => (
          <label
            key={theme.id}
            className="group relative flex cursor-pointer flex-col items-center gap-1.5 rounded-2xl border border-border bg-surface p-4 text-center transition hover:border-primary/60 has-checked:border-primary has-checked:ring-2 has-checked:ring-ring has-checked:bg-surface-muted"
          >
            <input
              type="radio"
              name="theme"
              value={theme.id}
              className="sr-only"
              defaultChecked={theme.id === "amour"}
            />
            <span className="text-2xl">{theme.emoji}</span>
            <span className="text-xs font-semibold leading-tight text-foreground">
              {theme.label}
            </span>
          </label>
        ))}
        <label className="group relative flex cursor-pointer flex-col items-center gap-1.5 rounded-2xl border border-dashed border-border bg-surface p-4 text-center transition hover:border-primary/60 has-checked:border-primary has-checked:ring-2 has-checked:ring-ring has-checked:bg-surface-muted">
          <input type="radio" name="theme" value="" className="sr-only" />
          <span className="text-2xl">✍️</span>
          <span className="text-xs font-semibold leading-tight text-foreground">
            Thème libre
          </span>
        </label>
      </fieldset>

      <div className="flex flex-col gap-2">
        <label htmlFor="customTheme" className="text-sm font-medium text-foreground/80">
          Envie d&apos;un thème sur mesure ? Décris-le ici (et sélectionne &quot;Thème
          libre&quot; ci-dessus) :
        </label>
        <input
          id="customTheme"
          name="customTheme"
          type="text"
          placeholder="Ex : Quel genre de coloc je suis, Mon rapport aux voyages..."
          className="tap-target w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {state.error && (
        <p className="rounded-xl bg-red-100 px-4 py-3 text-sm font-medium text-red-700">
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
