# SKU Passport — Schema

## Purpose
The **full, reusable history of one product**. Open it once when you confirm an
opportunity; every action thereafter sediments into it. It is the merchant's
compounding memory for that SKU — the reason the second order is faster and
safer than the first.

## Schema (model #2)
```
SkuPassport {
  skuPassportId      : String          // SKU-4001
  opportunityId      : String          // OPP-4001
  skuName            : String
  category           : String
  targetRegion       : String
  platform           : String
  targetPersona      : String
  currentStage       : TradeStage      // 1 of 15
  overallRisk        : RiskLevel
  leadSupplierId     : String
  leadSupplierTrust  : Int             // 0–100 (from Supplier Trust Graph)
  createdAt          : String
  history            : List<String>    // human-readable milestones
}
```

## Linked records (the Deal Room assembles these around one passport)
- ProductOpportunity (the thesis)
- Suppliers + SupplierRatings (shortlist + trust)
- ComplianceRoute (go/no-go + reusable rules)
- CashConversionScore (buy/negotiate/test_smaller/stop)
- ListingDraft (per platform)
- TradeOrder + steps (15-state flow)
- GrowthExperiment + GrowthMetric (test result)
- TradeLoopLedgerEvent[] (append-only audit)
- Decision Memo (the human + AI decision record)

## Export / portability
`exportSkuPassportJson` produces a portable JSON of the full passport. Sharing it
is a **high-risk action** (`share_supplier_data`) requiring approval, because it
contains supplier and price data.

## Lifecycle
`OPPORTUNITY_CONFIRMED → SUPPLIER_INQUIRY → QUOTE_RECEIVED → SAMPLE_* →
SMALL_BATCH_PO → PRODUCTION → QUALITY_INSPECTION → SHIPPING → CUSTOMS →
DELIVERED → AFTER_SALES → REORDER_DECISION`.

## Why it's a moat
A passport is non-transferable value that lives in Atlaz. The more SKUs a
merchant runs, the larger their irreplaceable library — and the higher the cost
of leaving.
