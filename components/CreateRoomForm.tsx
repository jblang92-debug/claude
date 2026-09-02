"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createRoom, type CreateRoomState } from "@/lib/room-actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary" disabled={pending}>
      {pending ? "Création…" : "Créer le salon"}
    </button>
  );
}

const initialState: CreateRoomState = {};

export function CreateRoomForm() {
  const [state, formAction] = useActionState(createRoom, initialState);
  return (
    <form action={formAction}>
      <input type="text" name="name" placeholder="Ton prénom" maxLength={40} />
      {state.error ? <div className="error-box warn">{state.error}</div> : null}
      <SubmitButton />
    </form>
  );
}
