"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { Persona as PersonaInput } from "@/modules/persona-engine";

export async function savePersona(data: PersonaInput) {
  const userId = await getSession();
  if (!userId) redirect("/login");

  // Max 3 personas per user
  const count = await prisma.persona.count({ where: { userId } });
  if (count >= 3) {
    return { ok: false, error: "Maximum 3 personas atteint." };
  }

  // Deactivate all existing personas, activate the new one
  await prisma.persona.updateMany({
    where: { userId, isActive: true },
    data: { isActive: false },
  });

  const persona = await prisma.persona.create({
    data: {
      userId,
      name: data.name,
      niche: data.niche,
      tone: data.tone,
      platform: data.platform,
      bio: data.bio,
      catchphrase: data.catchphrase,
      visualStyle: data.visual_style,
      isActive: true,
    },
  });

  return { ok: true, personaId: persona.id };
}

export async function getMyPersonas() {
  const userId = await getSession();
  if (!userId) redirect("/login");

  return prisma.persona.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function deletePersona(personaId: string) {
  const userId = await getSession();
  if (!userId) redirect("/login");

  await prisma.persona.deleteMany({
    where: { id: personaId, userId },
  });

  return { ok: true };
}

export async function setActivePersona(personaId: string) {
  const userId = await getSession();
  if (!userId) redirect("/login");

  await prisma.persona.updateMany({
    where: { userId, isActive: true },
    data: { isActive: false },
  });

  await prisma.persona.updateMany({
    where: { id: personaId, userId },
    data: { isActive: true },
  });

  return { ok: true };
}
