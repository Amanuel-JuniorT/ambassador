import { PrismaClient } from "@prisma/client";

async function main() {
  const prisma = new PrismaClient();
  const users = await prisma.user.findMany({
    select: { email: true, role: true, name: true },
  });
  const accounts = await prisma.account.count();
  console.log(JSON.stringify({ users, accounts }, null, 2));
  await prisma.$disconnect();
}

main();
