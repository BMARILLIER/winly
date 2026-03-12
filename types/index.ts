/**
 * Shared types used across multiple modules.
 *
 * Centralizes domain types that were previously defined in market-intelligence
 * and imported by growth-simulator, social-radar, UI components, etc.
 *
 * Modules should import shared types from here:
 *   import type { Niche, ContentFormat, Platform } from "@/types";
 */

// ─── Content & Creator Domain ───

export type Niche =
  | "entrepreneurship"
  | "fitness"
  | "tech"
  | "lifestyle"
  | "finance"
  | "marketing"
  | "wellness"
  | "travel";

export type ContentFormat =
  | "carousel"
  | "reel"
  | "static_image"
  | "story"
  | "video"
  | "thread"
  | "live";

export type Platform = "instagram" | "tiktok" | "twitter" | "linkedin" | "youtube";

export type AudienceTier =
  | "nano"      // <5k
  | "micro"     // 5k-25k
  | "mid"       // 25k-100k
  | "macro"     // 100k-500k
  | "mega";     // 500k+

// ─── Shared Scoring ───

export type ImpactLevel = "high" | "medium" | "low";
export type Urgency = "high" | "medium" | "low";
export type TrendDirection = "rising" | "stable" | "fading";

// ─── Label Helpers ───

const FORMAT_LABELS: Record<ContentFormat, string> = {
  carousel: "Carousel",
  reel: "Reel",
  static_image: "Static Image",
  story: "Story",
  video: "Video",
  thread: "Thread",
  live: "Live",
};

export function formatLabel(format: ContentFormat): string {
  return FORMAT_LABELS[format] ?? format;
}

const NICHE_LABELS: Record<Niche, string> = {
  entrepreneurship: "Entrepreneurship",
  fitness: "Fitness",
  tech: "Tech",
  lifestyle: "Lifestyle",
  finance: "Finance",
  marketing: "Marketing",
  wellness: "Wellness",
  travel: "Travel",
};

export function nicheLabel(niche: Niche): string {
  return NICHE_LABELS[niche] ?? niche;
}

const TIER_LABELS: Record<AudienceTier, string> = {
  nano: "<5K",
  micro: "5K-25K",
  mid: "25K-100K",
  macro: "100K-500K",
  mega: "500K+",
};

export function tierLabel(tier: AudienceTier): string {
  return TIER_LABELS[tier] ?? tier;
}
