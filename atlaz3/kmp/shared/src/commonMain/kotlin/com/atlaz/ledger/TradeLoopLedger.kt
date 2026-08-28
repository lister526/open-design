package com.atlaz.ledger

import com.atlaz.domain.model.TradeLoopLedgerEvent

/**
 * TradeLoopLedger — append-only, immutable trade-event ledger and one of the
 * six Atlaz moats. Seeded from mock data, appends runtime events, and notifies
 * listeners (used by view models to reactively refresh timelines).
 *
 * The 15 canonical event types are enumerated in [EventTypes].
 */
class TradeLoopLedger(seed: List<TradeLoopLedgerEvent> = emptyList()) {

    private val events: MutableList<TradeLoopLedgerEvent> = seed.toMutableList()
    private val listeners = mutableListOf<(TradeLoopLedgerEvent) -> Unit>()
    private var counter = 9000

    fun record(
        skuPassportId: String,
        eventType: String,
        summary: String,
        riskLevel: String = "Low",
        userApprovalRequired: Boolean = eventType in EventTypes.approvalEvents
    ): TradeLoopLedgerEvent {
        val ev = TradeLoopLedgerEvent(
            eventId = "EVT-${counter++}",
            skuPassportId = skuPassportId,
            eventType = eventType,
            actorType = EventTypes.actorFor(eventType),
            actorId = EventTypes.actorIdFor(eventType),
            payloadSummary = summary,
            riskLevel = riskLevel,
            userApprovalRequired = userApprovalRequired,
            evidence = "Recorded by Atlaz Trade Loop Ledger (mock).",
            confidenceScore = null,
            timestamp = "2026-06-07T00:00:00Z",
            schemaVersion = "atlaz.ledger.v3"
        )
        events.add(ev)
        listeners.forEach { it(ev) }
        return ev
    }

    fun forSku(skuPassportId: String): List<TradeLoopLedgerEvent> =
        events.filter { it.skuPassportId == skuPassportId }

    fun recent(n: Int = 8): List<TradeLoopLedgerEvent> = events.takeLast(n).reversed()

    fun all(): List<TradeLoopLedgerEvent> = events.toList()

    fun onRecord(listener: (TradeLoopLedgerEvent) -> Unit) { listeners.add(listener) }
}

object EventTypes {
    // 15 canonical event types
    val all = listOf(
        "opportunity_analyzed", "sku_passport_created", "suppliers_matched", "rfq_generated",
        "sample_brief_generated", "quotes_compared", "listing_generated", "compliance_route_checked",
        "cash_conversion_calculated", "sample_inspected", "order_placed", "document_generated",
        "growth_playbook_created", "ai_decision_generated", "human_decision_confirmed"
    )
    val approvalEvents = setOf("rfq_generated", "listing_generated", "ai_decision_generated", "order_placed")

    fun actorFor(type: String) = when (type) {
        "human_decision_confirmed" -> "user"
        "suppliers_matched", "quotes_compared", "compliance_route_checked", "cash_conversion_calculated" -> "tool"
        else -> "ai"
    }
    fun actorIdFor(type: String) = when (actorFor(type)) {
        "user" -> "merchant"
        "tool" -> "tool-registry"
        else -> "atlaz-ai"
    }
}
