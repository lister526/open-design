# Atlaz v4 — Product Requirements

## Vision
The AI trade execution network for small global merchants: one closed loop per
SKU, every action compounding into reusable assets.

## Principles
1. **Deal Room first.** The unit of work is one SKU, not a tab.
2. **Every AI output is a 15-field work-order**, not a chat message.
3. **High-risk actions never auto-execute** — human approval required.
4. **Compounding memory** is the product, not a feature.
5. **UI language ≠ AI output language.**
6. **No false certainty** — confidence, evidence, assumptions, risks always shown.

## The 10 product areas (requirements)

### 1. Trade Command Center (home)
- 5 daily questions surfaced as the spine of the home.
- Identity card (trader profile from onboarding).
- Today's action (top agent actions to approve).
- Opportunity funnel (counts by decision).
- 5-type risk radar (compliance, cash, inventory, FX, return).
- Active Deal Rooms list (≥12).
- Agent actions to approve.
- One-click starts.

### 2. Opportunity Radar
- 22-field investment memos per opportunity (≥18 opportunities).
- Decision: RECOMMENDED / WATCH / HIGH_RISK_REVIEW.
- Why-now and anti-thesis both mandatory.

### 3. SKU Deal Room (CORE)
- 10-field header (SKU, scenario, region, platform, stage, risk, suppliers,
  cash decision, compliance go/no-go, lead supplier trust).
- 10 modules: Opportunity Thesis, Supplier Shortlist, Compliance Route,
  Margin & Cash, Sample Plan, Listing & Content Kit, Order Timeline,
  Growth Experiment, Decision Memo, Ledger.

### 4. Supplier Match + War Room
- ≥5 suppliers per opportunity (≥90 total), role-spread guaranteeing a
  small-test, a certified, a scale, a balanced, and a high-risk option.
- War Room: A/B/C side-by-side comparison on landed cost & trust.
- Dynamic Supplier Trust Graph score.

### 5. Compliance Copilot
- 9 inputs → 15 outputs.
- Mandatory legal disclaimer on every result.
- High-risk results rendered in red with `no_go_until_certified`.
- ≥8 high-risk compliance cases in mock data.

### 6. AI Listing Studio
- Per-platform output: Amazon (title/bullets/A+), Shopify (PDP story/SEO),
  TikTok Shop (video script/creator brief/caption).
- Avoids restricted keywords flagged by compliance.

### 7. Trade Flow
- 15 trade states, 8 document types, 7 Tool Adapters.
- ≥8 order flows in mock data.

### 8. Cash Conversion cockpit
- Real-time sliders → live recompute.
- Decision: buy / negotiate / test_smaller / stop.
- Survive-the-test-period logic (break-even on fixed costs).
- ≥12 cash scores in mock data.

### 9. Growth Playbook
- 7/14/30-day plan.
- Test result → 6 decisions: scale / modify / lower_price / change_market /
  change_angle / stop.
- ≥12 growth experiments in mock data.

### 10. Factory Portal
- Reserved for the supplier side of the network.

## Mock data minimums (v4)
≥18 opportunities, ≥90 suppliers (≥5/opp), ≥12 Deal Rooms, ≥60 ledger events,
≥12 compliance routes, ≥12 cash scores, ≥12 growth experiments, ≥8 high-risk
compliance cases, ≥8 order flows. **8 real scenarios. No lorem.**

## i18n
7 languages real-time (zh/en/es/fr/de/ja/ar with RTL), 10 currencies
(USD/CNY/EUR/GBP/JPY/CAD/AUD/AED/MXN/BRL) + mock FX. UI language ≠ AI output language.

## Acceptance
See `ACCEPTANCE_CRITERIA.md`. The US TikTok $3,000 story is the gating test.
