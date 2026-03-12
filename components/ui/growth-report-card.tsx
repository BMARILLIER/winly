"use client";

import { useRef, useState, useCallback } from "react";
import type { GrowthReportData } from "@/modules/report";
import { getGradeColor, CARD_THEMES } from "@/modules/share";
import type { CardTheme } from "@/modules/share";

interface Props {
  data: GrowthReportData;
}

// Accent purple used across Winly
const ACCENT = "#8b5cf6";
const ACCENT_DIM = "rgba(139, 92, 246, 0.25)";

function urgencyColor(u: string): string {
  if (u === "high") return "#ef4444";
  if (u === "medium") return "#f59e0b";
  return "#22c55e";
}

export function GrowthReportCard({ data }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [theme, setTheme] = useState<CardTheme>(CARD_THEMES[0]);
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [textCopied, setTextCopied] = useState(false);

  const drawCard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 640;
    const H = 520;
    canvas.width = W * 2;
    canvas.height = H * 2;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.scale(2, 2);

    const t = theme;
    const gc = getGradeColor(data.growthGrade);

    // ── Background ──
    ctx.fillStyle = t.bg;
    ctx.beginPath();
    ctx.roundRect(0, 0, W, H, 20);
    ctx.fill();

    // Gradient overlay
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "rgba(139, 92, 246, 0.06)");
    grad.addColorStop(0.5, "rgba(139, 92, 246, 0.02)");
    grad.addColorStop(1, "rgba(139, 92, 246, 0.12)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // ── Header ──
    ctx.fillStyle = t.text;
    ctx.font = "bold 24px system-ui, -apple-system, sans-serif";
    ctx.fillText("WINLY", 36, 48);

    ctx.fillStyle = ACCENT;
    ctx.font = "600 14px system-ui, -apple-system, sans-serif";
    ctx.fillText("Growth Report", 120, 48);

    ctx.textAlign = "right";
    ctx.fillStyle = t.subtle;
    ctx.font = "12px system-ui, -apple-system, sans-serif";
    ctx.fillText(data.date, W - 36, 48);
    ctx.textAlign = "left";

    // Divider
    ctx.strokeStyle = t.subtle + "33";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(36, 64);
    ctx.lineTo(W - 36, 64);
    ctx.stroke();

    // ── User info ──
    ctx.fillStyle = t.text;
    ctx.font = "bold 20px system-ui, -apple-system, sans-serif";
    ctx.fillText(data.username, 36, 96);

    ctx.fillStyle = t.subtle;
    ctx.font = "13px system-ui, -apple-system, sans-serif";
    ctx.fillText(`${data.platform} · ${data.niche}`, 36, 116);

    // ── Growth Score Ring ──
    const ringX = W / 2;
    const ringY = 195;
    const ringR = 58;

    // Background ring
    ctx.beginPath();
    ctx.arc(ringX, ringY, ringR, Math.PI * 0.75, Math.PI * 2.25);
    ctx.strokeStyle = t.subtle + "22";
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.stroke();

    // Score ring
    const scoreAngle = Math.PI * 0.75 + (data.growthScore / 100) * Math.PI * 1.5;
    ctx.beginPath();
    ctx.arc(ringX, ringY, ringR, Math.PI * 0.75, scoreAngle);
    ctx.strokeStyle = ACCENT;
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.stroke();

    // Score number
    ctx.fillStyle = t.text;
    ctx.font = "bold 40px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(String(data.growthScore), ringX, ringY + 12);

    ctx.fillStyle = t.subtle;
    ctx.font = "12px system-ui, -apple-system, sans-serif";
    ctx.fillText("Growth Score", ringX, ringY + 30);
    ctx.textAlign = "left";

    // Grade badge
    const gradeX = ringX + ringR + 24;
    const gradeY = ringY - 10;
    ctx.beginPath();
    ctx.arc(gradeX, gradeY, 22, 0, Math.PI * 2);
    ctx.fillStyle = gc.bg;
    ctx.fill();
    ctx.strokeStyle = gc.border;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = gc.text;
    ctx.font = "bold 20px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(data.growthGrade, gradeX, gradeY + 7);
    ctx.textAlign = "left";

    // Label badge
    const labelColor = data.growthLabel === "High" ? "#22c55e" : data.growthLabel === "Medium" ? "#f59e0b" : "#ef4444";
    ctx.fillStyle = labelColor + "22";
    const labelW = ctx.measureText(data.growthLabel).width + 20;
    ctx.beginPath();
    ctx.roundRect(ringX - labelW / 2, ringY + 40, labelW, 24, 12);
    ctx.fill();
    ctx.fillStyle = labelColor;
    ctx.font = "bold 12px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(data.growthLabel, ringX, ringY + 56);
    ctx.textAlign = "left";

    // ── Metrics Grid (2x2) ──
    const gridTop = 280;
    const gridLeft = 36;
    const cellW = (W - 72 - 20) / 2;
    const cellH = 80;

    const metrics = [
      { icon: "★", label: "Top Strength", value: data.topStrength.label, sub: `${data.topStrength.score}/100` },
      { icon: "⚡", label: "Viral Potential", value: `${data.viralPotential}/100`, sub: viralLabel(data.viralPotential) },
      { icon: "🕐", label: "Best Posting Time", value: data.bestPostingTime, sub: "" },
      { icon: "🎯", label: "Biggest Opportunity", value: truncate(data.biggestOpportunity.title, 28), sub: data.biggestOpportunity.urgency + " urgency" },
    ];

    metrics.forEach((m, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = gridLeft + col * (cellW + 20);
      const y = gridTop + row * (cellH + 12);

      // Cell bg
      ctx.fillStyle = t.card;
      ctx.beginPath();
      ctx.roundRect(x, y, cellW, cellH, 12);
      ctx.fill();

      // Border
      ctx.strokeStyle = ACCENT_DIM;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(x, y, cellW, cellH, 12);
      ctx.stroke();

      // Icon + label
      ctx.fillStyle = t.subtle;
      ctx.font = "12px system-ui, -apple-system, sans-serif";
      ctx.fillText(`${m.icon}  ${m.label}`, x + 14, y + 24);

      // Value
      ctx.fillStyle = t.text;
      ctx.font = "bold 15px system-ui, -apple-system, sans-serif";
      ctx.fillText(m.value, x + 14, y + 48);

      // Sub
      if (m.sub) {
        ctx.fillStyle = t.subtle;
        ctx.font = "11px system-ui, -apple-system, sans-serif";
        ctx.fillText(m.sub, x + 14, y + 66);
      }
    });

    // ── Footer ──
    ctx.fillStyle = t.subtle + "88";
    ctx.font = "10px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Generated with Winly — winly.app", W / 2, H - 14);
    ctx.textAlign = "left";
  }, [data, theme]);

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
    link.download = `winly-growth-report-${data.date.replace(/\s+/g, "-")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  }

  async function handleCopyImage() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (blob) {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      handleDownload();
    }
  }

  function handleCopyText() {
    navigator.clipboard.writeText(data.summaryText);
    setTextCopied(true);
    setTimeout(() => setTextCopied(false), 2000);
  }

  async function handleShare() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (blob && navigator.share) {
        const file = new File([blob], `winly-growth-report.png`, { type: "image/png" });
        await navigator.share({
          title: `My Winly Growth Report: ${data.growthScore}/100`,
          text: data.summaryText,
          files: [file],
        });
      } else {
        await handleCopyImage();
      }
    } catch {
      // cancelled
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
        <canvas ref={canvasCallback} className="rounded-2xl shadow-lg max-w-full" />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={handleDownload}
          className="rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
        >
          {downloaded ? "Downloaded!" : "Download Image"}
        </button>
        <button
          onClick={handleCopyText}
          className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-surface-2 transition-colors"
        >
          {textCopied ? "Copied!" : "Copy Summary"}
        </button>
        <button
          onClick={handleCopyImage}
          className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-surface-2 transition-colors"
        >
          {copied ? "Copied!" : "Copy Image"}
        </button>
        <button
          onClick={handleShare}
          className="rounded-xl border border-accent text-accent px-5 py-2.5 text-sm font-medium hover:bg-accent-muted transition-colors"
        >
          Share
        </button>
      </div>
    </div>
  );
}

function viralLabel(score: number): string {
  if (score >= 75) return "Very High";
  if (score >= 50) return "Promising";
  if (score >= 25) return "Moderate";
  return "Low";
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}
