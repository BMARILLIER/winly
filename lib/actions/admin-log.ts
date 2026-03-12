"use server";

import { prisma } from "@/lib/db";

export async function logAdminAction(
  adminId: string,
  action: string,
  target?: string,
  details?: Record<string, unknown>
) {
  await prisma.adminLog.create({
    data: {
      adminId,
      action,
      target: target ?? null,
      details: details ? JSON.stringify(details) : null,
    },
  });
}
