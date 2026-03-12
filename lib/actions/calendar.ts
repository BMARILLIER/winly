"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const scheduleContentSchema = z.object({
  ideaId: z.string().min(1, "Content ID is required."),
  date: z.string().min(1, "Date is required."),
});

const ideaIdSchema = z.object({
  ideaId: z.string().min(1, "Content ID is required."),
});

const updateCalendarStatusSchema = z.object({
  ideaId: z.string().min(1, "Content ID is required."),
  status: z.enum(["idea", "draft", "ready", "published", "archived"], {
    error: "Invalid status.",
  }),
});

const createAndScheduleSchema = z.object({
  workspaceId: z.string().min(1, "Workspace is required."),
  title: z.string().trim().min(1, "Title is required."),
  date: z.string().min(1, "Date is required."),
});

export async function scheduleContent(formData: FormData): Promise<void> {
  const userId = await getSession();
  if (!userId) redirect("/login");

  const parsed = scheduleContentSchema.safeParse({
    ideaId: formData.get("ideaId") ?? "",
    date: formData.get("date") ?? "",
  });

  if (!parsed.success) return;

  const { ideaId, date } = parsed.data;

  const idea = await prisma.contentIdea.findUnique({
    where: { id: ideaId },
    include: { workspace: { select: { userId: true } } },
  });
  if (!idea || idea.workspace.userId !== userId) return;

  await prisma.contentIdea.update({
    where: { id: ideaId },
    data: { scheduledDate: date },
  });

  revalidatePath("/calendar");
}

export async function unscheduleContent(formData: FormData): Promise<void> {
  const userId = await getSession();
  if (!userId) redirect("/login");

  const parsed = ideaIdSchema.safeParse({
    ideaId: formData.get("ideaId") ?? "",
  });
  if (!parsed.success) return;

  const { ideaId } = parsed.data;

  const idea = await prisma.contentIdea.findUnique({
    where: { id: ideaId },
    include: { workspace: { select: { userId: true } } },
  });
  if (!idea || idea.workspace.userId !== userId) return;

  await prisma.contentIdea.update({
    where: { id: ideaId },
    data: { scheduledDate: null },
  });

  revalidatePath("/calendar");
}

export async function updateCalendarStatus(formData: FormData): Promise<void> {
  const userId = await getSession();
  if (!userId) redirect("/login");

  const parsed = updateCalendarStatusSchema.safeParse({
    ideaId: formData.get("ideaId") ?? "",
    status: formData.get("status") ?? "",
  });

  if (!parsed.success) return;

  const { ideaId, status } = parsed.data;

  const idea = await prisma.contentIdea.findUnique({
    where: { id: ideaId },
    include: { workspace: { select: { userId: true } } },
  });
  if (!idea || idea.workspace.userId !== userId) return;

  await prisma.contentIdea.update({
    where: { id: ideaId },
    data: { status },
  });

  revalidatePath("/calendar");
}

export async function createAndSchedule(formData: FormData): Promise<void> {
  const userId = await getSession();
  if (!userId) redirect("/login");

  const parsed = createAndScheduleSchema.safeParse({
    workspaceId: formData.get("workspaceId") ?? "",
    title: formData.get("title") ?? "",
    date: formData.get("date") ?? "",
  });

  if (!parsed.success) return;

  const { workspaceId, title, date } = parsed.data;

  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId, userId },
  });
  if (!workspace) return;

  await prisma.contentIdea.create({
    data: {
      workspaceId,
      title,
      hook: "",
      format: "text",
      caption: "",
      cta: "",
      status: "idea",
      scheduledDate: date,
    },
  });

  revalidatePath("/calendar");
}
