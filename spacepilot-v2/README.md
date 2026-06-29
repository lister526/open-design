# SpacePilot — AI Listing Revenue Upgrade OS (V2)

> SpacePilot diagnoses **why an Airbnb / Vrbo / serviced‑apartment listing is under‑earning**, then turns the highest‑ROI room fixes into a **shoppable upgrade kit, an executable quote, a local delivery workflow, a photo‑ready handover, and before/after revenue tracking.**

The wedge is narrow and defensible: **short‑term‑rental revenue‑loss diagnosis + a room‑level ROI upgrade loop.** SpacePilot is *not* a render toy, a generic interior‑design marketplace, or a pricing tool — it is the operating layer that connects *"this listing is leaking revenue"* to *"here is the kit, the quote, the installer, and the proof it worked."*

The commercial loop is unchanged and money‑first:

**Free Listing Revenue Leak Scan → $149 AI Listing Audit → $799–$1,299 Scenario Upgrade Proposal → 10–15% coordination fee on delivered projects.**

This is a fully interactive MVP (front‑end only, browser‑persisted) demonstrating the entire flywheel, a gated founder/admin console, a supplier SKU library, and a launch‑city delivery partner network — with real‑time localization (EN / 中文 / 日本語 / Español / العربية, Arabic RTL) and dark/light mode.

---

## What makes it hard to copy (the moat)

The product is built around **six compounding assets**, surfaced on the landing page under *"Why this becomes hard to copy."*

1. **Listing Performance Passport** — every audit produces a durable, evidence‑weighted record of a unit's revenue leaks, scenario upside and upgrade history. It gets stronger the more it's used.
2. **Room‑level ROI graph** — a growing map of *which fix unlocks which uplift*, informed by completed projects (`confidenceSamples` per edge), not generic design opinion.
3. **SKU Upgrade‑Kit library** — leak categories are bound to concrete, costed, lead‑timed components, so a diagnosis is instantly shoppable.
4. **Supplier Trust Ledger** — verified delivery partners accrue an on‑time / rework / photo‑handover track record that becomes the routing layer for new jobs.
5. **Photo‑ready handover standard** — the unit of delivery isn't "renovation done," it's "listing is re‑photographed and revenue‑ready," which competitors don't own.
6. **Before/after revenue tracking** — closing the loop from upgrade to measured outcome creates proprietary outcome data that feeds back into the ROI graph.

These six objects reference and reinforce each other — copying any one is easy; copying the *loop* is not.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | **Next.js 15** (App Router) + React 19 |
| Language | TypeScript (strict, `@/*` path alias) |
| Styling | Tailwind CSS + shadcn‑style HSL token system, **warm‑editorial** theme (bone / deep ink / muted amber / revenue green), Fraunces display + Inter |
| State | **Zustand v5** + `persist` (localStorage) |
| i18n | JSON dictionaries + Zustand‑backed `useT()` hook — **no URL change**, RTL for Arabic |
| Icons | lucide‑react |

No backend required for the demo — leads, scans, waitlist and partner applications persist in the browser. Every revenue figure is a **scenario‑based estimate**, never a guarantee.

---

## Run it

```bash
cd spacepilot-v2
npm ci          # or: npm install
npm run dev     # http://localhost:3000
```

Production:

```bash
npm run build
npm run start
```

**Acceptance:** `npm ci && npm run build` compiles cleanly with no TypeScript errors; all routes below return 200 with no hydration/console errors; mobile layouts are responsive; all five locales have an identical, complete key set (82 keys each).

---

## Routes

| Route | What it is |
|---|---|
| `/` | **Landing** — diagnostic hero with the embedded **Listing Revenue Leak Scanner**, three live demo case cards (Osaka / Manchester / Dubai), the **"Why this becomes hard to copy"** moat section (6 objects), the 4‑step "how it works" loop, and a city‑launch CTA. |
| `/audit` | **AI Listing Audit** — a 5‑step diagnostic flow (Listing → Unit economics → Room evidence → Constraints → Goal), prefilled from `?case=`, → **$149 paywall** (simulated) → full result: leak score ring, grade badge, **7‑category leak map**, scenario upside & payback, top‑3 fixes, compliance notes. |
| `/proposal/[id]` | **Scenario Upgrade Proposal + Quote** — a missing/unknown id deterministically loads a **demo proposal** (never "not found"). Outcome strip, diagnosis leak map, budget‑band slider (Lean / Standard / Premium) with **live re‑quote**, itemized quote with founder‑only margin columns, delivery timeline, **photo‑ready handover checklist**, before/after scenario table, **deposit checkout**, and **export/copy summary** (shareable). |
| `/console` | **Founder Console** — gated as admin/demo (`?demo=1` or `?admin=1`). Eight money‑first KPIs always visible (free scans, paid audits, proposal conversion, deposit conversion, avg project value, weighted project margin, supplier SLA score, before/after coverage). Detail view adds tabs: overview, **kanban pipeline** (incl. the `scanned` stage), leads, SKU library, partners, and a margin lab. |
| `/partners` | **Launch‑city delivery partner network** — honest value props (no commission until closed, verified local delivery, photo‑ready handover, repeat portfolio work), a **Supplier Trust Ledger** scorecard section, the revenue model, the SKU kit catalog, and an application form. All profiles are clearly labeled **sample / demo** — no fabricated customer claims. |

---

## The domain engine (`src/lib/engine.ts`)

A small, transparent, fully deterministic engine drives the whole product:

- **`computeRevenueLeakScore()`** — the diagnostic spine. Scores **seven leak categories** — *photo pull, amenity gap, design memorability, layout efficiency, durability, turnover speed, compliance risk* — into per‑category severity, monthly revenue drag, an overall 0–100 leak score and a grade (`critical` / `leaking` / `tuning` / `optimized`).
- **`estimateMonthlyUpside()`** — scenario ADR + occupancy uplift by band (lean 6% / standard 11% / premium 18%), scaled by how much leakage exists → monthly/annual upside ranges and payback months.
- **`recommendUpgradeKit()`** — binds the top leaks to concrete **SKU kit items** (cost / retail / lead time / install effort) and sizes the project by band and unit size.
- **`buildListingPerformancePassport()`** — assembles the durable artifact: leak score, scenario, recommended kit, evidence‑completeness confidence, before/after rows, compliance flags and a human summary.
- **`buildQuote(kit, band)`** — margin‑based quote (lean 30% / standard 36% / premium 42%) with a **12% platform coordination fee** line, customer/cost totals, margin %, and a **20% deposit**.
- **`buildScenarioProposal(passport, band, isDemo)`** — wraps the quote with the delivery timeline and the photo‑ready handover checklist.
- **`scoreSupplierFit()`** — derives a **trust score** from on‑time rate, rework rate, photo‑handover score, responsiveness and experience.
- **`hash01()` / `demoLead()`** — deterministic seeds so any `/proposal/[id]` resolves to a stable demo.

---

## Data model (`src/lib/types.ts`)

Key objects: `ScanInput` / `AuditInput`, `RevenueLeakScore` + `LeakItem` (7 categories), `MarketScenario`, `UpgradeKit` + `KitItem`, `ListingPerformancePassport` (+ `BeforeAfterImpact`, `ComplianceRiskFlag`), `Quote` + `QuoteLine` (with `depositUsd`), `ScenarioProposal` (+ `HandoverItem`), `Lead` (carries a full `passport`, status incl. `scanned`), `SupplierTrustLedger`, `Partner`, and the `RoomUpgradeGraphNode` that powers the ROI graph.

---

## Project structure

```
spacepilot-v2/
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx               # root layout, no‑flash theme+RTL script, Fraunces+Inter, metadata
│  │  ├─ page.tsx                 # Landing (SiteShell + Landing)
│  │  ├─ globals.css              # warm‑editorial CSS variable tokens + utilities
│  │  ├─ audit/page.tsx           # <Suspense> wrapper (useSearchParams)
│  │  ├─ proposal/[id]/page.tsx
│  │  ├─ console/page.tsx         # <Suspense> wrapper (useSearchParams)
│  │  └─ partners/page.tsx
│  ├─ components/
│  │  ├─ ui/                      # button, primitives, shared (ScoreRing/GradeBadge/LeakMap/badges)
│  │  ├─ layout/                  # Navbar, Footer, SiteShell, LocaleSwitcher, ThemeToggle, Logo, Providers
│  │  └─ sections/                # Landing, Scanner, Audit, Proposal, Console, Partners
│  ├─ lib/
│  │  ├─ types.ts                 # domain types
│  │  ├─ engine.ts                # leak scoring / upside / kit / passport / quote / proposal / trust
│  │  ├─ options.ts               # form option lists
│  │  ├─ seed.ts                  # seeded leads, suppliers, partners, demo cases, upgrade graph
│  │  └─ cn.ts                    # clsx + tailwind‑merge
│  ├─ store/
│  │  ├─ prefs.ts                 # locale/currency/theme + useT()/useMoney()
│  │  └─ data.ts                  # leads / waitlist / partner apps
│  └─ i18n/
│     ├─ config.ts                # Locale, currencies, dict registry
│     └─ en/zh/ja/es/ar.json      # 82 keys each, identical key set
```

---

## Compliance language

Every revenue figure is framed as a **scenario‑based estimate, subject to local market verification, seasonality and pricing strategy** — never a guarantee. We improve real spaces and listing presentation; we do **not** fabricate amenities, hide defects or fake photos. Wet‑area / serviced‑unit work surfaces plumbing/electrical compliance notes, and non‑reversible changes flag landlord approval. Partner and supplier profiles in the demo are explicitly labeled **sample / demo** — there are no fabricated customer logos or claims of an existing customer base.

---

## Conversion path — test it end to end

1. **`/`** → tune the **Listing Revenue Leak Scanner** → *Run scan* → see leak score, top leaks, scenario upside and the recommended kit → *Start full audit* (or open a demo case card).
2. **`/audit`** → complete the 5 diagnostic steps → *Run diagnosis* → hit the **$149 paywall** → *Unlock* → read the full leak map + scenario result.
3. From the result → *Unlock executable proposal & quote* → **`/proposal/[id]`** (or just open **`/proposal/demo`**).
4. On the proposal → drag the **budget‑band slider** (quote re‑prices live) → review the itemized quote, delivery timeline and **photo‑ready handover checklist** → **Pay deposit** → *Export / copy summary* to share.
5. **`/console?demo=1`** → the lead appears in the **pipeline / leads / overview**, contributing to the eight KPIs; drag it across the kanban; open the **Margin lab**.
6. **`/partners`** → review the **trust scorecards** → submit an application → it appears in **Console → Partners**.

Use **Console → Reset** to restore the seeded demo data at any time.

---

## Localization & currency

- Language switcher lives in the navbar. Switching is **instant and client‑side — the URL never changes**.
- Arabic switches the document to **RTL** automatically (via both an SSR no‑flash script and a client effect).
- All five dictionaries share an **identical, complete 82‑key set** — no missing keys.
- Currency auto‑maps to the selected locale (USD/EUR/GBP/JPY/AED/SGD/CNY) and re‑formats every price via `useMoney()`. Static FX rates for the demo.

---

## Missing production capabilities (next integrations)

This MVP is front‑end only; everything persists in the browser. To take it to production:

| Concern | Drop‑in path |
|---|---|
| **Payments** | Replace the simulated audit paywall + deposit checkout (`Audit.tsx`, `Proposal.tsx`) with Stripe Checkout / Payment Intents; credit the $149 audit toward the proposal server‑side. |
| **Persistence / auth** | Swap the Zustand `persist` stores (`store/data.ts`) for Supabase / Postgres + RLS; gate `/console` behind real auth instead of `?demo=1`; move `engine.ts` behind API routes. |
| **Real AI vision** | Replace the heuristic leak scorer with an LLM + vision pipeline that reads uploaded photos / floor plans / listing URLs and returns the same `RevenueLeakScore` + `ListingPerformancePassport` shapes. |
| **PMS / channel data** | Pull live ADR, occupancy, ratings and seasonality from Airbnb/Vrbo/Guesty/PriceLabs APIs to ground the scenario estimates in real performance rather than self‑reported inputs. |
| **Supplier sourcing** | Back the SKU library + `SUPPLIERS` with real catalog/lead‑time APIs and auto‑match on market + category; make the **Supplier Trust Ledger** update from real job outcomes. |
| **Outcome tracking** | Capture real before/after photos and post‑upgrade revenue to populate the **room‑level ROI graph** with genuine `confidenceSamples`. |
| **Growth** | The shareable proposal already carries a referral; wire it to attribution, a case‑study generator and city‑launch waitlist segments. |

---

## Notes

Front‑end only; all data lives in the browser (`localStorage` keys `spacepilot.prefs` and `spacepilot.data`). Clearing site data resets everything; the Console also has a Reset button.
