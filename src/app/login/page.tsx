import { Suspense } from "react";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/LoginForm";
import { getSession, toSessionUser } from "@/lib/api-auth";

export default async function LoginPage() {
  const session = await getSession();
  if (session?.user) {
    const user = toSessionUser(session);
    redirect(user.role === "ADMIN" ? "/admin" : "/verify");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 flex flex-col items-center text-center">
        <img
          src="/ambassador-logo.png"
          alt="Ambassador"
          className="mb-5 h-[88px] w-auto object-contain"
        />
        <h1 className="m-0 text-lg font-semibold tracking-wide">Staff sign in</h1>
        <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-muted">
          Special customer cards are verified only by signed-in staff. Guests scanning a
          card will not see personal details.
        </p>
      </div>
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
