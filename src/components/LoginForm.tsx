"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { PasswordField } from "./PasswordField";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setPending(true);
    const { error: signError } = await authClient.signIn.email({
      email: email.trim(),
      password,
    });
    setPending(false);
    if (signError) {
      setError("Those credentials were not accepted.");
      return;
    }
    const next = searchParams.get("next") || "/verify";
    router.replace(next);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-[400px]">
      <div className="field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <PasswordField
        id="password"
        label="Password"
        value={password}
        onChange={setPassword}
        autoComplete="current-password"
        required
      />
      {error ? <p className="mb-3 text-[12.5px] text-[var(--red)]">{error}</p> : null}
      <button type="submit" className="btn full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
