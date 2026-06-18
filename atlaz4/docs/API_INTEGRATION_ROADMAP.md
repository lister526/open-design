# API Integration Roadmap

> Today every adapter is **mock**. This is the order in which real integrations
> would replace them, all behind the existing Tool Adapter layer so no UI/AI
> code changes.

## Adapter status

| Adapter | Capability | Real candidates (examples) | Risk gate | Status |
|---|---|---|---|---|
| SupplierApiAdapter | Supplier search/enrich | 1688, Alibaba, Global Sources | — | mock |
| LogisticsApiAdapter | Freight quote/transit | Freightos, Flexport, carriers | — | mock |
| PaymentApiAdapter | Deposit/escrow/credit | Stripe, escrow providers | **HIGH** approval | mock |
| ComplianceDatabaseAdapter | Region+platform rules | gov/lab rule DBs, platform policy | — | mock |
| AdPlatformAdapter | Campaign cost/perf | TikTok Ads, Meta, Google | — | mock |
| MarketplaceListingAdapter | Publish listing | Amazon SP-API, Shopify, TikTok Shop | **HIGH** approval | mock |
| InspectionServiceAdapter | Pre-shipment QC | QIMA, AsiaInspection | — | mock |

## Sequencing
1. **Read-only first** (lowest risk): supplier search, freight quote,
   compliance lookup, ad cost estimate, inspection booking estimate.
2. **Write with human approval next**: marketplace listing draft submission,
   supplier inquiry send.
3. **Money last** (highest risk): payment/escrow, credit terms — always
   human-approved, fully audited in the Trade Loop Ledger.

## AI provider
The `TradeAiService` interface is the seam. `MockTradeAiService` → a real
LLM-backed implementation. The 15-field envelope is the I/O contract; model
routing (cheap for routine drafts, premium for high-stakes work-orders) lives
behind the interface to protect gross margin.

## Non-negotiables when integrating
- High-risk actions stay human-approved.
- Every external call logs an auditable ledger event.
- Sensitive fields (prices, supplier identities) can be redacted before any
  external request (`PRIVACY_NOTES.md`).
- Each integration ships with its own error/empty/blocked UI states
  (already designed in `components.js`).
