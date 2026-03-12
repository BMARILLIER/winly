"use client";

import { useRef, useState, useCallback } from "react";
import type { ScoreCardData } from "@/modules/share";
import { getGradeColor, getScoreBarColor, CARD_THEMES } from "@/modules/share";
import type { CardTheme } from "@/modules/share";

interface Props {
  data: ScoreCardData;
}

export function ShareUI({ data }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [theme, setTheme] = useState<CardTheme>(CARD_THEMES[0]);
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const drawCard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 600;
    const H = 400;
    canvas.width = W * 2;
    canvas.height = H * 2;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.scale(2, 2);

    const t = theme;
    const gradeColor = getGradeColor(data.grade);

    // Background
    ctx.fillStyle = t.bg;
    ctx.beginPath();
    ctx.roundRect(0, 0, W, H, 16);
    ctx.fill();

    // Subtle gradient overlay
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "rgba(139, 92, 246, 0.05)");
    grad.addColorStop(1, "rgba(139, 92, 246, 0.15)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Header
    ctx.fillStyle = t.text;
    ctx.font = "bold 22px system-ui, -apple-system, sans-serif";
    ctx.fillText("WINLY", 32, 45);

    ctx.fillStyle = t.subtle;
    ctx.font = "13px system-ui, -apple-system, sans-serif";
    ctx.fillText("Score Card", 105, 45);

    // Date
    ctx.textAlign = "right";
    ctx.fillStyle = t.subtle;
    ctx.font = "12px system-ui, -apple-system, sans-serif";
    ctx.fillText(data.date, W - 32, 45);
    ctx.textAlign = "left";

    // Divider
    ctx.strokeStyle = t.subtle + "33";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(32, 60);
    ctx.lineTo(W - 32, 60);
    ctx.stroke();

    // Username + meta
    ctx.fillStyle = t.text;
    ctx.font = "bold 20px system-ui, -apple-system, sans-serif";
    ctx.fillText(data.username, 32, 95);

    ctx.fillStyle = t.subtle;
    ctx.font = "13px system-ui, -apple-system, sans-serif";
    ctx.fillText(`${data.platform} · ${data.niche} · ${data.level}`, 32, 118);

    // Grade circle
    const gradeX = W - 80;
    const gradeY = 105;
    ctx.beginPath();
    ctx.arc(gradeX, gradeY, 30, 0, Math.PI * 2);
    ctx.fillStyle = gradeColor.bg;
    ctx.fill();
    ctx.strokeStyle = gradeColor.border;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = gradeColor.text;
    ctx.font = "bold 28px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(data.grade, gradeX, gradeY + 10);
    ctx.textAlign = "left";

    // Score arc
    const scoreX = 100;
    const scoreY = 205;
    const scoreR = 50;

    // Background arc
    ctx.beginPath();
    ctx.arc(scoreX, scoreY, scoreR, Math.PI * 0.75, Math.PI * 2.25);
    ctx.strokeStyle = t.subtle + "33";
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.stroke();

    // Score arc
    const scoreAngle = Math.PI * 0.75 + (data.globalScore / 100) * Math.PI * 1.5;
    ctx.beginPath();
    ctx.arc(scoreX, scoreY, scoreR, Math.PI * 0.75, scoreAngle);
    ctx.strokeStyle = "#8b5cf6";
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.stroke();

    // Score number
    ctx.fillStyle = t.text;
    ctx.font = "bold 32px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(String(data.globalScore), scoreX, scoreY + 8);
    ctx.fillStyle = t.subtle;
    ctx.font = "11px system-ui, -apple-system, sans-serif";
    ctx.fillText("/ 100", scoreX, scoreY + 25);
    ctx.textAlign = "left";

    // Pillar bars
    if (data.pillars.length > 0) {
      const barX = 190;
      const barW = W - barX - 40;
      const barH = 14;
      const gap = 10;
      let barY = 160;

      for (const pillar of data.pillars) {
        // Label
        ctx.fillStyle = t.subtle;
        ctx.font = "12px system-ui, -apple-system, sans-serif";
        ctx.fillText(pillar.label, barX, barY - 3);

        // Score value
        ctx.textAlign = "right";
        ctx.fillStyle = t.text;
        ctx.font = "bold 12px system-ui, -apple-system, sans-serif";
        ctx.fillText(String(pillar.score), barX + barW, barY - 3);
        ctx.textAlign = "left";

        // Bar background
        ctx.fillStyle = t.subtle + "22";
        ctx.beginPath();
        ctx.roundRect(barX, barY + 2, barW, barH, 4);
        ctx.fill();

        // Bar fill
        const fillW = (pillar.score / 100) * barW;
        ctx.fillStyle = getScoreBarColor(pillar.score);
        ctx.beginPath();
        ctx.roundRect(barX, barY + 2, fillW, barH, 4);
        ctx.fill();

        barY += barH + gap + 14;
      }
    }

    // Achievement badge
    if (data.topAchievement) {
      ctx.fillStyle = t.card;
      ctx.beginPath();
      ctx.roundRect(32, H - 75, W - 64, 35, 8);
      ctx.fill();

      ctx.fillStyle = t.subtle;
      ctx.font = "11px system-ui, -apple-system, sans-serif";
      ctx.fillText("Top Achievement:", 46, H - 53);

      ctx.fillStyle = t.text;
      ctx.font = "bold 11px system-ui, -apple-system, sans-serif";
      ctx.fillText(data.topAchievement, 160, H - 53);
    }

    // Footer
    ctx.fillStyle = t.subtle + "88";
    ctx.font = "10px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Generated with Winly — winly.app", W / 2, H - 16);
    ctx.textAlign = "left";
  }, [data, theme]);

  // Draw on mount and theme change
  const canvasCallback = useCallback(
    (node: HTMLCanvasElement | null) => {
      if (node) {
        (canvasRef as React.MutableRefObject<HTMLCanvasElement>).current = node;
        setTimeout(drawCard, 0);
      }
    },
    [drawCard]
  );

  function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `winly-scorecard-${data.date}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  }

  async function handleCopyImage() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );
      if (blob) {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Fallback: download instead
      handleDownload();
    }
  }

  async function handleShare() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );
      if (blob && navigator.share) {
        const file = new File([blob], `winly-scorecard-${data.date}.png`, {
          type: "image/png",
        });
        await navigator.share({
          title: `My Winly Score: ${data.globalScore}/100`,
          text: `I scored ${data.globalScore}/100 on Winly! Grade: ${data.grade}`,
          files: [file],
        });
      } else {
        // Fallback to copy
        await handleCopyImage();
      }
    } catch {
      // User cancelled or not supported
    }
  }

  return (
    <div className="space-y-6">
      {/* Theme selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-foreground">Theme:</span>
        {CARD_THEMES.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setTheme(t);
              setTimeout(drawCard, 0);
            }}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors ${
              theme.id === t.id
                ? "border-accent bg-accent-muted text-accent"
                : "border-border bg-surface-1 text-text-secondary hover:bg-surface-2"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Canvas */}
      <div className="flex justify-center">
        <canvas
          ref={canvasCallback}
          className="rounded-2xl shadow-lg max-w-full"
        />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={handleDownload}
          className="rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-hover"
        >
          {downloaded ? "Downloaded!" : "Download PNG"}
        </button>
        <button
          onClick={handleCopyImage}
          className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-surface-2"
        >
          {copied ? "Copied!" : "Copy to Clipboard"}
        </button>
        <button
          onClick={handleShare}
          className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-surface-2"
        >
          Share
        </button>
      </div>
    </div>
  );
}
