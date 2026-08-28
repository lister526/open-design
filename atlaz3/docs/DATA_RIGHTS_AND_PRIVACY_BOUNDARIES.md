# Atlaz — Data Rights & Privacy Boundaries

Atlaz's data network effect is only legitimate (and only defensible) if it is **consent-first**.

## Rights (who owns what)
- **Merchants own** their SKU Passports, Trade Loop Ledger, listings, cash plans and decisions.
- **Suppliers own** their profile and control whether trust signals are shared into the graph.
- **Atlaz** holds only: (a) data the merchant stores in their workspace, and (b) anonymized,
  consented aggregates used to improve shared intelligence.

## The DataRightConsent object
Every aggregation is governed by a `DataRightConsent` record with:
`scope, anonymized, purpose, grantedAt, revocable`. Consent is:
- **Opt-in** (off by default for anything cross-merchant),
- **Anonymized** (no identifying merchant/customer data),
- **Purpose-bound** (used only for the stated purpose),
- **Revocable** (a merchant can withdraw consent; future aggregates exclude them).

## Hard boundaries
- No end-customer PII is collected in the MVP.
- No selling of data to third parties.
- No cross-merchant exposure of private data — only aggregates.
- Tool integrations transmit **only what the user explicitly approves** (Human-approved Agent Actions).
- Compliance/finance outputs are estimates, never guarantees.

## Why this is strategic
Trust is the product. A privacy breach would destroy the network. Consent-first design is both
the ethical and the commercial requirement for a 12–15-year network company.
