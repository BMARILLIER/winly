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
  format: z.enum(["carousel", "reel", "single_image", "text", "story", "thread", "live"], {
    error: "Veuillez sélectionner un format.",
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

export async function generateContentWithAI(
  topic: string,
  format: string,
  niche: string,
  platform: string
): Promise<{
  ok: boolean;
  hook?: string;
  caption?: string;
  cta?: string;
  error?: string;
}> {
  const userId = await getSession();
  if (!userId) return { ok: false, error: "Non connecté." };

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "Clé API non configurée." };
  }

  const formatLabels: Record<string, string> = {
    carousel: "Carrousel",
    reel: "Reel / Vidéo courte",
    single_image: "Image unique",
    text: "Post texte",
    story: "Story",
    thread: "Thread",
    live: "Live",
  };
  const formatLabel = formatLabels[format] || format;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: `Tu es un expert en création de contenu pour les réseaux sociaux. Tu génères du contenu engageant en français.

Règles :
- Réponds UNIQUEMENT en JSON valide (pas de markdown, pas de backticks)
- Contenu adapté à la plateforme ${platform}
- Niche du créateur : ${niche}
- Format du post : ${formatLabel}
- Ton : authentique, engageant, professionnel mais accessible
- Le hook doit capter l'attention immédiatement (1 phrase percutante)
- La caption doit être complète et prête à publier (3-5 phrases)
- Le CTA doit encourager l'interaction

Structure JSON exacte :
{
  "hook": "phrase d'accroche percutante",
  "caption": "légende complète prête à publier avec emojis et hashtags",
  "cta": "appel à l'action engageant"
}`,
        messages: [
          {
            role: "user",
            content: `Génère un contenu ${formatLabel} sur le sujet : "${topic}"`,
          },
        ],
      }),
    });

    if (!res.ok) {
      throw new Error(`API error ${res.status}`);
    }

    const body = await res.json();
    const text = body.content?.[0]?.text;
    if (!text) throw new Error("Réponse vide");

    const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed = JSON.parse(cleaned) as {
      hook: string;
      caption: string;
      cta: string;
    };

    return {
      ok: true,
      hook: parsed.hook,
      caption: parsed.caption,
      cta: parsed.cta,
    };
  } catch (err) {
    console.error("[content-ai] Error:", err);
    return { ok: false, error: "Erreur lors de la génération IA." };
  }
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
