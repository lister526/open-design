package com.atlaz.domain.usecase

import com.atlaz.ai.AiEnvelope
import com.atlaz.ai.TradeAiService
import com.atlaz.data.repository.TradeRepository
import com.atlaz.domain.model.*
import com.atlaz.ledger.TradeLoopLedger

/* ============================================================================
 * 8 domain UseCases — the application's verbs. Each composes the repository, the
 * AI service and the ledger to advance the single-SKU Trade Loop. ViewModels call
 * UseCases, never repositories/services directly.
 * ========================================================================== */

// 1
class StartTradeLoopUseCase(private val ai: TradeAiService, private val repo: TradeRepository) {
    operator fun invoke(opportunityId: String): AiEnvelope? =
        repo.opportunity(opportunityId)?.let { ai.generateOpportunityReport(it) }
}

// 2
class CreateSkuPassportUseCase(private val ai: TradeAiService, private val repo: TradeRepository) {
    operator fun invoke(opportunityId: String): AiEnvelope? =
        repo.opportunity(opportunityId)?.let { ai.createSkuPassport(it) }
}

// 3
class MatchSuppliersUseCase(private val ai: TradeAiService, private val repo: TradeRepository) {
    operator fun invoke(opportunityId: String): Pair<List<Supplier>, AiEnvelope>? =
        repo.opportunity(opportunityId)?.let { repo.suppliers(opportunityId) to ai.recommendSuppliers(it) }
}

// 4
class RunComplianceRouteUseCase(private val ai: TradeAiService, private val repo: TradeRepository) {
    operator fun invoke(opportunityId: String): Pair<ComplianceRoute?, AiEnvelope>? =
        repo.opportunity(opportunityId)?.let { repo.complianceRoute(opportunityId) to ai.runComplianceRouteCheck(it) }
}

// 5
class CalculateCashConversionUseCase(private val ai: TradeAiService, private val repo: TradeRepository) {
    operator fun invoke(opportunityId: String): Pair<CashOutputs, AiEnvelope>? {
        val o = repo.opportunity(opportunityId) ?: return null
        val inputs = repo.cashInputsFor(o)
        val env = ai.calculateCashConversionScore(inputs, "SKU-${o.opportunityId.removePrefix("OPP-")}")
        return com.atlaz.ai.CashEngine.calculate(inputs) to env
    }
}

// 6
class GenerateListingUseCase(private val ai: TradeAiService, private val repo: TradeRepository) {
    operator fun invoke(opportunityId: String): Pair<ListingDraft?, AiEnvelope>? =
        repo.opportunity(opportunityId)?.let { repo.listing(opportunityId) to ai.generateListingDraft(it) }
}

// 7
class ProposeAndApproveAgentActionUseCase(
    private val ai: TradeAiService, private val ledger: TradeLoopLedger
) {
    fun propose(skuPassportId: String, context: String): AiEnvelope = ai.proposeAgentActions(skuPassportId, context)
    fun approve(action: AgentAction, note: String): HumanApprovalRecord {
        ledger.record(action.skuPassportId, "human_decision_confirmed", "Approved ${action.actionType}", action.riskLevel)
        return HumanApprovalRecord("HAR-${action.actionId}", action.actionId, "approved", note, "2026-06-07T00:00:00Z")
    }
    fun reject(action: AgentAction, note: String): HumanApprovalRecord {
        ledger.record(action.skuPassportId, "human_decision_confirmed", "Rejected ${action.actionType}", action.riskLevel)
        return HumanApprovalRecord("HAR-${action.actionId}", action.actionId, "rejected", note, "2026-06-07T00:00:00Z")
    }
}

// 8
class EvaluateAndDecideReorderUseCase(private val ai: TradeAiService, private val repo: TradeRepository) {
    operator fun invoke(experimentId: String): AiEnvelope? =
        repo.growthExperiments().firstOrNull { it.experimentId == experimentId }?.let { ai.evaluateExperimentResult(it) }
}
