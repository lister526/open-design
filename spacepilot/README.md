# SpacePilot AI — MVP

> **AI-powered room transformation engine for landlords, designers and high-intent homeowners.**
> From room scan to a profitable, buildable redesign proposal in minutes.

This is a real, runnable MVP designed to **validate paid demand for high-ticket space transactions** — not a toy demo. It implements the full commercial loop: acquire → qualify → quote → convert → operate.

---

## 1. Quick start

```bash
cd spacepilot
npm install
npm run dev      # http://localhost:5173
```

Build & preview production:

```bash
npm run build
npm run preview  # http://localhost:4173
npm run lint     # tsc type-check
```

No paid APIs. All users, leads, quotes, projects, suppliers, partners and waitlist entries are simulated with **mock data + localStorage**.

---

## 2. File structure

```
spacepilot/
├─ index.html
├─ vite.config.ts / tailwind.config.js / postcss.config.js / tsconfig.json
└─ src/
   ├─ main.tsx                 # entry + providers (Locale, Audit, Router)
   ├─ App.tsx                  # routes + chrome
   ├─ index.css                # Tailwind + design tokens (buttons, cards, inputs)
   ├─ context/
   │  ├─ LocaleContext.tsx     # language + currency + units, persisted
   │  └─ AuditContext.tsx      # active audit/lead across pages
   ├─ lib/
   │  ├─ locale.ts             # 9 languages, 8 currencies, metric/imperial, FX & formatters
   │  ├─ i18n.ts               # translation dictionary (EN source of truth, fallback)
   │  ├─ types.ts              # domain model
   │  ├─ options.ts            # form options (user types, rooms, pains, styles…)
   │  ├─ engine.ts             # ★ scoring + project estimate + diagnosis + quote engine
   │  └─ store.ts              # localStorage data layer (leads, waitlist, partners)
   ├─ data/seed.ts             # seed leads, supplier catalog, partner network
   ├─ components/              # Navbar, Footer, Logo, LocaleSwitcher, ui (ScoreRing, badges…)
   └─ pages/
      ├─ Landing.tsx           # marketing site (hero, pains, workflow, use cases, pricing, trust, CTA)
      ├─ Audit.tsx             # 5-step AI Room Audit intake + instant diagnosis result
      ├─ Proposal.tsx          # smart proposal + quote engine + deposit/payment + matched components
      ├─ Partners.tsx          # Pro/partner portal + supplier catalog + onboarding (growth)
      ├─ Business.tsx          # business model + revenue engine + moat + growth loops
      └─ Console.tsx           # operator/admin console (overview, leads, pipeline, quotes, suppliers, partners, settings)
```

## 3. Core components & business logic

| Module | Responsibility | Why it matters |
|---|---|---|
| `lib/engine.ts` → `scoreLead` | Opportunity score (0–100) + intent tier | **Qualifies** high-value buyers; ROI-driven operators score highest |
| `lib/engine.ts` → `estimateProject` | $/m² × room factor × budget band | Turns an intake into a **real budget range** |
| `lib/engine.ts` → `diagnose` | Summary, modules, routing, ROI angle, risk notes | Routes leads to the right **paid package** |
| `lib/engine.ts` → `buildQuote` | Itemized lines, platform fee, warranty, **margin (admin-only)** | The **monetization** core |
| `pages/Audit.tsx` | Lead capture + instant value | **Acquisition + qualification** |
| `pages/Proposal.tsx` | Buildable proposal + deposit | **Conversion** |
| `pages/Console.tsx` | Leads, funnel, revenue, pipeline, margin sim | **Founder operations** |

### Which page does what (the strategic map)
- **Acquisition:** `Landing` + `Audit` (free start, 9 languages)
- **Qualification:** `Audit` result — opportunity score & intent tier; low-cost paid audit filters low intent
- **Quoting:** `Proposal` quote engine (lean / standard / premium, editable, currency-aware)
- **Conversion:** `Proposal` deposit + next-step routing ($499–$999 briefs, 8–15% project fee)
- **Operations / moat insight:** `Console` (revenue, margin simulator, supplier & partner network)
- **Future moat:** `data/seed.ts` supplier catalog (configurable space modules) + local partner network

### Compliance posture
All outcome language uses **"estimated", "scenario", "potential", "subject to local conditions"** and never guarantees returns. No fabricated customers or logos.

---

## 4. Localization
- **9 languages:** English (default), 中文, 日本語, Español, 한국어, Français, Deutsch, Português, العربية (RTL).
- **8 currencies:** USD, EUR, GBP, JPY, CNY, SGD, AED, KRW (static FX — swap for live rates).
- **Units:** metric / imperial. All persisted to localStorage; switch via the top-right control.

---

## 5. Extending to production (drop-in next steps)

| Concern | MVP today | Production path |
|---|---|---|
| Auth & DB | localStorage | **Supabase** (Postgres + Auth + RLS); replace `lib/store.ts` |
| Payments | simulated deposit | **Stripe** (+ local PSPs: PayPay, Alipay, etc.); wire into `Proposal.payDeposit` |
| AI design | rule-based `diagnose` | LLM + image model behind the same `diagnose()` interface |
| 3D / AR | model URL placeholders | Real `.glb` viewer / room-scan SDK |
| Supply chain | mock catalog | Supplier ERP / catalog ingestion → `SupplierComponent` |
| FX | static rates | Live FX feed in `lib/locale.ts` |
| Email/CRM | local waitlist | Resend/Postmark + HubSpot; `addWaitlist` is the seam |

The engine, store and locale layers are deliberately isolated so each external system is a **single-file swap**.
