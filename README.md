# Ambassador special customer cards

Phase 1 desk: register special customers, print QR cards, and verify at checkout. SAP and CNET remain the systems of money and invoice.

The app lives in this folder (`ambassador/`).

## Database

**PostgreSQL** via Prisma. SQLite will not work on Vercel (no persistent disk). Use [Neon](https://neon.tech) (free, Vercel integration).

You need two URLs from Neon:

- **DATABASE_URL** — pooled (Prisma queries)
- **DIRECT_URL** — direct / unpooled (migrations)

On a free Neon project, if you only have one connection string, paste it in both.

## Run locally

1. Create a Neon project and copy the connection strings.
2. Put them in `.env` (see `.env.example`).
3. Then:

```bash
cd ambassador
npm install
npx prisma generate
npm run db:setup
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Seed creates **one admin** from `.env` (`SEED_ADMIN_*`). It **wipes** users, sessions, and special customers first:

```bash
npm run db:seed
```

Default (change in `.env`):

| Role  | Email               | Password              |
|-------|---------------------|-----------------------|
| Admin | admin@ambassador.et | Ambassador.Admin.2026 |

Cashiers are created later in the Staff screen.

## Deploy on Vercel

1. Push the repo. In Vercel, set **Root Directory** to `ambassador`.
2. Add the Neon integration, or paste env vars:

| Name | Value |
|------|--------|
| `DATABASE_URL` | Neon pooled URL |
| `DIRECT_URL` | Neon direct URL |
| `BETTER_AUTH_SECRET` | Long random string (32+ chars) |
| `BETTER_AUTH_URL` | `https://your-app.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |

3. Build already runs `prisma migrate deploy`. After the first successful deploy, seed **once** from your machine (this **clears** the DB then creates the admin from `SEED_ADMIN_*`):

```bash
cd ambassador
npx prisma db seed
```

Use production `DATABASE_URL` / `DIRECT_URL` and the admin env vars when you do that. Do not re-run seed on a live DB with real data.

Do not commit `.env`. Change `SEED_ADMIN_PASSWORD` before production.

## Roles

- **Admin** — staff users, register specials, print cards, directory, block/unblock, verify
- **Cashier** — verify only

## QR privacy

The printed code is an opaque URL (`/c/<random>`). A normal camera opens a branded page with **no name, TIN, discount, or validity**. Only signed-in staff can look the token up.
