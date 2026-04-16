import { prisma } from "@/lib/db";
import { getActiveConnection } from "@/lib/services/instagram-connection";

export interface BestContent {
  id: string;
  title: string;
  preview: string;
  source: "content_idea" | "instagram";
  score: number;
}

/**
 * Find the best recent content to repurpose for a given workspace.
 * This is a plain server function (NOT a server action) — safe to call from server components.
 */
export async function queryBestContent(
  workspaceId: string,
  userId: string
): Promise<BestContent | null> {
  // Verify ownership
  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId, userId },
  });
  if (!workspace) return null;

  const candidates: BestContent[] = [];

  // 1. Published/ready ContentIdeas
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
      score: text.length + (Date.now() - idea.createdAt.getTime() < 7 * 86400000 ? 500 : 0),
    });
  }

  // 2. InstagramMedia (best engagement)
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

  candidates.sort((a, b) => b.score - a.score);
  return candidates[0];
}
