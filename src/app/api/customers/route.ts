import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiAdmin } from "@/lib/api-auth";
import { newCardToken, newDisplayId } from "@/lib/staff";
import {
  normalizeCustomerName,
  normalizeDiscount,
  normalizeTin,
  normalizeValidThru,
} from "@/lib/validate-customer";

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

  const nameResult = normalizeCustomerName(body?.name);
  if (nameResult.error) {
    return NextResponse.json({ error: nameResult.error }, { status: 400 });
  }
  const tinResult = normalizeTin(body?.tin);
  if (tinResult.error) {
    return NextResponse.json({ error: tinResult.error }, { status: 400 });
  }
  const validThruResult = normalizeValidThru(body?.validThru);
  if (validThruResult.error) {
    return NextResponse.json({ error: validThruResult.error }, { status: 400 });
  }
  const discountResult = normalizeDiscount(body?.discount);
  if (discountResult.error) {
    return NextResponse.json({ error: discountResult.error }, { status: 400 });
  }
  const branch = body?.branch?.trim() || "HQ";

  const customer = await prisma.specialCustomer.create({
    data: {
      displayId: newDisplayId(),
      token: newCardToken(),
      name: nameResult.name!,
      tin: tinResult.tin,
      branch,
      discount: discountResult.discount!,
      validThru: validThruResult.validThru,
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
    name?: string;
  } | null;

  if (!body?.id) {
    return NextResponse.json({ error: "Invalid update." }, { status: 400 });
  }

  const data: { status?: "ACTIVE" | "BLOCKED"; name?: string } = {};

  if (body.status === "ACTIVE" || body.status === "BLOCKED") {
    data.status = body.status;
  }
  if (typeof body.name === "string") {
    const nameResult = normalizeCustomerName(body.name);
    if (nameResult.error) {
      return NextResponse.json({ error: nameResult.error }, { status: 400 });
    }
    data.name = nameResult.name;
  }

  if (!data.status && !data.name) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const customer = await prisma.specialCustomer.update({
    where: { id: body.id },
    data,
  });

  return NextResponse.json({
    id: customer.id,
    status: customer.status,
    name: customer.name,
  });
}
