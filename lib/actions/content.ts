"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const createContentSchema = z.object({
  workspaceId: z.string().min(1, "Workspace not found."),
  title: z.string().trim().min(1, "Title is required."),
  hook: z.string().trim().optional().default(""),
  format: z.enum(["text", "image", "video", "carousel", "reel", "story", "live"], {
    error: "Please select a format.",
  }),
  caption: z.string().trim().optional().default(""),
  cta: z.string().trim().optional().default(""),
});

const updateContentStatusSchema = z.object({
  ideaId: z.string().min(1, "Content ID is required."),
  status: z.enum(["idea", "draft", "ready", "published", "archived"], {
    error: "Invalid status.",
  }),
});

const saveGeneratedIdeaSchema = z.object({
  workspaceId: z.string().min(1, "Workspace not found."),
  title: z.string().min(1, "Title is required."),
  hook: z.string().optional().default(""),
  format: z.string().optional().default("text"),
  caption: z.string().optional().default(""),
  cta: z.string().optional().default(""),
});

export type ContentState = { error?: string; success?: boolean } | null;

export async function createContentIdea(
  _prev: ContentState,
  formData: FormData
): Promise<ContentState> {
  const userId = await getSession();
  if (!userId) redirect("/login");

  const parsed = createContentSchema.safeParse({
    workspaceId: formData.get("workspaceId") ?? "",
    title: formData.get("title") ?? "",
    hook: formData.get("hook") ?? "",
    format: formData.get("format") ?? "",
    caption: formData.get("caption") ?? "",
    cta: formData.get("cta") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { workspaceId, title, hook, format, caption, cta } = parsed.data;

  // Verify ownership
  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId, userId },
  });
  if (!workspace) return { error: "Workspace not found." };

  await prisma.contentIdea.create({
    data: {
      workspaceId,
      title,
      hook,
      format,
      caption,
      cta,
    },
  });

  revalidatePath("/content");
  return { success: true };
}

export async function updateContentStatus(
  formData: FormData
): Promise<void> {
  const userId = await getSession();
  if (!userId) redirect("/login");

  const parsed = updateContentStatusSchema.safeParse({
    ideaId: formData.get("ideaId") ?? "",
    status: formData.get("status") ?? "",
  });

  if (!parsed.success) return;

  const { ideaId, status } = parsed.data;

  // Verify ownership through workspace
  const idea = await prisma.contentIdea.findUnique({
    where: { id: ideaId },
    include: { workspace: { select: { userId: true } } },
  });
  if (!idea || idea.workspace.userId !== userId) return;

  await prisma.contentIdea.update({
    where: { id: ideaId },
    data: { status },
  });

  revalidatePath("/content");
}

export async function deleteContentIdea(
  formData: FormData
): Promise<void> {
  const userId = await getSession();
  if (!userId) redirect("/login");

  const parsed = z.object({ ideaId: z.string().min(1) }).safeParse({
    ideaId: formData.get("ideaId") ?? "",
  });
  if (!parsed.success) return;

  const { ideaId } = parsed.data;

  const idea = await prisma.contentIdea.findUnique({
    where: { id: ideaId },
    include: { workspace: { select: { userId: true } } },
  });
  if (!idea || idea.workspace.userId !== userId) return;

  await prisma.contentIdea.delete({ where: { id: ideaId } });

  revalidatePath("/content");
}

export async function saveGeneratedIdea(
  formData: FormData
): Promise<void> {
  const userId = await getSession();
  if (!userId) redirect("/login");

  const parsed = saveGeneratedIdeaSchema.safeParse({
    workspaceId: formData.get("workspaceId") ?? "",
    title: formData.get("title") ?? "",
    hook: formData.get("hook") ?? "",
    format: formData.get("format") ?? "",
    caption: formData.get("caption") ?? "",
    cta: formData.get("cta") ?? "",
  });

  if (!parsed.success) return;

  const { workspaceId, title, hook, format, caption, cta } = parsed.data;

  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId, userId },
  });
  if (!workspace) return;

  await prisma.contentIdea.create({
    data: {
      workspaceId,
      title,
      hook,
      format,
      caption,
      cta,
    },
  });

  revalidatePath("/content");
}
