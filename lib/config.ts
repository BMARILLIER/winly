/**
 * Application-wide configuration constants.
 *
 * Environment-independent values that control app behavior.
 * For workspace-specific constants, see lib/workspace-constants.ts.
 */

// ─── Feature Flags ───

export const FEATURES = {
  /** Enable real API connectors (currently all mocked) */
  LIVE_CONNECTORS: false,
  /** Enable real-time data fetching from social platforms */
  LIVE_ANALYTICS: false,
  /** Enable marketplace transactions (currently UI-only) */
  MARKETPLACE_ENABLED: false,
  /** Enable private beta gating on registration */
  BETA_ENABLED: false,
} as const;

// ─── Beta Limits ───

export const BETA_MAX_USERS = 200;

// ─── Score Thresholds ───

export const SCORE_THRESHOLDS = {
  HIGH: 70,
  MEDIUM: 40,
} as const;

// ─── Grade Scale (shared across modules) ───

export function getGrade(score: number): string {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  if (score >= 50) return "D";
  return "F";
}

export function getScoreLevel(score: number): "high" | "medium" | "low" {
  if (score >= SCORE_THRESHOLDS.HIGH) return "high";
  if (score >= SCORE_THRESHOLDS.MEDIUM) return "medium";
  return "low";
}

// ─── Color Helpers (for UI) ───

export function scoreColorClass(score: number): string {
  if (score >= SCORE_THRESHOLDS.HIGH) return "text-success";
  if (score >= SCORE_THRESHOLDS.MEDIUM) return "text-warning";
  return "text-danger";
}

export function scoreColorHex(score: number): string {
  if (score >= SCORE_THRESHOLDS.HIGH) return "#22c55e";
  if (score >= SCORE_THRESHOLDS.MEDIUM) return "#f59e0b";
  return "#ef4444";
}
