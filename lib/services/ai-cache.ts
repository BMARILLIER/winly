import { prisma } from "@/lib/db";

/**
 * Simple AI response cache.
 * Generates a key from type + topic + niche, checks DB before calling API.
 * Cache entries expire after 7 days.
 */

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function buildKey(type: string, topic: string, niche: string, extra?: string): string {
  const raw = `${type}:${topic.trim().toLowerCase()}:${niche.trim().toLowerCase()}${extra ? `:${extra}` : ""}`;
  // Simple hash — good enough for cache keys
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const chr = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return `${type}_${Math.abs(hash).toString(36)}`;
}

export async function getCachedResponse<T>(
  type: string,
  topic: string,
  niche: string,
  extra?: string
): Promise<T | null> {
  const key = buildKey(type, topic, niche, extra);

  const cached = await prisma.aiCache.findUnique({
    where: { promptKey: key },
  });

  if (!cached) return null;

  // Check expiry
  const age = Date.now() - cached.createdAt.getTime();
  if (age > CACHE_TTL_MS) {
    await prisma.aiCache.delete({ where: { id: cached.id } });
    return null;
  }

  return JSON.parse(cached.response) as T;
}

export async function setCachedResponse(
  type: string,
  topic: string,
  niche: string,
  response: unknown,
  extra?: string
): Promise<void> {
  const key = buildKey(type, topic, niche, extra);

  await prisma.aiCache.upsert({
    where: { promptKey: key },
    create: {
      promptKey: key,
      type,
      response: JSON.stringify(response),
    },
    update: {
      response: JSON.stringify(response),
      createdAt: new Date(),
    },
  });
}
