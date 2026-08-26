import { PrismaClient } from "@prisma/client";

async function main() {
  const id = process.argv[2];
  const prisma = new PrismaClient();
  const customer = await prisma.specialCustomer.findUnique({ where: { id } });
  if (!customer) {
    console.error("not found");
    process.exit(1);
  }
  console.log(customer.token);
  await prisma.$disconnect();
}

main();
