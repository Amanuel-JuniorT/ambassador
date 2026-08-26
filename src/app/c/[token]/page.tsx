import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ambassador member card",
  robots: { index: false, follow: false },
};

export default async function PublicCardPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  await params;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center">
      <img src="/ambassador-logo.png" alt="Ambassador" className="mb-8 h-[88px] w-auto object-contain" />
      <p className="m-0 font-serif text-xl text-[var(--gold-bright)]">Member card</p>
      <p className="mt-3 max-w-sm text-[13.5px] leading-relaxed text-muted">
        Present this card at an Ambassador checkout. Eligibility is confirmed only by
        staff on the signed-in verify desk.
      </p>
      <p className="mt-8 text-[11px] tracking-[0.08em] text-muted uppercase">
        No account details are shown on this page
      </p>
    </main>
  );
}
