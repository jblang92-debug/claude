"use client";

import Link from "next/link";
import { useState } from "react";
import { slugify, type CatalogQuiz } from "@/lib/catalog";
import { PRESEEDED_TESTS } from "@/lib/preseeded-tests";

export function QuizList({
  quizzes,
  categoryColor,
  categoryEmoji,
}: {
  quizzes: CatalogQuiz[];
  categoryColor: string;
  categoryEmoji: string;
}) {
  const [duoMode, setDuoMode] = useState(false);

  return (
    <>
      <button
        type="button"
        className={`duo-toggle ${duoMode ? "on" : ""}`}
        onClick={() => setDuoMode((v) => !v)}
      >
        <span>🎮 Mode Duo — même téléphone, deux joueur·ses</span>
        <span className="duo-switch" />
      </button>

      <div className="quiz-list">
        {quizzes.map((q) => (
          <Link
            key={q.title}
            href={`/${duoMode ? "duo" : "test"}/${slugify(q.title)}`}
            className="quiz-card"
            style={{ "--tile-color": categoryColor } as React.CSSProperties}
          >
            <span className="qi">{categoryEmoji}</span>
            <span className="qt">
              {q.title}
              <span className="depth-tag">{q.depth === "profond" ? "🌊 profond" : "☀️ léger"}</span>
            </span>
            <span className="arrow">{PRESEEDED_TESTS[q.title] ? "⚡" : "✨"}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
