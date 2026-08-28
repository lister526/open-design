# Data Model — 21 Models

All models live in `kmp/shared/src/commonMain/kotlin/com/atlaz/domain/model/`
(`CoreModels.kt`, `MoatModels.kt`) and mirror the web `data.js` shapes.

| # | Model | Purpose |
|---|---|---|
| 1 | ProductOpportunity | 22+ field investment memo (the radar unit) |
| 2 | SkuPassport | Reusable per-SKU history (moat asset) |
| 3 | Supplier | Factory record (28 fields) |
| 4 | SupplierRating | Dynamic trust score output |
| 5 | SupplierTrustSignal | Append-only evidence behind the score |
| 6 | Inquiry | Outbound supplier message (approval-gated) |
| 7 | TradeOrder | Order with stages |
| 7b | TradeOrderStep | One stage of an order (goal, AI assist, docs, risk) |
| 8 | ComplianceCheck | A single pass/fail check |
| 9 | ComplianceRoute | Reusable region+platform+category route (moat asset) |
| 10 | ListingDraft | Per-platform listing payload |
| 11 | CashflowEvent | Money in/out event |
| 12 | CashConversionScore | The buy/negotiate/test_smaller/stop output |
| 13 | GrowthExperiment | A test window |
| 14 | (GrowthExperiment cont.) | — |
| 15 | GrowthMetric | Views/CTR/CVR/orders/refunds/CAC/comments |
| 16 | TradeLoopLedgerEvent | Append-only ledger event (moat asset) |
| 17 | AgentAction | Proposed action, approval-gated |
| 18 | UserPreference | UI lang, AI lang, currency, onboarding |
| 19 | DocumentTemplate | Trade-doc template (8 types) |
| 20 | MarketDemandSignal | Demand/content signal feed |
| 21 | AiGenerationLog | Audit log of AI generations |

Plus an aggregate (not a stored model): **DealRoom** assembles one SKU's full
closed loop (opportunity + passport + suppliers + compliance + cash + growth +
ledger + agent actions).

## Enums
- `TradeDecision`: RECOMMENDED / WATCH / HIGH_RISK_REVIEW
- `RiskLevel`: LOW / MEDIUM / HIGH
- `TradeStage`: 15 stages (OPPORTUNITY_CONFIRMED → … → REORDER_DECISION)

## The 15-field AI envelope
`AiEnvelope` (in `com.atlaz.ai`): `id, type, inputSnapshot, market, platform,
confidence, evidence, assumptions, risks, recommendation, nextActions,
generatedAssets, humanApprovalRequired, legalDisclaimer, createdAt`.

## Persistence mapping
Each `@Serializable` model maps to one SQLDelight table; the ledger is
append-only; preferences go to DataStore. See `TECHNICAL_ARCHITECTURE.md`.
