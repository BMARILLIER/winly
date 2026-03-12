"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { computeAuditReport, AUDIT_CATEGORIES } from "@/modules/audit";

// Build dynamic schema from audit categories
function buildAuditSchema() {
  const shape: Record<string, z.ZodString> = {};
  for (const cat of AUDIT_CATEGORIES) {
    for (const q of cat.questions) {
      shape[q.id] = z.string().min(1, `Please answer all questions in "${cat.label}".`);
    }
  }
  return z.object(shape);
}

export type AuditState = { error?: string } | null;

export async function submitAudit(
  _prev: AuditState,
  formData: FormData
): Promise<AuditState> {
  const userId = await getSession();
  if (!userId) redirect("/login");

  // Collect all answers
  const rawAnswers: Record<string, string> = {};
  for (const cat of AUDIT_CATEGORIES) {
    for (const q of cat.questions) {
      rawAnswers[q.id] = (formData.get(q.id) as string) ?? "";
    }
  }

  const auditSchema = buildAuditSchema();
  const parsed = auditSchema.safeParse(rawAnswers);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const answers = parsed.data;

  const report = computeAuditReport(answers);

  await prisma.auditResult.create({
    data: {
      userId,
      score: report.overallScore,
      details: JSON.stringify(report),
    },
  });

  redirect("/audit/results");
}
