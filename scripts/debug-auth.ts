import { PrismaClient } from "@prisma/client";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

async function main() {
  const prisma = new PrismaClient();
  const auth = betterAuth({
    database: prismaAdapter(prisma, { provider: "sqlite" }),
    emailAndPassword: { enabled: true },
  });

  const users = await prisma.user.findMany();
  const accounts = await prisma.account.findMany();
  console.log(
    "users",
    users.map((u) => ({ id: u.id, email: u.email, role: u.role })),
  );
  console.log(
    "accounts",
    accounts.map((a) => ({
      userId: a.userId,
      providerId: a.providerId,
      accountId: a.accountId,
      hasPassword: Boolean(a.password),
      passwordPrefix: a.password?.slice(0, 20),
    })),
  );

  const ctx = await auth.$context;
  const account = accounts[0];
  if (account?.password) {
    const ok = await ctx.password.verify({
      password: "Ambassador.Admin.2026",
      hash: account.password,
    });
    console.log("password verify", ok);
  }

  await prisma.$disconnect();
}

main();
