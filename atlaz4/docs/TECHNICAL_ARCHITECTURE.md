# Technical Architecture

## Targets
- **Primary:** iOS (Kotlin Multiplatform + Compose Multiplatform, hosted by a
  thin SwiftUI shell).
- **Optional:** Android (same shared Compose UI).
- **Demoable mirror:** zero-dependency vanilla-JS web prototype (deployed, but
  NOT a replacement for the app).

## Layering
```
SwiftUI shell (iOS)  /  Android Activity (optional)
        │  hosts
Compose Multiplatform UI  (presentation/, screens/)
        │  observes
ViewModels (StateFlow)        viewmodel/
        │  call
Use Cases                      domain/usecase/
        │  orchestrate
Repository  ──► Tool Adapter layer (7 adapters, mock)   tools/
        │                 │
   Domain models     AI Service (TradeAiService → MockTradeAiService)
   (21 models)            │  every output = AiEnvelope (15 fields)
        │            CashEngine
   Trade Loop Ledger (append-only events)   ledger/
        │
   Persistence: SQLDelight (chosen over Room) + DataStore (prefs)
```

## Why SQLDelight over Room
Room is Android-only. Atlaz is **iOS-first** and multiplatform, so persistence
must run on iOS and Android from one schema. **SQLDelight** is multiplatform
(native driver on iOS, Android driver on Android), gives compile-time-checked
SQL, and keeps the data layer in `commonMain`. DataStore is used for simple
preferences (UI language, AI language, currency, onboarding flag).

## The AI envelope as the contract
Every AI feature returns an `AiEnvelope` (15 fields). This is deliberate: it
makes AI output *drive* the UI, state, templates, and Agent Actions instead of
being a chat blob. Swapping the mock service for a real LLM-backed one changes
nothing above the `TradeAiService` interface.

## Tool Adapter layer (7)
`SupplierApiAdapter, LogisticsApiAdapter, PaymentApiAdapter,
ComplianceDatabaseAdapter, AdPlatformAdapter, MarketplaceListingAdapter,
InspectionServiceAdapter`. All `mock=true` today. Real integrations change only
these adapters.

## Human-approval gate
High-risk action types (`send_inquiry, confirm_order, request_credit_terms,
generate_compliance_statement, submit_listing, trigger_payment,
share_supplier_data`) set `humanApprovalRequired = true` and never auto-execute.

## Web mirror architecture
`data.js → i18n.js → ledger.js → ai.js → components.js → screens.js → app.js`,
loaded in order, each attached to `window`/`module`/`global` for both browser
and Node test harness use. No build step, no dependencies — deploys as static
files anywhere.

## i18n & FX
`I18n` holds 7 languages (Arabic RTL), 10 currencies, a mock FX table, and the
`aiOutputLangFor(region)` rule that decouples UI language from AI output language.

## Build/run
- Web: `python3 -m http.server` over `atlaz4/web` (or any static host).
- KMP: standard Gradle (`:shared`, `:androidApp`) + Xcode for the iOS app. The
  KMP code is hand-written and structurally validated; this sandbox has no JDK/
  Gradle/Xcode to compile it.
