"use server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { decryptToken } from "@/lib/services/instagram";
import { fetchMediaComments, type IgComment } from "@/lib/services/instagram-client";

export interface CommentWithReply {
  id: string;
  text: string;
  username: string;
  timestamp: string;
  likeCount: number;
  suggestedReply: string | null;
}

export interface PostComments {
  igMediaId: string;
  caption: string | null;
  permalink: string | null;
  mediaType: string;
  comments: CommentWithReply[];
}

export interface CommentsPageData {
  ok: boolean;
  error?: string;
  posts?: PostComments[];
}

export async function getRecentComments(): Promise<CommentsPageData> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Non authentifié" };

  const connection = await prisma.instagramConnection.findUnique({
    where: { userId: user.id },
  });
  if (!connection) {
    return { ok: false, error: "Instagram non connecté. Connecte-le dans les paramètres." };
  }

  const token = decryptToken(connection.accessToken);

  const recentMedia = await prisma.instagramMedia.findMany({
    where: { connectionId: connection.id },
    orderBy: { timestamp: "desc" },
    take: 10,
    select: {
      igMediaId: true,
      caption: true,
      permalink: true,
      mediaType: true,
      commentsCount: true,
    },
  });

  const postsWithComments = recentMedia.filter((m) => m.commentsCount > 0);
  if (postsWithComments.length === 0) {
    return { ok: true, posts: [] };
  }

  const posts: PostComments[] = [];

  for (const media of postsWithComments.slice(0, 5)) {
    const rawComments = await fetchMediaComments(media.igMediaId, token);
    if (rawComments.length === 0) continue;

    posts.push({
      igMediaId: media.igMediaId,
      caption: media.caption,
      permalink: media.permalink,
      mediaType: media.mediaType,
      comments: rawComments.map((c) => ({
        id: c.id,
        text: c.text,
        username: c.username,
        timestamp: c.timestamp,
        likeCount: c.like_count ?? 0,
        suggestedReply: null,
      })),
    });
  }

  return { ok: true, posts };
}

function stripJsonFences(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

export async function generateReplies(
  comments: { id: string; text: string; username: string }[],
  postCaption: string | null,
): Promise<{ ok: boolean; replies?: Record<string, string>; error?: string }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { ok: false, error: "Service IA indisponible." };

  if (comments.length === 0) return { ok: true, replies: {} };

  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Non authentifié" };

  const { checkAndConsumeGeneration } = await import("@/modules/content-generator");
  const quota = await checkAndConsumeGeneration(user.id);
  if (!quota.ok) return { ok: false, error: quota.error };

  const workspace = user.workspaces[0];
  const identity = workspace
    ? await prisma.creatorIdentity.findUnique({
        where: { workspaceId: workspace.id },
        select: { tone: true, catchphrases: true, avoid: true },
      })
    : null;

  let identityBlock = "";
  if (identity) {
    const parts: string[] = [];
    if (identity.tone) parts.push(`Ton : ${identity.tone}`);
    if (identity.catchphrases) parts.push(`Expressions : ${identity.catchphrases}`);
    if (identity.avoid) parts.push(`NE JAMAIS utiliser : ${identity.avoid}`);
    if (parts.length > 0) identityBlock = `\n\nIDENTITÉ DU CRÉATEUR :\n${parts.join("\n")}`;
  }

  const payload = comments.slice(0, 15).map((c) => ({
    id: c.id,
    username: c.username,
    text: c.text.slice(0, 300),
  }));

  const systemPrompt = `Tu rédiges des réponses à des commentaires Instagram pour un créateur.

Règles :
- Réponds UNIQUEMENT en français
- Ton chaleureux, authentique, engageant — tutoiement
- Chaque réponse : 1-2 phrases max, naturelle (pas robotique)
- Mentionne le @username au début de la réponse
- Si le commentaire est négatif/trolling : reste positif et professionnel, pas défensif
- Si c'est un emoji seul ou "🔥" : réponse courte et sympa (ex: "Merci @user 🙏")
- Adapte-toi au ton du commentaire (enthousiaste → enthousiaste, question → réponse utile)${identityBlock}

${postCaption ? `CONTEXTE DU POST :\n"${postCaption.slice(0, 300)}"` : ""}

Réponds UNIQUEMENT avec un JSON valide (pas de markdown) :
{
  "replies": {
    "comment_id_1": "réponse suggérée",
    "comment_id_2": "réponse suggérée"
  }
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
        max_tokens: 1500,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: `Commentaires à répondre :\n${JSON.stringify(payload, null, 2)}`,
          },
        ],
      }),
    });

    if (!res.ok) {
      console.error("[comments-ai] API error", res.status);
      return { ok: false, error: "Échec de la génération IA." };
    }

    const body = await res.json();
    const content = body.content?.[0]?.text;
    if (!content) return { ok: false, error: "Réponse IA vide." };

    const parsed = JSON.parse(stripJsonFences(content)) as { replies: Record<string, string> };
    return { ok: true, replies: parsed.replies ?? {} };
  } catch (err) {
    console.error("[comments-ai] failed:", err);
    return { ok: false, error: "Impossible de générer les réponses." };
  }
}
