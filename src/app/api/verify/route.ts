import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/api-auth";
import { extractCardToken } from "@/lib/staff";

export async function POST(request: Request) {
  const user = await requireApiUser();
  if (user instanceof NextResponse) return user;
  const body = (await request.json().catch(() => null)) as { token?: string } | null;
  const token = extractCardToken(body?.token || "");

  if (!token) {
    return NextResponse.json({ status: "INVALID", message: "Enter or scan a card." }, { status: 400 });
  }

  const customer = await prisma.specialCustomer.findUnique({ where: { token } });
  const result = !customer
    ? "NOT_FOUND"
    : customer.status === "BLOCKED"
      ? "BLOCKED"
      : "VALID";

  await prisma.verifyScan.create({
    data: {
      customerId: customer?.id,
      cashierId: user.id,
      tokenHint: token.slice(0, 8),
      result,
    },
  });

  if (!customer) {
    return NextResponse.json({
      status: "NOT_FOUND",
      message: "This card is not registered.",
    });
  }

  if (customer.status === "BLOCKED") {
    return NextResponse.json({
      status: "BLOCKED",
      name: customer.name,
      tin: customer.tin,
      displayId: customer.displayId,
      message: "This card is blocked. Do not apply the special rate — complete as a normal sale.",
    });
  }

  return NextResponse.json({
    status: "VALID",
    name: customer.name,
    tin: customer.tin,
    displayId: customer.displayId,
    discount: customer.discount,
    branch: customer.branch,
    sapCustomerNo: null,
    message: "In SAP, choose Special as the customer category, then complete the sale there.",
  });
}
