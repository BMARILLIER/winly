"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const completeMissionSchema = z.object({
  workspaceId: z.string().min(1, "Workspace is required."),
  missionId: z.string().min(1, "Mission ID is required."),
  date: z.string().min(1, "Date is required."),
  xp: z.coerce.number().int().min(0, "XP must be a positive number."),
});

export async function completeMission(formData: FormData): Promise<void> {
  const userId = await getSession();
  if (!userId) redirect("/login");

  const parsed = completeMissionSchema.safeParse({
    workspaceId: formData.get("workspaceId") ?? "",
    missionId: formData.get("missionId") ?? "",
    date: formData.get("date") ?? "",
    xp: formData.get("xp") ?? "",
  });

  if (!parsed.success) return;

  const { workspaceId, missionId, date, xp } = parsed.data;

  // Verify workspace ownership
  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId, userId },
  });
  if (!workspace) return;

  // Prevent duplicate completion
  const existing = await prisma.missionCompletion.findUnique({
    where: { workspaceId_missionId: { workspaceId, missionId } },
  });
  if (existing) return;

  await prisma.missionCompletion.create({
    data: { workspaceId, missionId, date, xp },
  });

  revalidatePath("/missions");
}
