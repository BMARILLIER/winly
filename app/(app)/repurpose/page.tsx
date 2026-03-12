import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Repurposer } from "./repurposer";

export default async function RepurposePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspace = user.workspaces[0];
  if (!workspace) redirect("/onboarding");

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Content Repurposer</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Collez n&apos;importe quel contenu et transformez-le en 4 formats différents instantanément.
        </p>
      </div>

      <Repurposer />
    </div>
  );
}
