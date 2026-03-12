"use server";

import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { computeCreatorScore, type CreatorScoreInput } from "@/modules/creator-score";
import { analyzeTrends, type TrendRadarInput } from "@/modules/trend-radar";

const creatorScoreSandboxSchema = z.object({
  totalContent: z.coerce.number().int().min(0).default(10),
  publishedContent: z.coerce.number().int().min(0).default(5),
  draftContent: z.coerce.number().int().min(0).default(2),
  readyContent: z.coerce.number().int().min(0).default(3),
  scheduledContent: z.coerce.number().int().min(0).default(2),
  postFrequency: z.string().default("weekly"),
  socialProfileCount: z.coerce.number().int().min(0).default(1),
  savedHooks: z.coerce.number().int().min(0).default(3),
  latestAuditScore: z.coerce.number().nullable().default(null),
  latestWinlyScore: z.coerce.number().nullable().default(null),
  completedMissions: z.coerce.number().int().min(0).default(0),
  totalXp: z.coerce.number().int().min(0).default(0),
});

const trendRadarSandboxSchema = z.object({
  niche: z.string().min(1).default("tech"),
  platform: z.string().min(1).default("instagram"),
  postFrequency: z.string().default("weekly"),
});

export async function runCreatorScoreSandbox(formData: FormData) {
  await requireAdmin();

  const parsed = creatorScoreSandboxSchema.safeParse({
    totalContent: formData.get("totalContent") ?? 10,
    publishedContent: formData.get("publishedContent") ?? 5,
    draftContent: formData.get("draftContent") ?? 2,
    readyContent: formData.get("readyContent") ?? 3,
    scheduledContent: formData.get("scheduledContent") ?? 2,
    postFrequency: formData.get("postFrequency") || "weekly",
    socialProfileCount: formData.get("socialProfileCount") ?? 1,
    savedHooks: formData.get("savedHooks") ?? 3,
    latestAuditScore: formData.get("latestAuditScore") || null,
    latestWinlyScore: formData.get("latestWinlyScore") || null,
    completedMissions: formData.get("completedMissions") ?? 0,
    totalXp: formData.get("totalXp") ?? 0,
  });

  if (!parsed.success) return { input: null, result: null, durationMs: 0 };

  const input: CreatorScoreInput = parsed.data;

  const start = performance.now();
  const result = computeCreatorScore(input);
  const durationMs = Math.round(performance.now() - start);

  // Save engine run
  await prisma.engineRun.create({
    data: {
      engine: "creator-score",
      input: JSON.stringify(input),
      output: JSON.stringify(result),
      durationMs,
      sandbox: true,
    },
  });

  return { input, result, durationMs };
}

export async function runTrendRadarSandbox(formData: FormData) {
  await requireAdmin();

  const parsed = trendRadarSandboxSchema.safeParse({
    niche: formData.get("niche") || "tech",
    platform: formData.get("platform") || "instagram",
    postFrequency: formData.get("postFrequency") || "weekly",
  });

  if (!parsed.success) return { input: null, result: null, durationMs: 0 };

  const input: TrendRadarInput = {
    ...parsed.data,
    existingTitles: [],
    existingFormats: [],
  };

  const start = performance.now();
  const result = analyzeTrends(input);
  const durationMs = Math.round(performance.now() - start);

  // Save engine run
  await prisma.engineRun.create({
    data: {
      engine: "trend-radar",
      input: JSON.stringify(input),
      output: JSON.stringify(result),
      durationMs,
      sandbox: true,
    },
  });

  return { input, result, durationMs };
}
