"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { analyzeBio, generateBios, type BioAnalysis } from "@/modules/bio";

const analyzeBioSchema = z.object({
  bio: z.string().trim().min(1, "Please enter your current bio."),
  workspaceId: z.string().min(1, "Workspace is required."),
});

export interface BioState {
  analysis?: BioAnalysis;
  suggestions?: { text: string; style: string; description: string }[];
  error?: string;
}

export async function analyzeBioAction(
  _prev: BioState | null,
  formData: FormData
): Promise<BioState | null> {
  const userId = await getSession();
  if (!userId) redirect("/login");

  const parsed = analyzeBioSchema.safeParse({
    bio: formData.get("bio") ?? "",
    workspaceId: formData.get("workspaceId") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { bio, workspaceId } = parsed.data;

  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId, userId },
  });
  if (!workspace) return { error: "Workspace not found." };

  const goals: string[] = JSON.parse(workspace.goals);

  const analysis = analyzeBio(bio, workspace.niche);
  const suggestions = generateBios({
    niche: workspace.niche,
    platform: workspace.mainPlatform,
    profileType: workspace.profileType,
    goals,
  });

  return { analysis, suggestions };
}
