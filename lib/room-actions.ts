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

/** Crée un salon (mode Soirée à distance) et y ajoute son créateur comme premier joueur. */
export async function createRoom(
  _prevState: CreateRoomState,
  formData: FormData,
): Promise<CreateRoomState> {
  const name = String(formData.get("name") || "").trim();
  if (!name) return { error: "Indique ton prénom pour continuer." };
  if (name.length > 40) return { error: "Choisis un prénom un peu plus court." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Session introuvable, recharge la page et réessaie." };

  let code = "";
  for (let attempt = 0; attempt < 5; attempt++) {
    code = generateRoomCode();
    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .insert({ code, host_user_id: user.id })
      .select("id")
      .single();
    if (!roomError && room) {
      const { error: playerError } = await supabase
        .from("players")
        .insert({ room_id: room.id, user_id: user.id, name });
      if (playerError) return { error: `Impossible de rejoindre ton propre salon : ${playerError.message}` };
      redirect(`/salon/${code}`);
    }
    // code déjà pris (collision très improbable) : on retente avec un autre.
  }
  return { error: "Impossible de créer le salon pour le moment. Réessaie dans un instant." };
}

export interface JoinRoomState {
  error?: string;
}

/** Rejoint un salon existant à partir de son code. */
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
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Session introuvable, recharge la page et réessaie." };
  console.error(`[DEBUG joinRoom] user=${user.id} code=${code}`);
  const { data: dbAuth } = await supabase.rpc("debug_auth");
  console.error(`[DEBUG joinRoom] db sees: ${JSON.stringify(dbAuth)}`);

  const { data: room } = await supabase.from("rooms").select("id, code").eq("code", code).maybeSingle();
  if (!room) return { error: "Aucun salon ne correspond à ce code." };

  const { error: playerError } = await supabase
    .from("players")
    .upsert({ room_id: room.id, user_id: user.id, name }, { onConflict: "room_id,user_id" });
  if (playerError) {
    console.error(`[DEBUG joinRoom] insert failed user=${user.id} room=${room.id} error=${playerError.message}`);
    return { error: `Impossible de rejoindre le salon : ${playerError.message}` };
  }
  console.error(`[DEBUG joinRoom] insert OK user=${user.id} room=${room.id}`);

  redirect(`/salon/${room.code}`);
}
