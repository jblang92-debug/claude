"use client";

import { useState, useTransition } from "react";
import { setResultReaction } from "@/lib/actions";

const REACTIONS = ["😂", "🎯", "😳", "💯", "🤔", "🔥"];

export function ReactionPicker({
  resultId,
  initialReaction,
}: {
  resultId: string;
  initialReaction: string | null;
}) {
  const [reaction, setReaction] = useState(initialReaction);
  const [, startTransition] = useTransition();

  return (
    <>
      <span className="field-label" style={{ textAlign: "center", display: "block" }}>
        Ça te ressemble ?
      </span>
      <div className="reactions-row">
        {REACTIONS.map((r) => (
          <button
            key={r}
            type="button"
            className={`reaction-btn ${reaction === r ? "picked" : ""}`}
            onClick={() => {
              setReaction(r);
              startTransition(() => {
                setResultReaction(resultId, r);
              });
            }}
          >
            {r}
          </button>
        ))}
      </div>
    </>
  );
}
