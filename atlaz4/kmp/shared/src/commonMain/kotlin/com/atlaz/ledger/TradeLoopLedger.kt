package com.atlaz.ledger

import com.atlaz.domain.model.RiskLevel
import com.atlaz.domain.model.TradeLoopLedgerEvent

/* ============================================================================
 * Atlaz v4 · Trade Loop Ledger.
 *
 * Append-only event stream per SKU Passport. Every meaningful action — inquiry
 * sent, quote received, sample approved, order placed, test result logged,
 * reorder decided — is sedimented here. This is what makes Atlaz compound:
 * the ledger IS the reusable trade memory.
 * ========================================================================== */
class TradeLoopLedger(seed: List<TradeLoopLedgerEvent> = emptyList()) {

    private val events = ArrayList<TradeLoopLedgerEvent>().apply { addAll(seed) }
    private val listeners = ArrayList<(TradeLoopLedgerEvent) -> Unit>()
    private var counter = 0

    fun record(
        skuPassportId: String,
        eventType: String,
        actorType: String = "user",
        source: String = "atlaz",
        confidenceScore: Double = 0.8,
        riskLevel: RiskLevel = RiskLevel.LOW,
        userApprovalRequired: Boolean = false,
        evidence: String = "",
        nextAction: String = "",
        auditNote: String = ""
    ): TradeLoopLedgerEvent {
        val ev = TradeLoopLedgerEvent(
            eventId = "LEDG-$skuPassportId-${events.size + 1}",
            skuPassportId = skuPassportId,
            eventType = eventType,
            timestamp = nowStamp(),
            actorType = actorType,
            source = source,
            confidenceScore = confidenceScore,
            riskLevel = riskLevel,
            userApprovalRequired = userApprovalRequired,
            evidence = evidence,
            nextAction = nextAction,
            auditNote = auditNote
        )
        events.add(ev)
        listeners.forEach { it(ev) }
        return ev
    }

    fun forSku(skuPassportId: String): List<TradeLoopLedgerEvent> =
        events.filter { it.skuPassportId == skuPassportId }

    fun recent(n: Int = 12): List<TradeLoopLedgerEvent> = events.takeLast(n).reversed()

    fun all(): List<TradeLoopLedgerEvent> = events.toList()

    fun onRecord(l: (TradeLoopLedgerEvent) -> Unit) { listeners.add(l) }

    private fun nowStamp(): String {
        counter += 1
        return "2026-06-15T09:${(10 + counter % 50).toString().padStart(2, '0')}:00Z"
    }
}
