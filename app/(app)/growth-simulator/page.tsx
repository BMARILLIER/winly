import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { GrowthSimulatorUI } from "./growth-simulator-ui";

export default async function GrowthSimulatorPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Growth Simulator</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Simulez votre potentiel de croissance et testez des scénarios &laquo; et si &raquo;.
        </p>
      </div>
      <GrowthSimulatorUI />
    </div>
  );
}
