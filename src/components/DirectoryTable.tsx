"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Customer = {
  id: string;
  displayId: string;
  name: string;
  tin: string | null;
  branch: string;
  discount: number;
  validThru: string | null;
  status: string;
};

export function DirectoryTable() {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<Customer[]>([]);
  const [error, setError] = useState("");

  async function load(search = q) {
    const res = await fetch(`/api/customers?q=${encodeURIComponent(search)}`);
    if (!res.ok) {
      setError("Could not load the directory.");
      return;
    }
    const data = (await res.json()) as { customers: Customer[] };
    setRows(data.customers);
  }

  useEffect(() => {
    void load("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function toggle(row: Customer) {
    const status = row.status === "ACTIVE" ? "BLOCKED" : "ACTIVE";
    const res = await fetch("/api/customers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: row.id, status }),
    });
    if (res.ok) void load();
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <input
          className="w-full max-w-[280px] rounded-md border border-[var(--line-strong)] bg-[var(--card)] px-3 py-2.5 text-[14px]"
          placeholder="Search name, TIN or member id"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            void load(e.target.value);
          }}
        />
      </div>
      {error ? <p className="text-[12.5px] text-[var(--red)]">{error}</p> : null}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13.5px]">
          <thead>
            <tr>
              {["Name", "TIN", "Member id", "Branch", "Rate", "Status", ""].map((h) => (
                <th
                  key={h}
                  className="border-b border-[var(--line-strong)] px-2.5 py-2 text-left text-[11px] font-medium tracking-[0.05em] text-muted uppercase"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-[rgba(228,196,129,0.04)]">
                <td className="border-b border-[var(--line)] px-2.5 py-2.5 font-medium">{row.name}</td>
                <td className="border-b border-[var(--line)] px-2.5 py-2.5 font-mono text-[12.5px] text-muted">
                  {row.tin || "—"}
                </td>
                <td className="border-b border-[var(--line)] px-2.5 py-2.5 font-mono text-xs text-[var(--gold-deep)]">
                  {row.displayId}
                </td>
                <td className="border-b border-[var(--line)] px-2.5 py-2.5">{row.branch}</td>
                <td className="border-b border-[var(--line)] px-2.5 py-2.5">{row.discount}%</td>
                <td className="border-b border-[var(--line)] px-2.5 py-2.5">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 font-mono text-[11px] ${
                      row.status === "ACTIVE"
                        ? "bg-[var(--green-fill)] text-[var(--green)]"
                        : "bg-[var(--red-fill)] text-[var(--red)]"
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="border-b border-[var(--line)] px-2.5 py-2.5 whitespace-nowrap">
                  <Link href={`/admin/print/${row.id}`} className="mr-3 text-xs text-ink-soft underline">
                    Print
                  </Link>
                  <button
                    type="button"
                    className="border-0 bg-transparent p-0 text-xs text-ink-soft underline"
                    onClick={() => void toggle(row)}
                  >
                    {row.status === "ACTIVE" ? "Block" : "Unblock"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 ? (
          <p className="py-10 text-center text-[13.5px] text-muted">No matching customers.</p>
        ) : null}
      </div>
    </div>
  );
}
