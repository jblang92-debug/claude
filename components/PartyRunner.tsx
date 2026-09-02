"use client";

import Link from "next/link";
import { useState } from "react";
import type { PartyPrompt, PartyType, PartyDepth } from "@/lib/party-content";
import { partyNickname } from "@/lib/party-content";

type Stage = "setup" | "depth" | "turn" | "prompt";

const INITIAL_SKIPS = 2;

export function PartyRunner({ prompts }: { prompts: PartyPrompt[] }) {
  const [stage, setStage] = useState<Stage>("setup");
  const [players, setPlayers] = useState<string[]>([]);
  const [nameInput, setNameInput] = useState("");
  const [skips, setSkips] = useState<Record<string, number>>({});
  const [depth, setDepth] = useState<PartyDepth>("leger");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentType, setCurrentType] = useState<PartyType | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<string | null>(null);
  const [used, setUsed] = useState<string[]>([]);

  function addPlayer() {
    const trimmed = nameInput.trim();
    if (!trimmed || players.includes(trimmed)) return;
    setPlayers((prev) => [...prev, trimmed]);
    setSkips((prev) => ({ ...prev, [trimmed]: INITIAL_SKIPS }));
    setNameInput("");
  }

  function removePlayer(name: string) {
    setPlayers((prev) => prev.filter((p) => p !== name));
  }

  function pickPrompt(type: PartyType) {
    const pool = prompts.filter((p) => p.type === type && p.depth === depth);
    const usedKey = (t: string) => `${type}:${t}`;
    const available = pool.filter((p) => !used.includes(usedKey(p.text)));
    const source = available.length ? available : pool; // relance le stock si tout est passé
    const chosen = source[Math.floor(Math.random() * source.length)];
    if (!chosen) return;
    setUsed((prev) => (available.length ? [...prev, usedKey(chosen.text)] : [usedKey(chosen.text)]));
    setCurrentType(type);
    setCurrentPrompt(chosen.text);
    setStage("prompt");
  }

  function skipPrompt() {
    const name = players[currentIndex];
    if ((skips[name] ?? 0) <= 0 || !currentType) return;
    setSkips((prev) => ({ ...prev, [name]: prev[name] - 1 }));
    pickPrompt(currentType);
  }

  function nextTurn() {
    setCurrentIndex((i) => (i + 1) % players.length);
    setCurrentType(null);
    setCurrentPrompt(null);
    setStage("turn");
  }

  if (stage === "setup") {
    return (
      <div>
        <div className="back-row">
          <Link href="/" className="link-btn">
            ← Accueil
          </Link>
        </div>
        <div className="hero">
          <h1 style={{ fontSize: 30 }}>🎉 Mode Soirée</h1>
          <p>Ajoutez les joueur·ses présent·es (2 minimum), puis lancez la partie.</p>
        </div>
        <div className="party-players">
          {players.length === 0 ? (
            <span className="footnote" style={{ margin: 0 }}>
              Aucun joueur·se pour l&apos;instant
            </span>
          ) : (
            players.map((name) => (
              <span key={name} className="party-chip">
                {name}
                <button type="button" onClick={() => removePlayer(name)}>
                  ✕
                </button>
              </span>
            ))
          )}
        </div>
        <div className="party-add-row">
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addPlayer();
              }
            }}
            placeholder="Prénom du joueur·se"
          />
          <button type="button" className="btn-add-player" onClick={addPlayer}>
            Ajouter
          </button>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          disabled={players.length < 2}
          onClick={() => setStage("depth")}
        >
          Continuer ({players.length} joueur·se{players.length > 1 ? "s" : ""})
        </button>
      </div>
    );
  }

  if (stage === "depth") {
    return (
      <div>
        <div className="back-row">
          <button type="button" className="link-btn" onClick={() => setStage("setup")}>
            ← Joueur·ses
          </button>
        </div>
        <div className="hero">
          <h1 style={{ fontSize: 28 }}>Quelle ambiance ?</h1>
          <p>Vous pourrez changer à tout moment pendant la partie.</p>
        </div>
        <button
          type="button"
          className="depth-option"
          onClick={() => {
            setDepth("leger");
            setCurrentIndex(0);
            setStage("turn");
          }}
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
          onClick={() => {
            setDepth("ose");
            setCurrentIndex(0);
            setStage("turn");
          }}
        >
          <span className="depth-emoji">🔥</span>
          <span>
            <strong>Osé</strong>
            <br />
            Plus intime, suggestif — jamais explicite
          </span>
        </button>
      </div>
    );
  }

  const currentName = players[currentIndex];

  if (stage === "turn") {
    return (
      <div>
        <div className="party-header">
          <button type="button" className="link-btn" onClick={() => setStage("depth")}>
            {depth === "ose" ? "🔥 Osé" : "☀️ Léger"} · changer
          </button>
          <Link href="/" className="link-btn">
            Quitter
          </Link>
        </div>
        <div className="party-turn-screen">
          <div className="party-turn-name">{currentName}</div>
          <p style={{ color: "var(--muted)" }}>C&apos;est ton tour !</p>
          <div className="party-choice-row">
            <button type="button" className="btn party-choice truth" onClick={() => pickPrompt("verite")}>
              💬 Vérité
            </button>
            <button type="button" className="btn party-choice dare" onClick={() => pickPrompt("action")}>
              🎯 Action
            </button>
          </div>
        </div>
      </div>
    );
  }

  // stage === "prompt"
  const skipsLeft = skips[currentName] ?? 0;
  return (
    <div>
      <div className="party-header">
        <span className={`party-type-tag ${currentType === "verite" ? "truth" : "dare"}`}>
          {currentType === "verite" ? "💬 Vérité" : "🎯 Action"}
        </span>
        <Link href="/" className="link-btn">
          Quitter
        </Link>
      </div>
      <div className="party-prompt-card">
        <div className="party-turn-name" style={{ fontSize: 18 }}>
          {currentName} · <span style={{ color: "var(--muted)", fontWeight: 500 }}>{partyNickname(currentName)}</span>
        </div>
        <p className="party-prompt-text">{currentPrompt}</p>
      </div>
      <button
        type="button"
        className="link-btn"
        style={{ display: "flex", justifyContent: "center", width: "100%", marginBottom: 16 }}
        disabled={skipsLeft <= 0}
        onClick={skipPrompt}
      >
        Passer {skipsLeft > 0 ? `(${skipsLeft} restant${skipsLeft > 1 ? "s" : ""})` : "(plus de passes)"}
      </button>
      <button type="button" className="btn btn-primary" onClick={nextTurn}>
        Tour suivant →
      </button>
    </div>
  );
}
