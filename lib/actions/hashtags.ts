"use server";

import { getSession } from "@/lib/auth";

export async function generateHashtagsWithAI(
  topic: string,
  platform: string,
  niche: string
): Promise<{
  ok: boolean;
  hashtags?: { large: string[]; medium: string[]; niche: string[] };
  error?: string;
}> {
  const userId = await getSession();
  if (!userId) return { ok: false, error: "Non connecté." };

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { ok: false, error: "Clé API non configurée." };

  // Check cache
  const { getCachedResponse, setCachedResponse } = await import("@/lib/services/ai-cache");
  type HashtagResult = { large: string[]; medium: string[]; niche: string[] };
  const cached = await getCachedResponse<HashtagResult>("hashtags", topic, niche, platform);
  if (cached) return { ok: true, hashtags: cached };

  const { checkAndConsumeGeneration } = await import("@/modules/content-generator");
  const quota = await checkAndConsumeGeneration(userId);
  if (!quota.ok) return { ok: false, error: quota.error };

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 800,
        system: `Tu es un expert en stratégie hashtags pour ${platform}. Tu connais les tendances actuelles et les meilleures pratiques.

Règles :
- Réponds UNIQUEMENT en JSON valide (pas de markdown, pas de backticks)
- Tous les hashtags commencent par #
- Adapté à la niche : ${niche}
- Plateforme : ${platform}

Génère 3 catégories de hashtags :
- "large" : 5 hashtags populaires (millions de posts, grande portée)
- "medium" : 10 hashtags moyens (bonne balance portée/visibilité)
- "niche" : 10 hashtags de niche (communauté ciblée, moins concurrentiels)

Structure JSON exacte :
{
  "large": ["#hashtag1", "#hashtag2", ...],
  "medium": ["#hashtag1", "#hashtag2", ...],
  "niche": ["#hashtag1", "#hashtag2", ...]
}`,
        messages: [
          {
            role: "user",
            content: `Génère des hashtags optimaux pour un post sur : "${topic}"`,
          },
        ],
      }),
    });

    if (!res.ok) throw new Error(`API error ${res.status}`);

    const body = await res.json();
    const text = body.content?.[0]?.text;
    if (!text) throw new Error("Réponse vide");

    const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed = JSON.parse(cleaned) as HashtagResult;

    // Save to cache
    await setCachedResponse("hashtags", topic, niche, parsed, platform);

    return { ok: true, hashtags: parsed };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[hashtags-ai] Error:", msg);
    return { ok: false, error: `Erreur IA : ${msg}` };
  }
}
