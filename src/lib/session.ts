import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth, type SessionUser } from "./auth";

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function requireUser(): Promise<SessionUser> {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login");
  }
  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: (session.user.role === "ADMIN" ? "ADMIN" : "CASHIER") as SessionUser["role"],
  };
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "ADMIN") {
    redirect("/verify");
  }
  return user;
}
