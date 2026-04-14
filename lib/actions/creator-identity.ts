"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export interface CreatorIdentityData {
  bio: string;
  tone: string;
  values: string;
  story: string;
  products: string;
  expertise: string;
  audience: string;
  catchphrases: string;
  avoid: string;
  references: string;
  freeNotes: string;
}

export async function getCreatorIdentity(workspaceId: string): Promise<CreatorIdentityData | null> {
  const userId = await getSession();
  if (!userId) return null;

  const identity = await prisma.creatorIdentity.findUnique({
    where: { workspaceId },
  });

  if (!identity) return null;

  return {
    bio: identity.bio ?? "",
    tone: identity.tone ?? "",
    values: identity.values ?? "",
    story: identity.story ?? "",
    products: identity.products ?? "",
    expertise: identity.expertise ?? "",
    audience: identity.audience ?? "",
    catchphrases: identity.catchphrases ?? "",
    avoid: identity.avoid ?? "",
    references: identity.references ?? "",
    freeNotes: identity.freeNotes ?? "",
  };
}

export async function saveCreatorIdentity(
  workspaceId: string,
  data: CreatorIdentityData
): Promise<{ ok: boolean; error?: string }> {
  const userId = await getSession();
  if (!userId) redirect("/login");

  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId, userId },
  });
  if (!workspace) return { ok: false, error: "Workspace introuvable." };

  await prisma.creatorIdentity.upsert({
    where: { workspaceId },
    create: {
      workspaceId,
      bio: data.bio || null,
      tone: data.tone || null,
      values: data.values || null,
      story: data.story || null,
      products: data.products || null,
      expertise: data.expertise || null,
      audience: data.audience || null,
      catchphrases: data.catchphrases || null,
      avoid: data.avoid || null,
      references: data.references || null,
      freeNotes: data.freeNotes || null,
    },
    update: {
      bio: data.bio || null,
      tone: data.tone || null,
      values: data.values || null,
      story: data.story || null,
      products: data.products || null,
      expertise: data.expertise || null,
      audience: data.audience || null,
      catchphrases: data.catchphrases || null,
      avoid: data.avoid || null,
      references: data.references || null,
      freeNotes: data.freeNotes || null,
    },
  });

  revalidatePath("/identity");
  revalidatePath("/repurpose");
  return { ok: true };
}

/**
 * Build a context string from the creator identity for injection into AI prompts.
 */
export async function getIdentityContext(workspaceId: string): Promise<string> {
  const identity = await getCreatorIdentity(workspaceId);
  if (!identity) return "";

  const parts: string[] = [];

  if (identity.bio) parts.push(`Qui je suis : ${identity.bio}`);
  if (identity.tone) parts.push(`Mon ton : ${identity.tone}`);
  if (identity.values) parts.push(`Mes valeurs : ${identity.values}`);
  if (identity.story) parts.push(`Mon parcours : ${identity.story}`);
  if (identity.products) parts.push(`Mes produits/services : ${identity.products}`);
  if (identity.expertise) parts.push(`Mon expertise : ${identity.expertise}`);
  if (identity.audience) parts.push(`Mon audience : ${identity.audience}`);
  if (identity.catchphrases) parts.push(`Mes expressions signatures : ${identity.catchphrases}`);
  if (identity.avoid) parts.push(`À NE JAMAIS faire/dire : ${identity.avoid}`);
  if (identity.references) parts.push(`Mes inspirations : ${identity.references}`);
  if (identity.freeNotes) parts.push(`Notes : ${identity.freeNotes}`);

  return parts.join("\n");
}
