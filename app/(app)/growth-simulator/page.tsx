import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getInstagramMetrics } from "@/lib/services/instagram-metrics";
import { GrowthSimulatorUI } from "./growth-simulator-ui";
import { DemoBanner } from "@/components/ui/demo-banner";

export default async function GrowthSimulatorPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspace = user.workspaces[0];
  if (!workspace) redirect("/onboarding");

  const igMetrics = await getInstagramMetrics(user.id);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Growth Simulator</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Simulez votre potentiel de croissance et testez des scénarios &laquo; et si &raquo;.
        </p>
      </div>
      {!igMetrics && <DemoBanner feature="Le simulateur de croissance (sans Instagram connecté)" />}
      <GrowthSimulatorUI
        initialFollowers={igMetrics?.followers ?? undefined}
        initialEngagement={igMetrics ? Math.round(igMetrics.engagementRate * 1000) / 10 : undefined}
        initialNiche={workspace.niche}
        initialPlatform={workspace.mainPlatform}
      />
    </div>
  );
}
