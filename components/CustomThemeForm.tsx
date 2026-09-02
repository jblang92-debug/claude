"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { startCustomTest, type StartCustomTestState } from "@/lib/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary" disabled={pending}>
      {pending ? "Génération en cours…" : "Créer ce test"}
    </button>
  );
}

const initialState: StartCustomTestState = {};

export function CustomThemeForm() {
  const [state, formAction] = useActionState(startCustomTest, initialState);

  return (
    <form action={formAction}>
      <span className="field-label">Ou écris ton propre test</span>
      <input
        type="text"
        name="customTheme"
        placeholder="Ex. : mon rapport au voyage"
        maxLength={140}
      />
      {state.error ? <div className="error-box warn">{state.error}</div> : null}
      <SubmitButton />
    </form>
  );
}
