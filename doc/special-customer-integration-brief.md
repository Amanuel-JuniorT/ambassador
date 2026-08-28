# Special Customer QR Integration — Field Brief

**Purpose:** Take this file on site (ChatGPT / Claude / notes). It is the full idea, architecture, and investigation checklist for integrating a special-customer QR card with an existing SAP + CNET checkout.

**Context:** Ethiopia-style retail (ETB, TIN). Company already runs SAP and CNET together. You were asked to add: register special customers, print QR cards, verify at checkout.

**Rule:** Observe and ask with permission. Do not dump databases, steal credentials, or bypass login.

---

## 1. One-paragraph summary

This is **not** a second cash register. It is a **customer-identity + discount-eligibility** layer. Cashiers already pick buyer types (e.g. staff vs normal). Staff discount is real, but **who** the staff member is is often **outside the system** (they know each other or call a manager). Normal customers may get **name + TIN** on the ticket if they ask. The new system adds a **Special** category: people get a printed QR card; an employee scans it on **our website** (no dedicated scanner hardware); the site checks a database; then the cashier finishes the sale in the **existing SAP terminal** (and CNET as they do today). SAP/CNET stay the system of money, invoice, and branches. Our app owns **card lifecycle** (register, print, verify, block). Shared data should mean **one customer identity**, not two masters.

---

## 2. What you already observed

1. **SAP checkout** appears to be served on **`localhost:9000`** and uses **JSP** (Java web till / terminal).
2. **Auth** on that localhost app — cashiers log in; the till is not an open page.
3. Every morning they open **both CNET and SAP**. SAP then opens a **terminal** (likely the 9000 JSP app).
4. **Buyer categories** exist (staff, and others).
5. **Staff:** discount yes; **no recorded identity** of which staff member (informal confirmation).
6. **Normal customer:** depending on request, **name and TIN** are saved (often on the sale, not always a full customer master).
7. Branches are already **linked** through the existing stack — a new system should ride that, not invent a per-shop database.

---

## 3. What the new system is for

| # | Intent |
|---|--------|
| 1 | Register a **special customer** |
| 2 | Issue a **QR** with their id, print as a **card**, give it to them |
| 3 | **Verify** at sale time using the card |

What you want:

1. A **category** for special customers **with discount** (like staff, but identifiable).
2. **Common data** with the existing system (one reads, one writes, or SAP is master).
3. **All branches** see the same specials, same as today’s SAP/CNET link.

What it is **not:** a new POS, a new price engine for all products, or a second invoice system.

---

## 4. How their morning actually works (mental model)

Treat three pieces even if it feels like one system:

| Piece | Role today | Do not replace |
|--------------------|----------------|
| **Checkout UI** (`localhost:9000`, JSP, login) | Cashier sells, category, maybe TIN, pay, receipt | Screen, cart, payment |
| **SAP** | Master data, pricing, invoices, branch sync | Customer master, discount conditions, postings |
| **CNET** | Often ops / POS / local books — they open it every day | Whatever CNET already owns (stock, cash, etc.) |

**Critical question on site:** *Where is the sale of record — SAP terminal, CNET, or both?* Copy Staff in **that** place.

Your website is a **third window**. It will **not** log into SAP and will **not** apply the discount by itself unless they later let you change the JSP. After a green verify, a human still completes the ticket in SAP (and CNET if needed).

---

## 5. Mapping old process → new process

| Today | Tomorrow |
|--------|----------|
| Staff discount, no recorded “who” | Keep staff as-is unless they want staff badges too. Do not mix staff and special on one card type unless they ask. |
| Walk-in: optional name + TIN | Unchanged |
| Special: does not exist | New category; **card required**; name + TIN **required** at registration |
| Informal phone / “I know them” | Scan = confirm; ideally log cashier, time, ticket |
| No USB QR scanner | Scan on **our website** (phone camera or PC camera), not inside SAP at first |

Discount **percentage** should live in **policy** (e.g. 15% / 20% by tier or same as a SAP condition), not hardcoded only on the plastic. Token stays; rate is looked up so HQ can change rates without reprinting every card.

**Minimum shared fields** (same meaning in both worlds):

- Canonical id (SAP customer number **or** yours — pick one owner)
- Name, TIN
- Category: `STAFF` | `WALK_IN` | `SPECIAL` (plus whatever they already have)
- Discount policy (rate **or** SAP condition key)
- Card token (not the person’s name in the QR if you can avoid it)
- Status: `ACTIVE` / `BLOCKED` / `EXPIRED`
- Branch of registration (info); **eligibility company-wide** unless they say otherwise

---

## 6. Architecture (target)

```
[HQ or any authorized branch]  Register special customer  →  print QR card
                            │
                            ▼
                 Special-customer identity
                 (id, name, TIN, category, discount, token, status)
                            │
         ┌──────────────────┼──────────────────┐
         ▼                  ▼                  ▼
      Branch A           Branch B           Branch C
      SAP terminal       SAP terminal       SAP terminal
      + CNET as today    + CNET as today    + CNET as today
         │                  │                  │
         └──── employee scans QR on OUR SITE ──┘
                            │
                            ▼
              Verify in DB / SAP API
              Show: Valid, name, TIN, SAP customer number
                            │
                            ▼
         Cashier in SAP: choose Special and/or enter customer number
         Discount and invoice stay in SAP/CNET
```

**Two hooks:**

1. **Scanner (now):** our website — camera scan → verify API → big on-screen result.
2. **Till (later, if they allow JSP change):** optional field on `localhost:9000` calling the same verify API so they don’t use two windows.

Do **not** install a separate special-customer server per shop. One backend / one URL for all branches. SAP already replicates customers if they are real SAP customers.

---

## 7. Data ownership — the real design choice

### Option A — SAP (or CNET customer master) is master — **target**

- Register in SAP: new **account group / customer group** = Special.
- Discount as **condition / price list / group discount** (copy Staff’s mechanism).
- Our app: generate token, print card, store `QR token ↔ SAP customer number`.
- Checkout: employee sees SAP number on our site → types it in SAP (or picks customer).
- Branches work because SAP already shares customers.

**Do not** have the website **SQL-read the SAP database**. Fragile, often against policy/license. Use: OData, RFC/BAPI, a middleware they already use between CNET and SAP, or a small export they give you.

### Option B — Our DB is master — **pilot / week one**

- We own register + QR + verify.
- After green scan, cashier in SAP only picks **Special** (like Staff — **no who** on the ticket).
- Optional: show TIN on our screen; cashier copies onto the invoice the same way as walk-in TIN.
- Risk: two truths. Use as a **bridge**, then migrate to A.

### Option C — Both write the same full customer list — **avoid**

Duplicate TINs, blocked cards still discounting, branch fights.

### What the developer chose between two ideas

| Idea | Verdict |
|------|---------|
| New DB, seed, scan on our app, then in SAP pick Special like staff (no extra info) | **OK for phase 1.** Fast. Weak audit. |
| Seed customers in SAP DB, website **reads SAP DB**, then pick category **and** user | **Right business outcome, wrong tech.** SAP as master yes; **direct SAP DB no.** |
| **Better:** SAP customers + group Special; our site only maps QR → SAP number; cashier enters that number | **Target.** |

**Sequence:** Phase 1 = B (our DB + scan + SAP category). Phase 2 = A (real SAP customer id on the card). Phase 3 = optional JSP hook on port 9000.

---

## 8. Scan without a hardware scanner

No USB scanner required.

- Page with camera (`getUserMedia`) and fallback: type the code / upload photo.
- Check **our** table (phase 1) or an **API** SAP/middleware exposes (phase 2).
- Show **large** result: Valid / Blocked, name, TIN, **SAP customer number**.
- Static seed is OK for demo. Production must not stay a static site: block cards, add people at HQ, all shops same yes/no.

Because SAP is another process with its own login, **auto-selecting the customer inside SAP from the website is hard**. Don’t block the project on that. **Copy-paste customer number** is enough; they already type TIN/customer today.

Do **not** apply the money discount on our website. SAP/CNET must remain price and invoice.

---

## 9. How hard is adding a “Special” category on their system?

It depends **where Staff already lives**.

| What it really is | Effort | Result |
|-------------------|--------|--------|
| Dropdown on JSP till only | Small **if** they let someone change that JSP | Cashiers can pick Special. Discount may still be **manual**, like staff. |
| Customer group / account group in SAP + pricing condition | Medium — their SAP consultant / key user, transport to branches | Discount and reports work everywhere if Staff already works that way. |
| Same flag again in **CNET** | Extra if CNET also has buyer type | If only one side knows Special, tickets won’t match. |
| Full customer master per special person | Harder than a category | Category **plus** who it was. |

**If Staff is already a group + condition:** adding Special is often **copy Staff** (1–3 days for someone who knows their SAP), not a new module.

**If nobody will touch SAP/CNET customizing:** you cannot add the category. You only add the website. Cashiers misuse Staff or a wrong type. Easy for you, incomplete for the company.

**Blockers:** no access to customizing or JSP; pricing without a condition (cashiers still type %); sale actually happens in CNET not SAP; Staff is a local hack on one PC not company-wide.

**Rule of thumb:** Copy Staff in the **same** system where Staff already works. Ask: *When they choose Staff, is that on the SAP terminal, in CNET, or both?*

---

## 10. Can you find the code because they “open SAP”?

**Usually no full source.** The till PC runs a **built** app. Source is with the partner / HQ / Git.

| What you see | What it is | Source on that PC? |
|--------------|------------|---------------------|
| SAP GUI / Fiori | Real SAP | **No** — customizing is in SAP |
| Browser/Java on **localhost:9000** | Local web POS (JSP / Commerce-like) | **Maybe** install folder, `.war`, logs — rarely `.java` |
| CNET | Separate install | **Maybe** folder; often vendor binary |

The **terminal** is the interesting local app. **SAP ERP is not the JSP.**

If they **allow** you on the PC (authorized integrator):

- Task Manager: `java.exe`, browser, `saplogon` when terminal opens
- Browser: full URL `http://localhost:9000/...`
- Ask IT for folders: `C:\hybris`, `C:\SAP`, Tomcat `webapps`, store POS folder
- `.war` = compiled — page names, not full business rules
- View-source / DevTools Network: form fields, `/api/...` — **integration surface**

**Ask:** “Where is the POS/terminal project (Git, WAR, who maintains JSP)?” That is how you get code legally.

Do **not** reverse-engineer, dump DB, or bypass auth.

---

## 11. Site visit — who to sit with

30–60 minutes each, with permission:

- **Cashier:** real sale, Staff vs normal, TIN
- **Store IT / whoever starts CNET + SAP** in the morning
- **SAP key user** who can open customer master and pricing (not only the till)

Bring: notebook, phone for **photos of screens they allow**, this brief.

---

## 12. Site visit — cashier PC startup (write this down)

1. What they click first: CNET or SAP?
2. Does SAP GUI open **and then** a browser/Java terminal?
3. Login: SAP user? POS user? both?
4. **Exact URL** after login: `localhost:9000` + full path
5. Does CNET stay open during the sale or only at open/close?
6. Session timeout? Works if internet is down?

---

## 13. Site visit — CNET (watch, don’t hack)

- Is there customer / buyer type (staff, etc.)?
- Does a CNET sale **create** a SAP document or the reverse?
- Which screen is the **ticket they give the customer**?
- Must CNET also get a Special type or only SAP?

---

## 14. Site visit — SAP GUI (key user, if allowed)

Ask them to **show Staff**, not theory:

- Is Staff a **customer group**, **one dummy customer**, or **no customer** (till flag only)?
- Pricing: **condition** for that group vs cashier typing %?
- Open a completed Staff invoice: customer field, TIN, discount lines
- Same groups in another branch?
- Who is allowed to add a customer group / till dropdown: store, HQ, partner?
- May specials become **real SAP customers** with numbers?

---

## 15. Site visit — the terminal SAP opens (`localhost:9000`)

Sit through **one normal** and **one Staff** sale.

**Login:** same as SAP GUI or POS-only?

**Pages:** cart → customer → pay → print. Note every URL path (`/login`, `/pos`, `/checkout`, `?site=`).

**Customer / category (most important):**

- Exact label of the dropdown
- All values in the list
- Staff: extra fields? (often **none** → category-only)
- Normal: **when** name + TIN appear (always vs invoice request)
- Search by name, phone, TIN, **customer number**? If a number field exists, QR can later print that number

**Discount:** automatic on Staff vs typed % vs manager PIN? Line item vs total only?

**DevTools (F12) only if they allow you as integrator — look, don’t attack:**

- Network when changing category or saving customer
- Payload codes (`STAFF`, `Z001`, …) — **reuse these for Special**
- Any scanner field in HTML? (probably none)

**Printer:** fiscal, A4, QR already on receipt? Second screen?

**What “good” looks like:**

- Staff = one dropdown + discount → Special is **clone that value** in the **same list** (their team).
- Name/TIN on a small form → Special can use that form + our scan site.
- **Customer number** field → best path: scan → show number → type it there.

---

## 16. Questions that settle the design (ask these)

1. When they pick Staff, is that **only** on `localhost:9000`, **only** CNET, or **both**?
2. After the sale, where do you see it: SAP invoice, CNET, both?
3. Walk-in TIN: **invoice text** or a **customer record**?
4. Who can add a category on the till?
5. Can we create real SAP customers for specials?
6. Is discount a **customer group condition** or **manual %**?
7. Must specials appear on **fiscal invoices with TIN**? (Usually yes.)
8. One website URL for all branches, or air-gapped shops?

---

## 17. What you will probably not get on day one

- Hybris / Commerce Java source
- Permission to change the JSP
- Direct SAP database access

Normal. The visit must answer: **Staff lives on the terminal, in SAP master, in CNET, or all three** — and **which screen is the sale of record**.

---

## 18. Local simulation project (for developers)

Repo: `Sap-Simulation` — **stand-in** for the JSP till + one verify webhook. It is **not** real SAP.

- Port **9000**, JSP checkout, `GET /api/verify-card?token=`
- Seeded tokens e.g. `TOKEN_ABDI_123` (15%), `TOKEN_CHALTU_456` (20%)
- Base amount 1000 ETB in the demo page
- Production: replace hardcoded list with DB or SAP API; add TIN, status, SAP customer id, categories

---

## 19. Recommended phases (say this to stakeholders)

**Phase 1 — Pilot:** Our website + seeded/own DB + camera scan. SOP: website green → in SAP choose **Special** (like Staff). Show name/TIN on our screen for optional copy.

**Phase 2 — Shared identity:** Each special is an SAP customer in group Special. QR maps to SAP number. Cashier enters that number. Discount from SAP. Our site does not read SAP SQL.

**Phase 3 — Optional:** If they allow changing the JSP, scan or paste token on `localhost:9000` so one window.

**Do not:** two full masters; website applying the discount; scanner-only-inside-SAP before you have access to JSP.

---

## 20. Prompt you can paste into ChatGPT / Claude on site

You can paste this (and sections 1–19) as system/context:

```
You are helping me on-site at a retailer that uses SAP and CNET together.
Cashiers open both apps each morning. SAP opens a logged-in terminal, often a JSP app on localhost:9000.
Existing buyer types include staff (discount, often no recorded identity) and walk-in (optional name + TIN).
I am designing a special-customer QR card: register, print card, verify on OUR website (phone/PC camera, no USB scanner), then cashier finishes in SAP/CNET.
I must not bypass auth, dump databases, or steal code. I may observe UI, URLs, field names, and ask staff.
Help me: interpret what I see, decide if Special should copy Staff, whether SAP or our DB should be master, and what to ask next.
SAP as master + QR mapped to SAP customer number is the target. Our DB + “pick Special like staff” is only phase 1. Do not recommend reading the SAP database directly from our website.
```

---

## 21. After the visit — fill this in

```
Date / branch:
Startup order (CNET vs SAP):
Terminal URL:
Staff is chosen on: [ ] SAP till  [ ] CNET  [ ] both
Staff identity on ticket: [ ] none  [ ] dummy customer  [ ] real user
Discount: [ ] auto group  [ ] manual %  [ ] manager PIN
Walk-in TIN stored as: [ ] invoice text  [ ] customer master
Customer number field on till: [ ] yes  [ ] no
Sale of record: [ ] SAP  [ ] CNET  [ ] both
Who can add category:
OK to create SAP customers for specials: [ ] yes  [ ] no  [ ] later
JSP / WAR location (if they showed):
API/network calls seen (category codes):
Notes:
```

---

*End of brief. Use the `.md` with ChatGPT/Claude; use the PDF for reading offline.*
