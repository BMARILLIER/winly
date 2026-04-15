import type { WeeklyInsights } from "@/lib/queries/weekly-insights";

export interface WeeklyReportAI {
  intro: string; // 1 phrase résumé global
  topPostReason: string | null; // pourquoi le top post a marché
  flopPostReason: string | null; // pourquoi le flop a sous-performé
  actions: string[]; // 3 actions concrètes
  opportunity: string | null; // 1 sujet/format tendance à exploiter
}

function stripJsonFences(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function fallbackReport(insights: WeeklyInsights): WeeklyReportAI {
  if (!insights.hasInstagram) {
    return {
      intro:
        "Connecte Instagram pour débloquer une analyse personnalisée de tes performances.",
      topPostReason: null,
      flopPostReason: null,
      actions: [
        "Connecte ton compte Instagram depuis les paramètres",
        "Lance une première synchronisation",
        "Reviens la semaine prochaine pour ton premier rapport complet",
      ],
      opportunity: null,
    };
  }
  return {
    intro: "Voici ton récap de la semaine — l'analyse IA sera disponible au prochain rapport.",
    topPostReason: null,
    flopPostReason: null,
    actions: [
      "Publie au moins 3 fois cette semaine pour générer des signaux",
      "Teste un format différent (carrousel ou Reel)",
      "Ajoute un appel à l'action clair dans tes légendes",
    ],
    opportunity: null,
  };
}

export async function generateWeeklyReport(
  insights: WeeklyInsights,
): Promise<WeeklyReportAI> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return fallbackReport(insights);
  if (!insights.hasInstagram || !insights.hasPosts) return fallbackReport(insights);

  const payload = {
    niche: insights.niche,
    followers: insights.followers,
    followersDelta: insights.followersDelta,
    thisWeekPosts: insights.thisWeekPosts,
    thisWeekAvgEngagement: insights.thisWeekAvgEngagement,
    prevWeekAvgEngagement: insights.prevWeekAvgEngagement,
    engagementDeltaPct: insights.engagementDeltaPct,
    bestFormat: insights.bestFormat,
    topPost: insights.topPost
      ? {
          type: insights.topPost.mediaType,
          likes: insights.topPost.likeCount,
          comments: insights.topPost.commentsCount,
          saved: insights.topPost.saved,
          caption: insights.topPost.caption?.slice(0, 140) ?? null,
        }
      : null,
    flopPost: insights.flopPost
      ? {
          type: insights.flopPost.mediaType,
          likes: insights.flopPost.likeCount,
          comments: insights.flopPost.commentsCount,
          caption: insights.flopPost.caption?.slice(0, 140) ?? null,
        }
      : null,
  };

  const systemPrompt = `Tu es un coach Instagram qui rédige des rapports hebdomadaires personnalisés.

Règles :
- Réponds UNIQUEMENT en français
- Ton direct, chaleureux, actionnable — tutoiement
- N'invente JAMAIS de chiffre que tu n'as pas reçu
- Chaque action doit être concrète et réalisable cette semaine
- Pas de jargon, pas de généralités vides

Réponds UNIQUEMENT avec un JSON valide (pas de markdown, pas de backticks) :
{
  "intro": "1 phrase qui résume la semaine (max 160 caractères)",
  "topPostReason": "Pourquoi ce post a marché, en 1 phrase (max 200 caractères), ou null si pas de top post",
  "flopPostReason": "Pourquoi ce post a sous-performé, en 1 phrase (max 200 caractères), ou null",
  "actions": ["Action 1", "Action 2", "Action 3"],
  "opportunity": "1 sujet/format à exploiter cette semaine dans la niche (max 200 caractères), ou null"
}`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: `Données de la semaine :\n${JSON.stringify(payload, null, 2)}`,
          },
        ],
      }),
    });

    if (!res.ok) {
      console.error("[weekly-report-ai] API error", res.status, await res.text());
      return fallbackReport(insights);
    }

    const body = await res.json();
    const content = body.content?.[0]?.text;
    if (!content) return fallbackReport(insights);

    const parsed = JSON.parse(stripJsonFences(content)) as WeeklyReportAI;
    if (!Array.isArray(parsed.actions) || parsed.actions.length === 0) {
      return fallbackReport(insights);
    }
    return parsed;
  } catch (err) {
    console.error("[weekly-report-ai] failed:", err);
    return fallbackReport(insights);
  }
}
