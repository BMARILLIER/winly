import { describe, it, expect } from "vitest";
import {
  computeCreatorScore,
  type CreatorScoreInput,
} from "@/modules/creator-score";

const BASE_INPUT: CreatorScoreInput = {
  totalContent: 0,
  publishedContent: 0,
  draftContent: 0,
  readyContent: 0,
  scheduledContent: 0,
  postFrequency: "weekly",
  socialProfileCount: 0,
  savedHooks: 0,
  latestAuditScore: null,
  latestWinlyScore: null,
  completedMissions: 0,
  totalXp: 0,
};

describe("creator-score", () => {
  it("returns score between 0 and 100", () => {
    const report = computeCreatorScore(BASE_INPUT);
    expect(report.score).toBeGreaterThanOrEqual(0);
    expect(report.score).toBeLessThanOrEqual(100);
  });

  it("returns all 5 factor scores", () => {
    const report = computeCreatorScore(BASE_INPUT);
    expect(report.details).toHaveLength(5);
    expect(report.details.map((d) => d.id)).toEqual([
      "engagement",
      "growth",
      "consistency",
      "performance",
      "profile",
    ]);
  });

  it("returns low score for empty workspace", () => {
    const report = computeCreatorScore(BASE_INPUT);
    // With no content, hooks, missions, etc. — score should be low
    expect(report.score).toBeLessThan(30);
    expect(report.grade).toBe("F");
  });

  it("returns higher score for active creator", () => {
    const active: CreatorScoreInput = {
      ...BASE_INPUT,
      totalContent: 20,
      publishedContent: 15,
      draftContent: 3,
      readyContent: 2,
      scheduledContent: 5,
      postFrequency: "daily",
      socialProfileCount: 3,
      savedHooks: 10,
      latestAuditScore: 75,
      latestWinlyScore: 80,
      completedMissions: 20,
      totalXp: 500,
    };
    const report = computeCreatorScore(active);
    expect(report.score).toBeGreaterThan(70);
    expect(["A+", "A", "B"]).toContain(report.grade);
  });

  it("weights sum to 1.0", () => {
    const report = computeCreatorScore(BASE_INPUT);
    const totalWeight = report.details.reduce((s, d) => s + d.weight, 0);
    expect(totalWeight).toBeCloseTo(1.0, 5);
  });

  it("factor scores are each between 0 and 100", () => {
    const maxed: CreatorScoreInput = {
      ...BASE_INPUT,
      totalContent: 50,
      publishedContent: 50,
      savedHooks: 20,
      latestAuditScore: 100,
      latestWinlyScore: 100,
      completedMissions: 50,
      totalXp: 1000,
      scheduledContent: 10,
      postFrequency: "daily",
      socialProfileCount: 5,
    };
    const report = computeCreatorScore(maxed);
    for (const d of report.details) {
      expect(d.score).toBeGreaterThanOrEqual(0);
      expect(d.score).toBeLessThanOrEqual(100);
    }
  });

  it("includes grade and advice", () => {
    const report = computeCreatorScore(BASE_INPUT);
    expect(typeof report.grade).toBe("string");
    expect(report.grade.length).toBeGreaterThan(0);
    expect(typeof report.advice).toBe("string");
    expect(report.advice.length).toBeGreaterThan(0);
  });

  it("Instagram data enriches scores when provided", () => {
    const withoutIg = computeCreatorScore(BASE_INPUT);
    const withIg = computeCreatorScore({
      ...BASE_INPUT,
      igConnected: true,
      igFollowers: 5000,
      igEngagementRate: 0.05,
      igMediaCount: 100,
    });
    expect(withIg.score).toBeGreaterThan(withoutIg.score);
  });
});
