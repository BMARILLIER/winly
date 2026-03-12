// ---------------------------------------------------------------------------
// Score Card Module
// Generate visual score cards for sharing
// ---------------------------------------------------------------------------

export interface ScoreCardData {
  username: string;
  platform: string;
  niche: string;
  level: string;
  globalScore: number;
  grade: string;
  pillars: ScoreCardPillar[];
  topAchievement: string | null;
  date: string;
}

export interface ScoreCardPillar {
  label: string;
  score: number;
}

export function getGrade(score: number): string {
  if (score >= 90) return "S";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 55) return "C";
  if (score >= 40) return "D";
  return "F";
}

export function getGradeColor(grade: string): { bg: string; text: string; border: string } {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    S: { bg: "#fbbf24", text: "#78350f", border: "#f59e0b" },
    A: { bg: "#34d399", text: "#064e3b", border: "#10b981" },
    B: { bg: "#60a5fa", text: "#1e3a5f", border: "#3b82f6" },
    C: { bg: "#fbbf24", text: "#78350f", border: "#f59e0b" },
    D: { bg: "#fb923c", text: "#7c2d12", border: "#f97316" },
    F: { bg: "#f87171", text: "#7f1d1d", border: "#ef4444" },
  };
  return colors[grade] ?? colors.F;
}

export function getScoreBarColor(score: number): string {
  if (score >= 80) return "#8b5cf6";
  if (score >= 60) return "#3b82f6";
  if (score >= 40) return "#f59e0b";
  return "#ef4444";
}

export const PLATFORM_LABELS: Record<string, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  twitter: "Twitter / X",
  linkedin: "LinkedIn",
  youtube: "YouTube",
};

export const CARD_THEMES = [
  { id: "dark", label: "Sombre", bg: "#111827", text: "#f9fafb", subtle: "#6b7280", card: "#1f2937" },
  { id: "light", label: "Clair", bg: "#ffffff", text: "#111827", subtle: "#9ca3af", card: "#f3f4f6" },
  { id: "violet", label: "Violet", bg: "#2e1065", text: "#f5f3ff", subtle: "#a78bfa", card: "#3b0764" },
  { id: "ocean", label: "Océan", bg: "#0c4a6e", text: "#f0f9ff", subtle: "#7dd3fc", card: "#075985" },
] as const;

export type CardTheme = (typeof CARD_THEMES)[number];
