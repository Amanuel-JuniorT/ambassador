"use client";

import { useState } from "react";

type Props = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
};

function EyeIcon({ off }: { off?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.6" />
      {off ? (
        <path d="M4 20 20 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      ) : null}
    </svg>
  );
}

export function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  required,
  minLength,
}: Props) {
  const [show, setShow] = useState(false);

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          minLength={minLength}
          className="pr-11"
        />
        <button
          type="button"
          className="absolute top-1/2 right-2 -translate-y-1/2 border-0 bg-transparent p-1.5 text-muted hover:text-[var(--gold-bright)]"
          aria-label={show ? "Hide password" : "Show password"}
          onClick={() => setShow((v) => !v)}
        >
          <EyeIcon off={show} />
        </button>
      </div>
    </div>
  );
}
