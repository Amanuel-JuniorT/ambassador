import { AppShell } from "@/components/AppShell";
import { VerifyDesk } from "@/components/VerifyDesk";
import { requireUser } from "@/lib/session";

export default async function VerifyPage() {
  const user = await requireUser();

  return (
    <AppShell role={user.role} name={user.name}>
      <h2 className="m-0 mb-1 text-base font-semibold">Verify at checkout</h2>
      <p className="mb-5 text-[13px] text-muted">
        No hardware scanner required. Camera scan or paste the code — the QR itself never
        contains a name, TIN, or rate.
      </p>
      <div className="section-note">
        After a valid result, select <b>Special</b> in the SAP terminal and complete the
        sale there. This desk never applies a price.
      </div>
      <VerifyDesk />
    </AppShell>
  );
}
