"use server";

import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCachedResponse, setCachedResponse } from "@/lib/services/ai-cache";
import { apiLimiter } from "@/lib/rate-limit";

// ─── Types ───

export interface Persona {
  name: string;
  niche: string;
  tone: string;
  bio: string;
  visual_style: string;
  catchphrase: string;
  platform: "instagram" | "tiktok" | "les_deux";
}

export interface PersonaInput {
  niche: string;
  tone: string;
  platform: "instagram" | "tiktok" | "les_deux";
}

export interface PersonaResult {
  ok: boolean;
  persona?: Persona;
  error?: string;
}

// ─── Main entry ───

export async function generatePersona(input: PersonaInput): Promise<PersonaResult> {
  const userId = await getSession();
  if (!userId) redirect("/login");

  // Validate input
  const niche = input.niche?.trim();
  const tone = input.tone?.trim();
  const platform = input.platform;

  if (!niche || !tone) {
    return { ok: false, error: "Niche et ton sont requis." };
  }

  if (!["instagram", "tiktok", "les_deux"].includes(platform)) {
    return { ok: false, error: "Plateforme invalide." };
  }

  // Rate limit
  const { success } = apiLimiter.check(userId);
  if (!success) {
    return { ok: false, error: "Trop de requêtes. Réessaie dans une minute." };
  }

  // Check cache
  const cacheExtra = `${tone}:${platform}`;
  const cached = await getCachedResponse<Persona>("persona", niche, niche, cacheExtra);
  if (cached) return { ok: true, persona: cached };

  // Call Claude API
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "Clé API non configurée." };
  }

  try {
    const persona = await callClaude(niche, tone, platform, apiKey);
    await setCachedResponse("persona", niche, niche, persona, cacheExtra);
    return { ok: true, persona };
  } catch (err) {
    console.error("[persona-engine] Error:", err);
    return { ok: false, error: "Erreur lors de la génération du persona." };
  }
}

// ─── Claude API call ───

async function callClaude(
  niche: string,
  tone: string,
  platform: string,
  apiKey: string,
): Promise<Persona> {
  const platformLabel =
    platform === "les_deux"
      ? "Instagram et TikTok"
      : platform === "instagram"
        ? "Instagram"
        : "TikTok";

  const systemPrompt = `Tu es un expert en création de personas anonymes pour réseaux sociaux.

L'utilisateur veut créer un compte ${platformLabel} SANS montrer son vrai visage ni son identité réelle.
Tu dois générer un persona fictif complet et cohérent.

Règles strictes :
- Le nom doit sonner réaliste mais être 100% fictif
- La bio fait 150 caractères MAX (compte les caractères)
- Le visual_style décrit les couleurs, ambiances et type de visuels (pas de photos de visage)
- La catchphrase est une phrase signature courte et mémorable
- Tout doit être cohérent avec la niche "${niche}" et le ton "${tone}"
- Réponds UNIQUEMENT en français
- Réponds UNIQUEMENT avec un objet JSON valide (pas de markdown, pas de backticks)

Format exact :
{
  "name": "Prénom Nom fictif",
  "niche": "${niche}",
  "tone": "${tone}",
  "bio": "Bio courte (150 car. max)",
  "visual_style": "Description du style visuel",
  "catchphrase": "Phrase signature",
  "platform": "${platform}"
}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 600,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Génère un persona anonyme pour un compte ${platformLabel} dans la niche "${niche}" avec un ton ${tone}.`,
        },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Claude API error ${res.status}: ${text}`);
  }

  const body = await res.json();
  const text = body.content?.[0]?.text;

  if (!text) {
    throw new Error("Réponse vide de Claude API");
  }

  // Strip markdown fences if present
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const parsed = JSON.parse(cleaned) as Persona;

  // Validate required fields
  if (!parsed.name || !parsed.bio || !parsed.catchphrase || !parsed.visual_style) {
    throw new Error("Persona incomplet retourné par l'API");
  }

  // Enforce bio length
  if (parsed.bio.length > 150) {
    parsed.bio = parsed.bio.slice(0, 147) + "...";
  }

  return {
    name: parsed.name,
    niche: parsed.niche || niche,
    tone: parsed.tone || tone,
    bio: parsed.bio,
    visual_style: parsed.visual_style,
    catchphrase: parsed.catchphrase,
    platform: parsed.platform || platform,
  } as Persona;
}
