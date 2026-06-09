# Atlaz — Supplier Trust Score

A single 0–1 score summarizing how trustworthy a supplier is for a given SKU, with a transparent
explanation and the evidence behind it. In the MVP it is computed from mock signals; in production
it incorporates real, opt-in trade signals (the moat).

## Inputs (Supplier fields, 28 total — key signals)
- `onTimeFulfillmentRate`, `returnDisputeRate`, `platformRating`, `yearsInBusiness`
- `sampleAccuracyScore`, `moqFlexibilityScore`, `communicationQuality`, `responseSpeedMock`
- `certifications`, `verificationStatus`, `exportMarkets`
- `lastTradeSignal`, `dataConsentStatus`

## Scoring (illustrative weights)
```
trust = w1*onTime + w2*(1 - disputeRate) + w3*sampleAccuracy
      + w4*communication + w5*certCoverage + w6*verificationBonus
      + w7*realTradeSignals(future)
```
The MVP uses a deterministic approximation; the explanation string lists the contributing factors
so the score is never a black box.

## Verification tiers (mock)
- **Verified (mock)** — top trust, signals present.
- **Partially verified (mock)** — some evidence.
- **Unverified (mock)** — verify independently before transacting.

## Risk flags
Suppliers surface explicit `riskFlags` (e.g. "Verify certifications before bulk order",
"Higher dispute rate — request inspection") so merchants act with eyes open.

## Disclaimer
Trust scores are **mock estimates** in the prototype and must be independently verified before
transacting. See `COMPLIANCE_DISCLAIMER.md` and `OWNERSHIP_NOTICE.md`.
