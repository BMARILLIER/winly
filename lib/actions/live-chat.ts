"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { analyzeMessages } from "@/modules/live-chat";

// --- Get conversations for workspace ---

export async function getConversations() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const workspace = user.workspaces[0];
  if (!workspace) redirect("/onboarding");

  return prisma.chatConversation.findMany({
    where: { workspaceId: workspace.id },
    include: {
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: { select: { messages: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

// --- Get single conversation with messages ---

export async function getConversation(id: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const workspace = user.workspaces[0];
  if (!workspace) redirect("/onboarding");

  const conversation = await prisma.chatConversation.findFirst({
    where: { id, workspaceId: workspace.id },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      insights: { where: { dismissed: false }, orderBy: { createdAt: "desc" } },
    },
  });

  return conversation;
}

// --- Create conversation ---

export async function createConversation(data: {
  contactName: string;
  contactType: string;
  platform: string;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const workspace = user.workspaces[0];
  if (!workspace) redirect("/onboarding");

  const conversation = await prisma.chatConversation.create({
    data: {
      workspaceId: workspace.id,
      contactName: data.contactName.trim(),
      contactType: data.contactType,
      platform: data.platform,
    },
  });

  return conversation;
}

// --- Send message ---

export async function sendMessage(conversationId: string, content: string, sender: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const workspace = user.workspaces[0];
  if (!workspace) redirect("/onboarding");

  // Verify ownership
  const conversation = await prisma.chatConversation.findFirst({
    where: { id: conversationId, workspaceId: workspace.id },
  });
  if (!conversation) throw new Error("Conversation not found");

  // Create message
  const message = await prisma.chatMessage.create({
    data: {
      conversationId,
      sender,
      content: content.trim(),
    },
  });

  // Update conversation timestamp
  await prisma.chatConversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  // Run analysis on all messages
  const allMessages = await prisma.chatMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    select: { sender: true, content: true },
  });

  const analysis = analyzeMessages(allMessages);

  // Update interest score
  await prisma.chatConversation.update({
    where: { id: conversationId },
    data: { score: analysis.interestScore },
  });

  // Save new insights (clear old non-dismissed ones first)
  await prisma.chatInsight.deleteMany({
    where: { conversationId, dismissed: false },
  });

  const insightsToCreate = [
    ...analysis.opportunities.map((o) => ({
      conversationId,
      type: "opportunity" as const,
      label: o.label,
      description: `Confiance: ${o.confidence}`,
      priority: o.confidence === "high" ? "high" : o.confidence === "medium" ? "medium" : "low",
    })),
    ...analysis.suggestions.map((s) => ({
      conversationId,
      type: "suggestion" as const,
      label: s.text,
      description: s.action,
      priority: s.priority,
    })),
  ];

  if (insightsToCreate.length > 0) {
    await prisma.chatInsight.createMany({ data: insightsToCreate });
  }

  return { message, analysis };
}

// --- Update conversation ---

export async function updateConversation(
  id: string,
  data: { status?: string; notes?: string; tags?: string }
) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const workspace = user.workspaces[0];
  if (!workspace) redirect("/onboarding");

  const conversation = await prisma.chatConversation.findFirst({
    where: { id, workspaceId: workspace.id },
  });
  if (!conversation) throw new Error("Conversation not found");

  return prisma.chatConversation.update({
    where: { id },
    data,
  });
}

// --- Dismiss insight ---

export async function dismissInsight(insightId: string) {
  await prisma.chatInsight.update({
    where: { id: insightId },
    data: { dismissed: true },
  });
}

// --- Delete conversation ---

export async function deleteConversation(id: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const workspace = user.workspaces[0];
  if (!workspace) redirect("/onboarding");

  const conversation = await prisma.chatConversation.findFirst({
    where: { id, workspaceId: workspace.id },
  });
  if (!conversation) throw new Error("Conversation not found");

  await prisma.chatConversation.delete({ where: { id } });
}
