"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getActiveConnection } from "@/lib/services/instagram-connection";

export interface BestContent {
  id: string;
  title: string;
  preview: string; // first 200 chars
  source: "content_idea" | "instagram";
  score: number; // engagement score for ranking
}

/**
 * Find the best recent content to repurpose for a given workspace.
 * Checks ContentIdea (published) and InstagramMedia (best engagement).
 * Returns the top suggestion or null.
 */
export async function getBestContentToRepurpose(
  workspaceId: string
): Promise<BestContent | null> {
  const userId = await getSession();
  if (!userId) redirect("/login");

  // Verify ownership
  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId, userId },
  });
  if (!workspace) return null;

  const candidates: BestContent[] = [];

  // 1. Check published ContentIdeas (best = most recent published with longest caption)
  const ideas = await prisma.contentIdea.findMany({
    where: {
      workspaceId,
      status: { in: ["published", "ready"] },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  for (const idea of ideas) {
    const text = [idea.hook, idea.caption, idea.cta].filter(Boolean).join(" ");
    if (text.length < 20) continue;
    candidates.push({
      id: idea.id,
      title: idea.title,
      preview: text.slice(0, 200),
      source: "content_idea",
      // Score: recency + content length (more substance = better to repurpose)
      score: text.length + (Date.now() - idea.createdAt.getTime() < 7 * 86400000 ? 500 : 0),
    });
  }

  // 2. Check InstagramMedia (best engagement = likes + comments)
  const connection = await getActiveConnection(userId);

  if (connection) {
    const media = await prisma.instagramMedia.findMany({
      where: { connectionId: connection.id },
      orderBy: { timestamp: "desc" },
      take: 20,
    });

    for (const m of media) {
      if (!m.caption || m.caption.length < 20) continue;
      const engagement = m.likeCount + m.commentsCount * 3 + (m.saved ?? 0) * 5;
      candidates.push({
        id: m.id,
        title: m.caption.slice(0, 60) + (m.caption.length > 60 ? "..." : ""),
        preview: m.caption.slice(0, 200),
        source: "instagram",
        score: engagement,
      });
    }
  }

  if (candidates.length === 0) return null;

  // Return highest-scoring candidate
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0];
}

/**
 * Get the full text of a content piece by id and source type.
 */
export async function getContentFullText(
  id: string,
  source: "content_idea" | "instagram"
): Promise<string | null> {
  const userId = await getSession();
  if (!userId) return null;

  if (source === "content_idea") {
    const idea = await prisma.contentIdea.findUnique({
      where: { id },
      include: { workspace: { select: { userId: true } } },
    });
    if (!idea || idea.workspace.userId !== userId) return null;
    return [idea.hook, idea.caption, idea.cta].filter(Boolean).join("\n\n");
  }

  if (source === "instagram") {
    const media = await prisma.instagramMedia.findUnique({
      where: { id },
      include: { connection: { select: { userId: true } } },
    });
    if (!media || media.connection.userId !== userId) return null;
    return media.caption ?? null;
  }

  return null;
}
