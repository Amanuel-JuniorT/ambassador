import { AppShell } from "@/components/AppShell";
import { StaffManager } from "@/components/StaffManager";
import { requireAdmin } from "@/lib/session";

export default async function StaffPage() {
  const user = await requireAdmin();
  return (
    <AppShell role={user.role} name={user.name}>
      <h2 className="m-0 mb-1 text-base font-semibold">Staff users</h2>
      <p className="mb-5 text-[13px] text-muted">
        Admins can add cashiers and other admins. Public sign-up is closed.
      </p>
      <StaffManager />
    </AppShell>
  );
}
