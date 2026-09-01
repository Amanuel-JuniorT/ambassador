"use client";

import { useState } from "react";
import { BrandMark } from "./BrandMark";

type Props = {
  name: string;
  displayId: string;
  validThru?: string | null;
  memberSince?: string;
  discount?: number;
  qrDataUrl?: string | null;
  showToggle?: boolean;
};

function tierName(discount?: number) {
  if (!discount) return "MEMBER";
  if (discount >= 20) return `HERITAGE · ${discount}%`;
  if (discount >= 15) return `SILVER · ${discount}%`;
  return `MEMBER · ${discount}%`;
}

function FrontFace({
  name,
  displayId,
  validThru,
  memberSince,
  discount,
}: Omit<Props, "qrDataUrl" | "showToggle">) {
  return (
    <article className="id-card">
      <div className="rail" />
      <div className="absolute top-4 right-4 left-7 flex items-start justify-between gap-3">
        <BrandMark className="h-11 w-auto print:h-8 sm:h-12" />
        <span className="pt-1 font-mono text-[9px] tracking-[0.12em] text-[#b7a480]">
          EST. 2008
        </span>
      </div>
      <div className="absolute top-[48%] right-4 left-7 -translate-y-1/2">
        <p className="print-tier m-0 font-mono text-[10px] tracking-[0.18em] text-[var(--gold-bright)] uppercase">
          {tierName(discount)}
        </p>
        <p className="print-name mt-2 mb-0 font-serif text-[22px] leading-tight font-semibold break-words text-[var(--gold-bright)] sm:text-[24px]">
          {name || "Full name"}
        </p>
      </div>
      <div className="absolute right-4 bottom-3.5 left-7 flex items-end justify-between gap-3">
        <div>
          <p className="m-0 text-[8px] tracking-[0.08em] text-[#9c8a69] uppercase">
            Member since {memberSince || "—"}
          </p>
          <p className="m-0 mt-1 text-[8px] tracking-[0.08em] text-[#9c8a69] uppercase">
            Valid thru {validThru || "—"}
          </p>
        </div>
        <p className="m-0 font-mono text-[12px] tracking-[0.04em] text-[var(--gold-bright)]">
          {displayId || "SP-26-000000"}
        </p>
      </div>
    </article>
  );
}

function BackFace({ qrDataUrl }: { qrDataUrl?: string | null }) {
  return (
    <article className="id-card flex">
      <div
        className="h-full w-11 shrink-0 sm:w-12"
        style={{
          backgroundColor: "rgba(0,0,0,0.12)",
          backgroundImage:
            "repeating-linear-gradient(45deg, transparent 0 6px, rgba(228,196,129,0.45) 6px 7px), repeating-linear-gradient(-45deg, transparent 0 6px, rgba(228,196,129,0.45) 6px 7px)",
        }}
      />
      <div className="relative flex-1 px-5 py-4">
        <p className="m-0 font-serif text-sm text-[var(--gold-bright)]">Ambassador</p>
        <p className="mt-1 max-w-[11rem] text-[10px] leading-relaxed text-[#9c8a69]">
          Present this card at checkout. Eligibility is confirmed by staff only.
        </p>
        <div className="absolute top-1/2 right-5 -translate-y-1/2">
          <div className="h-[72px] w-[72px] rounded-md border border-[rgba(228,196,129,0.3)] bg-white p-1.5">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Card verification code" className="block h-full w-full" />
            ) : (
              <div className="h-full w-full bg-[rgba(33,23,17,0.06)]" />
            )}
          </div>
        </div>
        <p className="absolute bottom-3.5 left-5 m-0 font-mono text-[8px] tracking-[0.08em] text-[#8c7a5c] uppercase">
          Scan at staff desk
        </p>
      </div>
    </article>
  );
}

export function MemberCard(props: Props) {
  const [face, setFace] = useState<"front" | "back">("front");
  const showToggle = props.showToggle ?? false;

  return (
    <div className="w-full">
      {showToggle ? (
        <div className="mb-3 flex justify-center gap-1 md:hidden">
          {(["front", "back"] as const).map((value) => (
            <button
              key={value}
              type="button"
              className={`min-w-[88px] rounded-full border px-3 py-1.5 font-mono text-[11px] tracking-[0.08em] uppercase ${
                face === value
                  ? "border-[var(--gold-deep)] bg-[var(--gold-fill)] text-[var(--gold-bright)]"
                  : "border-[var(--line-strong)] bg-transparent text-muted"
              }`}
              onClick={() => setFace(value)}
            >
              {value}
            </button>
          ))}
        </div>
      ) : null}

      <div className="flex flex-col items-center gap-4 md:flex-row md:justify-center md:gap-4">
        <div className={`w-full max-w-[420px] ${showToggle && face !== "front" ? "max-md:hidden" : ""}`}>
          <FrontFace {...props} />
        </div>
        <div className={`w-full max-w-[420px] ${showToggle && face !== "back" ? "max-md:hidden" : ""}`}>
          <BackFace qrDataUrl={props.qrDataUrl} />
        </div>
      </div>
    </div>
  );
}
