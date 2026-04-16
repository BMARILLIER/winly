import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ReferralUI } from "./referral-ui";

export default async function ReferralPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return <ReferralUI />;
}
