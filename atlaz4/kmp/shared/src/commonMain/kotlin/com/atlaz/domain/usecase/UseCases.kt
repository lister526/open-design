package com.atlaz.domain.usecase

import com.atlaz.ai.AiEnvelope
import com.atlaz.ai.CashEngine
import com.atlaz.ai.CashInput
import com.atlaz.ai.TradeAiService
import com.atlaz.data.repository.TradeRepository
import com.atlaz.domain.model.DealRoom
import com.atlaz.domain.model.ProductOpportunity

/* ============================================================================
 * Atlaz v4 · Use cases — the application logic the ViewModels call.
 * Each maps one user intent to repository + AI + ledger side effects.
 * ========================================================================== */

class GetOpportunitiesUseCase(private val repo: TradeRepository) {
    operator fun invoke(): List<ProductOpportunity> = repo.opportunities()
}

class GetDealRoomUseCase(private val repo: TradeRepository) {
    operator fun invoke(opportunityId: String): DealRoom? = repo.dealRoom(opportunityId)
}

class GenerateOpportunityReportUseCase(
    private val repo: TradeRepository,
    private val ai: TradeAiService
) {
    operator fun invoke(opportunityId: String): AiEnvelope? =
        repo.opportunity(opportunityId)?.let { ai.generateOpportunityReport(it) }
}

class RecommendSuppliersUseCase(
    private val repo: TradeRepository,
    private val ai: TradeAiService
) {
    operator fun invoke(opportunityId: String): AiEnvelope? {
        val opp = repo.opportunity(opportunityId) ?: return null
        return ai.recommendSuppliers(opp, repo.suppliers(opportunityId))
    }
}

class RunComplianceUseCase(
    private val repo: TradeRepository,
    private val ai: TradeAiService
) {
    operator fun invoke(opportunityId: String): AiEnvelope? =
        repo.opportunity(opportunityId)?.let { ai.runComplianceRouteCheck(it) }
}

class GenerateListingUseCase(
    private val repo: TradeRepository,
    private val ai: TradeAiService
) {
    operator fun invoke(opportunityId: String, platform: String): AiEnvelope? =
        repo.opportunity(opportunityId)?.let { ai.generateListingDraft(it, platform) }
}

class CashConversionUseCase(private val repo: TradeRepository) {
    operator fun invoke(input: CashInput) = CashEngine.compute(input)
}

class ProposeAgentActionsUseCase(
    private val repo: TradeRepository,
    private val ai: TradeAiService
) {
    operator fun invoke(opportunityId: String): AiEnvelope? =
        repo.opportunity(opportunityId)?.let { ai.proposeAgentActions(it) }
}

class EvaluateExperimentUseCase(
    private val repo: TradeRepository,
    private val ai: TradeAiService
) {
    operator fun invoke(opportunityId: String): AiEnvelope? {
        val opp = repo.opportunity(opportunityId) ?: return null
        val growth = repo.growth(opportunityId) ?: return null
        return ai.evaluateExperimentResult(opp, growth.metrics)
    }
}

/** Bundle so the platform layer constructs one object. */
class UseCases(repo: TradeRepository, ai: TradeAiService) {
    val getOpportunities = GetOpportunitiesUseCase(repo)
    val getDealRoom = GetDealRoomUseCase(repo)
    val opportunityReport = GenerateOpportunityReportUseCase(repo, ai)
    val recommendSuppliers = RecommendSuppliersUseCase(repo, ai)
    val runCompliance = RunComplianceUseCase(repo, ai)
    val generateListing = GenerateListingUseCase(repo, ai)
    val cash = CashConversionUseCase(repo)
    val proposeAgentActions = ProposeAgentActionsUseCase(repo, ai)
    val evaluateExperiment = EvaluateExperimentUseCase(repo, ai)
}
