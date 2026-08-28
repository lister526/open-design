# Data Rights & Privacy Boundaries

A clear line between what Atlaz may use and what it must never touch.

## The merchant's data (owned by the merchant)
- Supplier list and contact details
- Unit prices, quotes, landed costs, margins
- SKU Passports and their full history
- Trade Loop Ledger events
- Cash inputs and Cash Conversion Scores

**Boundary:** Atlaz may **store and process** this to serve the merchant. Atlaz
may **never** sell it, share it with other merchants, or expose it without an
explicit, per-instance approval (it is a high-risk action).

## Data Atlaz may aggregate (with consent)
- Anonymized, aggregated demand signals (e.g. "category X trending in region Y").

**Boundary:** only after de-identification and aggregation, only with consent,
and only such that no individual supplier, price, or merchant is identifiable.

## Data Atlaz must never derive or sell
- Individual supplier pricing tied to a named supplier.
- One merchant's margins revealed to another.
- Raw contact lists as a saleable product.

## User rights
| Right | How |
|---|---|
| Access | View all data in-app |
| Export | SKU Passport JSON export (`exportSkuPassportJson`) |
| Delete | Remove local store; exported shared copies are outside Atlaz control |
| Object | Disable AI processing / opt out of aggregation |
| Consent | Per-action approval for all high-risk operations |

## High-risk operations requiring explicit consent
`send_inquiry, trigger_payment, submit_listing, share_supplier_data,
request_credit_terms, generate_compliance_statement, confirm_order`.

## Production obligations
GDPR/CCPA-class compliance, data minimization, encryption in transit and at
rest, and a real DPA with any model/integration provider. Current build is
all-mock and local (`LEGAL_LIMITATIONS.md`).
