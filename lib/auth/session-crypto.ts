/**
 * HMAC-SHA256 session signing & verification.
 *
 * Uses the Web Crypto API so it works in both Node.js server actions
 * and the Next.js Edge middleware runtime.
 *
 * Cookie format: `<payload>.<base64url-signature>`
 * Payload format: `<userId>:<role>`
 */

const SESSION_SECRET =
  process.env.SESSION_SECRET ?? "winly-dev-secret-min-32-chars-change-in-prod";

// ── helpers ──

function toBase64Url(buf: ArrayBuffer): string {
  const bytes = Array.from(new Uint8Array(buf));
  return btoa(String.fromCharCode.apply(null, bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(str: string): ArrayBuffer {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer as ArrayBuffer;
}

async function getKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

// ── public API ──

/** Sign a payload string and return `payload.signature`. */
export async function signSession(payload: string): Promise<string> {
  const key = await getKey();
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload),
  );
  return `${payload}.${toBase64Url(sig)}`;
}

/**
 * Verify a signed cookie value.
 * Returns the original payload on success, `null` on failure.
 */
export async function verifySession(cookie: string): Promise<string | null> {
  const dot = cookie.lastIndexOf(".");
  if (dot === -1) return null;

  const payload = cookie.slice(0, dot);
  const sigBuf = fromBase64Url(cookie.slice(dot + 1));

  const key = await getKey();
  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    sigBuf,
    new TextEncoder().encode(payload),
  );

  return valid ? payload : null;
}
