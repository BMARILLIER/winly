/**
 * Deal Analyzer — instant brand deal evaluation.
 *
 * Computes fair price for a content deliverable based on
 * followers, engagement rate, and content type.
 * Compares with the proposed price to give a verdict.
 */

// --- Types ---

export type ContentType = "post" | "reel" | "story";

export type Verdict = "underpaid" | "fair" | "good";

export interface DealInput {
  proposedPrice: number;
  contentType: ContentType;
  deliverables: number; // number of pieces
}

export interface CreatorProfile {
  followers: number;
  engagementRate: number; // 0-1
  niche: string;
}

export interface DealAnalysis {
  verdict: Verdict;
  verdictLabel: string;
  verdictEmoji: string;

  fairPricePerUnit: number;
  fairPriceTotal: number;
  suggestedPrice: number;

  proposedPrice: number;
  deliverables: number;
  contentType: ContentType;

  // How far off the proposed price is (negative = underpaid)
  diffPercent: number;
  explanation: string;
}

// --- Content type factors ---

const CONTENT_FACTORS: Record<ContentType, { factor: number; label: string }> = {
  post: { factor: 0.02, label: "Post" },
  reel: { factor: 0.03, label: "Reel" },
  story: { factor: 0.01, label: "Story" },
};

// --- Niche multipliers (reuse from revenue module) ---

const NICHE_MULTIPLIERS: Record<string, number> = {
  finance: 1.8,
  business: 1.6,
  entrepreneurship: 1.5,
  tech: 1.4,
  beauty: 1.3,
  fashion: 1.3,
  health: 1.2,
  fitness: 1.2,
  food: 1.1,
  travel: 1.1,
  lifestyle: 1.0,
  education: 1.0,
  entertainment: 0.9,
  gaming: 0.9,
  art: 0.85,
  music: 0.85,
  other: 1.0,
};

// --- Main computation ---

export function analyzeDeal(
  deal: DealInput,
  creator: CreatorProfile
): DealAnalysis {
  const { proposedPrice, contentType, deliverables } = deal;
  const { followers, engagementRate, niche } = creator;

  const contentFactor = CONTENT_FACTORS[contentType].factor;
  const nicheMultiplier = NICHE_MULTIPLIERS[niche] ?? 1.0;

  // Base fair price per unit
  // = followers * engagement_rate * content_factor * niche_multiplier
  const rawFairPrice = followers * engagementRate * contentFactor * nicheMultiplier;

  // Floor: minimum viable price per content type
  const minPrices: Record<ContentType, number> = {
    post: 25,
    reel: 40,
    story: 15,
  };
  const fairPricePerUnit = Math.max(minPrices[contentType], Math.round(rawFairPrice));
  const fairPriceTotal = fairPricePerUnit * deliverables;

  // Suggested price: slightly above fair (creator should aim high)
  const suggestedPrice = Math.round(fairPriceTotal * 1.15);

  // Compare proposed vs fair
  const ratio = fairPriceTotal > 0 ? proposedPrice / fairPriceTotal : 1;
  const diffPercent = Math.round((ratio - 1) * 100);

  // Verdict
  let verdict: Verdict;
  let verdictLabel: string;
  let verdictEmoji: string;
  let explanation: string;

  if (ratio < 0.7) {
    verdict = "underpaid";
    verdictLabel = "Sous-paye";
    verdictEmoji = "x";
    const underPercent = Math.abs(diffPercent);
    explanation = `Ce deal est ${underPercent}% en dessous de votre valeur. Negociez a la hausse ou refusez.`;
  } else if (ratio <= 1.3) {
    verdict = "fair";
    verdictLabel = "Deal correct";
    verdictEmoji = "~";
    if (ratio >= 1.0) {
      explanation = `Prix aligné avec votre valeur. Deal acceptable${ratio >= 1.15 ? ", plutot favorable" : ""}.`;
    } else {
      const underPercent = Math.abs(diffPercent);
      explanation = `Legerement en dessous (-${underPercent}%), mais dans la fourchette acceptable.`;
    }
  } else {
    verdict = "good";
    verdictLabel = "Bonne opportunite";
    verdictEmoji = "check";
    explanation = `Ce deal est ${diffPercent}% au-dessus de votre valeur marche. Foncez !`;
  }

  return {
    verdict,
    verdictLabel,
    verdictEmoji,
    fairPricePerUnit,
    fairPriceTotal,
    suggestedPrice,
    proposedPrice,
    deliverables,
    contentType,
    diffPercent,
    explanation,
  };
}

// --- Fallback creator profile ---

export function getDefaultCreatorProfile(niche: string): CreatorProfile {
  return {
    followers: 5000,
    engagementRate: 0.035,
    niche,
  };
}
