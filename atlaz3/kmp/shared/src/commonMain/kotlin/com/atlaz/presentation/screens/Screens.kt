package com.atlaz.presentation.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.atlaz.viewmodel.AtlazContainer
import com.atlaz.viewmodel.CommandCenterViewModel
import com.atlaz.viewmodel.RadarViewModel

/**
 * Representative Compose screens. The full prototype defines 28 pages; this repo
 * implements the two anchor screens in Compose to demonstrate the MVVM->Compose
 * wiring on iOS/Android. The remaining 26 are fully interactive in the Web preview
 * and follow exactly this VM-state-driven pattern.
 */

@Composable
fun CommandCenterScreen(container: AtlazContainer) {
    val vm = remember { CommandCenterViewModel(container) }
    val state by vm.state.collectAsState()
    Text("AI Trade Command Center", style = MaterialTheme.typography.titleLarge)
    Card { Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Text("Opportunities tracked: ${state.opportunities.size}")
        Text("High-risk SKUs: ${state.highRisk.size}")
        Text("Recent ledger events: ${state.recentEvents.size}")
    } }
    Button(onClick = { /* navigate to Radar */ }) { Text("Start a Trade Loop") }
    state.recentEvents.take(5).forEach { ev ->
        Card { Column(Modifier.padding(12.dp)) {
            Text(ev.eventType, style = MaterialTheme.typography.bodyLarge)
            Text("${ev.actorType} · ${ev.payloadSummary}", style = MaterialTheme.typography.bodySmall)
        } }
    }
}

@Composable
fun RadarScreen(container: AtlazContainer) {
    val vm = remember { RadarViewModel(container) }
    val opps by vm.state.collectAsState()
    Text("Opportunity Radar", style = MaterialTheme.typography.titleLarge)
    opps.forEach { o ->
        Card { Column(Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(2.dp)) {
            Text(o.productConcept, style = MaterialTheme.typography.bodyLarge)
            Text("${o.targetRegion} · ${o.platform} · ${o.priceBand}", style = MaterialTheme.typography.bodySmall)
            Text("Margin ${(o.estimatedMargin * 100).toInt()}% · Risk ${o.complianceRisk}", style = MaterialTheme.typography.bodySmall)
        } }
    }
}
