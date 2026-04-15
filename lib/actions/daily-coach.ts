"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function getDailyCoachStatus(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  const row = await prisma.user.findUnique({
    where: { id: user.id },
    select: { dailyCoachEnabled: true },
  });
  return row?.dailyCoachEnabled ?? false;
}

export async function setDailyCoachEnabled(enabled: boolean): Promise<{ ok: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false };
  await prisma.user.update({
    where: { id: user.id },
    data: { dailyCoachEnabled: enabled },
  });
  revalidatePath("/settings");
  return { ok: true };
}
