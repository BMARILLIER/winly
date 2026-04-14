import { CompetitorsUI } from "./competitors-ui";
import { DemoBanner } from "@/components/ui/demo-banner";

export default function CompetitorsPage() {
  return (
    <>
      <DemoBanner feature="L'analyse concurrentielle" />
      <CompetitorsUI />
    </>
  );
}
