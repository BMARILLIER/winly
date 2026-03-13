import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function buildPrisma(): PrismaClient {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  if (tursoUrl && tursoToken) {
    console.log("[db] Using Turso adapter:", tursoUrl);
    const adapter = new PrismaLibSQL({
      url: tursoUrl,
      authToken: tursoToken,
    });
    return new PrismaClient({ adapter } as never);
  }

  console.log("[db] Using local SQLite (no TURSO env vars)");
  return new PrismaClient();
}

// Always build fresh in production to avoid stale cached client from build time
export const prisma =
  process.env.NODE_ENV === "production"
    ? buildPrisma()
    : (globalForPrisma.prisma || (globalForPrisma.prisma = buildPrisma()));
