import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { WorkspaceSettingsForm } from "./workspace-form";
import { InstagramConnection } from "@/components/settings/instagram-connection";
import { BillingSection } from "@/components/settings/billing-section";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspace = user.workspaces[0];
  if (!workspace) redirect("/onboarding");

  const billing = await prisma.user.findUnique({
    where: { id: user.id },
    select: { plan: true, stripeCustomerId: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Paramètres</h1>
      <p className="mt-2 text-text-secondary">Gérez votre workspace et vos préférences.</p>

      <div className="mt-8 max-w-2xl space-y-8">
        <BillingSection
          plan={billing?.plan ?? "free"}
          hasStripeCustomer={Boolean(billing?.stripeCustomerId)}
        />
        <Suspense fallback={null}>
          <InstagramConnection />
        </Suspense>
        <WorkspaceSettingsForm workspace={workspace} />
      </div>
    </div>
  );
}
