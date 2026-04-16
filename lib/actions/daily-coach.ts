"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function getDailyCoachStatus(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  try {
    const row = await prisma.$queryRawUnsafe<{ dailyCoachEnabled: number }[]>(
      `SELECT dailyCoachEnabled FROM User WHERE id = ?`,
      user.id,
    );
    return row?.[0]?.dailyCoachEnabled === 1;
  } catch {
    return false;
  }
}

export async function setDailyCoachEnabled(enabled: boolean): Promise<{ ok: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false };
  try {
    await prisma.$executeRawUnsafe(
      `UPDATE User SET dailyCoachEnabled = ? WHERE id = ?`,
      enabled ? 1 : 0,
      user.id,
    );
    revalidatePath("/settings");
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
