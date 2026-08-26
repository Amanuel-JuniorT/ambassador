"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

type Props = {
  role: "ADMIN" | "CASHIER";
  name: string;
  children: React.ReactNode;
};

export function AppShell({ role, name, children }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const links =
    role === "ADMIN"
      ? [
          { href: "/admin", label: "Directory" },
          { href: "/admin/register", label: "Register" },
          { href: "/admin/staff", label: "Staff" },
          { href: "/verify", label: "Verify" },
        ]
      : [{ href: "/verify", label: "Verify" }];

  async function signOut() {
    await authClient.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-[1040px] px-4 pb-20 pt-5 sm:px-6 sm:pt-7">
      <header className="mb-6 flex flex-col gap-4 border-b border-[var(--line)] pb-5 sm:mb-7 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/ambassador-logo.png"
            alt="Ambassador"
            className="h-12 w-auto object-contain object-left sm:h-14"
          />
          <div className="min-w-0">
            <h1 className="m-0 text-[15px] font-semibold tracking-wide sm:text-base">
              Special customer cards
            </h1>
            <p className="m-0 mt-0.5 text-[12.5px] text-muted">
              Identity and eligibility · alongside SAP / CNET
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="phase-tag">
            {role === "ADMIN" ? "ADMIN" : "CASHIER"}
          </span>
          <span className="hidden font-mono text-[11px] text-muted sm:inline">{name}</span>
          <button type="button" className="btn secondary" onClick={signOut}>
            Sign out
          </button>
        </div>
      </header>

      <nav className="mb-7 flex gap-1 overflow-x-auto border-b border-[var(--line)]">
        {links.map((link) => {
          const active =
            link.href === "/admin"
              ? pathname === "/admin"
              : pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`mr-6 shrink-0 border-b-2 px-1 py-2.5 text-sm font-medium no-underline transition-colors ${
                active
                  ? "border-[var(--gold-deep)] text-ink"
                  : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      {children}
    </div>
  );
}
