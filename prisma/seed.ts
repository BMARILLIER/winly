/**
 * Seed admin local pour Winly.
 *
 * Crée un compte admin de test si aucun admin n'existe encore.
 *
 * Usage :
 *   npx tsx prisma/seed.ts
 *
 * Pour changer les identifiants admin, modifier les constantes ci-dessous.
 * Pour promouvoir un utilisateur existant en admin :
 *   npx prisma db execute --stdin <<< "UPDATE User SET role='admin' WHERE email='user@example.com';"
 */

import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

// ---- Identifiants admin de test (modifiables) ----
const ADMIN_EMAIL = "admin@winly.local";
const ADMIN_PASSWORD = "admin123";
const ADMIN_NAME = "Admin";
// ---------------------------------------------------

const prisma = new PrismaClient();

async function main() {
  const existingAdmin = await prisma.user.findFirst({
    where: { role: "admin" },
  });

  if (existingAdmin) {
    console.log(`Admin already exists: ${existingAdmin.email}`);
    return;
  }

  const existing = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
  });

  if (existing) {
    await prisma.user.update({
      where: { email: ADMIN_EMAIL },
      data: { role: "admin" },
    });
    console.log(`Existing user promoted to admin: ${ADMIN_EMAIL}`);
    return;
  }

  const passwordHash = await hash(ADMIN_PASSWORD, 12);
  await prisma.user.create({
    data: {
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
      passwordHash,
      role: "admin",
    },
  });

  console.log(`Admin created: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
