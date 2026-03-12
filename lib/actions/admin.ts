"use server";

import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { logAdminAction } from "./admin-log";

const updateUserRoleSchema = z.object({
  userId: z.string().min(1, "User ID is required."),
  role: z.enum(["user", "admin"], {
    error: "Invalid role.",
  }),
});

const deleteUserSchema = z.object({
  userId: z.string().min(1, "User ID is required."),
});

const deleteWorkspaceSchema = z.object({
  workspaceId: z.string().min(1, "Workspace ID is required."),
});

const deleteContentSchema = z.object({
  contentId: z.string().min(1, "Content ID is required."),
});

const updateSystemSettingSchema = z.object({
  key: z.string().min(1, "Setting key is required."),
  value: z.string({ error: "Setting value is required." }),
});

export async function updateUserRole(formData: FormData) {
  const admin = await requireAdmin();
  const parsed = updateUserRoleSchema.safeParse({
    userId: formData.get("userId") ?? "",
    role: formData.get("role") ?? "",
  });

  if (!parsed.success) return;

  const { userId: targetUserId, role: newRole } = parsed.data;

  // Prevent removing the last admin
  if (newRole !== "admin") {
    const adminCount = await prisma.user.count({
      where: { role: "admin" },
    });
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { role: true },
    });
    if (targetUser?.role === "admin" && adminCount <= 1) {
      return;
    }
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { role: true, email: true },
  });

  await prisma.user.update({
    where: { id: targetUserId },
    data: { role: newRole },
  });

  await logAdminAction(admin.id, "user.role.update", targetUserId, {
    email: targetUser?.email,
    oldRole: targetUser?.role,
    newRole,
  });

  revalidatePath("/admin/users");
}

export async function deleteUser(formData: FormData) {
  const admin = await requireAdmin();
  const parsed = deleteUserSchema.safeParse({
    userId: formData.get("userId") ?? "",
  });
  if (!parsed.success) return;

  const targetUserId = parsed.data.userId;

  // Prevent self-delete
  if (targetUserId === admin.id) return;

  // Prevent deleting the last admin
  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { role: true, email: true },
  });
  if (targetUser?.role === "admin") {
    const adminCount = await prisma.user.count({
      where: { role: "admin" },
    });
    if (adminCount <= 1) return;
  }

  // Cascade delete: content ideas, saved hooks, social profiles, workspaces
  const workspaces = await prisma.workspace.findMany({
    where: { userId: targetUserId },
    select: { id: true },
  });
  const workspaceIds = workspaces.map((w) => w.id);

  if (workspaceIds.length > 0) {
    await prisma.contentIdea.deleteMany({
      where: { workspaceId: { in: workspaceIds } },
    });
    await prisma.savedHook.deleteMany({
      where: { workspaceId: { in: workspaceIds } },
    });
    await prisma.socialProfile.deleteMany({
      where: { workspaceId: { in: workspaceIds } },
    });
    await prisma.missionCompletion.deleteMany({
      where: { workspaceId: { in: workspaceIds } },
    });
    await prisma.workspace.deleteMany({
      where: { userId: targetUserId },
    });
  }

  await prisma.auditResult.deleteMany({ where: { userId: targetUserId } });
  await prisma.scoreResult.deleteMany({ where: { userId: targetUserId } });
  await prisma.creatorScore.deleteMany({ where: { userId: targetUserId } });
  await prisma.user.delete({ where: { id: targetUserId } });

  await logAdminAction(admin.id, "user.delete", targetUserId, {
    email: targetUser?.email,
    role: targetUser?.role,
  });

  revalidatePath("/admin/users");
}

export async function deleteWorkspace(formData: FormData) {
  const admin = await requireAdmin();
  const parsed = deleteWorkspaceSchema.safeParse({
    workspaceId: formData.get("workspaceId") ?? "",
  });
  if (!parsed.success) return;

  const { workspaceId } = parsed.data;

  await prisma.contentIdea.deleteMany({ where: { workspaceId } });
  await prisma.savedHook.deleteMany({ where: { workspaceId } });
  await prisma.socialProfile.deleteMany({ where: { workspaceId } });
  await prisma.missionCompletion.deleteMany({ where: { workspaceId } });
  await prisma.workspace.delete({ where: { id: workspaceId } });

  await logAdminAction(admin.id, "workspace.delete", workspaceId);

  revalidatePath("/admin/workspaces");
}

export async function deleteContent(formData: FormData) {
  const admin = await requireAdmin();
  const parsed = deleteContentSchema.safeParse({
    contentId: formData.get("contentId") ?? "",
  });
  if (!parsed.success) return;

  const { contentId } = parsed.data;

  await prisma.contentIdea.delete({ where: { id: contentId } });

  await logAdminAction(admin.id, "content.delete", contentId);

  revalidatePath("/admin/content");
}

export async function updateSystemSetting(formData: FormData) {
  const admin = await requireAdmin();
  const parsed = updateSystemSettingSchema.safeParse({
    key: formData.get("key") ?? "",
    value: formData.get("value") ?? "",
  });

  if (!parsed.success) return;

  const { key, value } = parsed.data;

  await prisma.systemSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });

  await logAdminAction(admin.id, "setting.update", key, { value });

  revalidatePath("/admin/settings");
}
