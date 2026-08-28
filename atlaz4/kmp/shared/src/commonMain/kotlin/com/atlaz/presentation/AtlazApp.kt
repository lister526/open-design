package com.atlaz.presentation

import androidx.compose.runtime.*
import com.atlaz.presentation.screens.CommandCenterScreen
import com.atlaz.presentation.screens.DealRoomScreen
import com.atlaz.viewmodel.AtlazContainer

/* ============================================================================
 * Atlaz v4 · Root composable. Single entry shared by iOS & Android.
 * Minimal in-app navigation: Command Center <-> Deal Room.
 * ========================================================================== */

@Composable
fun AtlazApp() {
    val container = remember { AtlazContainer() }
    var route by remember { mutableStateOf<AppRoute>(AppRoute.Command) }

    when (val r = route) {
        AppRoute.Command -> CommandCenterScreen(container) { id -> route = AppRoute.DealRoom(id) }
        is AppRoute.DealRoom -> DealRoomScreen(container, r.opportunityId) { route = AppRoute.Command }
    }
}

sealed class AppRoute {
    data object Command : AppRoute()
    data class DealRoom(val opportunityId: String) : AppRoute()
}
