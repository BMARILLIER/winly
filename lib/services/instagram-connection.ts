import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function getActiveConnection(userId: string) {
  try {
    const connections = await prisma.instagramConnection.findMany({
      where: { userId },
      orderBy: { connectedAt: "desc" },
    });

    if (connections.length === 0) return null;

    return connections.find((c) => c.isActive) ?? connections[0];
  } catch {
    try {
      const rows = await prisma.$queryRaw<
        { id: string; userId: string; igUserId: string; igUsername: string; accessToken: string; tokenExpiresAt: string | null; lastSyncAt: string | null; connectedAt: string }[]
      >(Prisma.sql`SELECT * FROM InstagramConnection WHERE userId = ${userId} ORDER BY connectedAt DESC LIMIT 1`);
      if (!rows || rows.length === 0) return null;
      const r = rows[0];
      return {
        id: r.id,
        userId: r.userId,
        igUserId: r.igUserId,
        igUsername: r.igUsername,
        accessToken: r.accessToken,
        tokenExpiresAt: r.tokenExpiresAt ? new Date(r.tokenExpiresAt) : null,
        lastSyncAt: r.lastSyncAt ? new Date(r.lastSyncAt) : null,
        connectedAt: new Date(r.connectedAt),
        isActive: true,
        updatedAt: new Date(),
      };
    } catch {
      return null;
    }
  }
}

export async function getActiveConnectionWithData(
  userId: string,
  opts?: { snapshotsTake?: number; mediaTake?: number },
) {
  try {
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
  } catch {
    const conn = await getActiveConnection(userId);
    if (!conn) return null;
    const [snapshots, media] = await Promise.all([
      prisma.instagramSnapshot.findMany({
        where: { connectionId: conn.id },
        orderBy: { createdAt: "desc" },
        take: opts?.snapshotsTake ?? 90,
      }),
      prisma.instagramMedia.findMany({
        where: { connectionId: conn.id },
        orderBy: { timestamp: "desc" },
        take: opts?.mediaTake ?? 25,
      }),
    ]);
    return { ...conn, snapshots, media };
  }
}

export async function getAllConnections(userId: string) {
  try {
    return await prisma.instagramConnection.findMany({
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
  } catch {
    const rows = await prisma.$queryRaw<
      { id: string; igUserId: string; igUsername: string; lastSyncAt: string | null; connectedAt: string; tokenExpiresAt: string | null }[]
    >(Prisma.sql`SELECT id, igUserId, igUsername, lastSyncAt, connectedAt, tokenExpiresAt FROM InstagramConnection WHERE userId = ${userId} ORDER BY connectedAt DESC`);
    return rows.map((r, i) => ({
      id: r.id,
      igUserId: r.igUserId,
      igUsername: r.igUsername,
      isActive: i === 0,
      lastSyncAt: r.lastSyncAt ? new Date(r.lastSyncAt) : null,
      connectedAt: new Date(r.connectedAt),
      tokenExpiresAt: r.tokenExpiresAt ? new Date(r.tokenExpiresAt) : null,
    }));
  }
}

export async function setActiveConnection(userId: string, connectionId: string) {
  try {
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
  } catch {
    // isActive column may not exist yet
  }
}
