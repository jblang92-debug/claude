"use client";

import { useState } from "react";
import { buildCharacter } from "@/lib/character";

/** Ajoute un canal alpha hexadécimal à une couleur "#RRGGBB". */
function withAlpha(hex: string, alphaHex: string): string {
  return `${hex}${alphaHex}`;
}

export function ShareCharacterButton({
  seed,
  color,
  emoji,
  theme,
  portrait,
  traits,
}: {
  seed: string;
  color: string;
  emoji?: string | null;
  theme: string;
  portrait: string;
  traits: string[];
}) {
  const [busy, setBusy] = useState(false);

  async function handleShare() {
    setBusy(true);
    try {
      const { svg, nickname, tier, secondary } = buildCharacter(seed, color, emoji, "export");

      const W = 1080;
      const H = 1350;
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const bg = ctx.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, "#170F2B");
      bg.addColorStop(1, "#241A3D");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      const halo1 = ctx.createRadialGradient(W * 0.25, H * 0.18, 0, W * 0.25, H * 0.18, 500);
      halo1.addColorStop(0, withAlpha(color, "aa"));
      halo1.addColorStop(1, withAlpha(color, "00"));
      ctx.fillStyle = halo1;
      ctx.fillRect(0, 0, W, H);

      const halo2 = ctx.createRadialGradient(W * 0.8, H * 0.75, 0, W * 0.8, H * 0.75, 480);
      halo2.addColorStop(0, withAlpha(secondary, "88"));
      halo2.addColorStop(1, withAlpha(secondary, "00"));
      ctx.fillStyle = halo2;
      ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = "#F3EFFF";
      ctx.font = "600 34px Fraunces, serif";
      ctx.textAlign = "left";
      ctx.fillText("Miroir", 70, 100);
      ctx.fillStyle = "#B4A6D6";
      ctx.font = "500 26px Inter, sans-serif";
      ctx.fillText(theme, 70, 140);

      const svgData = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          const size = 480;
          ctx.drawImage(img, W / 2 - size / 2, 190, size, size);
          resolve();
        };
        img.onerror = () => resolve();
        img.src = svgData;
      });

      ctx.textAlign = "center";
      ctx.fillStyle = "#B4A6D6";
      ctx.font = "600 24px Inter, sans-serif";
      ctx.fillText(tier.toUpperCase(), W / 2, 705);

      ctx.fillStyle = "#F3EFFF";
      ctx.font = "700 56px Fraunces, serif";
      ctx.fillText(nickname, W / 2, 770);

      ctx.font = "600 26px Inter, sans-serif";
      const gap = 18;
      const widths = traits.map((t) => ctx.measureText(t).width + 48);
      const totalW = widths.reduce((a, b) => a + b, 0) + gap * (traits.length - 1);
      let x = W / 2 - totalW / 2;
      const chipY = 830;
      traits.forEach((t, i) => {
        const w = widths[i];
        ctx.fillStyle = "rgba(255,255,255,0.08)";
        ctx.beginPath();
        ctx.roundRect(x, chipY, w, 56, 28);
        ctx.fill();
        ctx.fillStyle = color;
        ctx.fillText(t, x + w / 2, chipY + 38);
        x += w + gap;
      });

      ctx.fillStyle = "#D8CFEF";
      ctx.font = "400 30px Fraunces, serif";
      ctx.textAlign = "center";
      const words = portrait.split(" ");
      let line = "";
      let y = 940;
      const lineH = 42;
      const maxLines = 8;
      let lines = 0;
      for (const w of words) {
        const test = line + w + " ";
        if (ctx.measureText(test).width > 860 && line) {
          ctx.fillText(line.trim(), W / 2, y);
          line = w + " ";
          y += lineH;
          lines++;
          if (lines >= maxLines) {
            line = "";
            break;
          }
        } else {
          line = test;
        }
      }
      if (line && lines < maxLines) ctx.fillText(line.trim(), W / 2, y);

      ctx.fillStyle = "#8B7BAE";
      ctx.font = "500 24px Inter, sans-serif";
      ctx.fillText("Fais le test toi aussi sur Miroir", W / 2, H - 60);

      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/png"),
      );
      if (!blob) return;

      const file = new File([blob], "mon-personnage-miroir.png", { type: "image/png" });
      if (
        typeof navigator.share === "function" &&
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] })
      ) {
        try {
          await navigator.share({ files: [file], title: "Mon résultat sur Miroir" });
          return;
        } catch {
          // partage annulé par l'utilisateur : on retombe sur le téléchargement
        }
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "mon-personnage-miroir.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button type="button" className="btn btn-share" onClick={handleShare} disabled={busy}>
      {busy ? "Préparation…" : "📤 Partager mon personnage"}
    </button>
  );
}
