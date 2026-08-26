"use client";

import { MemberCard } from "@/components/MemberCard";

type Customer = {
  id: string;
  displayId: string;
  name: string;
  validThru: string | null;
  discount: number;
  createdAt: string;
  qrDataUrl: string;
};

export function PrintCard({ customer }: { customer: Customer }) {
  const year = new Date(customer.createdAt).getFullYear().toString();

  return (
    <div className="px-4 py-8 sm:px-6">
      <div className="no-print mx-auto mb-6 flex max-w-[1040px] items-center justify-between">
        <a href="/admin" className="text-[13px] text-muted no-underline">
          Back to directory
        </a>
        <button type="button" className="btn" onClick={() => window.print()}>
          Print
        </button>
      </div>
      <div className="print-only-cards rounded-2xl bg-[radial-gradient(circle_at_30%_20%,#2b2019,#14100b_72%)] px-3 py-8 sm:px-6 sm:py-10">
        <MemberCard
          name={customer.name}
          displayId={customer.displayId}
          validThru={customer.validThru}
          memberSince={year}
          discount={customer.discount}
          qrDataUrl={customer.qrDataUrl}
        />
      </div>
    </div>
  );
}
