"use client";

import { useState } from "react";

export function ShareLink({
  url,
  shareTitle,
  shareText,
}: {
  url: string;
  shareTitle?: string;
  shareText?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silencieux : le champ reste sélectionnable manuellement
    }
  }

  async function handleShare() {
    try {
      if (navigator.share) {
        await navigator.share({ title: shareTitle, text: shareText, url });
      } else {
        handleCopy();
      }
    } catch {
      // l'utilisateur a annulé le partage, rien à faire
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5">
        <input
          readOnly
          value={url}
          onFocus={(e) => e.currentTarget.select()}
          className="w-full truncate bg-transparent text-sm text-foreground/80 focus:outline-none"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="tap-target flex-1 rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary"
        >
          {copied ? "Lien copié ✓" : "Copier le lien"}
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="tap-target flex-1 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-dark"
        >
          Partager
        </button>
      </div>
    </div>
  );
}
