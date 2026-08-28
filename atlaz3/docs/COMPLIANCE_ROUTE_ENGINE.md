# Atlaz — Compliance Route Engine

Turns a product/market description into a structured **compliance route** — risk guidance only,
**never legal advice**. It is a moat because it encodes accumulated, market-specific judgment.

## Inputs (9)
1. `productType` 2. `material` 3. `targetRegion` 4. `platform` 5. `claims`
6. `hasElectronics` 7. `contactsFood` 8. `contactsSkin` 9. `targetAgeGroup`

## Outputs (12)
1. `requiredCertifications` 2. `recommendedTests` 3. `requiredDocs` 4. `forbiddenClaims`
5. `labelingRequirements` 6. `riskLevel` 7. `riskReasons` 8. `professionalReviewRequired`
9. `estimatedCertCostUsd` 10. `estimatedLeadTime` 11. `nextSteps` 12. `disclaimer`

## Behavior
- **High-risk** products (health/skin/electronic claims) → `professionalReviewRequired = true`,
  high `riskLevel`, and listing claims are **blocked** (e.g. "cures disease", "medical-grade",
  "guaranteed results").
- Routes recommend **compliance-safe alternative phrasing** for listings.
- Certifications referenced (CE, FCC, RoHS, FDA, LFGB, CPSIA, REACH, ISO9001, BSCI, Sedex, PSE,
  UKCA) are **mock** — Atlaz does not issue or verify them.

## Safety posture
The engine is designed to **reduce risk and force human verification**, not to certify
compliance. Atlaz makes **no compliance guarantee**. See `COMPLIANCE_DISCLAIMER.md`.
