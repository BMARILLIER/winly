/**
 * Re-exports for backward compatibility.
 * All existing `import { ... } from "@/lib/auth"` continue to work.
 */
export {
  SESSION_COOKIE,
  getSession,
  getSessionWithRole,
  setSession,
  clearSession,
  getCurrentUser,
} from "./get-session";
export { requireAuth } from "./require-auth";
export { requireAdmin } from "./require-admin";
export { signSession, verifySession } from "./session-crypto";
