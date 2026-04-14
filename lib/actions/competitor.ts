"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getCachedResponse, setCachedResponse } from "@/lib/services/ai-cache";
import type { RepurposedContent } from "@/modules/repurpose";

/**
 * Save a competitor post for future inspiration.
 */
export async function saveCompetitorPost(
  workspaceId: string,
  source: string,
  text: string,
  notes: string
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const userId = await getSession();
  if (!userId) redirect("/login");

  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId, userId },
  });
  if (!workspace) return { ok: false, error: "Workspace introuvable." };

  const post = await prisma.competitorInspo.create({
    data: { workspaceId, source, text, notes: notes || null },
  });

  revalidatePath("/repurpose");
  return { ok: true, id: post.id };
}

/**
 * Get all saved competitor posts for a workspace.
 */
export async function getCompetitorPosts(workspaceId: string) {
  const userId = await getSession();
  if (!userId) redirect("/login");

  return prisma.competitorInspo.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

/**
 * Delete a competitor post.
 */
export async function deleteCompetitorPost(id: string): Promise<void> {
  const userId = await getSession();
  if (!userId) redirect("/login");

  await prisma.competitorInspo.delete({ where: { id } });
  revalidatePath("/repurpose");
}

/**
 * Generate original content inspired by a competitor post.
 * Claude analyzes what works in the competitor's post and creates original content
 * adapted to the user's niche and style.
 */
export async function repurposeFromCompetitor(
  competitorText: string,
  niche: string,
  platform: string,
  identityContext?: string
): Promise<{
  ok: boolean;
  results?: RepurposedContent[];
  fromCache?: boolean;
  error?: string;
}> {
  const userId = await getSession();
  if (!userId) redirect("/login");

  const cleaned = competitorText.trim();
  if (!cleaned) return { ok: false, error: "Contenu vide." };

  // Check cache
  const cached = await getCachedResponse<RepurposedContent[]>(
    "competitor_inspo",
    cleaned,
    niche
  );
  if (cached) {
    return { ok: true, results: cached, fromCache: true };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "Clé API non configurée." };
  }

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
        max_tokens: 4000,
        system: `Tu es un expert en création de contenu pour les réseaux sociaux.

L'utilisateur te donne le post d'un CONCURRENT qui a bien performé.
Tu dois t'en INSPIRER pour créer du contenu ORIGINAL adapté à l'identité du créateur.

Niche de l'utilisateur : ${niche}
Plateforme principale : ${platform}
${identityContext ? `\nProfil du créateur (utilise ces infos pour adapter le ton, le style et les références) :\n${identityContext}\n` : ""}
IMPORTANT :
- NE COPIE PAS le contenu concurrent — analyse ce qui fonctionne (hook, structure, angle, émotion) et crée quelque chose d'original
- Adapte au vocabulaire, au ton et à l'univers du créateur (pas juste la niche "${niche}")
- Le contenu doit sembler authentique et refléter l'identité du créateur, pas copié
- Garde la même énergie/structure qui a fait le succès du post original

Analyse d'abord ce qui fait le succès du post concurrent :
- Type de hook utilisé
- Structure du contenu
- Émotion déclenchée
- CTA utilisé

Puis génère 4 formats originaux inspirés de cette analyse.

Réponds UNIQUEMENT en JSON valide (pas de markdown, pas de backticks) :
[
  {
    "formatId": "thread",
    "formatLabel": "Thread",
    "parts": ["tweet d'ouverture avec hook inspiré", "1/ ...", "2/ ...", "tweet de clôture"]
  },
  {
    "formatId": "carousel",
    "formatLabel": "Carrousel",
    "parts": ["Cover slide", "Diapo 2\\n\\n...", "Diapo CTA"]
  },
  {
    "formatId": "video_script",
    "formatLabel": "Script vidéo",
    "parts": ["HOOK (0-3s)\\n\\n...", "SCÈNE 1\\n\\n...", "CTA\\n\\n..."]
  },
  {
    "formatId": "post",
    "formatLabel": "Post unique",
    "parts": ["Post complet prêt à publier"]
  }
]`,
        messages: [
          {
            role: "user",
            content: `Voici le post concurrent qui a bien performé :\n\n"${cleaned}"\n\nInspire-toi de ce post pour créer du contenu original dans ma niche "${niche}".`,
          },
        ],
      }),
    });

    if (!res.ok) throw new Error(`API error ${res.status}`);

    const body = await res.json();
    const text = body.content?.[0]?.text;
    if (!text) throw new Error("Réponse vide");

    const jsonCleaned = text
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
    const parsed = JSON.parse(jsonCleaned) as RepurposedContent[];

    await setCachedResponse("competitor_inspo", cleaned, niche, parsed);

    return { ok: true, results: parsed };
  } catch (err) {
    console.error("[competitor-inspo] Error:", err);
    return { ok: false, error: "Erreur lors de la génération." };
  }
}
