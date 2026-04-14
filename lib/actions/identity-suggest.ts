"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getCachedResponse, setCachedResponse } from "@/lib/services/ai-cache";
import type { CreatorIdentityData } from "./creator-identity";

/**
 * Generate AI suggestions for a specific identity field.
 */
export async function suggestIdentityField(
  field: keyof CreatorIdentityData,
  fieldLabel: string,
  niche: string,
  platform: string,
  currentData: Partial<CreatorIdentityData>,
  rejectedSuggestions?: string[]
): Promise<{ ok: boolean; suggestions?: string[]; error?: string }> {
  const userId = await getSession();
  if (!userId) redirect("/login");

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { ok: false, error: "Clé API non configurée." };

  // Build context from already-filled fields
  const filledContext = Object.entries(currentData)
    .filter(([, v]) => v && v.trim())
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");

  const rejectedText = rejectedSuggestions?.length ? rejectedSuggestions.join("|") : "";
  const cacheKey = `${field}:${niche}:${platform}:${filledContext.slice(0, 100)}:rej${rejectedText.slice(0, 100)}`;
  const cached = await getCachedResponse<string[]>("identity_suggest", cacheKey, niche);
  if (cached) return { ok: true, suggestions: cached };

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
        max_tokens: 800,
        system: `Tu es un expert en personal branding pour créateurs de contenu.

Contexte du créateur :
- Niche : ${niche}
- Plateforme : ${platform}
${filledContext ? `\nInfos déjà renseignées :\n${filledContext}` : ""}

Tu dois suggérer 3 options pour le champ "${fieldLabel}" du profil créateur.
Chaque suggestion doit être concrète, spécifique à la niche "${niche}", et prête à utiliser.
${rejectedSuggestions?.length ? `\nSuggestions DÉJÀ REJETÉES (ne les repropose PAS, propose des alternatives différentes) :\n${rejectedSuggestions.map((s) => `- "${s}"`).join("\n")}` : ""}

Réponds UNIQUEMENT en JSON valide (pas de markdown, pas de backticks) :
["suggestion 1", "suggestion 2", "suggestion 3"]`,
        messages: [
          {
            role: "user",
            content: `Propose 3 suggestions pour "${fieldLabel}" adaptées à un créateur dans la niche "${niche}" sur ${platform}.`,
          },
        ],
      }),
    });

    if (!res.ok) throw new Error(`API error ${res.status}`);

    const body = await res.json();
    const text = body.content?.[0]?.text;
    if (!text) throw new Error("Réponse vide");

    const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    const suggestions = JSON.parse(cleaned) as string[];

    await setCachedResponse("identity_suggest", cacheKey, niche, suggestions);

    return { ok: true, suggestions };
  } catch (err) {
    console.error("[identity-suggest] Error:", err);
    return { ok: false, error: "Erreur lors de la génération." };
  }
}
