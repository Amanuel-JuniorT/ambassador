"use client";

import { useEffect, useRef, useState } from "react";

type Result =
  | {
      status: "VALID";
      name: string;
      tin: string | null;
      displayId: string;
      discount: number;
      branch: string;
      sapCustomerNo: null;
      message: string;
    }
  | {
      status: "BLOCKED";
      name: string;
      tin: string | null;
      displayId: string;
      message: string;
    }
  | { status: "NOT_FOUND" | "INVALID"; message: string };

export function VerifyDesk() {
  const [token, setToken] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [pending, setPending] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraNote, setCameraNote] = useState("");
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5Ref = useRef<{ stop: () => Promise<void> } | null>(null);

  async function verify(raw: string) {
    const value = raw.trim();
    if (!value) return;
    setPending(true);
    const res = await fetch("/api/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: value }),
    });
    const data = (await res.json()) as Result;
    setResult(data);
    setPending(false);
  }

  async function startCamera() {
    setCameraNote("");
    if (cameraOn) {
      await html5Ref.current?.stop().catch(() => undefined);
      html5Ref.current = null;
      setCameraOn(false);
      return;
    }
    if (!scannerRef.current) return;
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode(scannerRef.current.id);
      await scanner.start(
        { facingMode: "environment" },
        { fps: 8, qrbox: { width: 220, height: 220 } },
        (decoded) => {
          setToken(decoded);
          void verify(decoded);
        },
        () => undefined,
      );
      html5Ref.current = scanner;
      setCameraOn(true);
    } catch {
      setCameraNote("Camera is not available. Type the code from the staff desk instead.");
    }
  }

  useEffect(() => {
    return () => {
      void html5Ref.current?.stop().catch(() => undefined);
    };
  }, []);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[340px_1fr]">
      <div>
        <div className="relative aspect-square overflow-hidden rounded-[14px] bg-[var(--walnut-dark)]">
          <div
            id="qr-reader"
            ref={scannerRef}
            className="absolute inset-0 [&_video]:h-full [&_video]:w-full [&_video]:object-cover"
          />
          {!cameraOn ? (
            <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-[13px] text-muted">
              Camera preview
              <br />
              Use the camera, or enter the code from a staff scan
            </div>
          ) : null}
          <div className="pointer-events-none absolute inset-[16%] rounded-[10px] border-2 border-[var(--gold)]" />
        </div>
        <button type="button" className="btn secondary full mt-2.5" onClick={startCamera}>
          {cameraOn ? "Stop camera" : "Use camera"}
        </button>
        {cameraNote ? <p className="mt-2 text-[12.5px] text-[var(--red)]">{cameraNote}</p> : null}
        <div className="mt-3.5 flex gap-2">
          <input
            className="min-w-0 flex-1 rounded-md border border-[var(--line-strong)] bg-[var(--card)] px-3 py-2.5 font-mono text-[14px] text-ink sm:text-[13px]"
            placeholder="Paste scanned URL or token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void verify(token);
            }}
          />
          <button type="button" className="btn" disabled={pending} onClick={() => void verify(token)}>
            Verify
          </button>
        </div>
      </div>

      <div
        className={`flex min-h-[340px] flex-col items-center justify-center rounded-[14px] border px-8 py-8 text-center ${
          result?.status === "VALID"
            ? "border-[rgba(123,199,158,0.35)] bg-[var(--green-fill)]"
            : result?.status === "BLOCKED" || result?.status === "NOT_FOUND"
              ? "border-[rgba(227,143,132,0.35)] bg-[var(--red-fill)]"
              : "border-[var(--line)] bg-[var(--card)] text-muted"
        }`}
      >
        {!result ? (
          <p className="text-[13.5px]">Scan or enter a card to see the verify result</p>
        ) : result.status === "VALID" ? (
          <>
            <div className="mb-4 rounded-full bg-[var(--green)] px-3.5 py-1.5 font-mono text-[13px] tracking-[0.08em] text-[#0f1a14] uppercase">
              Valid
            </div>
            <p className="m-0 font-serif text-[26px] font-semibold">{result.name}</p>
            <p className="mt-1 mb-5 font-mono text-[13px] text-ink-soft">
              {result.tin ? `TIN ${result.tin}` : "No TIN on file"}
            </p>
            <div className="grid w-full max-w-[340px] grid-cols-2 gap-3.5 text-left">
              <div className="rounded-lg bg-black/16 px-3 py-2.5">
                <div className="mb-1 text-[11px] text-muted">Discount</div>
                <div className="font-mono text-[13.5px] font-medium">{result.discount}%</div>
              </div>
              <div className="rounded-lg bg-black/16 px-3 py-2.5">
                <div className="mb-1 text-[11px] text-muted">Branch registered</div>
                <div className="font-mono text-[13.5px] font-medium">{result.branch}</div>
              </div>
              <div className="rounded-lg bg-black/16 px-3 py-2.5">
                <div className="mb-1 text-[11px] text-muted">SAP customer no.</div>
                <div className="font-mono text-[13.5px] font-medium">Not linked yet</div>
              </div>
              <div className="rounded-lg bg-black/16 px-3 py-2.5">
                <div className="mb-1 text-[11px] text-muted">Member id</div>
                <div className="font-mono text-[13.5px] font-medium">{result.displayId}</div>
              </div>
            </div>
            <p className="mt-5 max-w-[320px] text-xs text-ink-soft">{result.message}</p>
          </>
        ) : result.status === "BLOCKED" ? (
          <>
            <div className="mb-4 rounded-full bg-[var(--red)] px-3.5 py-1.5 font-mono text-[13px] tracking-[0.08em] text-[#1f0d0a] uppercase">
              Blocked
            </div>
            <p className="m-0 font-serif text-[26px] font-semibold">{result.name}</p>
            <p className="mt-1 font-mono text-[13px] text-ink-soft">
              {result.tin ? `TIN ${result.tin}` : "No TIN on file"}
            </p>
            <p className="mt-5 max-w-[320px] text-xs text-ink-soft">{result.message}</p>
          </>
        ) : (
          <>
            <div className="mb-4 rounded-full bg-[var(--red)] px-3.5 py-1.5 font-mono text-[13px] tracking-[0.08em] text-[#1f0d0a] uppercase">
              Not found
            </div>
            <p className="m-0 font-serif text-[22px] font-semibold">No card matches</p>
            <p className="mt-3 max-w-[320px] text-xs text-ink-soft">{result.message}</p>
          </>
        )}
      </div>
    </div>
  );
}
