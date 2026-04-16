import { prisma } from "@/lib/db";

/**
 * Returns the active Instagram connection for a user.
 * If multiple connections exist, returns the one marked isActive.
 * Falls back to the most recently connected account.
 */
export async function getActiveConnection(userId: string) {
  const connections = await prisma.instagramConnection.findMany({
    where: { userId },
    orderBy: { connectedAt: "desc" },
  });

  if (connections.length === 0) return null;

  return connections.find((c) => c.isActive) ?? connections[0];
}

/**
 * Same as getActiveConnection but includes snapshots and media.
 */
export async function getActiveConnectionWithData(
  userId: string,
  opts?: { snapshotsTake?: number; mediaTake?: number },
) {
  const connections = await prisma.instagramConnection.findMany({
    where: { userId },
    include: {
      snapshots: { orderBy: { createdAt: "desc" }, take: opts?.snapshotsTake ?? 90 },
      media: { orderBy: { timestamp: "desc" }, take: opts?.mediaTake ?? 25 },
    },
    orderBy: { connectedAt: "desc" },
  });

  if (connections.length === 0) return null;

  return connections.find((c) => c.isActive) ?? connections[0];
}

/**
 * Returns all connections for a user (for the settings UI).
 */
export async function getAllConnections(userId: string) {
  return prisma.instagramConnection.findMany({
    where: { userId },
    orderBy: { connectedAt: "desc" },
    select: {
      id: true,
      igUserId: true,
      igUsername: true,
      isActive: true,
      lastSyncAt: true,
      connectedAt: true,
      tokenExpiresAt: true,
    },
  });
}

/**
 * Set a connection as active and deactivate others for this user.
 */
export async function setActiveConnection(userId: string, connectionId: string) {
  await prisma.$transaction([
    prisma.instagramConnection.updateMany({
      where: { userId },
      data: { isActive: false },
    }),
    prisma.instagramConnection.update({
      where: { id: connectionId },
      data: { isActive: true },
    }),
  ]);
}
