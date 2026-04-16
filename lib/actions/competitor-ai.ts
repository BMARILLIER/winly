"use server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getActiveConnection } from "@/lib/services/instagram-connection";

export interface CompetitorPostInput {
  caption: string;
  stats?: string; // ex: "200k vues, 15k likes" — texte libre
}

export interface CompetitorAnalysisInput {
  username: string; // ex: "@dj_snake"
  posts: CompetitorPostInput[];
}

export interface CompetitorAnalysisResult {
  ok: boolean;
  error?: string;
  summary?: string; // 2-3 phrases résumé
  patterns?: { title: string; description: string }[]; // patterns récurrents
  strengths?: string[]; // ce qu'il fait bien
  yourGap?: string | null; // ce qui manque à toi vs lui
  ideasToAdapt?: string[]; // 3 idées à piquer
  differentiatingAngle?: string | null; // angle pour te démarquer
}

function stripJsonFences(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

export async function analyzeCompetitor(
  input: CompetitorAnalysisInput,
): Promise<CompetitorAnalysisResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Non authentifié" };

  const username = input.username?.trim();
  if (!username) return { ok: false, error: "Username du concurrent requis." };
  if (!input.posts || input.posts.length === 0) {
    return { ok: false, error: "Ajoute au moins 1 post du concurrent." };
  }
  const validPosts = input.posts.filter((p) => p.caption?.trim().length >= 10);
  if (validPosts.length === 0) {
    return { ok: false, error: "Les posts doivent contenir au moins 10 caractères." };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { ok: false, error: "Service IA indisponible." };

  const { checkAndConsumeGeneration } = await import("@/modules/content-generator");
  const quota = await checkAndConsumeGeneration(user.id);
  if (!quota.ok) return { ok: false, error: quota.error };

  const workspace = user.workspaces[0];
  const niche = workspace?.niche ?? "général";
  const platform = workspace?.mainPlatform ?? "instagram";

  // Récupère les top posts de l'user pour comparaison (si IG connecté)
  const connection = await getActiveConnection(user.id);

  let userTopPosts: { caption: string | null; likes: number; comments: number; type: string }[] = [];
  if (connection) {
    const media = await prisma.instagramMedia.findMany({
      where: { connectionId: connection.id },
      orderBy: { timestamp: "desc" },
      take: 10,
    });
    userTopPosts = media
      .sort((a, b) => b.likeCount + b.commentsCount - (a.likeCount + a.commentsCount))
      .slice(0, 3)
      .map((m) => ({
        caption: m.caption?.slice(0, 160) ?? null,
        likes: m.likeCount,
        comments: m.commentsCount,
        type: m.mediaType,
      }));
  }

  const payload = {
    niche,
    platform,
    competitor: {
      username,
      posts: validPosts.map((p) => ({
        caption: p.caption.slice(0, 500),
        stats: p.stats ?? null,
      })),
    },
    userTopPosts,
  };

  const systemPrompt = `Tu es un analyste Instagram/TikTok qui aide un créateur à apprendre de ses concurrents.

À partir des posts du concurrent et (si fournis) des top posts du créateur, extrais :
- Les patterns récurrents du concurrent (formats, hooks, angles, longueur, structure)
- Ses forces (ce qu'il fait bien)
- Le "gap" entre toi et lui (ce qu'il fait que tu ne fais pas)
- 3 idées concrètes à ADAPTER (pas copier) pour le créateur
- Un angle différenciant pour se démarquer

Règles :
- Réponds UNIQUEMENT en français
- Ton direct, actionnable, tutoiement
- Base-toi UNIQUEMENT sur les données fournies, n'invente rien
- Si tu n'as pas assez de données, dis-le dans le summary

Réponds UNIQUEMENT avec un JSON valide (pas de markdown) :
{
  "summary": "2-3 phrases résumé de ce que fait ce concurrent (max 280 caractères)",
  "patterns": [
    { "title": "Nom du pattern (max 50 car.)", "description": "Comment il l'utilise (max 160 car.)" }
  ],
  "strengths": ["Force 1", "Force 2", "Force 3"],
  "yourGap": "1 phrase sur ce qui te manque vs lui, ou null si pas de données user",
  "ideasToAdapt": ["Idée 1 adaptée à ta niche", "Idée 2", "Idée 3"],
  "differentiatingAngle": "Angle pour te démarquer de lui (max 220 caractères), ou null"
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
        model: "claude-sonnet-4-6",
        max_tokens: 2000,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: `Données :\n${JSON.stringify(payload, null, 2)}`,
          },
        ],
      }),
    });

    if (!res.ok) {
      console.error("[competitor-ai] API error", res.status, await res.text());
      return { ok: false, error: "L'analyse IA a échoué. Réessaie." };
    }

    const body = await res.json();
    const content = body.content?.[0]?.text;
    if (!content) return { ok: false, error: "Réponse IA vide." };

    const parsed = JSON.parse(stripJsonFences(content));

    // Persiste pour historique (optionnel, best-effort)
    if (workspace) {
      try {
        await prisma.competitorInspo.create({
          data: {
            workspaceId: workspace.id,
            source: username,
            text: validPosts.map((p) => p.caption).join("\n---\n").slice(0, 4000),
            notes: parsed.summary?.slice(0, 500) ?? null,
          },
        });
      } catch {
        // ignore
      }
    }

    return {
      ok: true,
      summary: parsed.summary,
      patterns: Array.isArray(parsed.patterns) ? parsed.patterns.slice(0, 5) : [],
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 5) : [],
      yourGap: parsed.yourGap ?? null,
      ideasToAdapt: Array.isArray(parsed.ideasToAdapt) ? parsed.ideasToAdapt.slice(0, 3) : [],
      differentiatingAngle: parsed.differentiatingAngle ?? null,
    };
  } catch (err) {
    console.error("[competitor-ai] failed:", err);
    return { ok: false, error: "Impossible d'analyser pour le moment." };
  }
}
