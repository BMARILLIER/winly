/**
 * Revenue Engine — estimates creator earning potential.
 *
 * Uses followers, engagement rate, and content performance
 * to compute monetization estimates. Falls back to smart
 * estimation when real data is unavailable.
 */

// --- Types ---

export interface RevenueInput {
  followers: number;
  engagementRate: number; // 0-1
  avgLikes: number;
  avgComments: number;
  mediaCount: number;
  niche: string;
  monthlyGrowth: number; // absolute follower change
}

export interface RevenueReport {
  // Monthly earning range
  monthlyEarningsMin: number;
  monthlyEarningsMax: number;

  // Per-post value
  postValueMin: number;
  postValueMax: number;

  // Account value score (0-100)
  accountValueScore: number;

  // Growth potential label
  growthPotential: "explosive" | "strong" | "moderate" | "early";
  growthPotentialLabel: string;

  // Breakdown context
  tier: string;
  tierLabel: string;
}

// --- Niche multipliers (some niches pay more) ---

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

// --- Tier classification ---

function getTier(followers: number): { tier: string; tierLabel: string; baseCPM: number } {
  if (followers >= 1_000_000)
    return { tier: "mega", tierLabel: "Mega Influencer", baseCPM: 25 };
  if (followers >= 500_000)
    return { tier: "macro", tierLabel: "Macro Influencer", baseCPM: 18 };
  if (followers >= 100_000)
    return { tier: "mid", tierLabel: "Mid-Tier", baseCPM: 14 };
  if (followers >= 10_000)
    return { tier: "micro", tierLabel: "Micro Influencer", baseCPM: 10 };
  if (followers >= 1_000)
    return { tier: "nano", tierLabel: "Nano Influencer", baseCPM: 6 };
  return { tier: "starter", tierLabel: "Starter", baseCPM: 3 };
}

// --- Growth potential ---

function getGrowthPotential(
  engagementRate: number,
  monthlyGrowth: number,
  followers: number
): { potential: RevenueReport["growthPotential"]; label: string } {
  const growthRate = followers > 0 ? monthlyGrowth / followers : 0;

  if (engagementRate >= 0.06 && growthRate >= 0.05)
    return { potential: "explosive", label: "Croissance explosive" };
  if (engagementRate >= 0.04 || growthRate >= 0.03)
    return { potential: "strong", label: "Fort potentiel" };
  if (engagementRate >= 0.02 || growthRate >= 0.01)
    return { potential: "moderate", label: "Potentiel modere" };
  return { potential: "early", label: "Phase de lancement" };
}

// --- Main computation ---

export function computeRevenue(input: RevenueInput): RevenueReport {
  const { followers, engagementRate, avgLikes, avgComments, niche, monthlyGrowth } = input;
  const { tier, tierLabel, baseCPM } = getTier(followers);

  const nicheMultiplier = NICHE_MULTIPLIERS[niche] ?? 1.0;

  // Engagement multiplier: higher engagement = more value
  const engagementMultiplier = Math.min(2.5, Math.max(0.5, engagementRate * 100 / 3));

  // Effective CPM (cost per mille)
  const effectiveCPM = baseCPM * nicheMultiplier * engagementMultiplier;

  // Estimated reach per post (followers * engagement * reach factor)
  const reachPerPost = followers * Math.min(0.6, engagementRate * 8 + 0.1);

  // Post value range
  const postValueBase = (reachPerPost / 1000) * effectiveCPM;
  const postValueMin = Math.round(postValueBase * 0.7);
  const postValueMax = Math.round(postValueBase * 1.4);

  // Monthly earnings (assume 8-12 posts/month for brand deals)
  const postsPerMonth = 4; // conservative: collabs per month
  const monthlyEarningsMin = Math.round(postValueMin * postsPerMonth * 0.6);
  const monthlyEarningsMax = Math.round(postValueMax * postsPerMonth * 1.2);

  // Account value score (0-100)
  // Weighted: followers (30%), engagement (40%), content volume (15%), niche (15%)
  const followerScore = Math.min(100, Math.log10(Math.max(1, followers)) * 20);
  const engagementScore = Math.min(100, engagementRate * 100 * 15);
  const volumeScore = Math.min(100, (avgLikes + avgComments * 3) / Math.max(1, followers) * 800);
  const nicheScore = Math.min(100, nicheMultiplier * 60);

  const accountValueScore = Math.round(
    followerScore * 0.3 +
    engagementScore * 0.4 +
    volumeScore * 0.15 +
    nicheScore * 0.15
  );

  const { potential, label } = getGrowthPotential(engagementRate, monthlyGrowth, followers);

  return {
    monthlyEarningsMin: Math.max(50, monthlyEarningsMin),
    monthlyEarningsMax: Math.max(100, monthlyEarningsMax),
    postValueMin: Math.max(10, postValueMin),
    postValueMax: Math.max(25, postValueMax),
    accountValueScore: Math.min(100, Math.max(0, accountValueScore)),
    growthPotential: potential,
    growthPotentialLabel: label,
    tier,
    tierLabel,
  };
}

// --- Smart fallback estimation ---

export function estimateRevenue(niche: string): RevenueReport {
  return computeRevenue({
    followers: 5000,
    engagementRate: 0.035,
    avgLikes: 120,
    avgComments: 15,
    mediaCount: 50,
    niche,
    monthlyGrowth: 200,
  });
}
