import { randomBytes } from "crypto";
import { auth } from "./auth";
import { prisma } from "./prisma";

export async function createStaffUser(input: {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "CASHIER";
}) {
  const ctx = await auth.$context;
  const hashed = await ctx.password.hash(input.password);
  const id = randomBytes(16).toString("hex");
  const now = new Date();

  const user = await prisma.user.create({
    data: {
      id,
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      emailVerified: true,
      role: input.role,
      createdAt: now,
      updatedAt: now,
    },
  });

  await prisma.account.create({
    data: {
      id: randomBytes(16).toString("hex"),
      accountId: user.id,
      providerId: "credential",
      issuer: "local:credential",
      userId: user.id,
      password: hashed,
      createdAt: now,
      updatedAt: now,
    },
  });

  return user;
}

export function newCardToken() {
  return randomBytes(24).toString("hex");
}

export function newDisplayId() {
  const yy = String(new Date().getFullYear()).slice(-2);
  const n = String(Math.floor(100000 + Math.random() * 900000));
  return `SP-${yy}-${n}`;
}

export function publicCardUrl(token: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/c/${token}`;
}

export function extractCardToken(raw: string) {
  const text = raw.trim();
  try {
    const url = new URL(text);
    const match = url.pathname.match(/\/c\/([^/]+)/);
    if (match?.[1]) return match[1];
  } catch {
    // not a URL — treat as opaque token
  }
  return text;
}
