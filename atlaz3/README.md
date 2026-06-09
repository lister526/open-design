# Atlaz · Global AI Merchant Trade Network

> **The AI trade operating network for small global merchants** — turning product opportunities
> into supplier matches, compliant listings, sample orders, margin plans and growth decisions.

This repository is a **high-completion, iOS-first MVP prototype + full project repo** designed to
let one merchant run a **complete single-SKU Trade Loop** while embedding six compounding moats
for a 12–15-year network company.

---

## ▶️ Run the prototype (the demoable artifact)

The canonical, **runnable** artifact is a zero-dependency static web app that faithfully mirrors
the native iOS app (same data, AI envelope, Cash Conversion math, ledger event types and 6 moats).

```bash
cd web
python3 -m http.server 8080
# open http://localhost:8080
```

Useful query params:
- `?demo=1` — skip onboarding, fast boot
- `?reset=1` — restart onboarding
- `?lang=zh|ja|es|fr|de|en` — set UI language
- `?go=route:id` — deep-link, e.g. `?demo=1&go=compliance:OPP-2009`

## ✅ Verify it

```bash
node test/integrity.cjs        # 255/255 invariants (counts, 17 AI methods, 15 tools,
                               # 13 envelope fields, 6 moats, decision spaces, i18n, ledger)
```

---

## What's inside

```
atlaz3/
├── web/            ← runnable, zero-dependency prototype (iOS-framed)
│   ├── index.html
│   ├── css/styles.css        (design system: 30 components, dark mode, risk states)
│   └── js/  i18n · data · ledger · ai · components · screens · app
├── kmp/            ← Kotlin Multiplatform + Compose Multiplatform (iOS-first, Android-ready)
│   ├── shared/     10 layers · 30 models · 13 ViewModels · 8 UseCases · 17 AI methods · 15 tools
│   ├── androidApp/ Android entry (shared Compose UI)
│   └── iosApp/     SwiftUI shell hosting Compose (see iosApp/README.md)
├── docs/           ← 20 specs + acceptance criteria + deployment guide
└── test/           ← integrity harness (integrity.cjs)
```

## The 5 tabs + home
**Radar · Suppliers · Orders · Cashflow · Growth**, anchored by the **AI Trade Command Center**.

## The 6 moats
1. **SKU Passport** — portable, compounding record of a SKU's journey.
2. **Trade Loop Ledger** — append-only, auditable event log (15 event types).
3. **Supplier Trust Graph** — trust scored from (future real) trade signals.
4. **Compliance Route Engine** — 9 inputs → 12 outputs of risk guidance (not legal advice).
5. **Cash Conversion Score** — 18 inputs → 20 outputs; buy/negotiate/test/stop.
6. **Human-approved Agent Actions** — AI proposes, human approves; nothing risky happens silently.

## The Trade Loop
Opportunity → SKU Passport → suppliers → trust → RFQ/sample → quotes → **Compliance Route** →
**Cash Conversion Score** → listing → inspection → test order → growth → AI decision → human
confirm → export SKU Passport JSON.

## Languages & currencies
6 UI languages (en/zh/ja/es/fr/de) with real-time switching and English fallback; 5 display
currencies (USD/CNY/EUR/JPY/GBP). **UI language is independent of the AI's output language.**

---

## Important disclaimers
- **Risk guidance only — NOT legal advice.** Verify compliance with professionals (`docs/COMPLIANCE_DISCLAIMER.md`).
- **Estimates only — no loan, profit, sales or compliance guarantees** (`docs/CASH_CONVERSION_SCORE.md`).
- **Mock data only** — no real orders, messages, payments or certifications are created.
- **Ownership:** all concepts, schemas, designs and code are the original work of the founding
  team / user; not affiliated with any third party (`docs/OWNERSHIP_NOTICE.md`).

## Docs index
Business: `BUSINESS_PLAN` · `GO_TO_MARKET` · `MONETIZATION_MODEL` · `FUTURE_ROADMAP` · `NETWORK_EFFECTS_PLAYBOOK`
Product/Tech: `PRODUCT_REQUIREMENTS` · `TECHNICAL_ARCHITECTURE` · `DATA_MODEL` · `API_INTEGRATION_ROADMAP` · `DEPLOYMENT_GUIDE` · `ACCEPTANCE_CRITERIA`
Moats: `SKU_PASSPORT_SCHEMA` · `TRADE_GRAPH_SPEC` · `SUPPLIER_TRUST_SCORE` · `COMPLIANCE_ROUTE_ENGINE` · `CASH_CONVERSION_SCORE` · `AGENT_ACTION_SAFETY_MODEL` · `FACTORY_PORTAL_ROADMAP`
Trust & privacy: `COMPLIANCE_DISCLAIMER` · `PRIVACY_NOTES` · `DATA_RIGHTS_AND_PRIVACY_BOUNDARIES` · `OWNERSHIP_NOTICE`
