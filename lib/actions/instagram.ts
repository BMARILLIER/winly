"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { syncInstagramData, type SyncResult } from "@/lib/services/instagram-sync";

export async function getInstagramConnection() {
  const user = await requireAuth();

  const connection = await prisma.instagramConnection.findUnique({
    where: { userId: user.id },
    select: {
      igUsername: true,
      connectedAt: true,
      tokenExpiresAt: true,
      lastSyncAt: true,
    },
  });

  return connection;
}

export async function disconnectInstagram() {
  const user = await requireAuth();

  await prisma.instagramConnection.delete({
    where: { userId: user.id },
  }).catch(() => {
    // Already disconnected — ignore
  });
}

export async function syncInstagram(): Promise<SyncResult> {
  const user = await requireAuth();
  return syncInstagramData(user.id);
}
