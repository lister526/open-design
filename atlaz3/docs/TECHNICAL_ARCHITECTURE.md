# Atlaz — Technical Architecture

## Stack
- **Kotlin Multiplatform (KMP)** + **Compose Multiplatform** — write-once UI for **iOS-first**, Android-ready.
- **SwiftUI shell** hosts the Compose `MainViewController` on iOS.
- **Runnable Web Preview** — a zero-dependency, vanilla-JS prototype that faithfully mirrors the
  native app (same data, AI envelope, Cash Conversion math, ledger event types, moat objects).

## Layered Architecture (10 layers)
```
presentation  → Compose screens + 5-tab scaffold (AtlazApp)
viewmodel     → 13 MVVM ViewModels exposing immutable UiState (StateFlow)
domain        → 30 models + 8 UseCases (the app's verbs)
data          → TradeRepository (interface) + MockDataProvider (mock impl)
ai            → TradeAiService (17 methods) + 13-field AiEnvelope + CashEngine
tools         → TradeToolRegistry (15 tools, production APIs reserved)
ledger        → TradeLoopLedger (append-only event log) + 15 event types
i18n          → 6 languages, 5 currencies, aiOutputLangFor()
privacy       → consent-first data rights & boundaries
designSystem  → named color tokens, risk states, 17 status states, spacing
```

## Patterns
- **MVVM + Repository + Service + Tool Registry + Event Ledger.**
- ViewModels depend only on UseCases / repo / ledger — never on UI.
- Every AI output is an `AiEnvelope` (13 fields) → consumed identically by UI, ledger and JSON export.
- Every meaningful action appends a `TradeLoopLedgerEvent` → full auditability.
- Mock-now / production-reserved: each of the 15 tools declares credentials, risk, approval
  requirement and stored data so the production swap changes implementations, not signatures.

## iOS Integration Seam
```
iOSApp.swift → ContentView.swift (UIViewControllerRepresentable)
            → MainViewController.kt: ComposeUIViewController { AtlazApp() }
            → presentation/AtlazApp.kt (shared with Android)
```

## Web Preview Architecture
`index.html` loads, in order: `i18n.js → data.js → ledger.js → ai.js → components.js →
screens.js → app.js`. `app.js` owns `Store` (prefs), `Nav` (stack-based navigation + sheets),
and `App` (5-tab scaffold, 4-step onboarding, event delegation, deep-links via `?go=route:id`).

## Testing
- **Integrity harness** (`test/integrity.cjs`): loads all web JS in a DOM-shimmed VM and asserts
  255 invariants (counts, 17 AI methods, 15 tools, 13 envelope fields, 6 moat objects, decision spaces, i18n, ledger).
- **Headless render check** + **Playwright console capture** across 6 languages and deep links → zero console errors.

## Why KMP + Compose
One codebase, native performance, iOS-first per the brief, and a clean path to Android — while
the Web Preview guarantees a runnable, demoable artifact regardless of the build environment.
