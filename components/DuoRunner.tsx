"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import type { TestRow } from "@/lib/data";
import { generateDuoPortrait, generateDuoCompat } from "@/lib/actions";
import { buildCharacter } from "@/lib/character";

type Stage = "handoff-start" | "quiz" | "scoring" | "handoff-mid" | "reveal-locked" | "reveal-open";

interface PlayerResult {
  portrait: string;
  traits: string[];
}

export function DuoRunner({
  test,
  categoryColor,
  categoryEmoji,
}: {
  test: TestRow;
  categoryColor: string;
  categoryEmoji: string | null;
}) {
  const [stage, setStage] = useState<Stage>("handoff-start");
  const [activePlayer, setActivePlayer] = useState<1 | 2>(1);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [p1, setP1] = useState<PlayerResult | null>(null);
  const [p2, setP2] = useState<PlayerResult | null>(null);
  const [compat, setCompat] = useState<{ percent: number; compatText: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const total = test.questions.length;

  function startQuiz() {
    setStep(0);
    setAnswers({});
    setError(null);
    setStage("quiz");
  }

  function selectOption(index: number, optionText: string) {
    const newAnswers = { ...answers, [index]: optionText };
    setAnswers(newAnswers);
    if (index + 1 < total) {
      setTimeout(() => setStep(index + 1), 220);
      return;
    }

    setStage("scoring");
    const orderedAnswers = test.questions.map((_, i) => newAnswers[i]);
    startTransition(async () => {
      const result = await generateDuoPortrait(test, orderedAnswers);
      if (!result.ok) {
        setError(result.error);
        setStage("quiz");
        return;
      }
      if (activePlayer === 1) {
        setP1({ portrait: result.portrait, traits: result.traits });
        setStage("handoff-mid");
      } else {
        setP2({ portrait: result.portrait, traits: result.traits });
        setStage("reveal-locked");
      }
    });
  }

  function startPlayer2() {
    setActivePlayer(2);
    startQuiz();
  }

  function reveal() {
    setStage("reveal-open");
    if (!p1 || !p2) return;
    startTransition(async () => {
      const result = await generateDuoCompat(test.title, p1.portrait, p1.traits, p2.portrait, p2.traits);
      if (result.ok) setCompat({ percent: result.percent, compatText: result.compatText });
    });
  }

  if (stage === "handoff-start") {
    return (
      <div className="handoff-screen">
        <div className="handoff-emoji">🎮</div>
        <h1 style={{ fontSize: 28 }}>Test à deux, prêts ?</h1>
        <p>
          Joueur·se 1 commence en premier. Joueur·se 2, ne regarde pas les
          réponses par-dessus l&apos;épaule 😉
        </p>
        <button type="button" className="btn btn-primary" onClick={startQuiz}>
          Joueur·se 1, commence
        </button>
        <Link href="/" className="link-btn" style={{ marginTop: 16 }}>
          Annuler le mode duo
        </Link>
      </div>
    );
  }

  if (stage === "handoff-mid") {
    return (
      <div className="handoff-screen">
        <div className="handoff-emoji">🙈</div>
        <h1 style={{ fontSize: 28 }}>Passe le téléphone !</h1>
        <p>
          Joueur·se 1 a terminé. Donne le téléphone à Joueur·se 2 — ses
          réponses resteront privées jusqu&apos;à la révélation finale.
        </p>
        <button type="button" className="btn btn-primary" onClick={startPlayer2}>
          Joueur·se 2, à toi
        </button>
      </div>
    );
  }

  if (stage === "scoring") {
    return (
      <div className="loading-screen">
        <div className="spin-blob" />
        <h3>On dessine {activePlayer === 1 ? "le portrait de Joueur·se 1" : "le résultat"}…</h3>
        <p>Analyse des réponses</p>
      </div>
    );
  }

  if (stage === "quiz") {
    const question = test.questions[step];
    const selected = answers[step];
    return (
      <div>
        <div className="duo-player-tag">🎮 Joueur·se {activePlayer} répond</div>
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
        {error ? <div className="error-box warn">{error}</div> : null}
        {step > 0 ? (
          <button type="button" className="link-btn" onClick={() => setStep(step - 1)}>
            ← Question précédente
          </button>
        ) : null}
      </div>
    );
  }

  // reveal-locked / reveal-open
  if (!p1 || !p2) return null;

  const seed1 = `${test.slug}|p1|${p1.traits.join(",")}`;
  const seed2 = `${test.slug}|p2|${p2.traits.join(",")}`;
  const color2 = categoryColor.toUpperCase() === "#5EE6C5" ? "#B18CFF" : "#5EE6C5";
  const char1 = buildCharacter(seed1, categoryColor, categoryEmoji, "duo1");
  const char2 = buildCharacter(seed2, color2, categoryEmoji, "duo2");

  if (stage === "reveal-locked") {
    return (
      <div>
        <div className="hero" style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: 28 }}>Les deux résultats sont prêts…</h1>
          <p>Révélez-les en même temps, à deux !</p>
        </div>
        <div className="compat-row">
          <div className="compat-col hidden-card">
            <div className="mystery-blob">?</div>
            <div className="compat-name">Joueur·se 1</div>
          </div>
          <div className="compat-pct">🔒</div>
          <div className="compat-col hidden-card">
            <div className="mystery-blob">?</div>
            <div className="compat-name">Joueur·se 2</div>
          </div>
        </div>
        <button type="button" className="btn btn-primary" onClick={reveal}>
          ✨ Révéler les deux profils
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="hero" style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: 26 }}>{test.title}</h1>
      </div>
      <div className="compat-row">
        <div className="compat-col">
          <span dangerouslySetInnerHTML={{ __html: char1.svg }} />
          <div className="compat-name">Joueur·se 1 · {char1.nickname}</div>
        </div>
        <div className="compat-pct">{compat ? `${compat.percent}%` : "…"}</div>
        <div className="compat-col">
          <span dangerouslySetInnerHTML={{ __html: char2.svg }} />
          <div className="compat-name">Joueur·se 2 · {char2.nickname}</div>
        </div>
      </div>
      {compat ? (
        <div className="result-body" style={{ textAlign: "center" }}>
          {compat.compatText}
        </div>
      ) : null}
      <div className="duo-portraits">
        <div>
          <div className="duo-portrait-label">Portrait Joueur·se 1</div>
          <div className="result-body">{p1.portrait}</div>
        </div>
        <div>
          <div className="duo-portrait-label">Portrait Joueur·se 2</div>
          <div className="result-body">{p2.portrait}</div>
        </div>
      </div>
      <Link
        href="/"
        className="btn btn-primary"
        style={{ display: "block", textAlign: "center", textDecoration: "none" }}
      >
        Nouveau test
      </Link>
    </div>
  );
}
