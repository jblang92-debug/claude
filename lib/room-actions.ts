"use server";

import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

const CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ"; // sans 0/O/1/I, moins d'erreurs à recopier

function generateRoomCode(): string {
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
}

export interface CreateRoomState {
  error?: string;
}

/**
 * Crée un salon et y ajoute son créateur comme premier joueur.
 *
 * Passe par la fonction SQL `create_room` (SECURITY DEFINER) plutôt que par
 * deux écritures RLS séparées depuis le client : en diagnostic, les
 * insertions directes échouaient de façon persistante pour une session
 * anonyme tout juste créée (auth.uid() était pourtant correctement résolu
 * juste avant, y compris via des tentatives répétées) alors qu'une fonction
 * RPC résolvant auth.uid() dans son propre corps fonctionnait de façon
 * fiable — on écrit donc désormais dans la même transaction que cette
 * résolution.
 */
export async function createRoom(
  _prevState: CreateRoomState,
  formData: FormData,
): Promise<CreateRoomState> {
  const name = String(formData.get("name") || "").trim();
  if (!name) return { error: "Indique ton prénom pour continuer." };
  if (name.length > 40) return { error: "Choisis un prénom un peu plus court." };

  const supabase = await createClient();

  let lastError: string | null = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateRoomCode();
    const { data, error } = await supabase.rpc("create_room", {
      room_code: code,
      player_name: name,
    });
    if (!error && data) {
      redirect(`/salon/${code}`);
    }
    lastError = error?.message ?? null;
    // code déjà pris (collision très improbable) ou autre souci : on retente.
  }
  return {
    error: lastError
      ? `Impossible de créer le salon pour le moment : ${lastError}`
      : "Impossible de créer le salon pour le moment. Réessaie dans un instant.",
  };
}

export interface JoinRoomState {
  error?: string;
}

/** Rejoint un salon existant à partir de son code (voir `createRoom` pour le choix du RPC). */
export async function joinRoom(
  _prevState: JoinRoomState,
  formData: FormData,
): Promise<JoinRoomState> {
  const code = String(formData.get("code") || "").trim().toUpperCase();
  const name = String(formData.get("name") || "").trim();
  if (!code) return { error: "Indique le code du salon." };
  if (!name) return { error: "Indique ton prénom pour continuer." };
  if (name.length > 40) return { error: "Choisis un prénom un peu plus court." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("join_room", {
    target_code: code,
    player_name: name,
  });
  if (error) return { error: `Impossible de rejoindre le salon : ${error.message}` };

  redirect(`/salon/${code}`);
}
