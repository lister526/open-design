# Cash Conversion Score — Specification

## The real question
Not "what is my gross margin" but **"can I survive the test period without
running out of cash before revenue comes back?"** A solo seller with $3,000 dies
from cash timing, not from a slightly thin margin.

## Model (CashEngine)
```
effectiveSell      = sellPrice * (1 - returnRate)
commission         = sellPrice * commissionRate
contribution/unit  = effectiveSell - commission - landedUnitCost
contributionPct    = contribution / sellPrice

fxBuffer           = landedUnitCost * MOQ * fxBufferPct
fixedCosts         = adBudget + toolingFee + sampleCost + fxBuffer
breakEvenUnits     = fixedCosts / contribution         // recover FIXED test costs
breakEvenRatio     = breakEvenUnits / MOQ
cashNeeded         = (landedUnitCost * MOQ) + fixedCosts
projectedTestProfit= contribution * (0.6 * MOQ) - fixedCosts   // 60% sell-through
```
> Goods cost is recovered **as inventory sells**, so it is NOT charged against
> break-even — only the fixed test costs are. This is the key fix that makes the
> decision realistic instead of always "stop".

## Decision logic
```
if contributionPct <= 0.08                         → stop
else if breakEvenRatio > 0.85 or adRisk == High    → negotiate
else if inventoryPressure==High
        or cashNeeded > availableCash
        or fxRisk == High                          → test_smaller   (e.g. ~100 units)
else                                               → buy
```

## Outputs
`grossMargin, contributionMargin, contributionPct, fixedCosts, breakEvenUnits,
breakEvenRatio, cashNeededBeforeRevenue, daysToCashRecovery, projectedTestProfit,
adBudgetRisk, recommendation, explanation, sensitivityAnalysis[]`.

## Sensitivity analysis (always shown)
- If unit price drops 10% → new contribution.
- If returns rise +5% → new contribution.
- If ad efficiency halves → new break-even units.

## Cockpit behavior
Real-time sliders (price, unit cost, commission, return rate, ad budget, MOQ)
recompute the decision live. The must-pass story's home-cleaning SKU returns
**buy** at the planned order; high-cash-risk SKUs return **test_smaller (~100
units)** to protect the $3,000 budget.

## Disclaimer
Estimates only; not financial, lending, tax, or accounting advice
(`COMPLIANCE_DISCLAIMER.md` / `LEGAL_LIMITATIONS.md`).
