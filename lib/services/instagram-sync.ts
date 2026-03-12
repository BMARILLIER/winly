/**
 * Instagram sync service — server-only.
 *
 * Orchestrates: decrypt token → fetch API → persist snapshots + media.
 * Called from server actions only.
 */

import { prisma } from "@/lib/db";
import { decryptToken } from "./instagram";
import {
  fetchProfile,
  fetchRecentMedia,
  fetchMediaInsights,
  fetchAccountInsights,
} from "./instagram-client";

export interface SyncResult {
  ok: boolean;
  error?: string;
  followers?: number;
  mediaCount?: number;
  mediaSynced?: number;
}

export async function syncInstagramData(userId: string): Promise<SyncResult> {
  // 1. Get connection
  const connection = await prisma.instagramConnection.findUnique({
    where: { userId },
  });

  if (!connection) {
    return { ok: false, error: "Aucune connexion Instagram trouvée." };
  }

  // 2. Decrypt token
  let token: string;
  try {
    token = decryptToken(connection.accessToken);
  } catch {
    return { ok: false, error: "Token invalide. Reconnectez Instagram." };
  }

  // 3. Fetch profile
  const profile = await fetchProfile(token);
  if (!profile) {
    return { ok: false, error: "Impossible de récupérer le profil Instagram." };
  }

  // 4. Fetch account-level insights (may fail for non-business accounts)
  const accountInsights = await fetchAccountInsights(connection.igUserId, token);

  // 5. Save snapshot
  await prisma.instagramSnapshot.create({
    data: {
      connectionId: connection.id,
      followers: profile.followersCount,
      follows: profile.followsCount,
      mediaCount: profile.mediaCount,
      reach: accountInsights.reach ?? null,
      impressions: accountInsights.impressions ?? null,
      profileViews: accountInsights.profileViews ?? null,
    },
  });

  // 6. Fetch recent media
  const mediaItems = await fetchRecentMedia(token);

  // 7. Upsert media + fetch per-media insights
  let mediaSynced = 0;
  for (const item of mediaItems) {
    // Per-media insights (may fail for some media types)
    const insights = await fetchMediaInsights(item.id, token);

    await prisma.instagramMedia.upsert({
      where: {
        connectionId_igMediaId: {
          connectionId: connection.id,
          igMediaId: item.id,
        },
      },
      create: {
        connectionId: connection.id,
        igMediaId: item.id,
        mediaType: item.media_type,
        caption: item.caption ?? null,
        permalink: item.permalink ?? null,
        timestamp: new Date(item.timestamp),
        likeCount: item.like_count ?? 0,
        commentsCount: item.comments_count ?? 0,
        reach: insights.reach ?? null,
        impressions: insights.impressions ?? null,
        saved: insights.saved ?? null,
      },
      update: {
        caption: item.caption ?? null,
        likeCount: item.like_count ?? 0,
        commentsCount: item.comments_count ?? 0,
        reach: insights.reach ?? null,
        impressions: insights.impressions ?? null,
        saved: insights.saved ?? null,
      },
    });
    mediaSynced++;
  }

  // 8. Update lastSyncAt + username if changed
  await prisma.instagramConnection.update({
    where: { id: connection.id },
    data: {
      lastSyncAt: new Date(),
      igUsername: profile.username,
    },
  });

  return {
    ok: true,
    followers: profile.followersCount,
    mediaCount: profile.mediaCount,
    mediaSynced,
  };
}
