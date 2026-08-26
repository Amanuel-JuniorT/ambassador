import { redirect } from "next/navigation";
import { getSession, toSessionUser } from "@/lib/api-auth";

export default async function HomePage() {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login");
  }
  const user = toSessionUser(session);
  redirect(user.role === "ADMIN" ? "/admin" : "/verify");
}
