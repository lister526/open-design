# Atlaz — Trade Graph Spec

The **Trade Graph** is the union of three compounding structures that make Atlaz a network, not a tool.

## Nodes
- **Merchants** — own SKU Passports and ledgers.
- **SKU Passports** — the hub object; each is a node connecting opportunity, suppliers, compliance, cash, listing and growth.
- **Suppliers** — factories with trust scores.
- **Markets/Platforms** — regions and channels.

## Edges & Signals
- **Trade Loop Ledger events** (15 types) connect a SKU Passport to actions over time.
- **Supplier Trust Signals** connect suppliers to evidence (sample completed, on-time delivery, dispute resolved, fast response, certification uploaded).
- **Market Demand Signals** connect opportunities to demand evidence.
- **Creator Signals** connect opportunities to content angles.

## Why it compounds (data network effect)
1. Each completed loop adds ledger events and (opt-in) supplier signals.
2. More signals → more accurate **Supplier Trust Scores** and **Market Demand Signals** for everyone.
3. Better intelligence → better decisions → more loops → more signals. The flywheel turns.

## Privacy
All cross-merchant aggregation is **anonymized, consented, purpose-bound and revocable**
(`DATA_RIGHTS_AND_PRIVACY_BOUNDARIES.md`). The graph never exposes one merchant's private data to another.

## Schema pointers
- `SupplierTrustSignal`, `TradeLoopLedgerEvent`, `MarketDemandSignal`, `CreatorSignal`, `DataRightConsent` in `DATA_MODEL.md`.
- Trust scoring detail in `SUPPLIER_TRUST_SCORE.md`.
