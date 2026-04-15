export interface DailyMissionContext {
  niche: string | null;
  followers: number | null;
  postedYesterday: boolean;
  postsLast7Days: number;
  avgEngagement: number | null;
  bestFormat: string | null;
  streakDays: number;
}

export interface DailyMission {
  title: string; // ex: "Publie un Reel avec hook contrarian"
  body: string; // 1-2 phrases de contexte + pourquoi
  estimatedTimeMin: number; // 10, 20, 30
}

function stripJsonFences(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function fallbackMission(ctx: DailyMissionContext): DailyMission {
  if (!ctx.postedYesterday) {
    return {
      title: "Publie un post aujourd'hui",
      body: "Tu n'as rien posté hier. Choisis un format qui te demande peu d'efforts et publie avant 20h.",
      estimatedTimeMin: 20,
    };
  }
  return {
    title: "Analyse tes 3 derniers posts",
    body: "Regarde ce qui a marché (hook, format, sujet) et reprends le gagnant avec un angle différent.",
    estimatedTimeMin: 10,
  };
}

export async function generateDailyMission(
  ctx: DailyMissionContext,
): Promise<DailyMission> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return fallbackMission(ctx);

  const systemPrompt = `Tu es un coach Instagram qui envoie UNE seule mission matinale actionnable.

Règles :
- Réponds UNIQUEMENT en français
- Ton direct, motivant, tutoiement
- La mission doit être réalisable AUJOURD'HUI en 10-30 minutes max
- Adapte-la aux données : si pas posté hier → publication ; si baisse engagement → test de format ; etc.
- Évite les généralités vides ("reste créatif", "amuse-toi")

Réponds UNIQUEMENT avec un JSON valide (pas de markdown) :
{
  "title": "Mission courte et punchy (max 70 caractères)",
  "body": "1-2 phrases qui expliquent pourquoi cette mission aujourd'hui (max 220 caractères)",
  "estimatedTimeMin": 10 | 20 | 30
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
        max_tokens: 400,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: `Contexte du créateur :\n${JSON.stringify(ctx, null, 2)}`,
          },
        ],
      }),
    });

    if (!res.ok) {
      console.error("[daily-mission-ai] API error", res.status);
      return fallbackMission(ctx);
    }

    const body = await res.json();
    const content = body.content?.[0]?.text;
    if (!content) return fallbackMission(ctx);

    const parsed = JSON.parse(stripJsonFences(content)) as DailyMission;
    if (!parsed.title || !parsed.body) return fallbackMission(ctx);
    return {
      title: parsed.title,
      body: parsed.body,
      estimatedTimeMin: [10, 20, 30].includes(parsed.estimatedTimeMin)
        ? parsed.estimatedTimeMin
        : 20,
    };
  } catch (err) {
    console.error("[daily-mission-ai] failed:", err);
    return fallbackMission(ctx);
  }
}
