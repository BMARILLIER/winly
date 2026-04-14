"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getCachedResponse, setCachedResponse } from "@/lib/services/ai-cache";
import { analyzeBio, generateBios, type BioAnalysis } from "@/modules/bio";

const analyzeBioSchema = z.object({
  bio: z.string().trim().min(1, "Please enter your current bio."),
  workspaceId: z.string().min(1, "Workspace is required."),
  regenerate: z.string().optional(),
});

export interface BioState {
  analysis?: BioAnalysis;
  suggestions?: { text: string; style: string; description: string }[];
  fromCache?: boolean;
  error?: string;
}

type BioSuggestion = { text: string; style: string; description: string };

async function generateBiosWithAI(
  bio: string,
  niche: string,
  platform: string,
  profileType: string,
  goals: string[],
  forceFresh: boolean = false
): Promise<BioSuggestion[] | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  // Seed unique à chaque régénération pour bypass cache + forcer variation
  const seed = forceFresh ? `:${Date.now()}:${Math.random().toString(36).slice(2, 8)}` : "";
  const cacheKey = `${bio}:${platform}:${profileType}${seed}`;

  if (!forceFresh) {
    const cached = await getCachedResponse<BioSuggestion[]>("bio", cacheKey, niche);
    if (cached) return cached;
  }

  const profileLabels: Record<string, string> = {
    personal_brand: "marque personnelle (créateur individuel)",
    business: "compte professionnel / marque",
    anonymous: "compte anonyme / thématique",
  };

  const goalLabels: Record<string, string> = {
    grow_audience: "développer son audience",
    monetize: "monétiser",
    brand_awareness: "notoriété de marque",
    engagement: "booster l'engagement",
    consistency: "régularité de publication",
  };

  const goalsText = goals.map((g) => goalLabels[g] || g).join(", ");

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
        max_tokens: 1500,
        system: `Tu es un expert en personal branding et réseaux sociaux.
Tu génères des bios optimisées pour les profils sociaux.

Contexte du créateur :
- Niche : ${niche}
- Plateforme : ${platform}
- Type de profil : ${profileLabels[profileType] || profileType}
- Objectifs : ${goalsText || "croissance générale"}
- Bio actuelle : "${bio}"

Règles :
- Réponds UNIQUEMENT en JSON valide (pas de markdown, pas de backticks)
- Chaque bio doit faire entre 80 et 150 caractères
- Les bios doivent être en français
- Adapte le ton et le vocabulaire à la niche (ex: pour un DJ, utilise le jargon musical)
- Ne fais PAS de bio générique corporate — sois spécifique à l'univers du créateur
- Inclus un CTA adapté à la plateforme
- Chaque bio doit avoir un angle différent

Structure JSON exacte :
[
  { "text": "bio texte ici", "style": "Nom du style", "description": "Courte description de l'angle choisi" },
  { "text": "bio texte ici", "style": "Nom du style", "description": "Courte description de l'angle choisi" },
  { "text": "bio texte ici", "style": "Nom du style", "description": "Courte description de l'angle choisi" }
]`,
        messages: [
          {
            role: "user",
            content: forceFresh
              ? `Génère 3 NOUVELLES bios optimisées pour ce profil ${platform} dans la niche "${niche}". IMPORTANT : propose des angles totalement différents de ce que tu aurais généré avant — change le ton, la structure, les emojis, les CTA. Variation aléatoire ID : ${Math.random().toString(36).slice(2)}`
              : `Génère 3 bios optimisées pour ce profil ${platform} dans la niche "${niche}".`,
          },
        ],
        temperature: forceFresh ? 1 : 0.7,
      }),
    });

    if (!res.ok) throw new Error(`API error ${res.status}`);

    const body = await res.json();
    const text = body.content?.[0]?.text;
    if (!text) throw new Error("Réponse vide");

    const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed = JSON.parse(cleaned) as BioSuggestion[];

    // Cache result
    await setCachedResponse("bio", cacheKey, niche, parsed);

    return parsed;
  } catch (err) {
    console.error("[bio-ai] Error:", err);
    return null;
  }
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

  const { bio, workspaceId, regenerate } = parsed.data;
  const forceFresh = regenerate === "1";

  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId, userId },
  });
  if (!workspace) return { error: "Workspace not found." };

  // Quota : une régénération compte comme une génération IA
  if (forceFresh) {
    const { checkAndConsumeGeneration } = await import("@/modules/content-generator");
    const quota = await checkAndConsumeGeneration(userId);
    if (!quota.ok) {
      return { error: quota.error };
    }
  }

  const goals: string[] = JSON.parse(workspace.goals);
  const analysis = analyzeBio(bio, workspace.niche);

  // Try AI generation first, fallback to local templates
  const aiSuggestions = await generateBiosWithAI(
    bio,
    workspace.niche,
    workspace.mainPlatform,
    workspace.profileType,
    goals,
    forceFresh
  );

  const suggestions = aiSuggestions ?? generateBios({
    niche: workspace.niche,
    platform: workspace.mainPlatform,
    profileType: workspace.profileType,
    goals,
  });

  return { analysis, suggestions };
}
