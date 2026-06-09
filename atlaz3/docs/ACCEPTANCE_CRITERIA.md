# Atlaz — Acceptance Criteria (36 items)

Verified automatically by `test/integrity.cjs` (255/255 invariants) and manually in the Web Preview.

## Data & Moat (1–12)
1. ≥ 12 ProductOpportunity, each with ≥ 23 fields. ✅
2. ≥ 60 suppliers (5 per opportunity), each with ≥ 28 fields. ✅
3. ≥ 12 SKU Passports, each with ≥ 24 fields. ✅
4. ≥ 12 ComplianceRoute (9 inputs → 12 outputs). ✅
5. ≥ 8 ListingDraft, ≥ 8 TradeOrder, ≥ 8 CashConversionScore, ≥ 8 GrowthExperiment. ✅
6. ≥ 20 SupplierRating, ≥ 50 TradeLoopLedgerEvent, ≥ 20 SupplierTrustSignal, ≥ 12 AgentAction. ✅
7. ≥ 6 personas, ≥ 3 plans, ≥ 8 doc templates, ≥ 8 SampleInspectionResult, ≥ 12 MarketDemandSignal. ✅
8. 10 supplier regions; 12 mock certifications. ✅
9. 6 moat objects implemented as data + logic. ✅
10. 30 data models (15 core + 15 moat). ✅
11. No lorem ipsum — all content is realistic. ✅
12. ≥ 12 revenue streams. ✅

## AI & Tools (13–20)
13. 17 TradeAiService methods, exact names. ✅
14. 15 TradeToolRegistry tools, exact names, each with 7 metadata fields. ✅
15. Every AI output is a 13-field envelope. ✅
16. Cash Conversion Score: 18 inputs → 20 outputs. ✅
17. Cash decision space ⊆ {buy, negotiate, test_smaller, stop}. ✅
18. evaluateExperimentResult decision space ≥ 4 distinct outcomes. ✅
19. TradeLoopLedger seeds ≥ 50, appends at runtime, notifies listeners, events ≥ 12 fields. ✅
20. AiGenerationLog populated after calls. ✅

## App & UX (21–30)
21. 5 tabs: Radar, Suppliers, Orders, Cashflow, Growth. ✅
22. AI Trade Command Center home with stats + sections + CTA. ✅
23. 4-step onboarding (identity, market, platform, language+currency). ✅
24. 28 page renderers. ✅
25. 17 status states; 30 design-system components. ✅
26. Every core module: mock data, interaction, all states, next-action, JSON preview. ✅
27. Human-approved Agent Actions via approval sheet. ✅
28. 6 UI languages with real-time switching + English fallback. ✅
29. 5 display currencies. ✅
30. UI language ≠ AI output language (aiOutputLangFor). ✅

## Quality, Compliance & Ownership (31–36)
31. Zero console errors across 6 languages + deep links (Playwright). ✅
32. KMP + Compose tree: 10 layers, 30 models, 13 ViewModels, 8 UseCases, iOS+Android, SwiftUI shell. ✅
33. Runnable Web Preview mirrors native (same data/envelope/cash math/ledger/moats). ✅
34. 20 documentation files (exact names) + README + deploy guide. ✅
35. 6 mandatory disclaimers + ownership notice; risk-only compliance; no loan/profit/compliance guarantees. ✅
36. Integrity harness passes 255/255. ✅
