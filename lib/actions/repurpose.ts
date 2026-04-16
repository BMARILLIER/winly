"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getCachedResponse, setCachedResponse } from "@/lib/services/ai-cache";
import {
  repurposeContent,
  type RepurposedContent,
} from "@/modules/repurpose";

type RepurposeResult = {
  ok: boolean;
  results?: RepurposedContent[];
  fromCache?: boolean;
  error?: string;
};

export async function repurposeWithAI(
  sourceText: string,
  identityContext?: string
): Promise<RepurposeResult> {
  const userId = await getSession();
  if (!userId) redirect("/login");

  const cleaned = sourceText.trim();
  if (!cleaned) return { ok: false, error: "Contenu vide." };

  // --- Check cache first (blocks duplicate requests) ---
  const cached = await getCachedResponse<RepurposedContent[]>(
    "repurpose",
    cleaned,
    "" // no niche needed — the source text IS the key
  );
  if (cached) {
    return { ok: true, results: cached, fromCache: true };
  }

  // --- No API key? Fallback to local engine ---
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    const local = repurposeContent(cleaned);
    return { ok: true, results: local };
  }

  const { checkAndConsumeGeneration } = await import("@/modules/content-generator");
  const quota = await checkAndConsumeGeneration(userId);
  if (!quota.ok) return { ok: false, error: quota.error };

  const identityBlock = identityContext
    ? `\n\nProfil du créateur (adapte le ton et le contenu à cette identité) :\n${identityContext}`
    : "";

  // --- Call Claude API ---
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
Tu transformes un contenu source en 4 formats différents, prêts à publier.${identityBlock}

Règles :
- Réponds UNIQUEMENT en JSON valide (pas de markdown, pas de backticks)
- Contenu en français, engageant
- Adapte le ton au profil du créateur (si fourni)
- Chaque format doit être une vraie réécriture, pas un simple découpage
- Adapte le ton et le style à chaque plateforme

Structure JSON exacte à respecter :
[
  {
    "formatId": "thread",
    "formatLabel": "Thread",
    "parts": ["tweet d'ouverture avec hook 🧵", "1/ premier point...", "2/ deuxième point...", "tweet de clôture avec CTA"]
  },
  {
    "formatId": "carousel",
    "formatLabel": "Carrousel",
    "parts": ["📌 Titre accrocheur pour la cover", "Diapo 2\\n\\nContenu...", "...", "Diapo CTA"]
  },
  {
    "formatId": "video_script",
    "formatLabel": "Script vidéo",
    "parts": ["🎬 HOOK (0-3s)\\n\\nPhrase choc", "📍 SCÈNE 1 (3s-8s)\\n\\n...", "...", "🎯 CTA (fin)\\n\\n..."]
  },
  {
    "formatId": "post",
    "formatLabel": "Post unique",
    "parts": ["Hook + corps + CTA en un seul texte, prêt à copier-coller"]
  }
]

Consignes par format :
- Thread : 4-8 tweets max, chacun < 280 caractères, numérotés, hook percutant en ouverture
- Carrousel : 4-10 diapos, texte court par diapo, visuellement scannable
- Script vidéo : hook en 3s, 3-5 scènes avec timing, CTA final
- Post unique : 1 seul bloc avec hook, développement (2-4 phrases), CTA`,
        messages: [
          {
            role: "user",
            content: `Transforme ce contenu en 4 formats réseaux sociaux :\n\n${cleaned}`,
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

    const jsonCleaned = text
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
    const parsed = JSON.parse(jsonCleaned) as RepurposedContent[];

    // Save to cache
    await setCachedResponse("repurpose", cleaned, "", parsed);

    return { ok: true, results: parsed };
  } catch (err) {
    console.error("[repurpose-ai] Error:", err);
    // Fallback to local engine on error
    const local = repurposeContent(cleaned);
    return { ok: true, results: local };
  }
}

// Map repurpose formatId → ContentIdea format
const FORMAT_MAP: Record<string, string> = {
  thread: "thread",
  carousel: "carousel",
  video_script: "reel",
  post: "text",
};

/**
 * Save a repurposed format as a ContentIdea draft.
 */
export async function saveRepurposedAsDraft(
  workspaceId: string,
  formatId: string,
  formatLabel: string,
  parts: string[]
): Promise<{ ok: boolean; error?: string }> {
  const userId = await getSession();
  if (!userId) redirect("/login");

  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId, userId },
  });
  if (!workspace) return { ok: false, error: "Workspace introuvable." };

  // Extract hook (first part) and CTA (last part), body = middle parts
  const hook = parts[0] ?? "";
  const cta = parts.length > 1 ? parts[parts.length - 1] : "";
  const caption = parts.length > 2
    ? parts.slice(1, -1).join("\n\n")
    : parts.join("\n\n");

  const format = FORMAT_MAP[formatId] ?? "text";
  const title = `[Repurposé] ${formatLabel} — ${hook.slice(0, 50)}${hook.length > 50 ? "..." : ""}`;

  await prisma.contentIdea.create({
    data: {
      workspaceId,
      title,
      hook,
      format,
      caption,
      cta,
      status: "draft",
    },
  });

  revalidatePath("/content");
  return { ok: true };
}
