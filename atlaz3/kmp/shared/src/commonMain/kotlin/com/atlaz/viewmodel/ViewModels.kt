package com.atlaz.viewmodel

import com.atlaz.ai.AiEnvelope
import com.atlaz.ai.TradeAiService
import com.atlaz.data.repository.TradeRepository
import com.atlaz.designsystem.StatusState
import com.atlaz.domain.model.*
import com.atlaz.domain.usecase.*
import com.atlaz.ledger.TradeLoopLedger
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

/* ============================================================================
 * 13 ViewModels (MVVM). Each owns an immutable UiState exposed as a StateFlow.
 * They depend only on UseCases / repository / ledger — never on UI. The same
 * ViewModels drive Compose on both iOS and Android.
 * ========================================================================== */

abstract class BaseViewModel<S>(initial: S) {
    private val _state = MutableStateFlow(initial)
    val state: StateFlow<S> = _state
    protected fun setState(s: S) { _state.value = s }
    val current: S get() = _state.value
}

// Shared container so all 13 VMs can be constructed from one place.
class AtlazContainer(
    val repo: TradeRepository,
    val ai: TradeAiService,
    val ledger: TradeLoopLedger
) {
    val startTradeLoop = StartTradeLoopUseCase(ai, repo)
    val createPassport = CreateSkuPassportUseCase(ai, repo)
    val matchSuppliers = MatchSuppliersUseCase(ai, repo)
    val runCompliance = RunComplianceRouteUseCase(ai, repo)
    val calcCash = CalculateCashConversionUseCase(ai, repo)
    val genListing = GenerateListingUseCase(ai, repo)
    val agentActions = ProposeAndApproveAgentActionUseCase(ai, ledger)
    val reorder = EvaluateAndDecideReorderUseCase(ai, repo)
}

// 1
class CommandCenterViewModel(c: AtlazContainer) : BaseViewModel<CommandCenterViewModel.UiState>(UiState()) {
    data class UiState(
        val status: StatusState = StatusState.LOADING,
        val opportunities: List<ProductOpportunity> = emptyList(),
        val recentEvents: List<TradeLoopLedgerEvent> = emptyList(),
        val highRisk: List<ProductOpportunity> = emptyList()
    )
    init {
        setState(UiState(StatusState.DONE, c.repo.opportunities(), c.ledger.recent(8),
            c.repo.opportunities().filter { it.complianceRisk == "High" }))
    }
}

// 2
class RadarViewModel(c: AtlazContainer) : BaseViewModel<List<ProductOpportunity>>(c.repo.opportunities())

// 3
class OpportunityDetailViewModel(private val c: AtlazContainer) : BaseViewModel<OpportunityDetailViewModel.UiState>(UiState()) {
    data class UiState(val status: StatusState = StatusState.EMPTY, val opp: ProductOpportunity? = null, val report: AiEnvelope? = null)
    fun load(id: String) { val o = c.repo.opportunity(id); setState(UiState(if (o == null) StatusState.ERROR else StatusState.DONE, o, o?.let { c.ai.generateOpportunityReport(it) })) }
}

// 4
class SkuPassportViewModel(private val c: AtlazContainer) : BaseViewModel<SkuPassport?>(null) {
    fun load(skuId: String) = setState(c.repo.skuPassport(skuId))
}

// 5
class SupplierListViewModel(private val c: AtlazContainer) : BaseViewModel<List<Supplier>>(emptyList()) {
    fun load(opportunityId: String) = setState(c.repo.suppliers(opportunityId))
}

// 6
class SupplierDetailViewModel(private val c: AtlazContainer) : BaseViewModel<SupplierDetailViewModel.UiState>(UiState()) {
    data class UiState(val supplier: Supplier? = null, val trust: AiEnvelope? = null, val signals: List<SupplierTrustSignal> = emptyList())
    fun load(supplierId: String) { val s = c.repo.supplier(supplierId); setState(UiState(s, s?.let { c.ai.generateSupplierTrustSummary(it) }, s?.let { c.repo.trustSignals(supplierId) } ?: emptyList())) }
}

// 7
class TrustGraphViewModel(c: AtlazContainer) : BaseViewModel<List<Supplier>>(c.repo.suppliersByOpp().values.flatten().sortedByDescending { it.trustScore })

// 8
class ComplianceViewModel(private val c: AtlazContainer) : BaseViewModel<ComplianceViewModel.UiState>(UiState()) {
    data class UiState(val route: ComplianceRoute? = null, val env: AiEnvelope? = null, val blocked: Boolean = false)
    fun load(opportunityId: String) { val r = c.runCompliance(opportunityId); setState(UiState(r?.first, r?.second, r?.first?.riskLevel == "High")) }
}

// 9
class ListingViewModel(private val c: AtlazContainer) : BaseViewModel<ListingViewModel.UiState>(UiState()) {
    data class UiState(val listing: ListingDraft? = null, val env: AiEnvelope? = null)
    fun load(opportunityId: String) { val r = c.genListing(opportunityId); setState(UiState(r?.first, r?.second)) }
}

// 10
class CashflowViewModel(private val c: AtlazContainer) : BaseViewModel<CashflowViewModel.UiState>(UiState()) {
    data class UiState(val inputs: CashInputs? = null, val outputs: CashOutputs? = null, val env: AiEnvelope? = null)
    fun load(opportunityId: String) {
        val o = c.repo.opportunity(opportunityId) ?: return setState(UiState())
        val inputs = c.repo.cashInputsFor(o); val r = c.calcCash(opportunityId)
        setState(UiState(inputs, r?.first, r?.second))
    }
    fun recalc(inputs: CashInputs, sku: String?) {
        setState(UiState(inputs, com.atlaz.ai.CashEngine.calculate(inputs), c.ai.calculateCashConversionScore(inputs, sku)))
    }
}

// 11
class OrderViewModel(private val c: AtlazContainer) : BaseViewModel<TradeOrder?>(null) {
    fun load(opportunityId: String) = setState(c.repo.order(opportunityId))
}

// 12
class GrowthViewModel(private val c: AtlazContainer) : BaseViewModel<GrowthViewModel.UiState>(UiState()) {
    data class UiState(val experiments: List<GrowthExperiment> = emptyList(), val decision: AiEnvelope? = null)
    init { setState(UiState(c.repo.growthExperiments())) }
    fun evaluate(experimentId: String) = setState(current.copy(decision = c.reorder(experimentId)))
}

// 13
class AgentActionViewModel(private val c: AtlazContainer) : BaseViewModel<AgentActionViewModel.UiState>(UiState()) {
    data class UiState(val actions: List<AgentAction> = emptyList(), val lastDecision: HumanApprovalRecord? = null)
    init { setState(UiState(c.repo.agentActions())) }
    fun approve(a: AgentAction, note: String) = setState(current.copy(lastDecision = c.agentActions.approve(a, note)))
    fun reject(a: AgentAction, note: String) = setState(current.copy(lastDecision = c.agentActions.reject(a, note)))
}
