"use client";

import { useState } from "react";
import Link from "next/link";
import { MemberCard } from "./MemberCard";

type Created = {
  id: string;
  displayId: string;
  name: string;
  tin: string | null;
  branch: string;
  discount: number;
  validThru: string | null;
};

export function RegisterForm() {
  const year = String(new Date().getFullYear());
  const [name, setName] = useState("");
  const [tin, setTin] = useState("");
  const [branch, setBranch] = useState("HQ");
  const [validThru, setValidThru] = useState("");
  const [discount, setDiscount] = useState("15");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [created, setCreated] = useState<Created | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  function onValidThru(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length > 2) {
      setValidThru(`${digits.slice(0, 2)}/${digits.slice(2)}`);
    } else {
      setValidThru(digits);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setPending(true);
    const res = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        tin,
        branch,
        validThru,
        discount: Number(discount),
      }),
    });
    const data = await res.json();
    setPending(false);
    if (!res.ok) {
      setError(data.error || "Could not register this customer.");
      return;
    }
    setCreated(data);
    const card = await fetch(`/api/customers/${data.id}`);
    if (card.ok) {
      const payload = await card.json();
      setQrDataUrl(payload.qrDataUrl);
    }
  }

  return (
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2">
      <form onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="reg-name">Full name</label>
          <input
            id="reg-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Abdi Bekele"
            autoComplete="off"
          />
        </div>
        <div className="field">
          <label htmlFor="reg-tin">
            TIN <span className="font-normal text-muted">(optional)</span>
          </label>
          <input
            id="reg-tin"
            value={tin}
            onChange={(e) => setTin(e.target.value)}
            placeholder="0012345678"
            autoComplete="off"
          />
        </div>
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="field !mb-0">
            <label htmlFor="reg-branch">Branch of registration</label>
            <select id="reg-branch" value={branch} onChange={(e) => setBranch(e.target.value)}>
              <option>HQ</option>
              <option>Branch A</option>
              <option>Branch B</option>
              <option>Branch C</option>
            </select>
          </div>
          <div className="field !mb-0">
            <label htmlFor="reg-valid">Valid thru</label>
            <input
              id="reg-valid"
              value={validThru}
              onChange={(e) => onValidThru(e.target.value)}
              placeholder="MM/YY"
              autoComplete="off"
            />
          </div>
        </div>
        <div className="field">
          <label htmlFor="reg-discount">Discount policy</label>
          <select
            id="reg-discount"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
          >
            <option value="10">10%</option>
            <option value="15">15%</option>
            <option value="20">20%</option>
          </select>
        </div>
        {error ? <p className="mb-3 text-[12.5px] text-[var(--red)]">{error}</p> : null}
        <button type="submit" className="btn full" disabled={pending}>
          {pending ? "Generating…" : "Generate card"}
        </button>
      </form>

      <div>
        <div className="rounded-2xl bg-[radial-gradient(circle_at_30%_20%,#2b2019,#14100b_72%)] px-3 py-6 sm:px-5 sm:py-8">
          <MemberCard
            name={created?.name || name.toUpperCase()}
            displayId={created?.displayId || "SP-26-000000"}
            validThru={created?.validThru || validThru}
            memberSince={year}
            discount={created?.discount || Number(discount)}
            qrDataUrl={qrDataUrl}
            showToggle
          />
        </div>
        <div className="mt-4">
          {created ? (
            <Link href={`/admin/print/${created.id}`} className="btn secondary full inline-flex justify-center no-underline">
              Print card
            </Link>
          ) : (
            <button type="button" className="btn secondary full" disabled>
              Print card
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
