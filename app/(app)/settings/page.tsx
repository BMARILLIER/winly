import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { WorkspaceSettingsForm } from "./workspace-form";
import { InstagramConnection } from "@/components/settings/instagram-connection";
import { BillingSection } from "@/components/settings/billing-section";
import { DailyCoachToggle } from "@/components/settings/daily-coach-toggle";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspace = user.workspaces[0];
  if (!workspace) redirect("/onboarding");

  const billing = await prisma.user.findUnique({
    where: { id: user.id },
    select: { plan: true, stripeCustomerId: true },
  });

  let dailyCoachEnabled = false;
  try {
    const coachRow = await prisma.$queryRaw<{ dailyCoachEnabled: number }[]>(
      Prisma.sql`SELECT dailyCoachEnabled FROM User WHERE id = ${user.id}`,
    );
    dailyCoachEnabled = coachRow?.[0]?.dailyCoachEnabled === 1;
  } catch {
    // field doesn't exist yet in DB — safe to ignore
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Paramètres</h1>
      <p className="mt-2 text-text-secondary">Gérez votre workspace et vos préférences.</p>

      <div className="mt-8 max-w-2xl space-y-8">
        <Suspense fallback={null}>
          <InstagramConnection />
        </Suspense>
        <BillingSection
          plan={billing?.plan ?? "free"}
          hasStripeCustomer={Boolean(billing?.stripeCustomerId)}
        />
        <DailyCoachToggle initialEnabled={dailyCoachEnabled} />
        <WorkspaceSettingsForm workspace={workspace} />
      </div>
    </div>
  );
}
