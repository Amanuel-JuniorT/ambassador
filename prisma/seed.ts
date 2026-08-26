import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

const prisma = new PrismaClient();

const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true, disableSignUp: true },
  secret: process.env.BETTER_AUTH_SECRET,
});

async function clearDatabase() {
  await prisma.verifyScan.deleteMany();
  await prisma.specialCustomer.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.user.deleteMany();
}

async function createAdmin(name: string, email: string, password: string) {
  const ctx = await auth.$context;
  const hashed = await ctx.password.hash(password);
  const id = randomBytes(16).toString("hex");
  const now = new Date();

  const user = await prisma.user.create({
    data: {
      id,
      name,
      email,
      emailVerified: true,
      role: "ADMIN",
      createdAt: now,
      updatedAt: now,
    },
  });

  await prisma.account.create({
    data: {
      id: randomBytes(16).toString("hex"),
      accountId: user.id,
      providerId: "credential",
      issuer: "local:credential",
      userId: user.id,
      password: hashed,
      createdAt: now,
      updatedAt: now,
    },
  });

  return user;
}

async function main() {
  const email = (process.env.SEED_ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD || "";
  const name = (process.env.SEED_ADMIN_NAME || "Administrator").trim();

  if (!email || !password) {
    throw new Error(
      "Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in .env before seeding.",
    );
  }
  if (password.length < 8) {
    throw new Error("SEED_ADMIN_PASSWORD must be at least 8 characters.");
  }

  console.log("Clearing database…");
  await clearDatabase();

  const admin = await createAdmin(name, email, password);
  console.log("Seed complete.");
  console.log(`Admin: ${admin.email} (${admin.name})`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
