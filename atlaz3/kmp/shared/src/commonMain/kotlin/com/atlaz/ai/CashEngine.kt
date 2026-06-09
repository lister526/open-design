package com.atlaz.ai

import com.atlaz.domain.model.CashInputs
import com.atlaz.domain.model.CashOutputs
import kotlin.math.ceil
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt

/**
 * Cash Conversion Score engine — 18 inputs -> 20 outputs, decision in
 * {buy, negotiate, test_smaller, stop}. Pure function, identical logic to the
 * web prototype's calcCash() so behaviour matches across platforms.
 */
object CashEngine {
    fun calculate(i: CashInputs): CashOutputs {
        val intlPerUnit = i.internationalFreight / max(1, i.qty)
        val domPerUnit = i.domesticFreight / max(1, i.qty)
        val duty = i.unitCost * i.dutyRate
        val landed = round2(i.unitCost + intlPerUnit + domPerUnit + duty +
            i.sampleCost / max(1, i.qty) + i.packagingCost + i.complianceReserveCost / max(1, i.qty))
        val platFee = i.targetPrice * i.platformFee
        val payFee = i.targetPrice * i.paymentFee
        val gross = round2(i.targetPrice - landed)
        val net = round2(gross - platFee - payFee - i.adBudgetPerUnit -
            (i.targetPrice * i.refundRate) - i.returnHandlingCost * i.refundRate)
        val grossR = round3(gross / i.targetPrice)
        val netR = round3(net / i.targetPrice)
        val breakeven = if (net > 0) ceil((i.unitCost * i.qty) / net).toInt().toString() else "n/a"
        val cashLocked = (landed * i.qty)
        val recoveryDays = i.inventoryDays + i.paymentTerms
        var score = 50 + netR * 120 - i.refundRate * 60 - (recoveryDays / 120.0) * 20 -
            (i.dutyRate * 40) - (i.adBudgetPerUnit / max(1.0, i.targetPrice)) * 30
        val s = max(0.0, min(100.0, score.roundToInt().toDouble())).toInt()
        val decision = when {
            net <= 0 -> "stop"
            s >= 70 -> "buy"
            s >= 50 -> "negotiate"
            else -> "test_smaller"
        }
        return CashOutputs(
            landedUnitCost = landed, grossMargin = gross, grossMarginRate = grossR,
            netMargin = net, netMarginRate = netR, breakEvenUnits = breakeven,
            cashLocked = round2(cashLocked), cashRecoveryDays = recoveryDays,
            inventoryPressure = if (i.inventoryDays > 45) "High" else if (i.inventoryDays > 25) "Medium" else "Low",
            adRisk = if (i.adBudgetPerUnit / i.targetPrice > 0.25) "High" else "Medium",
            fxRisk = if (i.fxRate != 1.0) "Medium (FX exposure)" else "Low",
            dutyRisk = if (i.dutyRate > 0.08) "High" else if (i.dutyRate > 0) "Medium" else "Low",
            returnRisk = if (i.refundRate > 0.08) "High" else if (i.refundRate > 0.04) "Medium" else "Low",
            paymentTermRisk = if (i.paymentTerms > 45) "High" else if (i.paymentTerms > 20) "Medium" else "Low",
            cashConversionScore = s,
            recommendedFirstOrderQty = max(50, (i.qty * (if (s >= 70) 1.0 else if (s >= 50) 0.7 else 0.4)).roundToInt()),
            decision = decision,
            explanation = when (decision) {
                "buy" -> "Healthy net margin and acceptable cash recovery — first order is reasonable."
                "negotiate" -> "Margin is workable but tight — negotiate unit cost / MOQ before committing."
                "test_smaller" -> "Cash conversion is weak — test with a smaller quantity first."
                else -> "Net margin is non-positive — do not buy under these assumptions."
            },
            recommendedNextStep = when (decision) {
                "buy" -> "Create a sample order, then place the first test order."
                "negotiate" -> "Request a supplier counter-quote targeting a lower unit cost."
                "test_smaller" -> "Reduce first-order quantity and re-run the Cash Conversion Score."
                else -> "Stop and re-evaluate the opportunity or switch supplier/market."
            },
            disclaimer = Disclaimers.FINANCE
        )
    }

    private fun round2(v: Double) = (v * 100).roundToInt() / 100.0
    private fun round3(v: Double) = (v * 1000).roundToInt() / 1000.0
}
