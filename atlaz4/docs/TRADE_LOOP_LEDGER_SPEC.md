# Trade Loop Ledger — Specification

## Purpose
An **append-only event stream** per SKU Passport. Every meaningful action —
inquiry sent, quote received, sample approved, order placed, test result logged,
reorder decided — is recorded immutably. The ledger IS the trade memory that
makes Atlaz compound, and it is the audit trail behind every high-risk action.

## Event schema (model #16)
```
TradeLoopLedgerEvent {
  eventId             : String
  skuPassportId       : String
  eventType           : String   // opportunity_confirmed, inquiry_sent, quote_received,
                                  // sample_requested, compliance_checked, order_placed,
                                  // test_logged, reorder_decided, *_approved ...
  timestamp           : String
  actorType           : String   // user / ai / supplier / system
  source              : String
  confidenceScore     : Double
  riskLevel           : RiskLevel
  userApprovalRequired: Boolean
  evidence            : String
  nextAction          : String
  auditNote           : String
}
```

## Rules
1. **Append-only.** Events are never edited or deleted; corrections are new events.
2. **Every high-risk approval writes an event** (`<action>_approved`) with the
   approving actor and an audit note.
3. **AI-authored events** carry `actorType=ai` and a `confidenceScore`.
4. **Ordering** is by timestamp; the API exposes `forSku`, `recent(n)`, `all`.

## Mock seed
≥12 SKUs seeded with 6 events each (opportunity_confirmed, supplier_shortlisted,
inquiry_sent, quote_received, sample_requested, compliance_checked) → ≥60+ events.

## API (web `ledger.js` / KMP `TradeLoopLedger`)
```
record(skuPassportId, eventType, ...) → event
forSku(skuPassportId) → events
recent(n) → newest-first events
all() → events
onRecord(listener)
```

## Why it's a moat
The ledger is a per-merchant, per-SKU history that cannot be re-created
elsewhere. It powers the Supplier Trust Graph, the Decision Memo, and the audit
guarantees that make high-risk automation trustworthy.
