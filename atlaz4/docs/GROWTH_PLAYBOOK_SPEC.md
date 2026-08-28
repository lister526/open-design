# Growth Playbook — Specification

## Purpose
Turn a short-video test into a **decision**. Atlaz produces a 7/14/30-day plan,
then reads the real test result and tells the merchant exactly what to do next.

## The plan
| Window | Goal | Spend | Measure |
|---|---|---|---|
| Day 7 | Validate hook & offer | ~$15/day, 3 creative angles | CTR, CVR |
| Day 14 | Double down on the winning angle | reallocate to best angle + UGC | CVR, CAC |
| Day 30 | Decide reorder vs pivot | scale or cut | profit, refunds |

## Test metrics (GrowthMetric)
`views, clicks, ctr, cvr, orders, refunds, adSpend, cac, commentsSummary,
creatorPerformance, customerComplaints`.

## Decision rules (6 outcomes)
```
if refunds > orders/3                        → stop          (quality/product problem first)
else if cvr < 0.01 and ctr < 0.01            → change_market (wrong audience, not creative)
else if cvr < 0.01                           → change_angle  (traffic doesn't convert)
else if cac > 25                             → lower_price   (acquisition too expensive)
else if ctr < 0.02                           → modify        (refresh hooks/thumbnails)
else                                         → scale         (healthy — scale the winner)
```

Each decision returns an `AiEnvelope` with evidence (the actual metrics),
the recommendation, and a next action to **write a Decision Memo**.

## Decision Memo
The memo records: the data, the decision, the reasoning, and who approved it —
and is written to the Trade Loop Ledger so the next reorder cycle starts from
real history, not memory.

## Mock data
≥12 growth experiments; RECOMMENDED SKUs show healthy metrics (→ scale),
weaker SKUs show poor metrics (→ change_angle / lower_price / stop). The
must-pass home-cleaning SKU produces a clean **scale-or-pivot** decision from
7-day data.
