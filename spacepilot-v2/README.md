# SpacePilot — AI Space Transaction OS (V2)

> The operating system that turns a room refresh into a **paid, profitable project in under 15 minutes** — for short‑term rental landlords, operators, and the designers/contractors who deliver the work.

SpacePilot V2 is a top‑tier PropTech product built as a money‑closing loop:

**$149 AI Room Audit → $799–$1,299 Smart Proposal → 10–15% Coordination Fee on delivery.**

This is a fully interactive MVP (front‑end only, browser‑persisted) demonstrating the entire commercial flywheel, an admin/founder console, a supplier catalog, and a partner program — with real‑time localization (EN / 中文 / 日本語 / Español / العربية) and dark/light mode.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | **Next.js 15** (App Router) + React 19 |
| Language | TypeScript (strict, `@/*` path alias) |
| Styling | Tailwind CSS + shadcn‑style HSL token system (dark/light via `.dark` class) |
| State | **Zustand v5** + `persist` (localStorage) |
| i18n | JSON dictionaries + Zustand‑backed `useT()` hook — **no URL change**, RTL support for Arabic |
| Icons | lucide‑react |

No backend required for the demo — leads, waitlist and partner applications persist in the browser.

---

## Run it

```bash
cd spacepilot-v2
npm install
npm run dev      # http://localhost:3000
```

Production:

```bash
npm run build
npm run start
```

---

## Routes

| Route | What it is |
|---|---|
| `/` | **Landing** — hero with embedded ROI calculator, pain points, before/after short‑stay scenarios, clickable 5‑step workflow, use cases, 3‑tier pricing, trust, waitlist CTA |
| `/audit` | **AI Room Audit** — 4‑step intake (profile / unit / goals / contact) with progress bar + live value preview → **$149 paywall** (simulated Stripe, blurred preview) → diagnosis (Opportunity Score, scenario revenue, project range, recommended package) |
| `/proposal/[id]` | **Smart Proposal + Quote Engine** — executable business proposal, budget‑band slider (Lean / Standard / Premium) with **live re‑quote**, line items with cost/retail/**margin**, founder‑only margin view, admin‑visible platform fee, **"Pay deposit to lock suppliers"** CTA, shareable referral link |
| `/console` | **Founder Console** (money‑first) — weighted pipeline value, cash collected, weighted coordination fees, conversion funnel, **kanban pipeline** with amounts, top leads by project value, leads table, supplier catalog, partner roster, **margin simulator** |
| `/partners` | **Partner / Pro Portal** — revenue model, network preview, component catalog preview, onboarding application form |

---

## Project structure

```
spacepilot-v2/
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx               # root layout, no‑flash theme script, Providers
│  │  ├─ page.tsx                 # Landing (SiteShell + Landing)
│  │  ├─ globals.css              # light/dark CSS variable tokens
│  │  ├─ audit/page.tsx
│  │  ├─ proposal/[id]/page.tsx
│  │  ├─ console/page.tsx
│  │  └─ partners/page.tsx
│  ├─ components/
│  │  ├─ ui/                      # button, primitives (Card/Input/Select/Progress…), shared (ScoreRing/Badges)
│  │  ├─ layout/                  # Navbar, Footer, SiteShell, LocaleSwitcher, ThemeToggle, Logo, Providers
│  │  └─ sections/                # Landing, RoiCalculator, Audit, Proposal, Console, Partners
│  ├─ lib/
│  │  ├─ types.ts                 # domain types
│  │  ├─ engine.ts                # computeRoi / estimateProject / scoreLead / diagnose / buildQuote
│  │  ├─ options.ts               # form option lists
│  │  ├─ seed.ts                  # seeded leads, suppliers, partners
│  │  └─ cn.ts                    # clsx + tailwind‑merge
│  ├─ store/
│  │  ├─ prefs.ts                 # locale/currency/theme + useT()/useMoney()
│  │  └─ data.ts                  # leads / waitlist / partner apps
│  └─ i18n/
│     ├─ config.ts                # Locale, currencies, dict registry
│     └─ en/zh/ja/es/ar.json
```

---

## The domain engine (`src/lib/engine.ts`)

Everything in the product is driven by a small, transparent engine:

- **`computeRoi()`** — scenario‑based ADR uplift by budget band (lean 6% / standard 11% / premium 18%) → monthly & annual uplift, indicative payback. All language is **estimated / scenario‑based**.
- **`estimateProject()`** — `$/m² band × room factor` → low / high / mid project cost.
- **`scoreLead()`** — 0–100 opportunity score + tier (priority / hot / warm / cold) weighted by user type, timeline, budget, signals.
- **`diagnose()`** — assembles the full audit output (score, summary, modules, ROI, risks, recommended package).
- **`buildQuote()`** — margin‑based quote (lean 30% / standard 36% / premium 42%) with a **12% platform coordination fee** line, returning customer total, cost total, margin and margin %.

---

## Compliance language

Revenue figures are intentionally framed as **scenario‑based estimates, subject to local market verification**. Final pricing is confirmed after a site survey; wet areas surface plumbing/electrical compliance notes. No fake customer logos are used.

---

## Conversion path — test it end to end

1. **`/`** → adjust the hero **ROI calculator** sliders → *Start my audit*.
2. **`/audit`** → complete the 4 steps → *Run my audit* → hit the **$149 paywall** → *Unlock* → read the diagnosis.
3. From the result → *View executable proposal & quote* → **`/proposal/[id]`**.
4. On the proposal → drag the **budget band slider** (watch the quote re‑price live) → toggle **Founder margin view** (see cost & margin per line + the platform fee) → *Pay deposit to lock suppliers* → "Suppliers locked".
5. **`/console`** → the new lead now shows in the **pipeline / leads / overview**, contributing to weighted pipeline value, collected cash and coordination fees. Drag it across the kanban. Open the **Margin lab** to model unit economics.
6. **`/partners`** → submit an application → it appears in **Console → Partners** as a new application.

Use **Console → Reset** to restore the seeded demo data at any time.

---

## Localization & currency

- Language switcher lives at the top of the navbar (and inside the console header). Switching is **instant and client‑side — the URL never changes**.
- Arabic switches the document to **RTL** automatically.
- Currency auto‑maps to the selected locale (USD/EUR/GBP/JPY/AED/SGD/CNY) and re‑formats every price via `useMoney()`. Static FX rates for the demo.

---

## Extending to production

| Concern | Drop‑in path |
|---|---|
| **Payments** | Replace the simulated paywall/deposit in `Audit.tsx` & `Proposal.tsx` with Stripe Checkout / Payment Intents; credit the $149 audit toward the proposal server‑side. |
| **Persistence / auth** | Swap the Zustand `persist` stores (`store/data.ts`) for Supabase / Postgres + RLS; move `engine.ts` calls behind API routes. |
| **Real AI** | Replace `diagnose()` heuristics with an LLM call that reads uploaded photos/floor plans (vision) and returns the same `Diagnosis` shape. |
| **3D / visualization** | Add a Before/After or 3D render step between audit result and proposal (e.g. an image‑gen or 3D pipeline) keyed off the recommended modules. |
| **Supplier sourcing** | Back `SUPPLIERS` with a real catalog API and live lead times; auto‑match on `markets` + category. |
| **Growth** | The shareable proposal already carries a `?ref=` referral; wire it to attribution + a Case Study Generator and City Launch waitlist segments. |

---

## Notes

This MVP is front‑end only and stores all data in the browser (`localStorage` keys `spacepilot.prefs` and `spacepilot.data`). Clearing site data resets everything; the Console also has a Reset button.
