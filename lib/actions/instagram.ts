"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import {
  getActiveConnection,
  getAllConnections,
  setActiveConnection,
} from "@/lib/services/instagram-connection";
import { syncInstagramData, type SyncResult } from "@/lib/services/instagram-sync";

export async function getInstagramConnection() {
  const user = await requireAuth();
  const connection = await getActiveConnection(user.id);
  if (!connection) return null;
  return {
    igUsername: connection.igUsername,
    connectedAt: connection.connectedAt,
    tokenExpiresAt: connection.tokenExpiresAt,
    lastSyncAt: connection.lastSyncAt,
  };
}

export async function getInstagramConnections() {
  const user = await requireAuth();
  return getAllConnections(user.id);
}

export async function switchInstagramAccount(connectionId: string) {
  const user = await requireAuth();
  const connections = await getAllConnections(user.id);
  const target = connections.find((c) => c.id === connectionId);
  if (!target) return { ok: false, error: "Compte introuvable." };
  await setActiveConnection(user.id, connectionId);
  revalidatePath("/settings");
  return { ok: true };
}

export async function disconnectInstagram(connectionId?: string) {
  const user = await requireAuth();

  if (connectionId) {
    await prisma.instagramConnection.delete({
      where: { id: connectionId },
    }).catch(() => {});
  } else {
    const active = await getActiveConnection(user.id);
    if (active) {
      await prisma.instagramConnection.delete({
        where: { id: active.id },
      }).catch(() => {});
    }
  }

  // If there are remaining connections, activate the first one
  const remaining = await getAllConnections(user.id);
  if (remaining.length > 0 && !remaining.some((c) => c.isActive)) {
    await setActiveConnection(user.id, remaining[0].id);
  }

  revalidatePath("/settings");
}

export async function syncInstagram(): Promise<SyncResult> {
  const user = await requireAuth();
  return syncInstagramData(user.id);
}
