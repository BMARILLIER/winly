import { ReportsUI } from "./reports-ui";
import { DemoBanner } from "@/components/ui/demo-banner";

export default function ReportsPage() {
  return (
    <>
      <DemoBanner feature="Les rapports exportables" />
      <ReportsUI />
    </>
  );
}
