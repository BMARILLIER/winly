/**
 * Creator Score Engine
 *
 * Calculates a global creator score (0-100) from 5 weighted factors,
 * using only local data (workspace activity, content, audits, missions).
 * No external API calls.
 */

// --- Types ---

export interface CreatorScoreInput {
  // Content activity
  totalContent: number;
  publishedContent: number;
  draftContent: number;
  readyContent: number;
  scheduledContent: number;
  // Workspace config
  postFrequency: string;
  socialProfileCount: number;
  // Hooks
  savedHooks: number;
  // Audit & score history
  latestAuditScore: number | null;
  latestWinlyScore: number | null;
  // Missions
  completedMissions: number;
  totalXp: number;
  // Instagram (optional — enriches scoring when connected)
  igConnected?: boolean;
  igFollowers?: number;
  igEngagementRate?: number; // 0-1 ratio
  igMediaCount?: number;
  igTotalSaved?: number;
}

export interface CreatorScoreReport {
  score: number;
  engagementScore: number;
  growthScore: number;
  consistencyScore: number;
  performanceScore: number;
  profileScore: number;
  details: FactorDetail[];
  grade: string;
  advice: string;
}

export interface FactorDetail {
  id: string;
  label: string;
  score: number;
  weight: number;
  description: string;
}

// --- Weights (sum = 1.0) ---

const WEIGHTS = {
  engagement: 0.25,
  growth: 0.20,
  consistency: 0.25,
  performance: 0.20,
  profile: 0.10,
} as const;

// --- Scoring functions ---

/**
 * Engagement Score — measures content quality signals.
 * Based on: hooks saved, audit score, published content ratio.
 */
function scoreEngagement(input: CreatorScoreInput): number {
  let score = 0;

  // Hooks saved = proxy for content quality work
  if (input.savedHooks >= 10) score += 30;
  else if (input.savedHooks >= 5) score += 20;
  else if (input.savedHooks >= 1) score += 10;

  // Audit score reflects profile quality
  if (input.latestAuditScore !== null) {
    score += Math.min(input.latestAuditScore, 100) * 0.4;
  }

  // Published ratio — higher means content reaches audience
  if (input.totalContent > 0) {
    const publishedRatio = input.publishedContent / input.totalContent;
    score += publishedRatio * 30;
  }

  // Instagram engagement rate bonus (real-world signal)
  if (input.igEngagementRate != null && input.igEngagementRate > 0) {
    const rate = input.igEngagementRate * 100; // convert to percentage
    if (rate >= 5) score += 20;
    else if (rate >= 3) score += 15;
    else if (rate >= 1) score += 10;
    else score += 5;
  }

  return Math.round(Math.min(score, 100));
}

/**
 * Growth Score — measures expansion activity.
 * Based on: total content created, content diversity, XP earned.
 */
function scoreGrowth(input: CreatorScoreInput): number {
  let score = 0;

  // Content volume
  if (input.totalContent >= 20) score += 35;
  else if (input.totalContent >= 10) score += 25;
  else if (input.totalContent >= 5) score += 15;
  else if (input.totalContent >= 1) score += 5;

  // XP from missions = active growth
  if (input.totalXp >= 500) score += 35;
  else if (input.totalXp >= 200) score += 25;
  else if (input.totalXp >= 50) score += 15;
  else if (input.totalXp >= 10) score += 5;

  // Content pipeline depth (drafts + ready)
  const pipeline = input.draftContent + input.readyContent;
  if (pipeline >= 5) score += 30;
  else if (pipeline >= 3) score += 20;
  else if (pipeline >= 1) score += 10;

  // Instagram follower milestone bonus
  if (input.igFollowers != null && input.igFollowers > 0) {
    if (input.igFollowers >= 10_000) score += 15;
    else if (input.igFollowers >= 1_000) score += 10;
    else if (input.igFollowers >= 100) score += 5;
  }

  return Math.round(Math.min(score, 100));
}

/**
 * Consistency Score — measures regularity.
 * Based on: post frequency setting, scheduled content, missions completed.
 */
function scoreConsistency(input: CreatorScoreInput): number {
  let score = 0;

  // Post frequency ambition
  const freqScores: Record<string, number> = {
    daily: 25,
    few_per_week: 20,
    weekly: 15,
    few_per_month: 10,
    irregular: 5,
  };
  score += freqScores[input.postFrequency] ?? 10;

  // Scheduled content = planned consistency
  if (input.scheduledContent >= 7) score += 35;
  else if (input.scheduledContent >= 3) score += 25;
  else if (input.scheduledContent >= 1) score += 15;

  // Missions completed = daily engagement
  if (input.completedMissions >= 20) score += 40;
  else if (input.completedMissions >= 10) score += 30;
  else if (input.completedMissions >= 5) score += 20;
  else if (input.completedMissions >= 1) score += 10;

  return Math.round(Math.min(score, 100));
}

/**
 * Performance Score — measures content effectiveness.
 * Based on: Winly Score, content progression rate, audit score.
 */
function scorePerformance(input: CreatorScoreInput): number {
  let score = 0;

  // Winly Score is a direct performance measure
  if (input.latestWinlyScore !== null) {
    score += Math.min(input.latestWinlyScore, 100) * 0.5;
  }

  // Content status progression: idea → draft → ready → published
  if (input.totalContent > 0) {
    const advancedRatio =
      (input.readyContent + input.publishedContent) / input.totalContent;
    score += advancedRatio * 30;
  }

  // Having both an audit and a score = thorough analysis
  if (input.latestAuditScore !== null && input.latestWinlyScore !== null) {
    score += 20;
  } else if (
    input.latestAuditScore !== null ||
    input.latestWinlyScore !== null
  ) {
    score += 10;
  }

  return Math.round(Math.min(score, 100));
}

/**
 * Profile Score — measures profile completeness.
 * Based on: social profiles connected, hooks library, workspace setup.
 */
function scoreProfile(input: CreatorScoreInput): number {
  let score = 0;

  // Social profiles connected
  if (input.socialProfileCount >= 3) score += 40;
  else if (input.socialProfileCount >= 2) score += 30;
  else if (input.socialProfileCount >= 1) score += 20;

  // Hooks library = prepared creator
  if (input.savedHooks >= 5) score += 30;
  else if (input.savedHooks >= 1) score += 15;

  // Has audit = cares about profile quality
  if (input.latestAuditScore !== null) score += 30;

  // Instagram connected = real platform presence
  if (input.igConnected) score += 10;

  return Math.round(Math.min(score, 100));
}

// --- Grade & advice ---

function getGrade(score: number): string {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  if (score >= 50) return "D";
  return "F";
}

function getAdvice(score: number, details: FactorDetail[]): string {
  if (score >= 80)
    return "Excellent profil créateur. Continuez à produire et à engager régulièrement.";
  if (score >= 60) {
    const weakest = details.reduce((a, b) => (a.score < b.score ? a : b));
    return `Bonne progression. Concentrez-vous sur l'amélioration de votre ${weakest.label.toLowerCase()} pour passer au niveau supérieur.`;
  }
  if (score >= 40)
    return "Vous construisez votre élan. Complétez plus de missions, publiez du contenu et lancez des audits pour booster votre score.";
  return "Vous débutez. Créez du contenu, complétez les missions quotidiennes et lancez votre premier audit.";
}

// --- Main engine ---

export function computeCreatorScore(
  input: CreatorScoreInput
): CreatorScoreReport {
  const engagementScore = scoreEngagement(input);
  const growthScore = scoreGrowth(input);
  const consistencyScore = scoreConsistency(input);
  const performanceScore = scorePerformance(input);
  const profileScore = scoreProfile(input);

  const details: FactorDetail[] = [
    {
      id: "engagement",
      label: "Engagement",
      score: engagementScore,
      weight: WEIGHTS.engagement,
      description: "Signaux de qualité de contenu et potentiel d'interaction avec l'audience",
    },
    {
      id: "growth",
      label: "Growth",
      score: growthScore,
      weight: WEIGHTS.growth,
      description: "Volume de contenu et activité d'expansion",
    },
    {
      id: "consistency",
      label: "Régularité",
      score: consistencyScore,
      weight: WEIGHTS.consistency,
      description: "Régularité de publication et engagement quotidien",
    },
    {
      id: "performance",
      label: "Performance",
      score: performanceScore,
      weight: WEIGHTS.performance,
      description: "Efficacité du contenu et scores d'évaluation",
    },
    {
      id: "profile",
      label: "Profil",
      score: profileScore,
      weight: WEIGHTS.profile,
      description: "Complétude du profil et qualité de la configuration",
    },
  ];

  const score = Math.round(
    details.reduce((sum, d) => sum + d.score * d.weight, 0)
  );

  return {
    score,
    engagementScore,
    growthScore,
    consistencyScore,
    performanceScore,
    profileScore,
    details,
    grade: getGrade(score),
    advice: getAdvice(score, details),
  };
}
