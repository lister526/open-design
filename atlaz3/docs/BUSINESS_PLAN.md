# Atlaz — Business Plan

> **Atlaz is the AI trade operating network for small global merchants** — turning
> product opportunities into supplier matches, compliant listings, sample orders,
> margin plans and growth decisions. Atlaz is designed to compound into a 12–15-year
> network company, not a single-feature tool.

---

## 1. Executive Summary
Small cross-border merchants (solo founders, TikTok/Amazon/Shopify sellers, micro-brands)
face a fragmented, high-risk path from "interesting product idea" to "profitable, compliant,
repeatable order." Today that path spans dozens of disconnected tools, spreadsheets, agents
and gut decisions. Atlaz collapses the entire **single-SKU Trade Loop** — opportunity →
SKU Passport → supplier match → compliance route → sample → margin/cash plan → listing →
test order → growth decision — into one AI-native, iOS-first app. Every loop deposits
structured data into six proprietary, compounding moat objects, so the product gets smarter
and harder to replicate with each merchant and each SKU.

## 2. Problem
- **Sourcing is opaque.** Trust is built on word-of-mouth; quality and dispute history are invisible.
- **Compliance is terrifying and ad-hoc.** Sellers guess at certifications and make risky claims.
- **Cash is mismanaged.** Merchants discover too late that margins evaporate after fees, duty, ads and refunds.
- **Knowledge is lost.** Each SKU's hard-won learnings vanish; the next product starts from zero.
- **Tools don't talk.** Sourcing, compliance, listing, finance and growth live in separate silos.

## 3. Solution
A guided, AI-assisted Trade Loop with **human-in-the-loop agent actions**, backed by:
- **SKU Passport** — a portable, compounding record of a SKU's entire journey.
- **Trade Loop Ledger** — an append-only, auditable log of every event.
- **Supplier Trust Graph** — trust scored from real (future) and mock trade signals.
- **Compliance Route Engine** — risk guidance (not legal advice) per product/market.
- **Cash Conversion Score** — an 18-input margin/cash engine with a clear buy/negotiate/test/stop decision.
- **Human-approved Agent Actions** — the AI proposes, the human approves; nothing risky happens silently.

## 4. Why Now
Three curves are converging: (1) AI that can reason over structured trade data and call tools;
(2) creator-driven commerce (TikTok Shop) lowering the barrier to launching products; and
(3) merchants drowning in compliance and cash complexity they cannot afford to staff. The
window to become the *system of record* for small-merchant trade is open now.

## 5. Product Overview
iOS-first (Kotlin Multiplatform + Compose Multiplatform, Android-ready). Five tabs — **Radar,
Suppliers, Orders, Cashflow, Growth** — anchored by an **AI Trade Command Center** home. 28
pages, 6 UI languages, 5 display currencies, and the crucial separation of UI language from
AI output language (you can use the app in Chinese while it writes a listing in German).

## 6. Market & Segmentation
- **Beachhead:** English- and Chinese-speaking solo sellers on TikTok Shop / Amazon / Shopify ($0–2M GMV).
- **Expansion:** micro-brands, agencies managing many SKUs, and ultimately suppliers themselves.
- **TAM logic:** tens of millions of small cross-border sellers globally; ARPU expands as Atlaz
  moves from "assistant" to "operating network" to "transaction layer."

## 7. The Six Moats (Defensibility)
Each is detailed in its own spec doc. Together they create **data, workflow and network**
lock-in: the SKU Passport makes switching painful; the Trade Loop Ledger is an auditable
history competitors can't recreate; the Supplier Trust Graph improves with every merchant;
the Compliance and Cash engines encode accumulated judgment; Agent Actions make the AI safe
enough to trust with real money.

## 8. Network Effects
- **Data network effect:** more loops → better supplier trust scores, market signals and benchmarks for everyone (anonymized, consented).
- **Supply-side:** verified suppliers attract more merchants; more merchants attract more suppliers (future Factory Portal).
- **Cross-side:** compliance and cash intelligence compound across markets and categories.

## 9. Business Model
Freemium SaaS + usage add-ons + (future) transaction take-rate and trade-finance referrals.
See `MONETIZATION_MODEL.md` for the 12 revenue streams and `docs` pricing (Free / Pro / Enterprise).

## 10. Go-to-Market
Creator-led, content-first acquisition (the same channels our users sell on), template-driven
virality (shareable SKU Passports), and supplier-side seeding. See `GO_TO_MARKET.md`.

## 11. Competitive Landscape
Alibaba/1688 (sourcing, no compliance/cash brain), Jungle Scout/Helium 10 (research, no loop),
AutoDS/Spocket (dropshipping, no moat data), generic AI copilots (no trade structure). Atlaz's
wedge is the **end-to-end loop + compounding moat data**, not any single feature. See the
competitive benchmark in `docs/competitive_benchmark` and the simulation report.

## 12. Product Roadmap (4 phases)
See `FUTURE_ROADMAP.md`: **Phase 1** single-SKU loop (this MVP) → **Phase 2** real integrations
& multi-SKU → **Phase 3** Factory Portal & trust graph at scale → **Phase 4** trade-finance &
marketplace transaction layer.

## 13. Technology
KMP + Compose for write-once iOS/Android; MVVM + Repository + Service + Tool Registry + Event
Ledger; a 13-field AI envelope for every output; 15 reserved production tool integrations. See
`TECHNICAL_ARCHITECTURE.md` and `API_INTEGRATION_ROADMAP.md`.

## 14. Data & Privacy
Consent-first, merchant-owned data; anonymized aggregation only with permission; no end-customer
PII in the MVP. See `DATA_RIGHTS_AND_PRIVACY_BOUNDARIES.md` and `PRIVACY_NOTES.md`.

## 15. Compliance & Risk Posture
Atlaz provides **risk guidance, not legal advice**, and makes **no loan, profit or compliance
guarantees**. High-risk claims are blocked; professional review is flagged. See `COMPLIANCE_DISCLAIMER.md`.

## 16. Team
A world-class founding team spanning AI product, iOS/KMP architecture, cross-border trade SaaS,
supply-chain finance, trade compliance, B2B marketplace growth, data-network strategy and UI/UX.

## 17. Financial Logic (illustrative)
Land merchants on Free, convert to Pro ($29/mo) as they run their second loop, expand to
Enterprise seats and add-ons; later layer transaction and finance revenue. Unit economics
improve as moat data lowers AI/tooling cost and raises conversion.

## 18. Key Metrics
Activation = first completed Trade Loop; retention = second SKU Passport created; expansion =
loops per merchant per month; moat health = ledger events and trust signals accumulated.

## 19. Risks & Mitigations
Regulatory (mitigate: risk-only posture + professional review flags); supplier data quality
(mitigate: trust graph + verification); AI trust (mitigate: human-approved actions + envelope
auditability); platform dependence (mitigate: multi-platform, own system-of-record).

## 20. The 12–15 Year Vision
Atlaz becomes the **operating network and system of record for small global trade** — the layer
through which a meaningful share of small-merchant cross-border commerce is discovered, sourced,
de-risked, financed and grown.

---
*Ownership: see `OWNERSHIP_NOTICE.md`. All figures are illustrative; this is not investment advice.*
