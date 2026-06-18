package com.atlaz.viewmodel

import com.atlaz.ai.AiEnvelope
import com.atlaz.ai.MockTradeAiService
import com.atlaz.data.repository.TradeRepository
import com.atlaz.domain.model.DealRoom
import com.atlaz.domain.model.ProductOpportunity
import com.atlaz.domain.usecase.UseCases
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

/* ============================================================================
 * Atlaz v4 · App container + observable state.
 *
 * StateFlow-based so both Compose Multiplatform (iOS/Android) and a SwiftUI
 * shell can observe the same model. No Android-only dependencies here.
 * ========================================================================== */

class AtlazContainer {
    val repository = TradeRepository()
    val ai = MockTradeAiService()
    val useCases = UseCases(repository, ai)
}

data class CommandCenterState(
    val identity: String = "US TikTok Shop new seller",
    val opportunities: List<ProductOpportunity> = emptyList(),
    val activeDealRooms: List<String> = emptyList(),
    val pendingAgentActions: Int = 0,
    val fiveQuestions: List<String> = listOf(
        "What should I do today?",
        "What is worth selling right now?",
        "Who can I trust to make it?",
        "Will this make money without killing my cash?",
        "Is the test working — reorder or pivot?"
    )
)

class CommandCenterViewModel(private val c: AtlazContainer) {
    private val _state = MutableStateFlow(CommandCenterState())
    val state: StateFlow<CommandCenterState> = _state

    fun load() {
        _state.value = CommandCenterState(
            opportunities = c.useCases.getOpportunities(),
            activeDealRooms = c.repository.dealRoomIds(),
            pendingAgentActions = c.repository.agentActions().count { it.status == "pending_approval" }
        )
    }
}

data class DealRoomState(
    val dealRoom: DealRoom? = null,
    val activeModule: String = "thesis",
    val lastEnvelope: AiEnvelope? = null
)

class DealRoomViewModel(private val c: AtlazContainer) {
    private val _state = MutableStateFlow(DealRoomState())
    val state: StateFlow<DealRoomState> = _state

    fun open(opportunityId: String) {
        _state.value = DealRoomState(dealRoom = c.useCases.getDealRoom(opportunityId))
    }

    fun selectModule(module: String) {
        _state.value = _state.value.copy(activeModule = module)
        val id = _state.value.dealRoom?.opportunity?.opportunityId ?: return
        val env = when (module) {
            "thesis" -> c.useCases.opportunityReport(id)
            "supplier" -> c.useCases.recommendSuppliers(id)
            "compliance" -> c.useCases.runCompliance(id)
            "listing" -> c.useCases.generateListing(id, _state.value.dealRoom?.opportunity?.platform ?: "TikTok Shop")
            "growth" -> c.useCases.evaluateExperiment(id)
            else -> c.useCases.proposeAgentActions(id)
        }
        _state.value = _state.value.copy(lastEnvelope = env)
    }
}
