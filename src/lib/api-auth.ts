import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth, type SessionUser } from "./auth";

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

export function toSessionUser(session: NonNullable<Awaited<ReturnType<typeof getSession>>>): SessionUser {
  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role === "ADMIN" ? "ADMIN" : "CASHIER",
  };
}

export async function requireApiUser(): Promise<SessionUser | NextResponse> {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  return toSessionUser(session);
}

export async function requireApiAdmin(): Promise<SessionUser | NextResponse> {
  const user = await requireApiUser();
  if (user instanceof NextResponse) return user;
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }
  return user;
}
