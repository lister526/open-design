# Atlaz v4 — The AI Trade Execution Network for Small Global Merchants

> **v4 supersedes v3.** Atlaz v3 was a flat, tab-based product-research tool. It
> did not meet the goal. **Atlaz v4 is a ground-up rebuild** around a single
> idea: take a small merchant from *product opportunity* all the way through
> *demand → supplier match → compliance → sampling → quoting → order →
> margin/cashflow → short-video growth → reorder review* as one **closed loop**,
> and sediment every action into reusable trade assets.

---

## What Atlaz is (and is not)

**Atlaz is NOT** a database, an AI product-listing generator, or a research
dashboard. Those are features, not a business.

**Atlaz IS** the *AI trade execution network for small global merchants* — the
operating system a one-person or small team uses to actually **execute** a
cross-border trade, not just research it.

Every action a merchant takes compounds into four irreplaceable assets (the moat):

| Asset | What it accumulates |
|---|---|
| **SKU Passport** | The full reusable history of one product: thesis, suppliers, compliance, economics, samples, listings, test results, decisions. |
| **Supplier Trust Graph** | A dynamic, evidence-based trust score per supplier that improves as the ledger grows. |
| **Trade Loop Ledger** | An append-only event stream of every meaningful action across every SKU. |
| **Compliance Memory** | Reusable region+platform+category compliance routes so the second SKU is faster than the first. |

---

## The structural pivot: from tabs to Deal Rooms

v3 was 5 flat tabs (Radar / Suppliers / Orders / Cashflow / Growth).
**v4 is a per-SKU Deal Room product.** Clicking an opportunity opens a full
**SKU Deal Room** with 10 modules, all tied to ONE SKU:

1. Opportunity Thesis 2. Supplier Shortlist 3. Compliance Route 4. Margin & Cash
5. Sample Plan 6. Listing & Content Kit 7. Order Timeline 8. Growth Experiment
9. Decision Memo 10. Ledger

## The 10 product areas

1. **Trade Command Center** — 5 daily questions, identity card, today's action,
   opportunity funnel, 5-type risk radar, active Deal Rooms, agent actions to approve.
2. **Opportunity Radar** — 22-field investment memos.
3. **SKU Deal Room** (the core) — 10-field header + 10 modules.
4. **Supplier Match + War Room** — A/B/C compare.
5. **Compliance Copilot** — 9 inputs / 15 outputs, mandatory disclaimer, red high-risk.
6. **AI Listing Studio** — per-platform (Amazon / Shopify / TikTok Shop).
7. **Trade Flow** — 15 states, 8 doc types, 7 Tool Adapters.
8. **Cash Conversion cockpit** — real-time sliders → buy / negotiate / test_smaller / stop.
9. **Growth Playbook** — 7/14/30-day, test-result → 6 decisions.
10. **Factory Portal** — reserved.

---

## The 15-field AI envelope

Every AI output is a structured **work-order**, never a chat blob:

```
id, type, inputSnapshot, market, platform, confidence, evidence, assumptions,
risks, recommendation, nextActions, generatedAssets, humanApprovalRequired,
legalDisclaimer, createdAt
```

**High-risk actions require human approval** and never auto-execute:
`send_inquiry, confirm_order, request_credit_terms, generate_compliance_statement,
submit_listing, trigger_payment, share_supplier_data`.

---

## Repository layout

```
atlaz4/
├── README.md                ← you are here
├── web/                     ← zero-dependency vanilla-JS demoable mirror (DEPLOYED)
│   ├── index.html
│   ├── css/styles.css
│   └── js/  data, i18n, ledger, ai, components, screens, app
├── kmp/                     ← Kotlin Multiplatform + Compose, iOS-first (the real app)
│   ├── shared/              ← domain models, AI service, cash engine, tools, ledger, UI
│   ├── iosApp/              ← SwiftUI shell hosting Compose
│   └── androidApp/          ← optional Android host
├── docs/                    ← 21 product / business / legal documents
└── tests/                   ← integrity + must-pass simulation harnesses
```

> **The web prototype is a demoable mirror, not a replacement for the app.** The
> production product is the KMP + Compose Multiplatform iOS app. The web build
> exists so the full v4 experience can be demoed and permanently hosted today.

---

## Internationalization

- **7 UI languages**, switchable in real time: `zh, en, es, fr, de, ja, ar`
  (Arabic includes full **RTL**).
- **10 currencies** with a mock FX table: `USD, CNY, EUR, GBP, JPY, CAD, AUD, AED, MXN, BRL`.
- **UI language is independent of AI output language** — a German seller can
  read the UI in English while the supplier inquiry is generated in German.

## Design language

Shopify clarity + Stripe trust + Alibaba density + Linear speed.
**No gradients. No crypto-dashboard glow.** Flat, dense, fast, legible.

---

## The must-pass story

> A US TikTok Shop new seller, **$3,000 budget**, wants a home-cleaning product.
> Atlaz: surfaces 3 recommendations → seller picks one → SKU Passport opens →
> 5 suppliers appear (small-test / certified / high-risk) → inquiry, IM script,
> sample brief, quote comparison → US/TikTok compliance flags banned words →
> cash check suggests 100 units if dangerous → TikTok description + video script
> + creator brief → mock sample order → 7-day test data → AI decides
> reorder / modify / lower-price / change-market / change-angle / **stop** + writes
> a Decision Memo.
>
> **If this story does not run smoothly, the product has failed.** It runs — see
> `tests/simulation.cjs` and `docs/ACCEPTANCE_CRITERIA.md`.

---

## Run the web prototype locally

```bash
cd atlaz4/web
python3 -m http.server 8090
# open http://localhost:8090
# Helpful query params:
#   ?demo=1            skip onboarding
#   ?lang=ar           force a language (zh/en/es/fr/de/ja/ar)
#   ?ccy=EUR           force a currency
#   ?go=dealroom:OPP-4001   jump straight into a Deal Room
```

## Documents

See [`docs/`](docs/) — 21 documents covering product, business, go-to-market,
monetization (including high-profit & distribution techniques),
**ownership (copyright belongs to the project owner)**, legal limits, technical
architecture, data model, the four moat specs, acceptance criteria and a real
deployment guide.

## Ownership & honesty

- **Copyright and ownership of this project belong to the project owner.** See
  [`docs/OWNERSHIP_NOTICE.md`](docs/OWNERSHIP_NOTICE.md).
- Atlaz makes **no false claims**: it is **not** a registered company, has **not**
  obtained legal permission of any kind, and has **no** real third-party
  integrations. All adapters are mock. See
  [`docs/LEGAL_LIMITATIONS.md`](docs/LEGAL_LIMITATIONS.md).
