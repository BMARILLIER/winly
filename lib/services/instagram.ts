import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

// ─── Config ───

if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
  throw new Error("SESSION_SECRET must be set and at least 32 characters long");
}
const ENCRYPT_KEY = process.env.SESSION_SECRET.slice(0, 32);

/**
 * Resolve the redirect URI dynamically so it matches the current environment.
 * Local dev → http://localhost:3000/api/instagram/callback
 * Production → https://winly-lac.vercel.app/api/instagram/callback
 */
function getRedirectUri(): string {
  if (process.env.NODE_ENV === "production") {
    return `${process.env.NEXT_PUBLIC_APP_URL ?? "https://winly-lac.vercel.app"}/api/instagram/callback`;
  }
  return "https://localhost:3000/api/instagram/callback";
}

function getClientId(): string {
  return process.env.INSTAGRAM_CLIENT_ID ?? "";
}

function getClientSecret(): string {
  return process.env.INSTAGRAM_CLIENT_SECRET ?? "";
}

// ─── Encryption ───

export function encryptToken(token: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv("aes-256-cbc", Buffer.from(ENCRYPT_KEY), iv);
  const encrypted = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptToken(encrypted: string): string {
  const [ivHex, encHex] = encrypted.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPT_KEY), iv);
  return Buffer.concat([decipher.update(Buffer.from(encHex, "hex")), decipher.final()]).toString("utf8");
}

// ─── OAuth URLs ───

export function buildAuthUrl(state: string): string {
  const clientId = getClientId();
  const redirectUri = getRedirectUri();

  if (!clientId) {
    throw new Error("INSTAGRAM_CLIENT_ID is not set — cannot build OAuth URL");
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "instagram_business_basic,instagram_business_manage_insights",
    response_type: "code",
    state,
  });

  const url = `https://www.instagram.com/oauth/authorize?${params}`;

  console.log("[instagram] buildAuthUrl:", {
    client_id: clientId ? "set" : "MISSING",
    redirect_uri: redirectUri,
    url,
  });

  return url;
}

// ─── Token Exchange ───

export async function exchangeCodeForToken(code: string): Promise<{
  access_token: string;
  user_id: string;
}> {
  const redirectUri = getRedirectUri();
  console.log("[instagram] exchangeCodeForToken redirect_uri:", redirectUri);

  const res = await fetch("https://api.instagram.com/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: getClientId(),
      client_secret: getClientSecret(),
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
      code,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Instagram token exchange failed: ${text}`);
  }

  return res.json();
}

// ─── Long-Lived Token ───

export async function getLongLivedToken(shortToken: string): Promise<{
  access_token: string;
  expires_in: number;
}> {
  const params = new URLSearchParams({
    grant_type: "ig_exchange_token",
    client_secret: getClientSecret(),
    access_token: shortToken,
  });

  const res = await fetch(`https://graph.instagram.com/access_token?${params}`);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Instagram long-lived token failed: ${text}`);
  }

  return res.json();
}

// ─── Profile Info ───

export async function getInstagramProfile(accessToken: string): Promise<{
  id: string;
  username: string;
}> {
  const res = await fetch(
    `https://graph.instagram.com/v21.0/me?fields=user_id,username&access_token=${accessToken}`
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Instagram profile fetch failed: ${text}`);
  }

  const data = await res.json();
  return { id: data.user_id ?? data.id, username: data.username };
}
