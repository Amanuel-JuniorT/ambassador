# Current status — Special customer cards

**Date:** 26 August 2026  
**Phase:** Phase 1 (pilot) — live on Vercel against Neon Postgres  
**Production URL:** https://ambassador-virid-chi.vercel.app  
**Repo:** https://github.com/Amanuel-JuniorT/ambassador

Related: [special-customer-integration-brief.md](./special-customer-integration-brief.md) (field architecture and site-visit checklist).

---

## What this product is

Identity + discount-eligibility layer for Ambassador special customers. It is **not** a second POS.

| Owns | Does not own |
|------|----------------|
| Register specials, print QR cards, verify, block | Prices, payment, invoices |
| Staff login (admin / cashier) | SAP / CNET till UI |
| Opaque card tokens + directory | Applying the % on the sale |

After a green verify, the cashier still chooses **Special** (like Staff) in SAP/CNET and finishes the ticket there.

---

## What is built and working

### Auth and roles

- Better Auth (email/password), public sign-up disabled
- **Admin** — directory, register, print, staff users, block/unblock, verify
- **Cashier** — verify only
- Seed: clears DB then creates **one admin** from `SEED_ADMIN_*` env vars
- Cashiers are added in the Staff UI after login

### Special customers

- Register: name, optional TIN, branch, valid-thru, discount policy
- Printable front/back card (Ambassador mark, no “HOTEL” wordmark)
- Mobile: Front / Back toggle; desktop: both faces
- Directory: search, block / unblock, print

### QR privacy

- QR encodes only `https://…/c/<opaque-token>`
- Public `/c/[token]` page: branded message, **no** name, TIN, rate, or validity
- Verify API requires signed-in staff; camera or paste URL/token

### Ops / platform

| Piece | Choice |
|-------|--------|
| App | Next.js 16 (App Router) in repo root |
| DB | PostgreSQL on Neon (Prisma) |
| Hosting | Vercel |
| Auth URLs | `BETTER_AUTH_URL` + `NEXT_PUBLIC_APP_URL` must be the Vercel origin (or Vercel’s `VERCEL_URL` is trusted in code) |

Local SQLite was abandoned — not suitable for Vercel.

---

## Explicitly not done (later phases)

Matches the brief’s phasing:

| Phase | Status |
|-------|--------|
| **1** Our DB + scan + SAP category “Special” like Staff | **Done (this app)** |
| **2** Real SAP customer number on card; QR → SAP id; discount from SAP conditions; no SQL into SAP | Not started |
| **3** Optional JSP hook on `localhost:9000` so one window | Not started |

Also not done: SAP OData/RFC/middleware, CNET buyer-type sync, audit reports beyond verify scan log table, offline/air-gapped shops.

---

## How to run

### Local

```bash
npm install
npx prisma generate
npm run db:setup    # migrate + seed (seed wipes data)
npm run dev
```

See `.env.example` for `DATABASE_URL`, `DIRECT_URL`, auth, and `SEED_ADMIN_*`.

### Seed again (destructive)

```bash
npm run db:seed
```

Wipes users, sessions, specials, then creates the admin. Do **not** wire this into the Vercel build.

### Vercel

- Root directory: `./` (app is the repo root)
- Leave default build (`npm run build` already runs `prisma migrate deploy`)
- Env: Neon URLs, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL` (Config, not Secret)
- Seed once from a machine pointed at the same Neon DB after first deploy

---

## Known pitfalls (already hit)

1. **Invalid origin on production** — login failed until production URL was set on `BETTER_AUTH_URL` / `NEXT_PUBLIC_APP_URL` (and code trusts `VERCEL_URL`).
2. **Redirect loop** — stale session cookie + proxy treating “cookie present” as logged in. Proxy no longer bounces `/login` → `/verify` on cookie alone.
3. **`NEXT_PUBLIC_*` as Vercel Secret** — use **Config**; public prefix is intentional for the app URL.
4. **Seed on every deploy** — must not; seed clears the database.

---

## Credential model

| Who | How |
|-----|-----|
| First admin | `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` via `npm run db:seed` |
| More admins / cashiers | Admin → Staff screen |
| Special customers | Not login accounts — card holders only |

Change seed password before treating the system as production-hard.

---

## Suggested next work

1. Confirm SOP on site: green verify → SAP **Special** (copy Staff).
2. Site visit using the field brief (where Staff lives; sale of record).
3. Phase 2 design: SAP customer group + QR maps to SAP number (API/middleware, not DB SQL).
4. Harden production: rotate secrets, restrict who can seed, optional verify audit UI.

---

*End of status note.*
