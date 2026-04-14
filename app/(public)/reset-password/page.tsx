import Link from "next/link";
import { ResetPasswordForm } from "./reset-form";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-border bg-surface-1 p-8 text-center">
          <h1 className="text-xl font-semibold text-foreground">Lien invalide</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Ce lien ne contient pas de jeton de réinitialisation.
          </p>
          <Link
            href="/forgot-password"
            className="mt-4 inline-block text-sm font-medium text-accent hover:underline"
          >
            Demander un nouveau lien →
          </Link>
        </div>
      </div>
    );
  }

  return <ResetPasswordForm token={token} />;
}
