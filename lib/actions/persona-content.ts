"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { apiLimiter } from "@/lib/rate-limit";

export interface GeneratedContent {
  hook: string;
  body: string;
  cta: string;
  hashtags: string[];
}

export interface ContentResult {
  ok: boolean;
  content?: GeneratedContent;
  error?: string;
}

export async function generatePersonaContent(
  personaId: string,
  subject: string,
  format: string,
): Promise<ContentResult> {
  const userId = await getSession();
  if (!userId) redirect("/login");

  if (!subject.trim()) {
    return { ok: false, error: "Sujet requis." };
  }

  const { success } = apiLimiter.check(userId);
  if (!success) {
    return { ok: false, error: "Trop de requêtes. Réessaie dans une minute." };
  }

  const persona = await prisma.persona.findFirst({
    where: { id: personaId, userId },
  });

  if (!persona) {
    return { ok: false, error: "Persona introuvable." };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "Clé API non configurée." };
  }

  const { checkAndConsumeGeneration } = await import("@/modules/content-generator");
  const quota = await checkAndConsumeGeneration(userId);
  if (!quota.ok) return { ok: false, error: quota.error };

  const formatLabels: Record<string, string> = {
    caption: "une caption Instagram (texte seul, 1 à 3 paragraphes)",
    carrousel: "un carrousel (slide 1 = hook, slides 2-8 = points clés, dernière slide = CTA)",
    reel: "un script de Reel/TikTok (hook 3s, corps 20-40s, CTA final)",
    story: "une série de 3-5 stories (texte court + sticker/question par story)",
  };

  const formatInstruction = formatLabels[format] || formatLabels.caption;

  const systemPrompt = `Tu es ${persona.name}, un créateur de contenu anonyme dans la niche "${persona.niche}".

Ton profil :
- Ton : ${persona.tone}
- Bio : ${persona.bio}
- Catchphrase : "${persona.catchphrase}"
- Style visuel : ${persona.visualStyle}
- Plateforme : ${persona.platform === "les_deux" ? "Instagram et TikTok" : persona.platform}

Tu dois écrire ${formatInstruction} sur le sujet donné.

Règles strictes :
- Écris DANS LA VOIX du persona (ton ${persona.tone})
- Ne mentionne JAMAIS que tu es une IA
- Ne révèle JAMAIS la vraie identité de l'utilisateur
- Utilise le style et vocabulaire cohérents avec le persona
- Le hook doit accrocher en 1-2 lignes
- Le CTA doit être naturel (pas commercial)
- Les hashtags doivent être pertinents pour la niche "${persona.niche}"

Réponds UNIQUEMENT avec un objet JSON valide (pas de markdown, pas de backticks) :
{
  "hook": "La première ligne qui accroche",
  "body": "Le corps du contenu (utilise des retours à la ligne avec \\n)",
  "cta": "L'appel à l'action final",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5"]
}`;

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
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: `Écris ${formatInstruction} sur ce sujet : "${subject.trim()}"`,
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

    if (!text) throw new Error("Réponse vide");

    const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed = JSON.parse(cleaned) as GeneratedContent;

    if (!parsed.hook || !parsed.body || !parsed.cta) {
      throw new Error("Contenu incomplet");
    }

    return { ok: true, content: parsed };
  } catch (err) {
    console.error("[persona-content] Error:", err);
    return { ok: false, error: "Erreur lors de la génération du contenu." };
  }
}
