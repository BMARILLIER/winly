import { redirect } from "next/navigation";
import { getCurrentUser } from "./get-session";
import { ROLES } from "@/lib/permissions/roles";

/**
 * Server-side admin guard.
 * Returns the admin user or redirects:
 *   - No session → /login
 *   - Not admin  → /dashboard
 */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== ROLES.ADMIN) redirect("/dashboard");
  return user;
}
