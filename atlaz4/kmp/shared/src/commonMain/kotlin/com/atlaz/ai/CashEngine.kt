package com.atlaz.ai

import kotlin.math.max
import kotlin.math.roundToInt

/* ============================================================================
 * Atlaz v4 · CashEngine — the Cash Conversion Score.
 *
 * The hard question for a small merchant is NOT "what is my gross margin",
 * it is "can I survive the test period without running out of cash before
 * revenue comes back". So break-even is measured against FIXED test costs
 * (ad + tooling + sample + FX buffer), recovered by per-unit contribution,
 * while goods cost is recovered as inventory sells.
 * ========================================================================== */

data class CashInput(
    val sellPriceUsd: Double,
    val landedUnitCostUsd: Double,
    val platformCommissionPct: Double,
    val returnRatePct: Double,
    val moq: Int,
    val adBudgetUsd: Double,
    val toolingFeeUsd: Double,
    val sampleCostUsd: Double,
    val fxBufferPct: Double,
    val availableCashUsd: Double,
    val inventoryPressure: String, // Low / Medium / High
    val fxRisk: String             // Low / Medium / High
)

data class CashResult(
    val grossMarginPct: Double,
    val contributionMarginUsd: Double,
    val contributionPct: Double,
    val fixedCostsUsd: Double,
    val breakEvenUnits: Int,
    val breakEvenRatio: Double,           // breakEvenUnits / moq
    val cashNeededBeforeRevenueUsd: Double,
    val daysToCashRecovery: Int,
    val projectedTestProfitUsd: Double,
    val adBudgetRisk: String,
    val recommendation: String,           // buy / negotiate / test_smaller / stop
    val explanation: String,
    val sensitivityAnalysis: List<String>
)

object CashEngine {

    fun compute(inp: CashInput): CashResult {
        val effSell = inp.sellPriceUsd * (1.0 - inp.returnRatePct / 100.0)
        val commission = inp.sellPriceUsd * (inp.platformCommissionPct / 100.0)
        val contribution = effSell - commission - inp.landedUnitCostUsd
        val contributionPct = if (inp.sellPriceUsd > 0) contribution / inp.sellPriceUsd else 0.0
        val grossMarginPct =
            if (inp.sellPriceUsd > 0) (inp.sellPriceUsd - inp.landedUnitCostUsd) / inp.sellPriceUsd else 0.0

        val fxBuffer = inp.landedUnitCostUsd * inp.moq * (inp.fxBufferPct / 100.0)
        val fixedCosts = inp.adBudgetUsd + inp.toolingFeeUsd + inp.sampleCostUsd + fxBuffer

        val breakEvenUnits = if (contribution > 0) (fixedCosts / contribution).roundToInt() else Int.MAX_VALUE
        val breakEvenRatio = if (inp.moq > 0) breakEvenUnits.toDouble() / inp.moq else 9.99

        val goodsCost = inp.landedUnitCostUsd * inp.moq
        val cashNeeded = goodsCost + fixedCosts
        val daysToRecovery = (14 + (breakEvenRatio * 18).roundToInt()).coerceIn(10, 75)

        val sellThrough = (inp.moq * 0.6).roundToInt()
        val projectedTestProfit = contribution * sellThrough - fixedCosts

        val adRatio = if (inp.sellPriceUsd > 0) inp.adBudgetUsd / (inp.sellPriceUsd * max(1, inp.moq)) else 1.0
        val adBudgetRisk = when {
            adRatio > 0.28 -> "High"
            adRatio > 0.16 -> "Medium"
            else -> "Low"
        }

        val recommendation = when {
            contributionPct <= 0.08 -> "stop"
            breakEvenRatio > 0.85 || adBudgetRisk == "High" -> "negotiate"
            inp.inventoryPressure == "High" || cashNeeded > inp.availableCashUsd || inp.fxRisk == "High" -> "test_smaller"
            else -> "buy"
        }

        val safeQty = max(80, (breakEvenUnits * 1.15).roundToInt())
        val explanation = when (recommendation) {
            "stop" -> "Per-unit contribution is only ${pct(contributionPct)}. After commission and returns this SKU does not cover its own variable cost reliably — do not buy at this price/angle."
            "negotiate" -> "You must sell ${breakEvenUnits} units (${pct(breakEvenRatio)} of the order) just to recover fixed test costs of \$${money(fixedCosts)}. Negotiate unit price or MOQ before committing."
            "test_smaller" -> "Economics work but cash exposure of \$${money(cashNeeded)} is dangerous against \$${money(inp.availableCashUsd)} available. Start with ~${safeQty} units to protect the test budget."
            else -> "Healthy: contribution ${pct(contributionPct)}/unit, break-even ${breakEvenUnits} units (${pct(breakEvenRatio)} of order), projected test profit \$${money(projectedTestProfit)}. Proceed with the planned first order."
        }

        return CashResult(
            grossMarginPct = round2(grossMarginPct),
            contributionMarginUsd = round2(contribution),
            contributionPct = round2(contributionPct),
            fixedCostsUsd = round2(fixedCosts),
            breakEvenUnits = breakEvenUnits,
            breakEvenRatio = round2(breakEvenRatio),
            cashNeededBeforeRevenueUsd = round2(cashNeeded),
            daysToCashRecovery = daysToRecovery,
            projectedTestProfitUsd = round2(projectedTestProfit),
            adBudgetRisk = adBudgetRisk,
            recommendation = recommendation,
            explanation = explanation,
            sensitivityAnalysis = listOf(
                "If unit price drops 10%: contribution → \$${money(contribution + inp.landedUnitCostUsd * 0.10)}.",
                "If returns rise to ${(inp.returnRatePct + 5).roundToInt()}%: contribution → \$${money((inp.sellPriceUsd * (1 - (inp.returnRatePct + 5) / 100.0)) - commission - inp.landedUnitCostUsd)}.",
                "If ad efficiency halves: break-even units → ${(breakEvenUnits * 1.5).roundToInt()}."
            )
        )
    }

    private fun pct(x: Double) = "${(x * 100).roundToInt()}%"
    private fun money(x: Double) = ((x * 100).roundToInt() / 100.0).toString()
    private fun round2(x: Double) = (x * 100).roundToInt() / 100.0
}
