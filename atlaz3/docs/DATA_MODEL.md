# Atlaz — Data Model (30 models)

All models are pure, `@Serializable` Kotlin data classes in
`shared/src/commonMain/kotlin/com/atlaz/domain/model/` and mirrored in the web prototype's `data.js`.

## Core models (15)
1. **ProductOpportunity** (23 fields) — a scouted product idea for a market/platform.
2. **Supplier** (28 fields) — a factory with trust, certs, lead times, dispute history.
3. **MarketPersona** — buyer behavior per region.
4. **PlatformRule** — listing rules, prohibited claims, fees per platform.
5. **ListingDraft** — title/bullets/description with compliance-safe alternatives.
6. **TradeOrder** — an order moving through the trade steps.
7. **TradeStep** — one step in the loop (pending/active/done/blocked).
8. **SupplierRating** — a scored rating with evidence.
9. **CashflowEvent** — money in/out for a SKU.
10. **GrowthExperiment** — a test with hypothesis, channel, budget, metrics.
11. **ExperimentMetrics** — impressions, CTR, CVR, ROAS, CAC, refund rate.
12. **DocumentTemplate** — a trade-document template.
13. **UserPreference** — identity, market, platform, language, currency, theme.
14. **Plan** — Free/Pro/Enterprise.
15. **RevenueStream** — one of the 12 monetization streams.

## Moat models (15)
16. **SkuPassport** (24 fields) — portable, compounding record of a SKU's journey.
17. **TradeLoopLedgerEvent** (12 fields) — append-only event; 15 event types.
18. **SupplierTrustSignal** — an edge/signal in the Supplier Trust Graph.
19. **ComplianceRoute** — 9 inputs → 12 outputs from the Compliance Route Engine.
20. **CashConversionScore** — 18 inputs → 20 outputs; decision buy/negotiate/test_smaller/stop.
21. **AgentAction** (15 fields) — a human-approved agent action; 13 action types.
22. **HumanApprovalRecord** — the approve/reject decision and note.
23. **QuoteComparison** — side-by-side supplier quotes + recommendation.
24. **SampleInspectionResult** — visual/functional/measurement verdict.
25. **CertificationClaim** — a claimed cert and its (mock) verification status.
26. **MaterialProfile** — material/components and contact flags (food/skin/electronics).
27. **MarketDemandSignal** — a demand metric and trend.
28. **CreatorSignal** — a creator angle and fit score.
29. **ReorderDecision** — reorder/iterate/stop/scale with basis.
30. **DataRightConsent** — consent-first data-rights record (revocable, purpose-bound).

## Relationships
`ProductOpportunity 1—* Supplier`, `ProductOpportunity 1—1 SkuPassport`, `SkuPassport 1—* TradeLoopLedgerEvent`,
`SkuPassport 1—1 ComplianceRoute`, `SkuPassport 1—1 CashConversionScore`, `SkuPassport 1—* AgentAction`,
`Supplier 1—* SupplierTrustSignal`. The **SKU Passport** is the hub that all moat data hangs off.
