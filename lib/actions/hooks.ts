"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const saveHookSchema = z.object({
  workspaceId: z.string().min(1, "Workspace is required."),
  text: z.string().min(1, "Hook content is required."),
  type: z.enum(["question", "stat", "story", "bold", "curiosity"], {
    error: "Please select a hook type.",
  }),
});

const deleteHookSchema = z.object({
  hookId: z.string().min(1, "Hook ID is required."),
});

export async function saveHook(formData: FormData): Promise<void> {
  const userId = await getSession();
  if (!userId) redirect("/login");

  const parsed = saveHookSchema.safeParse({
    workspaceId: formData.get("workspaceId") ?? "",
    text: formData.get("text") ?? "",
    type: formData.get("type") ?? "",
  });

  if (!parsed.success) return;

  const { workspaceId, text, type } = parsed.data;

  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId, userId },
  });
  if (!workspace) return;

  await prisma.savedHook.create({
    data: { workspaceId, text, type },
  });

  revalidatePath("/hooks");
}

export interface HookWithPayoff {
  text: string;
  payoff: string;
  verified: boolean;
  verificationNote: string | null;
}

export async function generateHooksWithAI(
  topic: string,
  hookType: string | null,
  niche: string
): Promise<{ ok: boolean; hooks?: HookWithPayoff[]; error?: string }> {
  const userId = await getSession();
  if (!userId) return { ok: false, error: "Non connecté." };

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { ok: false, error: "Clé API non configurée." };

  // Check cache first (cached responses don't consume credits)
  const { getCachedResponse, setCachedResponse } = await import("@/lib/services/ai-cache");
  const cached = await getCachedResponse<HookWithPayoff[] | string[]>("hooks", topic || niche, niche, hookType ?? "all");
  if (cached) {
    const normalized: HookWithPayoff[] = cached.map((h) =>
      typeof h === "string"
        ? { text: h, payoff: "", verified: true, verificationNote: null }
        : h,
    );
    return { ok: true, hooks: normalized };
  }

  const { checkAndConsumeGeneration } = await import("@/modules/content-generator");
  const quota = await checkAndConsumeGeneration(userId);
  if (!quota.ok) return { ok: false, error: quota.error };

  const typeLabels: Record<string, string> = {
    question: "Question intrigante",
    stat: "Statistique choc",
    story: "Début d'histoire",
    bold: "Affirmation audacieuse",
    curiosity: "Curiosité / mystère",
  };
  const typeInstruction = hookType
    ? `Style de hook demandé : ${typeLabels[hookType] ?? hookType}.`
    : "Mélange différents styles (question, statistique, histoire, affirmation audacieuse, curiosité).";

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
        system: `Tu es un expert en copywriting pour les réseaux sociaux. Tu crées des hooks (phrases d'accroche) percutants en français, AVEC leur réponse/développement.

Règles :
- Chaque hook fait 1 à 2 phrases maximum
- Le hook doit donner envie de lire/regarder la suite
- Adapté à la niche : ${niche}
- ${typeInstruction}
- Ton : direct, authentique, engageant
- Pas de hashtags, pas d'emojis dans le hook
- IMPORTANT : pour chaque hook, fournis le "payoff" = la réponse/le développement (2-4 phrases) qui suit le hook
- IMPORTANT FIABILITÉ : chaque fait, chiffre, statistique ou affirmation dans le hook ET le payoff DOIT être vérifiable et exact. Ne cite JAMAIS de chiffre inventé. Si tu n'es pas sûr à 100% d'un fait, mets verified=false et explique dans verificationNote exactement ce qui doit être vérifié par le créateur avant publication. Préfère des vérités universellement reconnues plutôt que des stats douteuses. En cas de doute, utilise "selon certaines études" ou reformule sans chiffre précis.
- Réponds UNIQUEMENT en JSON valide :
{
  "hooks": [
    {
      "text": "Le hook ici",
      "payoff": "Le développement/la réponse qui suit le hook (2-4 phrases)",
      "verified": true,
      "verificationNote": null
    }
  ]
}
- Génère exactement 6 hooks différents`,
        messages: [
          {
            role: "user",
            content: topic.trim()
              ? `Génère 6 hooks sur le sujet : "${topic}". Pour chaque hook, donne la réponse/le développement vérifié.`
              : `Génère 6 hooks variés pour un créateur dans la niche "${niche}". Pour chaque hook, donne la réponse/le développement vérifié.`,
          },
        ],
      }),
    });

    if (!res.ok) throw new Error(`API error ${res.status}`);

    const body = await res.json();
    const text = body.content?.[0]?.text;
    if (!text) throw new Error("Réponse vide");

    // Strip markdown code fences if present
    const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed = JSON.parse(cleaned) as { hooks: HookWithPayoff[] | string[] };

    // Normalize: support both old format (string[]) and new format (HookWithPayoff[])
    const hooks: HookWithPayoff[] = parsed.hooks.map((h) =>
      typeof h === "string"
        ? { text: h, payoff: "", verified: true, verificationNote: null }
        : { text: h.text, payoff: h.payoff ?? "", verified: h.verified ?? true, verificationNote: h.verificationNote ?? null },
    );

    await setCachedResponse("hooks", topic || niche, niche, hooks, hookType ?? "all");

    return { ok: true, hooks };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[hooks-ai] Error:", msg);
    return { ok: false, error: `Erreur IA : ${msg}` };
  }
}

export async function deleteHook(formData: FormData): Promise<void> {
  const userId = await getSession();
  if (!userId) redirect("/login");

  const parsed = deleteHookSchema.safeParse({
    hookId: formData.get("hookId") ?? "",
  });
  if (!parsed.success) return;

  const { hookId } = parsed.data;

  const hook = await prisma.savedHook.findUnique({
    where: { id: hookId },
    include: { workspace: { select: { userId: true } } },
  });
  if (!hook || hook.workspace.userId !== userId) return;

  await prisma.savedHook.delete({ where: { id: hookId } });

  revalidatePath("/hooks");
}
