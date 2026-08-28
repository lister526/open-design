# Atlaz v4 — Business Plan (Phased)

> A serious, phased plan. It contains **no false claims**: Atlaz is not yet a
> registered company, has no revenue, no customers, and no real integrations.
> This plan describes how it *could* be built into a business from where it is.

## 1. Problem

Small global merchants (1-person to small-team sellers on TikTok Shop, Shopify,
Amazon) lose money not because they can't find products, but because they can't
**execute a cross-border trade safely**: they pick the wrong supplier, miss a
compliance requirement, misjudge cash, and run out of money during the test.
The work is fragmented across spreadsheets, chat apps, sourcing sites, and
guesswork.

## 2. Solution

Atlaz is the **AI trade execution network** that runs the full loop per SKU in
one Deal Room, and compounds every action into reusable assets (SKU Passport,
Supplier Trust Graph, Trade Loop Ledger, Compliance Memory).

## 3. Why now

- Short-video commerce (TikTok Shop) created millions of first-time importers.
- AI makes structured, multi-step trade assistance feasible.
- Cross-border tooling is still built for big enterprises, not solo sellers.

## 4. Target customer

Primary ICP: **US TikTok Shop new seller, ~$3,000 first budget.**
Adjacent: UK Shopify, DE/FR Amazon sellers, SEA/ME/LatAm small importers.

## 5. Product

See `PRODUCT_REQUIREMENTS.md`. Core = the per-SKU Deal Room with 10 modules and
the 15-field AI work-order. iOS-first (KMP + Compose), web demoable mirror.

## 6. Business model

See `MONETIZATION_MODEL.md`. Subscription core + usage credits, expanding to
transaction take-rate, supplier placement, and compliance referrals.

## 7. Phased roadmap

### Phase 0 — Prototype (current)
- Web demoable mirror + KMP app skeleton, all-mock AI and adapters.
- Goal: prove the loop and the must-pass story. **Done.**

### Phase 1 — Private beta (0–3 months)
- Ship the iOS app with real LLM behind the same `TradeAiService` interface.
- Replace mock store with SQLDelight persistence; add DataStore prefs.
- 20–50 hand-picked TikTok Shop sellers. Measure activation (first real decision).
- No payments yet; high-risk actions still human-approved.

### Phase 2 — Public launch + first revenue (3–9 months)
- Subscription tiers live (Stripe). Free → Starter → Growth → Pro.
- First real Tool Adapters: supplier search, freight quote, marketplace listing
  draft (still human-approved before submit).
- PLG distribution loops (SEO, short-video dogfooding, referral).

### Phase 3 — Network & take-rate (9–24 months)
- Verified supplier marketplace (supplier-paid placement).
- Payment/escrow adapter → transaction take-rate (the high-margin lever).
- Compliance/lab/freight affiliate partnerships.
- Team seats, API/white-label.

## 8. Go-to-market

See `GO_TO_MARKET.md`.

## 9. Competition & moat

Generic AI product-research tools and sourcing marketplaces exist, but they stop
at *research* or *listing*. Atlaz owns *execution + memory*: the four compounding
assets create switching cost that pure tools cannot match.

## 10. Team & ownership

Ownership belongs entirely to the project owner (`OWNERSHIP_NOTICE.md`). Team and
incorporation are future steps; a starting charter template is provided in
`COMPANY_CHARTER_TEMPLATE.md`.

## 11. Risks

- Regulatory/compliance liability → mitigated by disclaimers, human approval,
  and never giving legal advice (`LEGAL_LIMITATIONS.md`, `COMPLIANCE_DISCLAIMER.md`).
- LLM cost → mitigated by model routing via the envelope/adapter layer.
- Platform dependency (TikTok/Amazon policy) → diversify platforms early.
- Trust → built through evidence-backed outputs and approval gates, not hype.

## 12. Financial plan (planning, illustrative)

| Phase | Focus | Revenue (planning) |
|---|---|---|
| 1 | Beta, no revenue | $0 |
| 2 | Subscriptions | first $5k–$30k MRR |
| 3 | Network + take-rate | scale toward profitability |

> All numbers are planning targets to guide decisions, not commitments or
> projections of actual results.
