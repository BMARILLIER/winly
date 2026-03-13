"use server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const MOCK_USERNAME = "barbara.crowft_dj";
const MOCK_IG_USER_ID = "mock_17841400000000";

const CAPTIONS = [
  "Sunset vibes at the rooftop 🌅 #dj #music #sunset",
  "New set dropping this weekend! Stay tuned 🎵",
  "Behind the scenes — studio session 🎧",
  "Festival memories ✨ What an incredible crowd!",
  "Merci pour cette soirée incroyable 🔥 #live #djlife",
  "New collab coming soon... 👀",
  "Morning coffee & playlist curation ☕🎶",
  "Throwback to this amazing venue 🏟️",
  "Weekend mood 🎉 Who's ready?",
  "Grateful for every single one of you 💜 #community",
  "Studio time — cooking something special 🍳🎵",
  "When the drop hits just right 💥",
  "Vinyl collection growing 📀 #oldschool",
  "Sound check ✅ Ready for tonight!",
  "Best crowd energy I've felt in months 🙌",
];

const MEDIA_TYPES = ["IMAGE", "VIDEO", "CAROUSEL_ALBUM", "VIDEO", "IMAGE", "VIDEO"];

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function injectMockInstagramData(): Promise<{
  ok: boolean;
  error?: string;
  summary?: string;
}> {
  const user = await requireAdmin();

  try {
    // Clean existing mock data
    const existing = await prisma.instagramConnection.findUnique({
      where: { userId: user.id },
    });

    if (existing) {
      await prisma.instagramMedia.deleteMany({ where: { connectionId: existing.id } });
      await prisma.instagramSnapshot.deleteMany({ where: { connectionId: existing.id } });
      await prisma.instagramConnection.delete({ where: { id: existing.id } });
    }

    // Create mock connection
    const connection = await prisma.instagramConnection.create({
      data: {
        userId: user.id,
        igUserId: MOCK_IG_USER_ID,
        igUsername: MOCK_USERNAME,
        accessToken: "mock_encrypted_token_for_testing",
        tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        lastSyncAt: new Date(),
      },
    });

    // Create snapshots (90 days of history)
    const snapshots = [];
    let followers = 8420;
    for (let i = 89; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      // Organic growth with some variation
      followers += rand(-5, 25);
      snapshots.push({
        connectionId: connection.id,
        followers,
        follows: rand(480, 520),
        mediaCount: 15 + Math.floor((89 - i) / 6),
        reach: i < 30 ? rand(12000, 28000) : null,
        impressions: i < 30 ? rand(18000, 45000) : null,
        profileViews: i < 30 ? rand(200, 800) : null,
        createdAt: date,
      });
    }
    await prisma.instagramSnapshot.createMany({ data: snapshots });

    // Create mock media (15 posts over last 60 days)
    const mediaItems = [];
    for (let i = 0; i < 15; i++) {
      const daysAgo = Math.floor(i * 4) + rand(0, 2);
      const postDate = new Date();
      postDate.setDate(postDate.getDate() - daysAgo);
      postDate.setHours(rand(9, 21), rand(0, 59));

      const mediaType = MEDIA_TYPES[i % MEDIA_TYPES.length];
      const isVideo = mediaType === "VIDEO";
      const baseLikes = isVideo ? rand(180, 650) : rand(80, 350);
      const baseComments = isVideo ? rand(12, 55) : rand(5, 25);

      mediaItems.push({
        connectionId: connection.id,
        igMediaId: `mock_media_${i}_${Date.now()}`,
        mediaType,
        caption: CAPTIONS[i % CAPTIONS.length],
        permalink: `https://www.instagram.com/p/mock${i}/`,
        timestamp: postDate,
        likeCount: baseLikes,
        commentsCount: baseComments,
        reach: rand(2000, 12000),
        impressions: rand(3000, 18000),
        saved: rand(5, 80),
      });
    }
    await prisma.instagramMedia.createMany({ data: mediaItems });

    const finalFollowers = snapshots[snapshots.length - 1].followers;

    return {
      ok: true,
      summary: `Données injectées : @${MOCK_USERNAME}, ${finalFollowers} abonnés, ${mediaItems.length} posts, 90 jours d'historique.`,
    };
  } catch (err) {
    console.error("[instagram-mock] Error:", err);
    return { ok: false, error: String(err) };
  }
}

export async function clearMockInstagramData(): Promise<{ ok: boolean; error?: string }> {
  const user = await requireAdmin();

  try {
    const existing = await prisma.instagramConnection.findUnique({
      where: { userId: user.id },
    });

    if (existing) {
      await prisma.instagramMedia.deleteMany({ where: { connectionId: existing.id } });
      await prisma.instagramSnapshot.deleteMany({ where: { connectionId: existing.id } });
      await prisma.instagramConnection.delete({ where: { id: existing.id } });
    }

    // Also clear AI insights
    await prisma.aiInsight.deleteMany({ where: { userId: user.id } });

    return { ok: true };
  } catch (err) {
    console.error("[instagram-mock] Clear error:", err);
    return { ok: false, error: String(err) };
  }
}
