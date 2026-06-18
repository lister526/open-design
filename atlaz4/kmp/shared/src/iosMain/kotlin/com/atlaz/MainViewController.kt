package com.atlaz

import androidx.compose.ui.window.ComposeUIViewController
import com.atlaz.presentation.AtlazApp
import platform.UIKit.UIViewController

/* ============================================================================
 * Atlaz v4 · iOS entry point.
 *
 * Exposes the shared Compose UI as a UIViewController so the SwiftUI shell
 * (ContentView.swift) can host it. iOS is the primary target.
 * ========================================================================== */
fun MainViewController(): UIViewController = ComposeUIViewController { AtlazApp() }
