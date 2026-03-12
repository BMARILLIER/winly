import { getBetaRequests, getBetaStats } from "@/lib/actions/beta";
import { BetaPanelUI } from "./beta-panel-ui";

export default async function AdminBetaPage() {
  const [requests, stats] = await Promise.all([
    getBetaRequests(),
    getBetaStats(),
  ]);

  return <BetaPanelUI requests={requests} stats={stats} />;
}
