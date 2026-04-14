/**
 * In-memory sliding-window rate limiter.
 *
 * Sufficient for a private beta with a single process.
 * Swap for a Redis-backed store post-beta if needed.
 */

type WindowEntry = number[];

const stores = new Map<string, Map<string, WindowEntry>>();

// Periodic cleanup to avoid memory leaks (every 5 min)
const CLEANUP_INTERVAL = 5 * 60 * 1000;

let cleanupScheduled = false;
function scheduleCleanup() {
  if (cleanupScheduled) return;
  cleanupScheduled = true;
  setInterval(() => {
    const now = Date.now();
    for (const [, store] of stores) {
      for (const [key, timestamps] of store) {
        const fresh = timestamps.filter((t) => now - t < 15 * 60 * 1000);
        if (fresh.length === 0) store.delete(key);
        else store.set(key, fresh);
      }
    }
  }, CLEANUP_INTERVAL).unref?.();
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
}

/**
 * Create a named rate-limiter.
 *
 * @param name   Unique name for this limiter (e.g. "login", "beta")
 * @param limit  Max requests allowed within the window
 * @param windowMs  Time window in milliseconds
 */
export function createRateLimiter(
  name: string,
  limit: number,
  windowMs: number,
) {
  if (!stores.has(name)) stores.set(name, new Map());
  const store = stores.get(name)!;
  scheduleCleanup();

  return {
    check(identifier: string): RateLimitResult {
      const now = Date.now();
      const timestamps = store.get(identifier) ?? [];
      const valid = timestamps.filter((t) => now - t < windowMs);

      if (valid.length >= limit) {
        store.set(identifier, valid);
        return { success: false, remaining: 0 };
      }

      valid.push(now);
      store.set(identifier, valid);
      return { success: true, remaining: limit - valid.length };
    },

    /** Reset a specific identifier (useful for tests). */
    reset(identifier: string) {
      store.delete(identifier);
    },
  };
}

// ── Pre-configured limiters ──

/** Login: 5 attempts per 15 min per IP */
export const loginLimiter = createRateLimiter("login", 5, 15 * 60 * 1000);

/** Register: 3 attempts per 15 min per IP */
export const registerLimiter = createRateLimiter("register", 3, 15 * 60 * 1000);

/** Beta request: 3 attempts per 15 min per IP */
export const betaLimiter = createRateLimiter("beta", 3, 15 * 60 * 1000);

/** API routes: 30 requests per minute per user */
export const apiLimiter = createRateLimiter("api", 30, 60 * 1000);

// ── IP helper (for server actions) ──

export async function getClientIp(): Promise<string> {
  const { headers } = await import("next/headers");
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0].trim() ||
    h.get("x-real-ip") ||
    "unknown"
  );
}
