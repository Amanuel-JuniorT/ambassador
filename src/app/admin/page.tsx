import { AppShell } from "@/components/AppShell";
import { DirectoryTable } from "@/components/DirectoryTable";
import { requireAdmin } from "@/lib/session";

export default async function AdminDirectoryPage() {
  const user = await requireAdmin();
  return (
    <AppShell role={user.role} name={user.name}>
      <h2 className="m-0 mb-1 text-base font-semibold">Special customer directory</h2>
      <p className="mb-5 text-[13px] text-muted">
        All branches see the same list. Blocking a card stops checkout verification
        everywhere.
      </p>
      <DirectoryTable />
    </AppShell>
  );
}
