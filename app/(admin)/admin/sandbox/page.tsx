import { requireAdmin } from "@/lib/auth";
import { SandboxUI } from "./sandbox-ui";

export default async function AdminSandboxPage() {
  await requireAdmin();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Sandbox</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Testez les moteurs avec des entrées personnalisées. Les résultats sont sauvegardés dans l'historique.
        </p>
      </div>
      <SandboxUI />
    </div>
  );
}
