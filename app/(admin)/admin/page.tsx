import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export default async function AdminDashboardPage() {
  await requireAdmin();

  const [
    totalUsers,
    totalWorkspaces,
    totalContent,
    totalAudits,
    totalScores,
    totalMissions,
    totalCreatorScores,
    totalEngineRuns,
    totalAdminLogs,
    recentUsers,
    recentLogs,
    platformStats,
    nicheStats,
    roleStats,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.workspace.count(),
    prisma.contentIdea.count(),
    prisma.auditResult.count(),
    prisma.scoreResult.count(),
    prisma.missionCompletion.count(),
    prisma.creatorScore.count(),
    prisma.engineRun.count(),
    prisma.adminLog.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { email: true, role: true, createdAt: true },
    }),
    prisma.adminLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { admin: { select: { email: true } } },
    }),
    prisma.workspace.groupBy({
      by: ["mainPlatform"],
      _count: { id: true },
    }),
    prisma.workspace.groupBy({
      by: ["niche"],
      _count: { id: true },
    }),
    prisma.user.groupBy({
      by: ["role"],
      _count: { id: true },
    }),
  ]);

  const stats = [
    { label: "Utilisateurs", value: totalUsers },
    { label: "Workspaces", value: totalWorkspaces },
    { label: "Idées de contenu", value: totalContent },
    { label: "Audits", value: totalAudits },
    { label: "Scores", value: totalScores },
    { label: "Missions", value: totalMissions },
    { label: "Creator Scores", value: totalCreatorScores },
    { label: "Exécutions moteur", value: totalEngineRuns },
    { label: "Journaux admin", value: totalAdminLogs },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Dashboard</h1>

      {/* Stats grid */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border bg-surface-1 p-4">
            <p className="text-sm text-text-secondary">{s.label}</p>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-8 grid gap-8 lg:grid-cols-2">
        {/* Recent Users */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Utilisateurs récents</h2>
          <div className="overflow-hidden rounded-lg border bg-surface-1">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-surface-2">
                <tr>
                  <th className="px-4 py-3 font-medium text-text-secondary">Email</th>
                  <th className="px-4 py-3 font-medium text-text-secondary">Rôle</th>
                  <th className="px-4 py-3 font-medium text-text-secondary">Inscrit le</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentUsers.map((u) => (
                  <tr key={u.email}>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          u.role === "admin"
                            ? "bg-accent-muted text-accent"
                            : "bg-surface-2 text-text-secondary"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {u.createdAt.toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Admin Activity */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Activité récente</h2>
          {recentLogs.length === 0 ? (
            <div className="rounded-lg border bg-surface-1 p-6 text-center text-sm text-text-secondary">
              Aucune action admin pour le moment.
            </div>
          ) : (
            <div className="rounded-lg border bg-surface-1">
              <div className="divide-y">
                {recentLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <span className="text-sm text-foreground">{log.admin.email}</span>
                      <span className="mx-2 text-text-secondary">·</span>
                      <span className="text-sm font-medium text-foreground">{log.action}</span>
                    </div>
                    <span className="text-xs text-text-muted">
                      {log.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Distribution */}
      <div className="grid gap-8 md:grid-cols-3">
        <div>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Par rôle</h2>
          <div className="rounded-lg border bg-surface-1 p-4">
            {roleStats.length === 0 ? (
              <p className="text-sm text-text-secondary">Aucune donnée</p>
            ) : (
              <div className="space-y-2">
                {roleStats.map((r) => (
                  <div key={r.role} className="flex items-center justify-between">
                    <span className="text-sm capitalize text-foreground">{r.role}</span>
                    <span className="text-sm font-medium text-foreground">{r._count.id}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Par plateforme</h2>
          <div className="rounded-lg border bg-surface-1 p-4">
            {platformStats.length === 0 ? (
              <p className="text-sm text-text-secondary">Aucune donnée</p>
            ) : (
              <div className="space-y-2">
                {platformStats.map((p) => (
                  <div key={p.mainPlatform} className="flex items-center justify-between">
                    <span className="text-sm capitalize text-foreground">{p.mainPlatform}</span>
                    <span className="text-sm font-medium text-foreground">{p._count.id}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Par niche</h2>
          <div className="rounded-lg border bg-surface-1 p-4">
            {nicheStats.length === 0 ? (
              <p className="text-sm text-text-secondary">Aucune donnée</p>
            ) : (
              <div className="space-y-2">
                {nicheStats.map((n) => (
                  <div key={n.niche} className="flex items-center justify-between">
                    <span className="text-sm capitalize text-foreground">{n.niche}</span>
                    <span className="text-sm font-medium text-foreground">{n._count.id}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
