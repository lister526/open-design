# Supplier Trust Graph — Specification

## Purpose
A **dynamic, evidence-based** trust score per supplier that improves as the
Trade Loop Ledger grows. Not a static star rating — a living score backed by
append-only signals.

## Inputs (SupplierTrustSignal, append-only)
| signalType | What it observes | Typical weight |
|---|---|---|
| quote_returned | Did they quote, how fast | 0.10 |
| sample_consistency | Sample matched spec | 0.25 |
| on_time | Production/shipping on time | 0.20 |
| cert_confidence | Verified certifications | 0.20 |
| dispute | Disputes/returns history | −0.30 |
| market_fit | Fit for target region/platform | 0.15 |

## Score model
```
trustScore = clamp( base
                    + Σ(signal.weight * recencyDecay * confidence) * 100 , 0, 100 )
trustTier  = A (≥85) / B (70–84) / C (55–69) / D (<55)
trustTrend = improving / stable / declining   (slope of last N signals)
```
- **Recency decay:** newer signals weigh more (a 2-year-old on-time record means
  less than last month's).
- **Disputes are penalized** more steeply than positives reward.

## Role spread (mock guarantee)
Every opportunity is seeded with 5 supplier roles so the merchant always sees a
useful spread:
`small-test (recommended_test)`, `certified (recommended_cert)`,
`scale (recommended_scale)`, `balanced (conditional)`,
`high-risk (not_recommended, price reference only)`.

## Why it's a moat
The graph is built from the merchant's *own* execution history. A competitor's
new tool starts at zero; an Atlaz merchant carries a trust graph that gets
sharper with every order. Switching cost compounds.

## Outputs
`SupplierRating { supplierId, trustScore, trustTier, trustTrend, computedAt }`,
surfaced in the Supplier Match list and the War Room A/B/C comparison.
