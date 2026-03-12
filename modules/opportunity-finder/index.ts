// ---------------------------------------------------------------------------
// Opportunity Finder Module
// Détecte les sujets sous-exploités dans une niche
// Logique : engagement élevé + volume faible = opportunité forte
// Source de données : Creator Graph
// ---------------------------------------------------------------------------

import type { Niche } from "@/types";
import { getTopOpportunities, getAllNodes } from "@/lib/creator-graph";

export interface ContentOpportunity {
  id: string;
  title: string;
  niche: Niche;
  score: number;              // 0-100
  competition: "faible" | "moyenne" | "élevée";
  potential: "élevé" | "moyen" | "faible";
  recommendation: string;
  engagementLevel: number;    // 0-100  (engagement observé)
  volumeLevel: number;        // 0-100  (volume de contenu existant)
  format: string;
  hookType: string;
  duration: string;
}

function getCompetition(volume: number): ContentOpportunity["competition"] {
  if (volume <= 30) return "faible";
  if (volume <= 60) return "moyenne";
  return "élevée";
}

function getPotential(score: number): ContentOpportunity["potential"] {
  if (score >= 70) return "élevé";
  if (score >= 45) return "moyen";
  return "faible";
}

// ── Main Export ──
// Source de données : Creator Graph (lib/creator-graph.ts)

export function findOpportunities(niche?: Niche): ContentOpportunity[] {
  const nodes = niche ? getTopOpportunities(niche, 50) : getTopOpportunities(undefined, 50);

  return nodes.map((n) => ({
    id: n.id,
    title: n.title,
    niche: n.niche,
    score: n.opportunityScore,
    competition: getCompetition(n.volume),
    potential: getPotential(n.opportunityScore),
    recommendation: n.recommendation,
    engagementLevel: n.engagement,
    volumeLevel: n.volume,
    format: n.format,
    hookType: n.hookType,
    duration: n.duration,
  }));
}

// ── Style constants ──

export const COMPETITION_STYLES: Record<ContentOpportunity["competition"], { label: string; color: string }> = {
  faible: { label: "Faible", color: "bg-green-100 text-green-700" },
  moyenne: { label: "Moyenne", color: "bg-amber-100 text-amber-700" },
  élevée: { label: "Élevée", color: "bg-red-100 text-red-700" },
};

export const POTENTIAL_STYLES: Record<ContentOpportunity["potential"], { label: string; color: string }> = {
  élevé: { label: "Élevé", color: "text-success" },
  moyen: { label: "Moyen", color: "text-warning" },
  faible: { label: "Faible", color: "text-text-muted" },
};
