import { PrismaClient } from "@prisma/client";

async function main() {
  const p = new PrismaClient();
  const users = await p.user.findMany({ select: { email: true, role: true } });
  console.log("users", users);
  console.log("DATABASE_URL", process.env.DATABASE_URL);
  await p.$disconnect();
}

main();
