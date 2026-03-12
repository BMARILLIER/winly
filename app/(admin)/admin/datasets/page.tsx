import { requireAdmin } from "@/lib/auth";

// Import dataset info directly from modules
const NICHE_LIST = ["fitness", "tech", "food", "business"];
const UNIVERSAL_COUNT = 5;

// Platform format boost keys
const PLATFORMS = ["instagram", "tiktok", "twitter", "linkedin", "youtube"];

export default async function AdminDatasetsPage() {
  await requireAdmin();

  // Trend Radar dataset stats
  const trendStats = {
    niches: NICHE_LIST,
    universalTrends: UNIVERSAL_COUNT,
    platforms: PLATFORMS,
    totalNicheTrends: NICHE_LIST.length * 5, // 5 trends per niche
    totalTrends: NICHE_LIST.length * 5 + UNIVERSAL_COUNT,
  };

  // Creator Score engine config
  const creatorScoreConfig = {
    factors: [
      { id: "engagement", weight: 0.25, description: "Content quality signals" },
      { id: "growth", weight: 0.20, description: "Content volume and expansion" },
      { id: "consistency", weight: 0.25, description: "Posting regularity" },
      { id: "performance", weight: 0.20, description: "Content effectiveness" },
      { id: "profile", weight: 0.10, description: "Profile completeness" },
    ],
    gradeScale: [
      { grade: "A+", min: 90 },
      { grade: "A", min: 80 },
      { grade: "B", min: 70 },
      { grade: "C", min: 60 },
      { grade: "D", min: 50 },
      { grade: "F", min: 0 },
    ],
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Datasets</h1>
      <p className="mb-8 text-sm text-text-secondary">
        Aperçu des datasets locaux alimentant les moteurs Trend Radar et Creator Score.
      </p>

      {/* Trend Radar Datasets */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Trend Radar — Local Datasets
        </h2>

        <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-lg border bg-surface-1 p-4">
            <p className="text-sm text-text-secondary">Niches couvertes</p>
            <p className="text-2xl font-bold text-foreground">{trendStats.niches.length}</p>
          </div>
          <div className="rounded-lg border bg-surface-1 p-4">
            <p className="text-sm text-text-secondary">Tendances de niche</p>
            <p className="text-2xl font-bold text-foreground">{trendStats.totalNicheTrends}</p>
          </div>
          <div className="rounded-lg border bg-surface-1 p-4">
            <p className="text-sm text-text-secondary">Tendances universelles</p>
            <p className="text-2xl font-bold text-foreground">{trendStats.universalTrends}</p>
          </div>
          <div className="rounded-lg border bg-surface-1 p-4">
            <p className="text-sm text-text-secondary">Plateformes</p>
            <p className="text-2xl font-bold text-foreground">{trendStats.platforms.length}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border bg-surface-1 p-4">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Niches</h3>
            <div className="flex flex-wrap gap-2">
              {trendStats.niches.map((niche) => (
                <span
                  key={niche}
                  className="rounded-full bg-accent-muted px-3 py-1 text-xs font-medium capitalize text-accent"
                >
                  {niche}
                </span>
              ))}
              <span className="rounded-full bg-surface-2 px-3 py-1 text-xs font-medium text-text-secondary">
                + fallback universel
              </span>
            </div>
          </div>

          <div className="rounded-lg border bg-surface-1 p-4">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Platform Format Boosts</h3>
            <div className="flex flex-wrap gap-2">
              {trendStats.platforms.map((platform) => (
                <span
                  key={platform}
                  className="rounded-full bg-info/15 px-3 py-1 text-xs font-medium capitalize text-info"
                >
                  {platform}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-warning/30 bg-warning/15 p-4">
          <p className="text-sm text-warning">
            <span className="font-medium">Source des données :</span> Hardcoded local datasets in{" "}
            <code className="rounded bg-warning/15 px-1 text-xs">modules/trend-radar/index.ts</code>.
            To add a new niche, add entries to the <code className="rounded bg-warning/15 px-1 text-xs">NICHE_TRENDS</code> object.
          </p>
        </div>
      </div>

      {/* Creator Score Config */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Creator Score — Facteurs de scoring
        </h2>

        <div className="overflow-hidden rounded-lg border bg-surface-1">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-surface-2">
              <tr>
                <th className="px-4 py-3 font-medium text-text-secondary">Facteur</th>
                <th className="px-4 py-3 font-medium text-text-secondary">Poids</th>
                <th className="px-4 py-3 font-medium text-text-secondary">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {creatorScoreConfig.factors.map((f) => (
                <tr key={f.id}>
                  <td className="px-4 py-3 font-medium capitalize">{f.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 rounded-full bg-surface-2">
                        <div
                          className="h-2 rounded-full bg-accent"
                          style={{ width: `${f.weight * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-text-secondary">{(f.weight * 100).toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{f.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grade Scale */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Creator Score — Échelle de notes
        </h2>
        <div className="flex flex-wrap gap-3">
          {creatorScoreConfig.gradeScale.map((g) => (
            <div
              key={g.grade}
              className="rounded-lg border bg-surface-1 px-4 py-3 text-center"
            >
              <p className="text-lg font-bold text-foreground">{g.grade}</p>
              <p className="text-xs text-text-secondary">{g.min}+</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
