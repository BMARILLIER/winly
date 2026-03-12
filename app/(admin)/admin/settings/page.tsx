import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { SettingsEditor } from "./settings-editor";

export default async function AdminSettingsPage() {
  await requireAdmin();

  const [
    userCount,
    workspaceCount,
    contentCount,
    auditCount,
    scoreCount,
    hookCount,
    missionCount,
    creatorScoreCount,
    adminLogCount,
    engineRunCount,
    systemSettings,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.workspace.count(),
    prisma.contentIdea.count(),
    prisma.auditResult.count(),
    prisma.scoreResult.count(),
    prisma.savedHook.count(),
    prisma.missionCompletion.count(),
    prisma.creatorScore.count(),
    prisma.adminLog.count(),
    prisma.engineRun.count(),
    prisma.systemSetting.findMany(),
  ]);

  const modules = [
    "Dashboard",
    "Audit",
    "Score",
    "Action Plan",
    "Content",
    "Hooks",
    "Bio",
    "Repurpose",
    "Calendar",
    "Coach",
    "Radar",
    "Predictor",
    "Missions",
    "Progression",
    "Creator Score",
    "Trend Radar",
    "Score Card",
    "Settings",
    "Onboarding",
  ];

  const dbTables = [
    { name: "User", count: userCount },
    { name: "Workspace", count: workspaceCount },
    { name: "ContentIdea", count: contentCount },
    { name: "AuditResult", count: auditCount },
    { name: "ScoreResult", count: scoreCount },
    { name: "SavedHook", count: hookCount },
    { name: "MissionCompletion", count: missionCount },
    { name: "CreatorScore", count: creatorScoreCount },
    { name: "AdminLog", count: adminLogCount },
    { name: "EngineRun", count: engineRunCount },
  ];

  // Default settings if not yet set
  const defaultSettings = [
    { key: "creator_score.weight.engagement", defaultValue: "0.25", label: "Creator Score: Engagement Weight" },
    { key: "creator_score.weight.growth", defaultValue: "0.20", label: "Creator Score: Growth Weight" },
    { key: "creator_score.weight.consistency", defaultValue: "0.25", label: "Creator Score: Consistency Weight" },
    { key: "creator_score.weight.performance", defaultValue: "0.20", label: "Creator Score: Performance Weight" },
    { key: "creator_score.weight.profile", defaultValue: "0.10", label: "Creator Score: Profile Weight" },
    { key: "trend_radar.momentum_variation", defaultValue: "20", label: "Trend Radar: Momentum Variation Range" },
  ];

  const settingsMap = Object.fromEntries(systemSettings.map((s) => [s.key, s.value]));
  const editableSettings = defaultSettings.map((ds) => ({
    ...ds,
    currentValue: settingsMap[ds.key] ?? ds.defaultValue,
  }));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Paramètres</h1>

      {/* System Info */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Infos système</h2>
        <div className="rounded-lg border bg-surface-1 p-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <p className="text-sm text-text-secondary">Framework</p>
              <p className="font-medium text-foreground">Next.js 16</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">Base de données</p>
              <p className="font-medium text-foreground">SQLite (Prisma)</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">Modules actifs</p>
              <p className="font-medium text-foreground">{modules.length}</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">Mode</p>
              <p className="font-medium text-foreground">100% Local</p>
            </div>
          </div>
        </div>
      </div>

      {/* Editable Settings */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Configuration des moteurs</h2>
        <SettingsEditor settings={editableSettings} />
      </div>

      {/* Database Tables */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Tables de la base</h2>
        <div className="overflow-hidden rounded-lg border bg-surface-1">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-surface-2">
              <tr>
                <th className="px-4 py-3 font-medium text-text-secondary">Table</th>
                <th className="px-4 py-3 font-medium text-text-secondary">Lignes</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {dbTables.map((t) => (
                <tr key={t.name}>
                  <td className="px-4 py-3 font-medium">{t.name}</td>
                  <td className="px-4 py-3">{t.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modules */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Modules</h2>
        <div className="rounded-lg border bg-surface-1 p-4">
          <div className="flex flex-wrap gap-2">
            {modules.map((m) => (
              <span
                key={m}
                className="rounded-full bg-success/15 px-3 py-1 text-xs font-medium text-success"
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
