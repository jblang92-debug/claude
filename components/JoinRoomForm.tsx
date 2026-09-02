"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { joinRoom, type JoinRoomState } from "@/lib/room-actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-ghost-full" disabled={pending}>
      {pending ? "Connexion…" : "Rejoindre le salon"}
    </button>
  );
}

const initialState: JoinRoomState = {};

export function JoinRoomForm({ defaultCode }: { defaultCode?: string }) {
  const [state, formAction] = useActionState(joinRoom, initialState);
  return (
    <form action={formAction}>
      <input
        type="text"
        name="code"
        placeholder="Code du salon (ex. AB3CD)"
        maxLength={5}
        style={{ textTransform: "uppercase" }}
        defaultValue={defaultCode}
      />
      <input type="text" name="name" placeholder="Ton prénom" maxLength={40} />
      {state.error ? <div className="error-box warn">{state.error}</div> : null}
      <SubmitButton />
    </form>
  );
}
