import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export default async function AdminEnginesPage() {
  await requireAdmin();

  const [
    totalCreatorScores,
    recentCreatorScores,
    engineRuns,
    recentEngineRuns,
  ] = await Promise.all([
    prisma.creatorScore.count(),
    prisma.creatorScore.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        score: true,
        platform: true,
        username: true,
        createdAt: true,
        user: { select: { email: true } },
      },
    }),
    prisma.engineRun.count(),
    prisma.engineRun.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        engine: true,
        durationMs: true,
        sandbox: true,
        createdAt: true,
      },
    }),
  ]);

  const engines = [
    {
      name: "Creator Score",
      id: "creator-score",
      description: "Computes a 0-100 score from 5 weighted factors (engagement, growth, consistency, performance, profile)",
      source: "modules/creator-score/index.ts",
      totalRuns: totalCreatorScores,
      status: "active",
    },
    {
      name: "Trend Radar",
      id: "trend-radar",
      description: "Analyzes niche-specific trends with momentum scoring and platform-specific format boosts",
      source: "modules/trend-radar/index.ts",
      totalRuns: 0, // Trend radar is computed on-the-fly, not stored
      status: "active",
    },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Moteurs</h1>
      <p className="mb-8 text-sm text-text-secondary">
        Supervision des moteurs de calcul. Tous les moteurs tournent en local, sans API externe.
      </p>

      {/* Engine cards */}
      <div className="mb-8 grid gap-4 md:grid-cols-2">
        {engines.map((engine) => (
          <div key={engine.id} className="rounded-lg border bg-surface-1 p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">{engine.name}</h3>
              <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success">
                {engine.status}
              </span>
            </div>
            <p className="mb-3 text-xs text-text-secondary">{engine.description}</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-muted">
                <code>{engine.source}</code>
              </span>
              <span className="font-medium text-foreground">
                {engine.totalRuns} exécutions
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Creator Scores */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Creator Scores récents
        </h2>
        {recentCreatorScores.length === 0 ? (
          <div className="rounded-lg border bg-surface-1 p-6 text-center text-sm text-text-secondary">
            Aucun Creator Score calculé pour le moment.
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border bg-surface-1">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-surface-2">
                <tr>
                  <th className="px-4 py-3 font-medium text-text-secondary">Utilisateur</th>
                  <th className="px-4 py-3 font-medium text-text-secondary">Plateforme</th>
                  <th className="px-4 py-3 font-medium text-text-secondary">Username</th>
                  <th className="px-4 py-3 font-medium text-text-secondary">Score</th>
                  <th className="px-4 py-3 font-medium text-text-secondary">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentCreatorScores.map((cs) => (
                  <tr key={cs.id}>
                    <td className="px-4 py-3 text-foreground">{cs.user.email}</td>
                    <td className="px-4 py-3 capitalize text-text-secondary">{cs.platform}</td>
                    <td className="px-4 py-3 text-text-secondary">@{cs.username}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-bold ${
                          cs.score >= 70
                            ? "bg-success/15 text-success"
                            : cs.score >= 40
                              ? "bg-warning/15 text-warning"
                              : "bg-danger/15 text-danger"
                        }`}
                      >
                        {cs.score}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {cs.createdAt.toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Engine Runs (from sandbox or other) */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Historique des exécutions
        </h2>
        {recentEngineRuns.length === 0 ? (
          <div className="rounded-lg border bg-surface-1 p-6 text-center text-sm text-text-secondary">
            Aucune exécution enregistrée. Utilisez le Sandbox pour lancer des calculs de test.
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border bg-surface-1">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-surface-2">
                <tr>
                  <th className="px-4 py-3 font-medium text-text-secondary">Moteur</th>
                  <th className="px-4 py-3 font-medium text-text-secondary">Durée</th>
                  <th className="px-4 py-3 font-medium text-text-secondary">Type</th>
                  <th className="px-4 py-3 font-medium text-text-secondary">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentEngineRuns.map((run) => (
                  <tr key={run.id}>
                    <td className="px-4 py-3 font-medium text-foreground">{run.engine}</td>
                    <td className="px-4 py-3 text-text-secondary">{run.durationMs}ms</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          run.sandbox
                            ? "bg-warning/15 text-warning"
                            : "bg-info/15 text-info"
                        }`}
                      >
                        {run.sandbox ? "Sandbox" : "Production"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {run.createdAt.toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
