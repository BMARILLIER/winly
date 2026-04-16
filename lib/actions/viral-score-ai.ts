"use server";

import { getCurrentUser } from "@/lib/auth";

export interface ViralScoreAIInput {
  caption: string;
  format: string; // reel, carousel, video, thread, story, text, image
  platform?: string;
  niche?: string;
}

export interface ViralFactor {
  id: "hook" | "caption" | "cta" | "hashtags" | "format_fit";
  label: string;
  score: number; // 0-100
  feedback: string;
}

export interface ViralScoreAIResult {
  ok: boolean;
  error?: string;
  score?: number; // 0-100 global
  badge?: "fort" | "moyen" | "faible";
  verdict?: string; // 1-2 phrases résumé
  factors?: ViralFactor[];
  improvements?: string[]; // 3 suggestions concrètes
  improvedCaption?: string | null; // proposition réécrite
}

function stripJsonFences(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function badgeFromScore(score: number): "fort" | "moyen" | "faible" {
  if (score >= 70) return "fort";
  if (score >= 45) return "moyen";
  return "faible";
}

export async function analyzeViralScore(
  input: ViralScoreAIInput,
): Promise<ViralScoreAIResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Non authentifié" };

  const caption = input.caption?.trim() ?? "";
  if (caption.length < 10) {
    return { ok: false, error: "Ajoute au moins 10 caractères de légende à analyser." };
  }
  if (caption.length > 3000) {
    return { ok: false, error: "Légende trop longue (max 3000 caractères)." };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "Service IA indisponible. Réessaie plus tard." };
  }

  const { checkAndConsumeGeneration } = await import("@/modules/content-generator");
  const quota = await checkAndConsumeGeneration(user.id);
  if (!quota.ok) return { ok: false, error: quota.error };

  const workspace = user.workspaces[0];
  const platform = input.platform || workspace?.mainPlatform || "instagram";
  const niche = input.niche || workspace?.niche || "général";

  const systemPrompt = `Tu es un expert Instagram/TikTok qui note le potentiel viral d'un brouillon de post.

Analyse 5 facteurs (score 0-100 chacun) :
- hook : la première ligne accroche-t-elle ? (scroll-stop)
- caption : clarté, valeur apportée, longueur adaptée
- cta : présence et efficacité d'un appel à l'action
- hashtags : pertinence, spécificité (vs génériques)
- format_fit : le contenu colle-t-il au format choisi ?

Le score global est la moyenne pondérée : hook×0.30 + caption×0.25 + cta×0.15 + hashtags×0.10 + format_fit×0.20

Règles :
- Réponds UNIQUEMENT en français
- Ton direct, bienveillant, actionnable — tutoiement
- Sois strict mais juste : un score 85+ doit être rare
- Si un élément manque (pas de CTA, pas de hashtags), score bas ET dis-le clairement
- improvedCaption : propose une réécriture courte qui corrige les faiblesses (garde le même sujet)

Réponds UNIQUEMENT avec un JSON valide (pas de markdown, pas de backticks) :
{
  "score": 0-100,
  "verdict": "1-2 phrases résumé (max 200 caractères)",
  "factors": [
    { "id": "hook" | "caption" | "cta" | "hashtags" | "format_fit", "label": "Libellé court", "score": 0-100, "feedback": "Explication en 1 phrase (max 160 caractères)" }
  ],
  "improvements": ["Action concrète 1", "Action concrète 2", "Action concrète 3"],
  "improvedCaption": "Version améliorée de la caption, ou null si la version d'origine est déjà excellente"
}`;

  const userPayload = {
    platform,
    niche,
    format: input.format,
    draftCaption: caption,
  };

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1500,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: `Brouillon à analyser :\n\n${JSON.stringify(userPayload, null, 2)}`,
          },
        ],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[viral-score-ai] API error", res.status, text);
      return { ok: false, error: "L'analyse IA a échoué. Réessaie." };
    }

    const body = await res.json();
    const content = body.content?.[0]?.text;
    if (!content) return { ok: false, error: "Réponse IA vide." };

    const parsed = JSON.parse(stripJsonFences(content)) as {
      score: number;
      verdict: string;
      factors: ViralFactor[];
      improvements: string[];
      improvedCaption: string | null;
    };

    const score = Math.max(0, Math.min(100, Math.round(parsed.score)));

    return {
      ok: true,
      score,
      badge: badgeFromScore(score),
      verdict: parsed.verdict,
      factors: parsed.factors.map((f) => ({
        ...f,
        score: Math.max(0, Math.min(100, Math.round(f.score))),
      })),
      improvements: parsed.improvements.slice(0, 3),
      improvedCaption: parsed.improvedCaption ?? null,
    };
  } catch (err) {
    console.error("[viral-score-ai] failed:", err);
    return { ok: false, error: "Impossible d'analyser pour le moment." };
  }
}
