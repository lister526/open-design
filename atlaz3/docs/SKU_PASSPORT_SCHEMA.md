# Atlaz — SKU Passport Schema

The **SKU Passport** is the core moat object: a portable, compounding record of one SKU's entire
trade journey. It is the hub all other moat data attaches to, and the artifact a merchant owns,
exports and carries between products and (future) tools.

## Fields (24)
| # | Field | Meaning |
|---|-------|---------|
| 1 | `skuPassportId` | Stable ID (e.g. SKU-2001) |
| 2 | `opportunityId` | Source opportunity |
| 3 | `productConcept` | What it is |
| 4 | `category` | Product category |
| 5 | `targetRegion` | Market |
| 6 | `platform` | Sales channel |
| 7 | `materialProfileId` | Link to MaterialProfile |
| 8 | `hsCodeMock` | Mock HS/customs code |
| 9 | `originRegion` | Manufacturing origin |
| 10 | `certificationsClaimed` | Claimed certs |
| 11 | `complianceRouteId` | Link to ComplianceRoute |
| 12 | `selectedSupplierId` | Chosen supplier |
| 13 | `landedUnitCostEstimate` | From Cash engine |
| 14 | `targetPrice` | Sell price |
| 15 | `cashConversionScoreId` | Link to CashConversionScore |
| 16 | `listingId` | Link to ListingDraft |
| 17 | `tradeStage` | Current loop stage |
| 18 | `riskSummary` | compliance/cash/supplier risk |
| 19 | `ledgerEventCount` | # of ledger events |
| 20 | `dataRightConsentId` | Link to DataRightConsent |
| 21 | `createdAt` | Created timestamp |
| 22 | `updatedAt` | Updated timestamp |
| 23 | `ownerNote` | Merchant note (ownership) |
| 24 | `schemaVersion` | `atlaz.sku.v3` |

## Lifecycle
`created → sourcing → sampling → compliance_checked → cash_scored → listing_drafted →
ordered → growing → decided`. Each transition appends a `TradeLoopLedgerEvent`.

## Export
`exportSkuPassportJson()` produces a portable JSON envelope. The merchant owns it
(`OWNERSHIP_NOTICE.md`) and can archive, share or carry it forward — the heart of switching-cost moat.
