/**
 * Re-exports for backward compatibility.
 * All existing `import { ... } from "@/lib/auth"` continue to work.
 */
export {
  SESSION_COOKIE,
  getSession,
  setSession,
  clearSession,
  getCurrentUser,
} from "./get-session";
export { requireAuth } from "./require-auth";
export { requireAdmin } from "./require-admin";
