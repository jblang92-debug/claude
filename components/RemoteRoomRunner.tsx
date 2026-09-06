"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { PartyDepth, PartyPrompt, PartyType } from "@/lib/party-content";
import { partyNickname } from "@/lib/party-content";

export interface RoomRow {
  id: string;
  code: string;
  depth: PartyDepth;
  status: "waiting" | "active" | "ended";
  host_user_id: string;
  current_player_id: string | null;
}

export interface PlayerRow {
  id: string;
  user_id: string;
  name: string;
  skips_left: number;
  joined_at: string;
}

export interface TurnRow {
  id: string;
  player_id: string;
  turn_type: PartyType;
  depth: PartyDepth;
  prompt: string;
  response_text: string | null;
  proof_path: string | null;
  status: "pending" | "answered" | "skipped";
  created_at: string;
}

export interface CustomPrompt {
  id: string;
  type: PartyType;
  depth: PartyDepth;
  text: string;
}

function pickPrompt(
  catalog: PartyPrompt[],
  custom: CustomPrompt[],
  type: PartyType,
  depth: PartyDepth,
  usedTexts: Set<string>,
): string {
  const pool = [
    ...catalog.filter((p) => p.type === type && p.depth === depth).map((p) => p.text),
    ...custom.filter((p) => p.type === type && p.depth === depth).map((p) => p.text),
  ];
  const available = pool.filter((t) => !usedTexts.has(t));
  const source = available.length ? available : pool;
  return source[Math.floor(Math.random() * source.length)] ?? "Improvise quelque chose de fun !";
}

export function RemoteRoomRunner({
  room: initialRoom,
  players: initialPlayers,
  turns: initialTurns,
  customPrompts: initialCustomPrompts,
  catalog,
  myUserId,
}: {
  room: RoomRow;
  players: PlayerRow[];
  turns: TurnRow[];
  customPrompts: CustomPrompt[];
  catalog: PartyPrompt[];
  myUserId: string;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [room, setRoom] = useState(initialRoom);
  const [players, setPlayers] = useState(initialPlayers);
  const [turns, setTurns] = useState(initialTurns);
  const [customPrompts, setCustomPrompts] = useState(initialCustomPrompts);
  const [depthChoice, setDepthChoice] = useState<PartyDepth>(initialRoom.depth);
  const [answerText, setAnswerText] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreviewUrls, setProofPreviewUrls] = useState<Record<string, string>>({});
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const usedTextsRef = useRef<Set<string>>(new Set());

  const me = players.find((p) => p.user_id === myUserId) ?? null;

  useEffect(() => {
    const channel = supabase
      .channel(`room:${room.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rooms", filter: `id=eq.${room.id}` },
        (payload) => {
          if (payload.eventType === "UPDATE") setRoom(payload.new as RoomRow);
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "players", filter: `room_id=eq.${room.id}` },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setPlayers((prev) =>
              prev.some((p) => p.id === (payload.new as PlayerRow).id)
                ? prev
                : [...prev, payload.new as PlayerRow],
            );
          } else if (payload.eventType === "UPDATE") {
            setPlayers((prev) =>
              prev.map((p) => (p.id === (payload.new as PlayerRow).id ? (payload.new as PlayerRow) : p)),
            );
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "turns", filter: `room_id=eq.${room.id}` },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setTurns((prev) => [payload.new as TurnRow, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setTurns((prev) =>
              prev.map((t) => (t.id === (payload.new as TurnRow).id ? (payload.new as TurnRow) : t)),
            );
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "room_custom_prompts", filter: `room_id=eq.${room.id}` },
        (payload) => {
          setCustomPrompts((prev) => [...prev, payload.new as CustomPrompt]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.id]);

  // Filet de sécurité en complément du temps réel : si un événement Realtime
  // est manqué (connexion instable, etc.), on rattrape l'état du salon en
  // le relisant périodiquement.
  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      const [{ data: roomData }, { data: playersData }, { data: turnsData }, { data: promptsData }] =
        await Promise.all([
          supabase
            .from("rooms")
            .select("id, code, depth, status, host_user_id, current_player_id")
            .eq("id", room.id)
            .maybeSingle(),
          supabase.from("players").select("id, user_id, name, skips_left, joined_at").eq("room_id", room.id),
          supabase
            .from("turns")
            .select("id, player_id, turn_type, depth, prompt, response_text, proof_path, status, created_at")
            .eq("room_id", room.id)
            .order("created_at", { ascending: false })
            .limit(50),
          supabase.from("room_custom_prompts").select("id, type, depth, text").eq("room_id", room.id),
        ]);
      if (cancelled) return;
      if (roomData) setRoom(roomData as RoomRow);
      if (playersData) setPlayers(playersData as PlayerRow[]);
      if (turnsData) setTurns(turnsData as TurnRow[]);
      if (promptsData) setCustomPrompts(promptsData as CustomPrompt[]);
    };
    const interval = setInterval(poll, 3000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.id]);

  // Charge les URLs signées des preuves photo au fur et à mesure qu'elles apparaissent.
  useEffect(() => {
    const missing = turns.filter((t) => t.proof_path && !proofPreviewUrls[t.proof_path]);
    if (missing.length === 0) return;
    (async () => {
      const entries: Record<string, string> = {};
      for (const t of missing) {
        if (!t.proof_path) continue;
        const { data, error: signError } = await supabase.storage
          .from("party-proofs")
          .createSignedUrl(t.proof_path, 3600);
        if (signError) console.error("Impossible de générer l'URL de la preuve photo :", signError.message);
        else if (data?.signedUrl) entries[t.proof_path] = data.signedUrl;
      }
      if (Object.keys(entries).length) {
        setProofPreviewUrls((prev) => ({ ...prev, ...entries }));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turns]);

  const isHost = myUserId === room.host_user_id;
  const isMyTurn = room.status === "active" && me !== null && room.current_player_id === me.id;
  const currentPlayer = players.find((p) => p.id === room.current_player_id) ?? null;
  const myPendingTurn = me ? turns.find((t) => t.player_id === me.id && t.status === "pending") : undefined;
  const answeredTurns = turns.filter((t) => t.status === "answered").slice(0, 20);

  function playerName(playerId: string): string {
    return players.find((p) => p.id === playerId)?.name ?? "Quelqu'un";
  }

  function orderedPlayers(): PlayerRow[] {
    return [...players].sort((a, b) => a.joined_at.localeCompare(b.joined_at));
  }

  async function startGame() {
    setBusy(true);
    setError(null);
    const { data, error: rpcError } = await supabase.rpc("start_game", {
      target_room_id: room.id,
      chosen_depth: depthChoice,
    });
    setBusy(false);
    if (rpcError) setError("Impossible de lancer la partie pour le moment.");
    else if (data) setRoom(data as RoomRow);
  }

  async function chooseType(type: PartyType) {
    if (!me) return;
    setBusy(true);
    setError(null);
    const prompt = pickPrompt(catalog, customPrompts, type, room.depth, usedTextsRef.current);
    usedTextsRef.current.add(prompt);
    const { data, error: rpcError } = await supabase.rpc("choose_turn", {
      target_room_id: room.id,
      p_turn_type: type,
      p_depth: room.depth,
      p_prompt: prompt,
    });
    setBusy(false);
    if (rpcError) setError("Impossible de démarrer ce tour pour le moment.");
    else if (data) setTurns((prev) => [data as TurnRow, ...prev]);
  }

  function nextPlayerId(): string | null {
    const ordered = orderedPlayers();
    if (ordered.length === 0) return null;
    const idx = ordered.findIndex((p) => p.id === room.current_player_id);
    return ordered[(idx + 1) % ordered.length].id;
  }

  async function skipTurn() {
    if (!me || !myPendingTurn || me.skips_left <= 0) return;
    setBusy(true);
    setError(null);
    const prompt = pickPrompt(catalog, customPrompts, myPendingTurn.turn_type, room.depth, usedTextsRef.current);
    usedTextsRef.current.add(prompt);

    const { data, error: rpcError } = await supabase.rpc("skip_turn", {
      target_turn_id: myPendingTurn.id,
      new_prompt: prompt,
    });
    setBusy(false);
    if (rpcError) {
      setError("Impossible de changer de question pour le moment.");
      return;
    }
    const result = data as { player: PlayerRow; turn: TurnRow };
    setPlayers((prev) => prev.map((p) => (p.id === result.player.id ? result.player : p)));
    setTurns((prev) => prev.map((t) => (t.id === result.turn.id ? result.turn : t)));
  }

  async function submitTurn() {
    if (!me || !myPendingTurn) return;
    setBusy(true);
    setError(null);

    let proofPath: string | null = null;
    if (myPendingTurn.turn_type === "action" && myPendingTurn.depth === "leger" && proofFile) {
      const path = `${room.id}/${myPendingTurn.id}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("party-proofs")
        .upload(path, proofFile, { upsert: true, contentType: proofFile.type || "image/jpeg" });
      if (uploadError) {
        setBusy(false);
        setError("Impossible d'envoyer la photo pour le moment.");
        return;
      }
      proofPath = path;
    }

    const responseText =
      myPendingTurn.turn_type === "verite"
        ? answerText.trim() || null
        : myPendingTurn.depth === "ose"
          ? "C'est fait ✅"
          : null;

    const { data, error: rpcError } = await supabase.rpc("submit_turn", {
      target_turn_id: myPendingTurn.id,
      p_response_text: responseText,
      p_proof_path: proofPath,
      p_next_player_id: nextPlayerId(),
    });

    if (rpcError) {
      setBusy(false);
      setError("Impossible d'envoyer ta réponse pour le moment.");
      return;
    }
    const result = data as { turn: TurnRow; room: RoomRow };
    setTurns((prev) => prev.map((t) => (t.id === result.turn.id ? result.turn : t)));
    setRoom(result.room);

    setAnswerText("");
    setProofFile(null);
    setBusy(false);
  }

  async function addCustomPrompt(formData: FormData) {
    if (!me) return;
    const type = String(formData.get("type") || "verite") as PartyType;
    const depth = String(formData.get("depth") || "leger") as PartyDepth;
    const text = String(formData.get("text") || "").trim();
    if (!text) return;
    setBusy(true);
    const { data, error: rpcError } = await supabase.rpc("add_custom_prompt", {
      target_room_id: room.id,
      p_type: type,
      p_depth: depth,
      p_text: text,
    });
    setBusy(false);
    if (!rpcError) {
      if (data) {
        setCustomPrompts((prev) =>
          prev.some((p) => p.id === (data as CustomPrompt).id) ? prev : [...prev, data as CustomPrompt],
        );
      }
      setShowCustomForm(false);
    }
  }

  // ---------------------------------------------------------------------

  if (room.status === "waiting") {
    return (
      <div>
        <div className="room-code-display">{room.code}</div>
        <p className="footnote" style={{ marginTop: 0 }}>
          Partage ce code pour que d&apos;autres rejoignent le salon.
        </p>

        <span className="field-label">Joueur·ses connecté·es</span>
        <div className="party-players">
          {players.map((p) => (
            <span key={p.id} className="party-chip">
              {p.name}
              {p.user_id === room.host_user_id ? " 👑" : ""}
            </span>
          ))}
        </div>

        {isHost ? (
          <>
            <span className="field-label">Ambiance</span>
            <button
              type="button"
              className="depth-option"
              style={depthChoice === "leger" ? { borderColor: "var(--accent-violet)" } : undefined}
              onClick={() => setDepthChoice("leger")}
            >
              <span className="depth-emoji">☀️</span>
              <span>
                <strong>Léger</strong>
                <br />
                Fun, safe pour tout le monde
              </span>
            </button>
            <button
              type="button"
              className="depth-option"
              style={depthChoice === "ose" ? { borderColor: "var(--accent-violet)" } : undefined}
              onClick={() => setDepthChoice("ose")}
            >
              <span className="depth-emoji">🔥</span>
              <span>
                <strong>Osé</strong>
                <br />
                Plus intime, suggestif — jamais explicite
              </span>
            </button>
            {error ? <div className="error-box warn">{error}</div> : null}
            <button
              type="button"
              className="btn btn-primary"
              disabled={busy || players.length < 2}
              onClick={startGame}
            >
              {players.length < 2 ? "En attente d'un·e 2ᵉ joueur·se…" : "🚀 Lancer la partie"}
            </button>
          </>
        ) : (
          <p className="footnote">En attente que l&apos;hôte lance la partie…</p>
        )}
      </div>
    );
  }

  if (isMyTurn && !myPendingTurn) {
    return (
      <div className="party-turn-screen">
        <div className="party-turn-name">{me?.name}</div>
        <p style={{ color: "var(--muted)" }}>C&apos;est ton tour !</p>
        <div className="party-choice-row">
          <button type="button" className="btn party-choice truth" disabled={busy} onClick={() => chooseType("verite")}>
            💬 Vérité
          </button>
          <button type="button" className="btn party-choice dare" disabled={busy} onClick={() => chooseType("action")}>
            🎯 Action
          </button>
        </div>
        {error ? <div className="error-box warn">{error}</div> : null}
      </div>
    );
  }

  if (isMyTurn && myPendingTurn) {
    const needsProof = myPendingTurn.turn_type === "action" && myPendingTurn.depth === "leger";
    return (
      <div>
        <span className={`party-type-tag ${myPendingTurn.turn_type === "verite" ? "truth" : "dare"}`}>
          {myPendingTurn.turn_type === "verite" ? "💬 Vérité" : "🎯 Action"}
        </span>
        <div className="party-prompt-card">
          <p className="party-prompt-text">{myPendingTurn.prompt}</p>
        </div>

        {myPendingTurn.turn_type === "verite" ? (
          <div className="answer-zone">
            <textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="Ta réponse, visible par tout le salon une fois envoyée…"
            />
          </div>
        ) : needsProof ? (
          <div className="proof-zone">
            <span className="proof-label">Preuve photo (facultative)</span>
            <div className="file-input-wrap">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProofFile(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>
        ) : (
          <p className="footnote" style={{ marginTop: 0, textAlign: "left" }}>
            Palier osé : aucune preuve demandée, juste ta confirmation.
          </p>
        )}

        {error ? <div className="error-box warn">{error}</div> : null}

        <button
          type="button"
          className="link-btn"
          style={{ display: "flex", justifyContent: "center", width: "100%", marginBottom: 16 }}
          disabled={busy || (me?.skips_left ?? 0) <= 0}
          onClick={skipTurn}
        >
          Passer ({me?.skips_left ?? 0} restant{(me?.skips_left ?? 0) > 1 ? "s" : ""})
        </button>
        <button type="button" className="btn btn-primary" disabled={busy} onClick={submitTurn}>
          {myPendingTurn.turn_type === "verite" ? "Envoyer ma réponse" : "C'est fait ✅"}
        </button>
      </div>
    );
  }

  // Pas mon tour : on regarde ce qui se passe.
  return (
    <div>
      <div className="party-header">
        <span className="party-type-tag truth">{room.depth === "ose" ? "🔥 Osé" : "☀️ Léger"}</span>
      </div>
      <div className="party-turn-screen" style={{ minHeight: "20vh" }}>
        <div className="party-turn-name" style={{ fontSize: 22 }}>
          {currentPlayer ? currentPlayer.name : "…"}
        </div>
        <p style={{ color: "var(--muted)" }}>
          {currentPlayer ? `C'est le tour de ${partyNickname(currentPlayer.name)}` : "En attente…"}
        </p>
      </div>

      <span className="field-label">Ce qui vient de se passer</span>
      <div className="turn-feed">
        {answeredTurns.length === 0 ? (
          <p className="footnote" style={{ margin: 0, textAlign: "left" }}>
            Rien pour l&apos;instant — le premier tour arrive.
          </p>
        ) : (
          answeredTurns.map((t) => (
            <div key={t.id} className="turn-card">
              <div className="turn-card-head">
                <span className="turn-card-name">{playerName(t.player_id)}</span>
                <span className={`party-type-tag ${t.turn_type === "verite" ? "truth" : "dare"}`}>
                  {t.turn_type === "verite" ? "💬" : "🎯"}
                </span>
              </div>
              <div className="turn-card-prompt">{t.prompt}</div>
              {t.response_text ? <div className="friend-answer">{t.response_text}</div> : null}
              {t.proof_path && proofPreviewUrls[t.proof_path] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={proofPreviewUrls[t.proof_path]} alt="Preuve" className="proof-preview" />
              ) : null}
            </div>
          ))
        )}
      </div>

      {showCustomForm ? (
        <form
          action={(fd) => {
            addCustomPrompt(fd);
          }}
        >
          <span className="field-label">Ajouter un Action/Vérité pour ce salon</span>
          <select name="type" defaultValue="verite" className="chip" style={{ marginBottom: 10, width: "100%" }}>
            <option value="verite">Vérité</option>
            <option value="action">Action</option>
          </select>
          <select name="depth" defaultValue={room.depth} className="chip" style={{ marginBottom: 10, width: "100%" }}>
            <option value="leger">Léger</option>
            <option value="ose">Osé</option>
          </select>
          <input type="text" name="text" placeholder="Ta question ou ton défi" maxLength={280} />
          <button type="submit" className="btn-ghost-full" disabled={busy}>
            Ajouter
          </button>
        </form>
      ) : (
        <button type="button" className="link-btn" onClick={() => setShowCustomForm(true)}>
          + Ajouter un Action/Vérité perso pour ce salon
        </button>
      )}
    </div>
  );
}
