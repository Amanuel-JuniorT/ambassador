"use client";

import { useEffect, useState } from "react";
import { PasswordField } from "./PasswordField";

type Staff = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

export function StaffManager() {
  const [users, setUsers] = useState<Staff[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("CASHIER");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function load() {
    const res = await fetch("/api/staff");
    if (!res.ok) return;
    const data = (await res.json()) as { users: Staff[] };
    setUsers(data.users);
  }

  useEffect(() => {
    void load();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setPending(true);
    const res = await fetch("/api/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });
    const data = await res.json();
    setPending(false);
    if (!res.ok) {
      setError(data.error || "Could not add this user.");
      return;
    }
    setName("");
    setEmail("");
    setPassword("");
    setRole("CASHIER");
    void load();
  }

  return (
    <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[340px_1fr]">
      <form onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="staff-name">Full name</label>
          <input id="staff-name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="staff-email">Email</label>
          <input
            id="staff-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <PasswordField
          id="staff-password"
          label="Temporary password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          minLength={8}
          required
        />
        <div className="field">
          <label htmlFor="staff-role">Role</label>
          <select id="staff-role" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="CASHIER">Cashier</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        {error ? <p className="mb-3 text-[12.5px] text-[var(--red)]">{error}</p> : null}
        <button type="submit" className="btn full" disabled={pending}>
          {pending ? "Saving…" : "Add staff user"}
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13.5px]">
          <thead>
            <tr>
              {["Name", "Email", "Role"].map((h) => (
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
            {users.map((user) => (
              <tr key={user.id}>
                <td className="border-b border-[var(--line)] px-2.5 py-2.5 font-medium">{user.name}</td>
                <td className="border-b border-[var(--line)] px-2.5 py-2.5 font-mono text-[12.5px] text-muted">
                  {user.email}
                </td>
                <td className="border-b border-[var(--line)] px-2.5 py-2.5 font-mono text-[11px] text-[var(--gold-deep)]">
                  {user.role}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
