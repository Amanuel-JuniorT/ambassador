import { AppShell } from "@/components/AppShell";
import { RegisterForm } from "@/components/RegisterForm";
import { requireAdmin } from "@/lib/session";

export default async function RegisterPage() {
  const user = await requireAdmin();
  return (
    <AppShell role={user.role} name={user.name}>
      <h2 className="m-0 mb-1 text-base font-semibold">Register a special customer</h2>
      <p className="mb-5 text-[13px] text-muted">
        Issues a card token stored in the database. The printed QR encodes only an opaque
        address — not a name, TIN, or discount.
      </p>
      <div className="section-note">
        Cashiers still finish every sale in <b>SAP / CNET</b>. This screen only issues the
        card.
      </div>
      <RegisterForm />
    </AppShell>
  );
}
