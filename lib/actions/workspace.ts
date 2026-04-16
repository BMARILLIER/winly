"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const workspaceSchema = z.object({
  name: z.string().trim().min(1, "Workspace name is required."),
  profileType: z.enum(["personal_brand", "business", "anonymous"], {
    error: "Veuillez sélectionner un type de profil.",
  }),
  mainPlatform: z.enum(["instagram", "tiktok", "youtube", "linkedin", "twitter"], {
    error: "Please select a platform.",
  }),
  niche: z.string().trim().min(1, "Please enter your niche."),
  goals: z.array(z.string()).min(1, "Please select at least one goal."),
  postFrequency: z.enum(["daily", "few_per_week", "weekly", "few_per_month", "irregular"], {
    error: "Veuillez sélectionner une fréquence.",
  }),
});

export type WorkspaceState = { error?: string; success?: boolean } | null;

export async function createWorkspace(
  _prev: WorkspaceState,
  formData: FormData
): Promise<WorkspaceState> {
  const userId = await getSession();
  if (!userId) redirect("/login");

  const parsed = workspaceSchema.safeParse({
    name: formData.get("name") ?? "",
    profileType: formData.get("profileType") ?? "",
    mainPlatform: formData.get("mainPlatform") ?? "",
    niche: formData.get("niche") ?? "",
    goals: formData.getAll("goals"),
    postFrequency: formData.get("postFrequency") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { name, profileType, mainPlatform, niche, goals, postFrequency } = parsed.data;

  await prisma.workspace.create({
    data: {
      name,
      profileType,
      mainPlatform,
      niche,
      goals: JSON.stringify(goals),
      postFrequency,
      userId,
    },
  });

  redirect("/onboarding/connect");
}

export async function updateWorkspace(
  _prev: WorkspaceState,
  formData: FormData
): Promise<WorkspaceState> {
  const userId = await getSession();
  if (!userId) redirect("/login");

  const workspaceId = formData.get("workspaceId") as string;
  if (!workspaceId) return { error: "Workspace not found." };

  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId, userId },
  });
  if (!workspace) return { error: "Workspace not found." };

  const parsed = workspaceSchema.safeParse({
    name: formData.get("name") ?? "",
    profileType: formData.get("profileType") ?? "",
    mainPlatform: formData.get("mainPlatform") ?? "",
    niche: formData.get("niche") ?? "",
    goals: formData.getAll("goals"),
    postFrequency: formData.get("postFrequency") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { name, profileType, mainPlatform, niche, goals, postFrequency } = parsed.data;

  await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      name,
      profileType,
      mainPlatform,
      niche,
      goals: JSON.stringify(goals),
      postFrequency,
    },
  });

  return { success: true };
}
