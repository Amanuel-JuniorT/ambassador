import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiAdmin } from "@/lib/api-auth";
import { newCardToken, newDisplayId } from "@/lib/staff";

export async function GET(request: Request) {
  const admin = await requireApiAdmin();
  if (admin instanceof NextResponse) return admin;
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim().toLowerCase();

  const customers = await prisma.specialCustomer.findMany({
    orderBy: { createdAt: "desc" },
  });

  const filtered = q
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.tin || "").includes(q) ||
          c.displayId.toLowerCase().includes(q),
      )
    : customers;

  return NextResponse.json({
    customers: filtered.map((c) => ({
      id: c.id,
      displayId: c.displayId,
      name: c.name,
      tin: c.tin,
      branch: c.branch,
      discount: c.discount,
      validThru: c.validThru,
      status: c.status,
      createdAt: c.createdAt,
    })),
  });
}

export async function POST(request: Request) {
  const admin = await requireApiAdmin();
  if (admin instanceof NextResponse) return admin;
  const body = (await request.json().catch(() => null)) as {
    name?: string;
    tin?: string;
    branch?: string;
    discount?: number;
    validThru?: string;
  } | null;

  const name = body?.name?.trim().toUpperCase() || "";
  const tin = body?.tin?.trim() || "";
  const branch = body?.branch?.trim() || "HQ";
  const discount = Number(body?.discount);
  const validThru = body?.validThru?.trim() || "";

  if (!name) {
    return NextResponse.json({ error: "Enter a full name." }, { status: 400 });
  }
  if (tin && !/^[0-9]{6,15}$/.test(tin)) {
    return NextResponse.json({ error: "TIN should be 6–15 digits, or leave it blank." }, { status: 400 });
  }
  if (validThru && !/^\d{2}\/\d{2}$/.test(validThru)) {
    return NextResponse.json({ error: "Valid thru should be MM/YY." }, { status: 400 });
  }
  if (!Number.isInteger(discount) || discount < 1 || discount > 100) {
    return NextResponse.json({ error: "Discount must be a whole number between 1 and 100." }, { status: 400 });
  }

  const customer = await prisma.specialCustomer.create({
    data: {
      displayId: newDisplayId(),
      token: newCardToken(),
      name,
      tin: tin || null,
      branch,
      discount,
      validThru: validThru || null,
      status: "ACTIVE",
      registeredById: admin.id,
    },
  });

  return NextResponse.json({
    id: customer.id,
    displayId: customer.displayId,
    name: customer.name,
    tin: customer.tin,
    branch: customer.branch,
    discount: customer.discount,
    validThru: customer.validThru,
    status: customer.status,
  });
}

export async function PATCH(request: Request) {
  const admin = await requireApiAdmin();
  if (admin instanceof NextResponse) return admin;
  const body = (await request.json().catch(() => null)) as {
    id?: string;
    status?: "ACTIVE" | "BLOCKED";
  } | null;

  if (!body?.id || (body.status !== "ACTIVE" && body.status !== "BLOCKED")) {
    return NextResponse.json({ error: "Invalid update." }, { status: 400 });
  }

  const customer = await prisma.specialCustomer.update({
    where: { id: body.id },
    data: { status: body.status },
  });

  return NextResponse.json({ id: customer.id, status: customer.status });
}
