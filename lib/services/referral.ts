import { prisma } from "@/lib/db";
import { randomBytes } from "crypto";

const REFERRER_BONUS = 20;
const REFERRED_BONUS = 5;

async function ensureTable() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS Referral (
        id TEXT PRIMARY KEY,
        referrerId TEXT NOT NULL,
        referredId TEXT NOT NULL UNIQUE,
        referralCode TEXT NOT NULL,
        creditGranted INTEGER NOT NULL DEFAULT 0,
        createdAt TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);
  } catch {
    // table may already exist
  }
}

export function generateReferralCode(userId: string): string {
  const hash = randomBytes(4).toString("hex");
  return `${userId.slice(0, 6)}${hash}`.toUpperCase();
}

export async function getReferralCode(userId: string): Promise<string> {
  await ensureTable();

  // Check if user already has referrals → derive code from first one
  const existing = await prisma.$queryRawUnsafe<{ referralCode: string }[]>(
    `SELECT referralCode FROM Referral WHERE referrerId = ? LIMIT 1`,
    userId,
  ).catch(() => []);

  if (existing.length > 0) return existing[0].referralCode;

  // Generate a stable code based on userId
  return generateReferralCode(userId);
}

export async function getReferralStats(userId: string): Promise<{
  code: string;
  totalReferred: number;
  creditsEarned: number;
}> {
  await ensureTable();
  const code = await getReferralCode(userId);

  const rows = await prisma.$queryRawUnsafe<{ cnt: number }[]>(
    `SELECT COUNT(*) as cnt FROM Referral WHERE referrerId = ?`,
    userId,
  ).catch(() => [{ cnt: 0 }]);

  const totalReferred = Number(rows[0]?.cnt ?? 0);

  return {
    code,
    totalReferred,
    creditsEarned: totalReferred * REFERRER_BONUS,
  };
}

export async function applyReferralCode(
  newUserId: string,
  code: string,
): Promise<{ ok: boolean; error?: string }> {
  await ensureTable();

  if (!code || code.length < 6) return { ok: false, error: "Code invalide." };

  // Check if already referred
  const existing = await prisma.$queryRawUnsafe<{ id: string }[]>(
    `SELECT id FROM Referral WHERE referredId = ?`,
    newUserId,
  ).catch(() => []);

  if (existing.length > 0) return { ok: false, error: "Deja parraine." };

  // Find referrer: code starts with first 6 chars of their userId
  const userPrefix = code.slice(0, 6).toLowerCase();
  const users = await prisma.user.findMany({
    where: { id: { startsWith: userPrefix } },
    select: { id: true },
  });

  // Fallback: search all referrals with this code
  let referrerId: string | null = users[0]?.id ?? null;

  if (!referrerId) {
    const fromReferral = await prisma.$queryRawUnsafe<{ referrerId: string }[]>(
      `SELECT referrerId FROM Referral WHERE referralCode = ? LIMIT 1`,
      code.toUpperCase(),
    ).catch(() => []);
    referrerId = fromReferral[0]?.referrerId ?? null;
  }

  if (!referrerId || referrerId === newUserId) {
    return { ok: false, error: "Code de parrainage invalide." };
  }

  // Create referral
  const id = `ref_${Date.now()}_${randomBytes(4).toString("hex")}`;
  await prisma.$executeRawUnsafe(
    `INSERT INTO Referral (id, referrerId, referredId, referralCode, creditGranted) VALUES (?, ?, ?, ?, 1)`,
    id, referrerId, newUserId, code.toUpperCase(),
  );

  // Grant credits: bonus to referrer
  await prisma.user.update({
    where: { id: referrerId },
    data: { generationsUsed: { decrement: REFERRER_BONUS } },
  });

  // Grant credits: bonus to referred
  await prisma.user.update({
    where: { id: newUserId },
    data: { generationsUsed: { decrement: REFERRED_BONUS } },
  });

  return { ok: true };
}
