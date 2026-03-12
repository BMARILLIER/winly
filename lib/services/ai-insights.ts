/**
 * AI Insights Service — server-only.
 *
 * Generates actionable insights from Instagram metrics.
 * Two modes:
 *   - "local" (default): deterministic rules, no external API
 *   - "ai" (optional): Claude API for richer analysis
 *
 * Never modifies scores. Never invents missing data.
 */

import { getInstagramMetrics, type InstagramMetrics } from "./instagram-metrics";

// ─── Types ───

export interface GeneratedInsight {
  category: "strategy" | "timing" | "audience" | "growth";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  metric: string | null;
}

export interface InsightGenerationResult {
  ok: boolean;
  summary: string;
  insights: GeneratedInsight[];
  source: "local" | "ai";
  error?: string;
}

// ─── Main entry ───

export async function generateInsightsFromMetrics(
  userId: string
): Promise<InsightGenerationResult> {
  const metrics = await getInstagramMetrics(userId);

  if (!metrics) {
    return {
      ok: false,
      summary: "",
      insights: [],
      source: "local",
      error: "Aucune donnée Instagram disponible. Connectez et synchronisez votre compte.",
    };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (apiKey) {
    try {
      return await generateWithClaude(metrics, apiKey);
    } catch (err) {
      console.error("[ai-insights] Claude API failed, falling back to local:", err);
      // Fallback to local on any error
    }
  }

  return generateLocal(metrics);
}

// ─── Local mode (deterministic rules) ───

function generateLocal(m: InstagramMetrics): InsightGenerationResult {
  const insights: GeneratedInsight[] = [];
  const engPct = Math.round(m.engagementRate * 1000) / 10;
  const benchmark = 3.5;

  // ── Strategy insights ──

  // Engagement vs benchmark
  if (engPct >= benchmark * 1.3) {
    insights.push({
      category: "strategy",
      title: "Taux d'engagement excellent",
      description: `Votre taux d'engagement (${engPct}%) est bien au-dessus de la moyenne (${benchmark}%). Votre contenu résonne fortement avec votre audience. Continuez sur cette lancée.`,
      impact: "high",
      metric: `${engPct}%`,
    });
  } else if (engPct < benchmark * 0.7 && engPct > 0) {
    insights.push({
      category: "strategy",
      title: "Engagement en dessous de la moyenne",
      description: `Votre taux d'engagement (${engPct}%) est inférieur à la moyenne (${benchmark}%). Essayez d'ajouter des questions et des appels à l'action dans vos légendes.`,
      impact: "high",
      metric: `${engPct}%`,
    });
  }

  // Best performing format
  if (m.mediaByType.length > 1) {
    const sorted = [...m.mediaByType].sort(
      (a, b) => (b.avgLikes + b.avgComments) - (a.avgLikes + a.avgComments)
    );
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];
    const bestLabel = formatTypeLabel(best.type);
    const worstLabel = formatTypeLabel(worst.type);
    const bestEng = best.avgLikes + best.avgComments;
    const worstEng = worst.avgLikes + worst.avgComments;

    if (worstEng > 0) {
      const ratio = Math.round((bestEng / worstEng) * 10) / 10;
      if (ratio >= 1.5) {
        insights.push({
          category: "strategy",
          title: `Misez davantage sur les ${bestLabel.toLowerCase()}`,
          description: `Vos ${bestLabel.toLowerCase()} génèrent ${ratio}x plus d'interactions que vos ${worstLabel.toLowerCase()}. Augmenter leur fréquence pourrait améliorer significativement votre portée.`,
          impact: ratio >= 2 ? "high" : "medium",
          metric: `${ratio}x plus d'interactions`,
        });
      }
    }
  }

  // Saves signal
  if (m.recentMedia.length > 0) {
    const avgSaves = m.totalSaved / m.recentMedia.length;
    if (avgSaves >= 10) {
      insights.push({
        category: "strategy",
        title: "Fort taux de sauvegarde",
        description: `Vos publications sont sauvegardées en moyenne ${Math.round(avgSaves)} fois. C'est un signal de contenu à haute valeur que l'algorithme favorise.`,
        impact: "medium",
        metric: `${Math.round(avgSaves)} saves/post`,
      });
    } else if (avgSaves < 3 && m.followers >= 500) {
      insights.push({
        category: "strategy",
        title: "Sauvegardes faibles",
        description: "Peu de personnes sauvegardent vos publications. Ajoutez du contenu éducatif, des listes ou des conseils pratiques pour encourager les sauvegardes.",
        impact: "medium",
        metric: `${Math.round(avgSaves)} saves/post`,
      });
    }
  }

  // ── Timing insights ──

  // Posting frequency
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 86_400_000;
  const recentPosts = m.recentMedia.filter(
    (p) => new Date(p.timestamp).getTime() >= thirtyDaysAgo
  );

  if (recentPosts.length < 4) {
    insights.push({
      category: "timing",
      title: "Fréquence de publication trop basse",
      description: `Vous avez publié seulement ${recentPosts.length} fois en 30 jours. Publier au moins une fois par semaine maintient l'engagement de votre audience.`,
      impact: "high",
      metric: `${recentPosts.length} posts/mois`,
    });
  } else if (recentPosts.length >= 20) {
    insights.push({
      category: "timing",
      title: "Rythme de publication soutenu",
      description: `${recentPosts.length} publications en 30 jours, c'est un excellent rythme. Assurez-vous de maintenir la qualité en parallèle.`,
      impact: "low",
      metric: `${recentPosts.length} posts/mois`,
    });
  }

  // Peak hour analysis
  if (recentPosts.length >= 5) {
    const byHour = new Map<number, { count: number; totalEng: number }>();
    for (const p of recentPosts) {
      const h = new Date(p.timestamp).getHours();
      const entry = byHour.get(h) ?? { count: 0, totalEng: 0 };
      entry.count++;
      entry.totalEng += p.likeCount + p.commentsCount;
      byHour.set(h, entry);
    }

    let bestHour = -1;
    let bestAvgEng = 0;
    for (const [hour, data] of byHour) {
      const avg = data.totalEng / data.count;
      if (avg > bestAvgEng) {
        bestAvgEng = avg;
        bestHour = hour;
      }
    }

    if (bestHour >= 0) {
      insights.push({
        category: "timing",
        title: `Meilleur créneau : ${bestHour}h-${bestHour + 1}h`,
        description: `Vos publications autour de ${bestHour}h obtiennent le plus d'interactions. Concentrez vos publications sur ce créneau.`,
        impact: "medium",
        metric: `${Math.round(bestAvgEng)} interactions moy.`,
      });
    }
  }

  // ── Growth insights ──

  // Follower growth
  if (m.monthlyGrowth > 0) {
    const growthPct = m.followers > 0
      ? Math.round((m.monthlyGrowth / m.followers) * 1000) / 10
      : 0;

    if (growthPct >= 5) {
      insights.push({
        category: "growth",
        title: "Croissance forte ce mois",
        description: `Vous avez gagné ${m.monthlyGrowth} abonnés ce mois (+${growthPct}%). C'est une progression solide. Identifiez les contenus qui ont le mieux performé et reproduisez-les.`,
        impact: "high",
        metric: `+${growthPct}%`,
      });
    } else if (growthPct > 0) {
      insights.push({
        category: "growth",
        title: "Croissance régulière",
        description: `+${m.monthlyGrowth} abonnés ce mois (+${growthPct}%). La croissance est positive mais pourrait être accélérée avec plus de contenu partageable.`,
        impact: "medium",
        metric: `+${growthPct}%`,
      });
    }
  } else if (m.monthlyGrowth < 0) {
    insights.push({
      category: "growth",
      title: "Perte d'abonnés ce mois",
      description: `Vous avez perdu ${Math.abs(m.monthlyGrowth)} abonnés. Cela peut être normal après un pic, mais vérifiez si un contenu récent a pu déplaire.`,
      impact: "high",
      metric: `${m.monthlyGrowth}`,
    });
  }

  // Reach
  if (m.accountReach != null && m.followers > 0) {
    const reachRatio = Math.round((m.accountReach / m.followers) * 100);
    if (reachRatio >= 100) {
      insights.push({
        category: "growth",
        title: "Portée supérieure à votre audience",
        description: `Votre portée (${reachRatio}% de vos abonnés) dépasse votre audience. Votre contenu est distribué au-delà de vos abonnés, c'est excellent pour la croissance.`,
        impact: "high",
        metric: `${reachRatio}% reach`,
      });
    } else if (reachRatio < 30) {
      insights.push({
        category: "growth",
        title: "Portée limitée",
        description: `Seulement ${reachRatio}% de vos abonnés voient vos contenus. Utilisez des Reels et des hashtags pertinents pour augmenter votre distribution.`,
        impact: "medium",
        metric: `${reachRatio}% reach`,
      });
    }
  }

  // ── Audience insights ──

  insights.push({
    category: "audience",
    title: `${m.followers.toLocaleString("fr-FR")} abonnés`,
    description: `Vous suivez ${m.follows.toLocaleString("fr-FR")} comptes pour ${m.followers.toLocaleString("fr-FR")} abonnés. ${
      m.follows > m.followers * 0.8
        ? "Votre ratio abonnés/abonnements est bas. Pensez à ne suivre que les comptes pertinents."
        : "Votre ratio abonnés/abonnements est sain."
    }`,
    impact: m.follows > m.followers * 0.8 ? "medium" : "low",
    metric: `ratio ${Math.round(m.followers / Math.max(m.follows, 1))}:1`,
  });

  // Best & worst posts
  if (m.recentMedia.length >= 3) {
    const sorted = [...m.recentMedia].sort(
      (a, b) => (b.likeCount + b.commentsCount) - (a.likeCount + a.commentsCount)
    );
    const best = sorted[0];
    const bestEng = best.likeCount + best.commentsCount;
    const bestCaption = best.caption
      ? best.caption.slice(0, 60) + (best.caption.length > 60 ? "…" : "")
      : "Sans légende";

    insights.push({
      category: "audience",
      title: "Meilleur post récent",
      description: `"${bestCaption}" — ${bestEng} interactions (${best.likeCount} likes, ${best.commentsCount} commentaires). Analysez ce qui a fonctionné et réutilisez cette approche.`,
      impact: "medium",
      metric: `${bestEng} interactions`,
    });
  }

  // ── Summary ──
  const summary = buildLocalSummary(m, engPct, recentPosts.length);

  return {
    ok: true,
    summary,
    insights,
    source: "local",
  };
}

function buildLocalSummary(
  m: InstagramMetrics,
  engPct: number,
  postsLast30: number
): string {
  const parts: string[] = [];

  parts.push(`Votre compte @${m.igUsername} compte ${m.followers.toLocaleString("fr-FR")} abonnés`);

  if (m.monthlyGrowth > 0) {
    parts.push(`avec une croissance de +${m.monthlyGrowth} ce mois`);
  } else if (m.monthlyGrowth < 0) {
    parts.push(`avec une baisse de ${m.monthlyGrowth} ce mois`);
  }

  parts.push(`et un taux d'engagement de ${engPct}%.`);

  if (postsLast30 > 0) {
    parts.push(`Vous avez publié ${postsLast30} fois en 30 jours.`);
  }

  if (engPct >= 3.5) {
    parts.push("L'engagement est au-dessus de la moyenne, continuez sur cette dynamique.");
  } else if (engPct > 0) {
    parts.push("L'engagement a une marge de progression — travaillez vos accroches et appels à l'action.");
  }

  return parts.join(" ");
}

// ─── Claude API mode ───

async function generateWithClaude(
  m: InstagramMetrics,
  apiKey: string
): Promise<InsightGenerationResult> {
  // Build a concise data payload — only facts, no raw tokens
  const dataForPrompt = {
    username: m.igUsername,
    followers: m.followers,
    follows: m.follows,
    mediaCount: m.mediaCount,
    engagementRate: `${Math.round(m.engagementRate * 1000) / 10}%`,
    avgLikes: m.avgLikes,
    avgComments: m.avgComments,
    totalSaved: m.totalSaved,
    monthlyGrowth: m.monthlyGrowth,
    weeklyGrowth: m.weeklyGrowth,
    accountReach: m.accountReach,
    accountImpressions: m.accountImpressions,
    profileViews: m.profileViews,
    postsAnalyzed: m.recentMedia.length,
    mediaByType: m.mediaByType.map((t) => ({
      type: t.type,
      count: t.count,
      avgLikes: t.avgLikes,
      avgComments: t.avgComments,
    })),
    topPosts: [...m.recentMedia]
      .sort((a, b) => (b.likeCount + b.commentsCount) - (a.likeCount + a.commentsCount))
      .slice(0, 3)
      .map((p) => ({
        type: p.mediaType,
        likes: p.likeCount,
        comments: p.commentsCount,
        saved: p.saved,
        caption: p.caption?.slice(0, 80) ?? null,
      })),
    worstPosts: [...m.recentMedia]
      .sort((a, b) => (a.likeCount + a.commentsCount) - (b.likeCount + b.commentsCount))
      .slice(0, 2)
      .map((p) => ({
        type: p.mediaType,
        likes: p.likeCount,
        comments: p.commentsCount,
        caption: p.caption?.slice(0, 80) ?? null,
      })),
  };

  const systemPrompt = `Tu es un consultant Instagram expert. Tu analyses les métriques d'un créateur et produis des recommandations concrètes.

Règles strictes :
- Réponds UNIQUEMENT en français
- Utilise un ton clair, direct et bienveillant
- Ne mentionne JAMAIS de données que tu n'as pas reçues
- N'invente aucun chiffre
- Pas de jargon inutile
- Chaque insight doit être actionnable

Réponds UNIQUEMENT avec un objet JSON valide (pas de markdown, pas de backticks) avec cette structure exacte :
{
  "summary": "Résumé global en 2-3 phrases",
  "insights": [
    {
      "category": "strategy" | "timing" | "audience" | "growth",
      "title": "Titre court (max 60 caractères)",
      "description": "Explication en 1-2 phrases avec données factuelles",
      "impact": "high" | "medium" | "low",
      "metric": "Chiffre clé ou null"
    }
  ]
}

Génère entre 6 et 10 insights, répartis dans les 4 catégories.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: `Voici les métriques Instagram du créateur :\n\n${JSON.stringify(dataForPrompt, null, 2)}`,
        },
      ],
      system: systemPrompt,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Claude API error ${res.status}: ${text}`);
  }

  const body = await res.json();
  const content = body.content?.[0]?.text;

  if (!content) {
    throw new Error("Empty response from Claude API");
  }

  const parsed = JSON.parse(content) as {
    summary: string;
    insights: GeneratedInsight[];
  };

  // Validate structure
  if (!parsed.summary || !Array.isArray(parsed.insights)) {
    throw new Error("Invalid response structure from Claude API");
  }

  return {
    ok: true,
    summary: parsed.summary,
    insights: parsed.insights.map((i) => ({
      category: i.category,
      title: i.title,
      description: i.description,
      impact: i.impact,
      metric: i.metric ?? null,
    })),
    source: "ai",
  };
}

// ─── Helpers ───

function formatTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    IMAGE: "Images",
    VIDEO: "Reels",
    CAROUSEL_ALBUM: "Carrousels",
  };
  return labels[type] ?? type;
}
