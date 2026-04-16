import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getInstagramMetrics } from "@/lib/services/instagram-metrics";
import { ReportsUI } from "./reports-ui";
import { DemoBanner } from "@/components/ui/demo-banner";

export default async function ReportsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspace = user.workspaces[0];
  if (!workspace) redirect("/onboarding");

  const igMetrics = await getInstagramMetrics(user.id);

  return (
    <>
      {!igMetrics && (
        <DemoBanner feature="Les rapports (connecte Instagram pour des rapports réels)" />
      )}
      <ReportsUI />
    </>
  );
}
