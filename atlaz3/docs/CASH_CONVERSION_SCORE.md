# Atlaz — Cash Conversion Score

A margin-and-cash engine that turns 18 trade inputs into 20 outputs and a single, unambiguous
decision: **buy / negotiate / test_smaller / stop**. It encodes the financial judgment small
merchants usually learn the hard way — a moat that compounds across SKUs.

## Inputs (18)
`unitCost, moq, qty, domesticFreight, internationalFreight, dutyRate, platformFee, paymentFee,
adBudgetPerUnit, targetPrice, refundRate, returnHandlingCost, fxRate, paymentTerms, inventoryDays,
sampleCost, packagingCost, complianceReserveCost`

## Outputs (20)
`landedUnitCost, grossMargin, grossMarginRate, netMargin, netMarginRate, breakEvenUnits,
cashLocked, cashRecoveryDays, inventoryPressure, adRisk, fxRisk, dutyRisk, returnRisk,
paymentTermRisk, cashConversionScore (0–100), recommendedFirstOrderQty, decision, explanation,
recommendedNextStep, disclaimer`

## Decision logic
```
landed = unitCost + intlPerUnit + domPerUnit + duty + samplePerUnit + packaging + compReservePerUnit
net    = (targetPrice - landed) - platformFee - paymentFee - adBudgetPerUnit
         - targetPrice*refundRate - returnHandling*refundRate
score  = 50 + netRate*120 - refundRate*60 - (recoveryDays/120)*20 - dutyRate*40 - adShare*30   (clamped 0–100)
decision = net<=0 ? stop : score>=70 ? buy : score>=50 ? negotiate : test_smaller
```

## Why it matters
Most small merchants fail not on the product but on **cash**: they over-order, under-price, or
ignore fees/duty/refunds. The Cash Conversion Score makes the kill-or-commit decision explicit,
with a recommended next step, before money is locked.

## Disclaimer
Estimates only. **Atlaz provides no loan commitment and this is not investment, tax, lending,
accounting or financing advice.** See `COMPLIANCE_DISCLAIMER.md`.
