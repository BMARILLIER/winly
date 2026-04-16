import { redirect } from "next/navigation";

export default async function ReferralLandingPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  redirect(`/register?ref=${encodeURIComponent(code)}`);
}
