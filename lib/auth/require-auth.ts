import { redirect } from "next/navigation";
import { getCurrentUser } from "./get-session";

/**
 * Server-side auth guard.
 * Returns the authenticated user or redirects to /login.
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
