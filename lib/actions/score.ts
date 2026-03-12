"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { computeScoreReport, SCORE_PILLARS } from "@/modules/score";

// Build dynamic schema from score pillars
function buildScoreSchema() {
  const shape: Record<string, z.ZodString> = {};
  for (const pillar of SCORE_PILLARS) {
    for (const q of pillar.questions) {
      shape[q.id] = z.string().min(1, `Please answer all questions in "${pillar.label}".`);
    }
  }
  return z.object(shape);
}

export type ScoreState = { error?: string } | null;

export async function submitScore(
  _prev: ScoreState,
  formData: FormData
): Promise<ScoreState> {
  const userId = await getSession();
  if (!userId) redirect("/login");

  const rawAnswers: Record<string, string> = {};
  for (const pillar of SCORE_PILLARS) {
    for (const q of pillar.questions) {
      rawAnswers[q.id] = (formData.get(q.id) as string) ?? "";
    }
  }

  const scoreSchema = buildScoreSchema();
  const parsed = scoreSchema.safeParse(rawAnswers);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const answers = parsed.data;

  const report = computeScoreReport(answers);

  await prisma.scoreResult.create({
    data: {
      userId,
      score: report.globalScore,
      details: JSON.stringify(report),
    },
  });

  redirect("/score/results");
}
