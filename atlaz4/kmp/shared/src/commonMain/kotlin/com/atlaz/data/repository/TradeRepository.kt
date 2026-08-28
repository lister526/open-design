package com.atlaz.data.repository

import com.atlaz.data.mock.MockDataProvider
import com.atlaz.domain.model.*
import com.atlaz.ledger.TradeLoopLedger

/* ============================================================================
 * Atlaz v4 · TradeRepository.
 *
 * Single source of truth for the domain. Today it reads MockDataProvider; the
 * real build swaps in an SQLDelight-backed store behind this SAME interface.
 * The live Trade Loop Ledger is held here so new events compound at runtime.
 * ========================================================================== */
class TradeRepository {

    val ledger = TradeLoopLedger(MockDataProvider.ledgerSeed)

    fun opportunities(): List<ProductOpportunity> = MockDataProvider.opportunities

    fun opportunity(id: String): ProductOpportunity? =
        MockDataProvider.opportunities.firstOrNull { it.opportunityId == id }

    fun suppliers(opportunityId: String): List<Supplier> =
        MockDataProvider.suppliers.filter { it.opportunityId == opportunityId }

    fun complianceRoute(opportunityId: String): ComplianceRoute? =
        MockDataProvider.complianceRoutes.firstOrNull { it.opportunityId == opportunityId }

    fun cashScore(opportunityId: String): CashConversionScore? =
        MockDataProvider.cashScores.firstOrNull { it.opportunityId == opportunityId }

    fun growth(opportunityId: String): GrowthExperiment? =
        MockDataProvider.growthExperiments.firstOrNull { it.opportunityId == opportunityId }

    fun agentActions(): List<AgentAction> = MockDataProvider.agentActions

    fun dealRoomIds(): List<String> = MockDataProvider.dealRoomIds

    fun dealRoom(opportunityId: String): DealRoom? = MockDataProvider.dealRoom(opportunityId)

    fun approveAgentAction(action: AgentAction): TradeLoopLedgerEvent =
        ledger.record(
            skuPassportId = action.skuPassportId,
            eventType = "${action.actionType}_approved",
            actorType = "user", riskLevel = action.riskLevel,
            userApprovalRequired = false,
            auditNote = "Approved: ${action.summary}"
        )
}
