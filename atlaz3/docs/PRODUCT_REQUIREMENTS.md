# Atlaz — Product Requirements (PRD)

## Goal
Ship a high-completion, iOS-first MVP that lets one merchant run a **complete single-SKU
Trade Loop** end-to-end with mock data, real interactions, and every state (loading / empty /
error / risk / blocked) handled — not a marketing page or empty navigation.

## Personas
1. **Solo TikTok Shop seller (US)** — speed, trends, compliant claims.
2. **Amazon FBA seller (Japan/UK)** — margins, certifications, reviews.
3. **Shopify micro-brand (Germany/France)** — brand, EU compliance, cash.
4. **Side-hustle creator (US)** — merch, low MOQ, fast iteration.

## Core User Journey (the Trade Loop)
Opportunity (Radar) → Create **SKU Passport** → **Match suppliers** → review **Trust** →
generate **RFQ / WeChat / sample brief** → **compare quotes** → **Compliance Route Check** →
**Cash Conversion Score** (buy/negotiate/test/stop) → **Listing draft** → **sample inspection** →
**test order** → **Growth playbook & experiment** → **AI decision** → **human confirm** → **export SKU Passport JSON**.

## Functional Requirements
- 5 tabs: Radar, Suppliers, Orders, Cashflow, Growth.
- Home = AI Trade Command Center (top stats + body sections + "Start a Trade Loop" CTA).
- 4-step onboarding: identity → market → platform → language+currency.
- Every core module: mock data, clickable interaction, all states, next-action buttons, JSON result preview.
- Every AI output wrapped in the 13-field envelope.
- Human-approved Agent Actions via bottom-sheet approval flow.
- 6 UI languages, 5 currencies, real-time whole-UI switching; UI language ≠ AI output language.

## Non-Functional Requirements
- iOS-first visual language; Android-ready via shared Compose code.
- Zero console errors; fast boot; offline-capable mock data.
- Auditability: every action recorded in the Trade Loop Ledger.

## Acceptance Criteria (summary)
See `docs/ACCEPTANCE_CRITERIA.md` for the full 36-item checklist (counts, methods, tools,
envelope fields, decision spaces, languages, disclaimers, ownership).

## Explicit Non-Goals (MVP)
No real orders, payments, messages or certifications are created. No legal advice. No loan,
profit or compliance guarantees.
