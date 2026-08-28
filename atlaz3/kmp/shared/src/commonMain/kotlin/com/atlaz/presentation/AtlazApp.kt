package com.atlaz.presentation

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.atlaz.ai.MockTradeAiService
import com.atlaz.data.mock.MockDataProvider
import com.atlaz.ledger.TradeLoopLedger
import com.atlaz.presentation.screens.CommandCenterScreen
import com.atlaz.presentation.screens.RadarScreen
import com.atlaz.viewmodel.AtlazContainer

/**
 * AtlazApp — the Compose Multiplatform root. Hosts the 5-tab scaffold
 * (Radar · Suppliers · Orders · Cashflow · Growth) and wires the dependency
 * container shared across all ViewModels. Rendered identically on iOS and Android.
 */
@Composable
fun AtlazApp() {
    val container = remember {
        val ledger = TradeLoopLedger(MockDataProvider.ledgerSeed())
        val tools = com.atlaz.tools.TradeToolRegistry(MockDataProvider.suppliersByOpp())
        val ai = MockTradeAiService(ledger, tools)
        AtlazContainer(MockDataProvider, ai, ledger)
    }
    var tab by remember { mutableStateOf(0) }
    val tabs = listOf("Radar", "Suppliers", "Orders", "Cashflow", "Growth")

    MaterialTheme {
        Scaffold(
            topBar = { CenterAlignedTopAppBar(title = { Text("Atlaz") }) },
            bottomBar = {
                NavigationBar {
                    tabs.forEachIndexed { i, label ->
                        NavigationBarItem(
                            selected = tab == i,
                            onClick = { tab = i },
                            icon = { Text(label.take(1)) },
                            label = { Text(label) }
                        )
                    }
                }
            }
        ) { padding ->
            Column(
                Modifier.padding(padding).fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                when (tab) {
                    0 -> CommandCenterScreen(container)
                    1 -> RadarScreen(container) // Suppliers/Orders/Cashflow/Growth follow the same pattern
                    else -> Text("${tabs[tab]} — see web prototype for the full interactive screen.")
                }
            }
        }
    }
}
