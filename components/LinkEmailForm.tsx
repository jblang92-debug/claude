"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { linkEmail, type LinkEmailState } from "@/lib/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-ghost-full" disabled={pending}>
      {pending ? "Envoi en cours…" : "Relier un email à ma collection"}
    </button>
  );
}

const initialState: LinkEmailState = {};

export function LinkEmailForm() {
  const [state, formAction] = useActionState(linkEmail, initialState);

  if (state.success) {
    return (
      <div className="error-box success">
        Vérifie ta boîte mail : clique sur le lien reçu pour confirmer. Ta
        collection, ta série et tes badges resteront ensuite accessibles
        depuis n&apos;importe quel appareil avec cet email.
      </div>
    );
  }

  return (
    <form action={formAction}>
      <p className="footnote" style={{ marginTop: 0, marginBottom: 12, textAlign: "left" }}>
        Ta collection est déjà sauvegardée sur cet appareil. Ajoute un email
        pour la retrouver ailleurs.
      </p>
      <input type="email" name="email" placeholder="ton@email.com" />
      {state.error ? <div className="error-box warn">{state.error}</div> : null}
      <SubmitButton />
    </form>
  );
}
