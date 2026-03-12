import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export default async function AdminAuditsPage() {
  await requireAdmin();
  const [totalAudits, totalScores, recentAudits, recentScores] =
    await Promise.all([
      prisma.auditResult.count(),
      prisma.scoreResult.count(),
      prisma.auditResult.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { user: { select: { email: true } } },
      }),
      prisma.scoreResult.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { user: { select: { email: true } } },
      }),
    ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Audits & Scores</h1>

      <div className="mb-8 grid grid-cols-2 gap-4">
        <div className="rounded-lg border bg-surface-1 p-4">
          <p className="text-sm text-text-secondary">Total audits</p>
          <p className="text-2xl font-bold text-foreground">{totalAudits}</p>
        </div>
        <div className="rounded-lg border bg-surface-1 p-4">
          <p className="text-sm text-text-secondary">Total scores</p>
          <p className="text-2xl font-bold text-foreground">{totalScores}</p>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Audits récents
        </h2>
        <div className="overflow-hidden rounded-lg border bg-surface-1">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-surface-2">
              <tr>
                <th className="px-4 py-3 font-medium text-text-secondary">Utilisateur</th>
                <th className="px-4 py-3 font-medium text-text-secondary">Score</th>
                <th className="px-4 py-3 font-medium text-text-secondary">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recentAudits.map((a) => (
                <tr key={a.id}>
                  <td className="px-4 py-3">{a.user.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        a.score >= 70
                          ? "bg-success/15 text-success"
                          : a.score >= 40
                            ? "bg-warning/15 text-warning"
                            : "bg-danger/15 text-danger"
                      }`}
                    >
                      {a.score}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {a.createdAt.toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {recentAudits.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-8 text-center text-text-secondary"
                  >
                    Aucun audit pour le moment
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Scores récents
        </h2>
        <div className="overflow-hidden rounded-lg border bg-surface-1">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-surface-2">
              <tr>
                <th className="px-4 py-3 font-medium text-text-secondary">Utilisateur</th>
                <th className="px-4 py-3 font-medium text-text-secondary">
                  Score (0-100)
                </th>
                <th className="px-4 py-3 font-medium text-text-secondary">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recentScores.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3">{s.user.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        s.score >= 70
                          ? "bg-success/15 text-success"
                          : s.score >= 40
                            ? "bg-warning/15 text-warning"
                            : "bg-danger/15 text-danger"
                      }`}
                    >
                      {s.score}/100
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {s.createdAt.toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {recentScores.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-8 text-center text-text-secondary"
                  >
                    Aucun score pour le moment
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
