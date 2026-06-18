# Legal Limitations & Honest Disclosures

This document exists to make sure Atlaz makes **no false claims**.

## What Atlaz is NOT (as of this build)
- **Not a registered company.** No legal entity named "Atlaz" has been formed.
- **No legal permission, license, or authorization** of any kind has been
  obtained from any government, platform, marketplace, or regulator.
- **No real third-party integrations.** Every Tool Adapter (supplier, logistics,
  payment, compliance database, ad platform, marketplace listing, inspection)
  is **mock** and performs **no network calls** and **no real transactions**.
- **No real AI provider is called in this build.** The AI is a deterministic
  mock implementation behind the `TradeAiService` interface.
- **No real money moves.** Payment/escrow adapters are mock and gated behind
  human approval even in concept.
- **Not legal, tax, financial, customs, or medical advice.**

## What the data is
- All mock data is **original, hand-authored** content created for this project.
- It is **not** scraped from, or representative of, any real supplier, price,
  or marketplace listing. Supplier names, ratings, and figures are fictional.

## Compliance outputs
- Compliance results are **general operational risk signals only**, not legal
  advice. See `COMPLIANCE_DISCLAIMER.md`. The seller is always responsible for
  verifying requirements with qualified professionals before selling.

## Financial outputs
- Cash Conversion Scores and economics are **estimates** for planning only.
  Atlaz provides no loan, credit, or investment commitment.

## Forward-looking statements
- `BUSINESS_PLAN.md`, `MONETIZATION_MODEL.md`, and `GO_TO_MARKET.md` contain
  **planning assumptions and targets**, not promises, projections of actual
  results, or guarantees of revenue.

## Ownership
- Copyright/ownership belongs to the project owner (`OWNERSHIP_NOTICE.md`). This
  is a statement of the owner's rights in the work product, not a claim that any
  trademark has been registered or that any company exists.

## If you take Atlaz to production
You must, at minimum: form a proper legal entity, obtain professional legal and
compliance counsel, implement real and compliant integrations, secure user data
per applicable law (GDPR/CCPA/etc.), and replace every disclaimer-gated mock with
a vetted real service.
