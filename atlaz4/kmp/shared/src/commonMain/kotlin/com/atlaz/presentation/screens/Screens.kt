package com.atlaz.presentation.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.atlaz.ai.AiEnvelope
import com.atlaz.designsystem.AtlazColors
import com.atlaz.domain.model.DealRoom
import com.atlaz.domain.model.ProductOpportunity
import com.atlaz.viewmodel.AtlazContainer

/* ============================================================================
 * Atlaz v4 · Compose Multiplatform screens (iOS-first; runs on Android too).
 *
 * Deal Room-centric: the Command Center surfaces the 5 daily questions and
 * active Deal Rooms; clicking an opportunity opens the full per-SKU Deal Room.
 * ========================================================================== */

@Composable
fun CommandCenterScreen(c: AtlazContainer, onOpenDealRoom: (String) -> Unit) {
    val vm = remember { com.atlaz.viewmodel.CommandCenterViewModel(c) }
    LaunchedEffect(Unit) { vm.load() }
    val state by vm.state.collectAsState()

    LazyColumn(
        modifier = Modifier.fillMaxSize().background(AtlazColors.Canvas).padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item {
            Text("Trade Command Center", fontSize = 24.sp, fontWeight = FontWeight.Bold, color = AtlazColors.Ink)
            Text(state.identity, fontSize = 13.sp, color = AtlazColors.InkSoft)
        }
        item { SectionCard("The 5 daily questions") {
            state.fiveQuestions.forEach { Text("• $it", fontSize = 13.sp, color = AtlazColors.Ink, modifier = Modifier.padding(vertical = 2.dp)) }
        } }
        item { SectionCard("Today's action") {
            Text("${state.pendingAgentActions} agent action(s) awaiting your approval.", fontSize = 13.sp, color = AtlazColors.Ink)
        } }
        item { Text("Active Deal Rooms", fontSize = 16.sp, fontWeight = FontWeight.SemiBold, color = AtlazColors.Ink) }
        items(state.opportunities) { opp ->
            OpportunityRow(opp) { onOpenDealRoom(opp.opportunityId) }
        }
    }
}

@Composable
private fun OpportunityRow(opp: ProductOpportunity, onClick: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth().clickable(onClick = onClick),
        colors = CardDefaults.cardColors(containerColor = AtlazColors.Surface)
    ) {
        Column(Modifier.padding(14.dp)) {
            Text(opp.productConcept, fontSize = 15.sp, fontWeight = FontWeight.SemiBold, color = AtlazColors.Ink)
            Text("${opp.targetRegion} · ${opp.platform} · ${opp.priceBand}", fontSize = 12.sp, color = AtlazColors.InkSoft)
            Spacer(Modifier.height(6.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Pill(opp.decision.name, decisionColor(opp.decision.name))
                Pill("Compliance: ${opp.complianceRisk}", riskColor(opp.complianceRisk))
                Pill("Margin ${opp.estimatedMargin}", AtlazColors.Brand)
            }
        }
    }
}

@Composable
fun DealRoomScreen(c: AtlazContainer, opportunityId: String, onBack: () -> Unit) {
    val vm = remember { com.atlaz.viewmodel.DealRoomViewModel(c) }
    LaunchedEffect(opportunityId) { vm.open(opportunityId); vm.selectModule("thesis") }
    val state by vm.state.collectAsState()
    val room = state.dealRoom ?: run { Text("Loading…"); return }

    val modules = listOf(
        "thesis" to "Opportunity Thesis", "supplier" to "Supplier Shortlist",
        "compliance" to "Compliance Route", "econ" to "Margin & Cash",
        "sample" to "Sample Plan", "listing" to "Listing & Content",
        "order" to "Order Timeline", "growth" to "Growth Experiment",
        "memo" to "Decision Memo", "ledger" to "Ledger"
    )

    Column(Modifier.fillMaxSize().background(AtlazColors.Canvas).padding(16.dp)) {
        Text("← Back", color = AtlazColors.Brand, modifier = Modifier.clickable(onClick = onBack))
        DealRoomHeader(room)
        Spacer(Modifier.height(10.dp))
        LazyColumn(horizontalAlignment = Alignment.Start) {
            item {
                FlowRowModules(modules, state.activeModule) { vm.selectModule(it) }
            }
            item { Spacer(Modifier.height(10.dp)) }
            item { state.lastEnvelope?.let { AiWorkOrderCard(it) } }
        }
    }
}

@Composable
private fun DealRoomHeader(room: DealRoom) {
    val o = room.opportunity
    Card(colors = CardDefaults.cardColors(containerColor = AtlazColors.Surface)) {
        Column(Modifier.padding(14.dp)) {
            Text(o.productConcept, fontSize = 18.sp, fontWeight = FontWeight.Bold, color = AtlazColors.Ink)
            Text("${o.scenario}", fontSize = 12.sp, color = AtlazColors.InkSoft)
            Spacer(Modifier.height(8.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Pill("Stage: ${room.passport?.currentStage?.name ?: "-"}", AtlazColors.Brand)
                Pill("Suppliers ${room.suppliers.size}", AtlazColors.TierB)
                Pill("Cash: ${room.cashScore?.recommendation ?: "-"}", AtlazColors.RiskMed)
            }
        }
    }
}

@Composable
private fun FlowRowModules(modules: List<Pair<String, String>>, active: String, onSelect: (String) -> Unit) {
    Column {
        modules.chunked(2).forEach { pair ->
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                pair.forEach { (key, label) ->
                    val selected = key == active
                    Box(
                        Modifier.weight(1f).clip(RoundedCornerShape(8.dp))
                            .background(if (selected) AtlazColors.Brand else AtlazColors.Surface)
                            .clickable { onSelect(key) }.padding(10.dp)
                    ) {
                        Text(label, fontSize = 12.sp, color = if (selected) Color.White else AtlazColors.Ink)
                    }
                }
                if (pair.size == 1) Spacer(Modifier.weight(1f))
            }
            Spacer(Modifier.height(8.dp))
        }
    }
}

@Composable
fun AiWorkOrderCard(env: AiEnvelope) {
    Card(colors = CardDefaults.cardColors(containerColor = AtlazColors.Surface)) {
        Column(Modifier.padding(14.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("AI Work Order · ${env.type}", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = AtlazColors.Ink)
                Spacer(Modifier.weight(1f))
                if (env.humanApprovalRequired) Pill("Approval required", AtlazColors.RiskHigh)
            }
            Text("Confidence ${(env.confidence * 100).toInt()}% · ${env.market} / ${env.platform}", fontSize = 11.sp, color = AtlazColors.InkSoft)
            Spacer(Modifier.height(8.dp))
            Text(env.recommendation, fontSize = 13.sp, color = AtlazColors.Ink)
            Spacer(Modifier.height(8.dp))
            LabelBlock("Evidence", env.evidence)
            LabelBlock("Assumptions", env.assumptions)
            LabelBlock("Risks", env.risks)
            Spacer(Modifier.height(8.dp))
            Text("Next actions", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = AtlazColors.Ink)
            env.nextActions.forEach {
                Pill("${it.label} (${it.riskLevel})", if (it.riskLevel == "High") AtlazColors.RiskHigh else AtlazColors.Brand)
            }
            Spacer(Modifier.height(8.dp))
            Text(env.legalDisclaimer, fontSize = 10.sp, color = AtlazColors.InkSoft)
        }
    }
}

@Composable
private fun LabelBlock(title: String, items: List<String>) {
    if (items.isEmpty()) return
    Column(Modifier.padding(vertical = 2.dp)) {
        Text(title, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = AtlazColors.Ink)
        items.forEach { Text("• $it", fontSize = 12.sp, color = AtlazColors.InkSoft) }
    }
}

@Composable
private fun SectionCard(title: String, content: @Composable () -> Unit) {
    Card(colors = CardDefaults.cardColors(containerColor = AtlazColors.Surface)) {
        Column(Modifier.padding(14.dp)) {
            Text(title, fontSize = 15.sp, fontWeight = FontWeight.SemiBold, color = AtlazColors.Ink)
            Spacer(Modifier.height(6.dp))
            content()
        }
    }
}

@Composable
private fun Pill(text: String, color: Color) {
    Box(Modifier.clip(RoundedCornerShape(6.dp)).background(color.copy(alpha = 0.12f)).padding(horizontal = 8.dp, vertical = 4.dp)) {
        Text(text, fontSize = 11.sp, color = color)
    }
}

private fun decisionColor(d: String): Color = when (d) {
    "RECOMMENDED" -> AtlazColors.RiskLow
    "HIGH_RISK_REVIEW" -> AtlazColors.RiskHigh
    else -> AtlazColors.RiskMed
}

private fun riskColor(r: String): Color = when {
    r.contains("High", true) -> AtlazColors.RiskHigh
    r.contains("Medium", true) -> AtlazColors.RiskMed
    else -> AtlazColors.RiskLow
}
