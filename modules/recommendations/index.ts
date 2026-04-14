/**
 * Recommendations Engine — actionable "what to do next" insights.
 *
 * Simple rule-based system using available data signals.
 * Returns 3-5 prioritized actions with clear CTAs.
 */

// --- Types ---

export interface RecommendationInput {
  followers: number;
  engagementRate: number; // 0-1
  postsLast30d: number;
  avgLikes: number;
  avgComments: number;
  topFormat: string | null; // "reel", "carousel", etc.
  monthlyGrowth: number;
  weeklyGrowth: number;
  mediaByType: { type: string; count: number; avgLikes: number; avgReach: number }[];
  hasInstagram: boolean;
}

export interface Recommendation {
  id: string;
  icon: "trending-up" | "alert-triangle" | "zap" | "target" | "calendar" | "heart" | "eye";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  category: "growth" | "engagement" | "content" | "monetization" | "consistency";
}

// --- Rule engine ---

export function generateRecommendations(input: RecommendationInput): Recommendation[] {
  const recs: Recommendation[] = [];

  // 1. Engagement analysis
  const engPercent = input.engagementRate * 100;
  if (engPercent < 2) {
    recs.push({
      id: "low-engagement",
      icon: "alert-triangle",
      title: "Engagement critique",
      description: `Votre taux (${engPercent.toFixed(1)}%) est bas. Ajoutez un CTA dans chaque post et posez des questions a votre audience.`,
      impact: "high",
      category: "engagement",
    });
  } else if (engPercent >= 5) {
    recs.push({
      id: "high-engagement",
      icon: "zap",
      title: "Engagement exceptionnel",
      description: `${engPercent.toFixed(1)}% — vous etes dans le top 10%. Monetisez avec des collaborations brand.`,
      impact: "high",
      category: "monetization",
    });
  }

  // 2. Posting frequency
  if (input.postsLast30d < 8) {
    recs.push({
      id: "post-more",
      icon: "calendar",
      title: "Publiez plus regulierement",
      description: `${input.postsLast30d} posts en 30j — visez 12+ pour rester visible. Batch-creez le dimanche.`,
      impact: "high",
      category: "consistency",
    });
  } else if (input.postsLast30d >= 20) {
    recs.push({
      id: "post-consistent",
      icon: "target",
      title: "Rythme excellent",
      description: `${input.postsLast30d} posts/mois — gardez ce rythme. Focus sur la qualite de chaque post.`,
      impact: "low",
      category: "consistency",
    });
  }

  // 3. Format optimization
  if (input.mediaByType.length > 1) {
    const sorted = [...input.mediaByType].sort((a, b) => b.avgLikes - a.avgLikes);
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];
    if (best && worst && best.type !== worst.type) {
      const improvement = worst.avgLikes > 0
        ? Math.round(((best.avgLikes - worst.avgLikes) / worst.avgLikes) * 100)
        : 100;
      if (improvement > 30) {
        const formatLabels: Record<string, string> = {
          VIDEO: "Reels",
          CAROUSEL_ALBUM: "Carrousels",
          IMAGE: "Photos",
          REEL: "Reels",
        };
        recs.push({
          id: "format-switch",
          icon: "trending-up",
          title: `Les ${formatLabels[best.type] ?? best.type} performent ${improvement}% mieux`,
          description: `Doublez vos ${(formatLabels[best.type] ?? best.type).toLowerCase()} — ils generent plus d'engagement que vos ${(formatLabels[worst.type] ?? worst.type).toLowerCase()}.`,
          impact: "medium",
          category: "content",
        });
      }
    }
  }

  // 4. Growth signal
  if (input.monthlyGrowth > 0) {
    const growthRate = input.followers > 0 ? (input.monthlyGrowth / input.followers) * 100 : 0;
    if (growthRate >= 5) {
      recs.push({
        id: "growth-spike",
        icon: "trending-up",
        title: "Croissance en acceleration",
        description: `+${input.monthlyGrowth} followers ce mois (+${growthRate.toFixed(1)}%). Capitalisez en augmentant la frequence.`,
        impact: "high",
        category: "growth",
      });
    } else if (growthRate < 1 && input.followers > 500) {
      recs.push({
        id: "growth-stagnant",
        icon: "alert-triangle",
        title: "Croissance en stagnation",
        description: "Moins de 1% de croissance. Testez de nouveaux sujets et collaborez avec d'autres createurs.",
        impact: "medium",
        category: "growth",
      });
    }
  }

  // 5. Instagram not connected
  if (!input.hasInstagram) {
    recs.push({
      id: "connect-ig",
      icon: "eye",
      title: "Connectez Instagram",
      description: "Debloquez des insights precis en connectant votre compte Instagram a Winly.",
      impact: "high",
      category: "growth",
    });
  }

  // 6. Engagement per follower (comment ratio)
  if (input.followers > 100 && input.avgComments > 0) {
    const commentRate = input.avgComments / input.followers;
    if (commentRate > 0.01) {
      recs.push({
        id: "strong-community",
        icon: "heart",
        title: "Communaute tres active",
        description: "Votre audience commente beaucoup. Lancez un produit digital ou un coaching — ils sont prets.",
        impact: "medium",
        category: "monetization",
      });
    }
  }

  // Sort by impact priority and return top 5
  const impactOrder = { high: 0, medium: 1, low: 2 };
  recs.sort((a, b) => impactOrder[a.impact] - impactOrder[b.impact]);
  return recs.slice(0, 5);
}

// --- Fallback recommendations (no data) ---

export function getDefaultRecommendations(): Recommendation[] {
  return [
    {
      id: "default-reels",
      icon: "zap",
      title: "Publiez 3 Reels par semaine",
      description: "Les Reels generent 2x plus de portee que les photos. Commencez par des formats courts (<30s).",
      impact: "high",
      category: "content",
    },
    {
      id: "default-cta",
      icon: "target",
      title: "Ajoutez un CTA a chaque post",
      description: "Terminez par une question ou un appel a l'action clair. L'engagement booste la distribution.",
      impact: "high",
      category: "engagement",
    },
    {
      id: "default-connect",
      icon: "eye",
      title: "Connectez votre Instagram",
      description: "Des recommandations personnalisees basees sur vos vraies performances.",
      impact: "medium",
      category: "growth",
    },
  ];
}
