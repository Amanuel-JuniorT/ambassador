import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = getSessionCookie(request);

  const isProtected =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/verify") ||
    pathname === "/";

  // Cookie presence is not proof of a valid session. Only gate "must look signed in"
  // here — pages call getSession() for the real check. Do not bounce /login → /verify
  // on cookie alone or stale cookies cause ERR_TOO_MANY_REDIRECTS.
  if (isProtected && !sessionCookie) {
    const login = new URL("/login", request.url);
    if (pathname !== "/") {
      login.searchParams.set("next", pathname);
    }
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|ambassador-logo.png|api/auth|api/|c/).*)"],
};
