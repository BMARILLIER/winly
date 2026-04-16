"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function getDailyCoachStatus(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  try {
    const row = await prisma.$queryRaw<{ dailyCoachEnabled: number }[]>(
      Prisma.sql`SELECT dailyCoachEnabled FROM User WHERE id = ${user.id}`,
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
    await prisma.$executeRaw(
      Prisma.sql`UPDATE User SET dailyCoachEnabled = ${enabled ? 1 : 0} WHERE id = ${user.id}`,
    );
    revalidatePath("/settings");
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
