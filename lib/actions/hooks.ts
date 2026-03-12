"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const saveHookSchema = z.object({
  workspaceId: z.string().min(1, "Workspace is required."),
  text: z.string().min(1, "Hook content is required."),
  type: z.enum(["question", "stat", "story", "bold", "curiosity"], {
    error: "Please select a hook type.",
  }),
});

const deleteHookSchema = z.object({
  hookId: z.string().min(1, "Hook ID is required."),
});

export async function saveHook(formData: FormData): Promise<void> {
  const userId = await getSession();
  if (!userId) redirect("/login");

  const parsed = saveHookSchema.safeParse({
    workspaceId: formData.get("workspaceId") ?? "",
    text: formData.get("text") ?? "",
    type: formData.get("type") ?? "",
  });

  if (!parsed.success) return;

  const { workspaceId, text, type } = parsed.data;

  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId, userId },
  });
  if (!workspace) return;

  await prisma.savedHook.create({
    data: { workspaceId, text, type },
  });

  revalidatePath("/hooks");
}

export async function deleteHook(formData: FormData): Promise<void> {
  const userId = await getSession();
  if (!userId) redirect("/login");

  const parsed = deleteHookSchema.safeParse({
    hookId: formData.get("hookId") ?? "",
  });
  if (!parsed.success) return;

  const { hookId } = parsed.data;

  const hook = await prisma.savedHook.findUnique({
    where: { id: hookId },
    include: { workspace: { select: { userId: true } } },
  });
  if (!hook || hook.workspace.userId !== userId) return;

  await prisma.savedHook.delete({ where: { id: hookId } });

  revalidatePath("/hooks");
}
