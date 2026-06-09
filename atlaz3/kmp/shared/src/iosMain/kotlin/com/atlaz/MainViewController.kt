package com.atlaz

import androidx.compose.ui.window.ComposeUIViewController
import com.atlaz.presentation.AtlazApp

/**
 * iOS entry point. SwiftUI hosts this UIViewController via UIViewControllerRepresentable
 * (see iosApp/iosApp/ContentView.swift). This is the iOS-first integration seam:
 * the entire UI is Kotlin/Compose, wrapped in a thin SwiftUI shell.
 */
fun MainViewController() = ComposeUIViewController { AtlazApp() }
