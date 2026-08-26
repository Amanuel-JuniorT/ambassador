import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiAdmin } from "@/lib/api-auth";
import { createStaffUser } from "@/lib/staff";

export async function GET() {
  const admin = await requireApiAdmin();
  if (admin instanceof NextResponse) return admin;
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
  return NextResponse.json({ users });
}

export async function POST(request: Request) {
  const admin = await requireApiAdmin();
  if (admin instanceof NextResponse) return admin;
  const body = (await request.json().catch(() => null)) as {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
  } | null;

  const name = body?.name?.trim() || "";
  const email = body?.email?.trim().toLowerCase() || "";
  const password = body?.password || "";
  const role = body?.role === "ADMIN" ? "ADMIN" : "CASHIER";

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "That email is already in use." }, { status: 409 });
  }

  const user = await createStaffUser({ name, email, password, role });
  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
}
