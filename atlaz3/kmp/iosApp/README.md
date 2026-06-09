# Atlaz · iOS App (SwiftUI + Compose Multiplatform)

This is the **iOS-first** shell. The entire UI is written once in Kotlin/Compose
(`shared/src/commonMain`) and hosted in SwiftUI via a thin bridge.

## How it fits together

```
iosApp/iosApp/iOSApp.swift          ← SwiftUI @main App
iosApp/iosApp/ContentView.swift     ← UIViewControllerRepresentable bridge
        │
        ▼
shared/src/iosMain/.../MainViewController.kt   ← ComposeUIViewController { AtlazApp() }
        │
        ▼
shared/src/commonMain/.../presentation/AtlazApp.kt   ← 5-tab Compose UI (shared with Android)
```

## Building (on macOS with Xcode + JDK 17)

1. Open `kmp/` in **Android Studio** (Giraffe+ with the KMP plugin) to let it
   sync Gradle and generate the `Shared` framework.
2. Build the shared framework for iOS:
   ```bash
   ./gradlew :shared:linkDebugFrameworkIosSimulatorArm64
   ```
3. Open `iosApp/iosApp.xcodeproj` (or `.xcworkspace`) in Xcode, set the
   `Shared.framework` search path to the Gradle output, select an iPhone 15
   simulator, and Run.

## If iOS cannot compile in your environment

The brief anticipates this. In that case the deliverables still stand:

- **iOS-native UI design** — see `docs/TECHNICAL_ARCHITECTURE.md` and the
  iPhone-framed **Web Preview** (`web/index.html`), which renders the exact
  iOS layout, navigation and states.
- **Full KMP tree** — `shared/` with all 10 layers, 30 models, 13 ViewModels,
  8 UseCases.
- **Compose UI** — `presentation/AtlazApp.kt` + `presentation/screens/`.
- **SwiftUI shell** — these two `.swift` files.
- **Android entry point** — `androidApp/`.
- **Runnable Web Preview** — the zero-dependency prototype in `web/`, which is
  the canonical, demoable artifact and exercises the full single-SKU trade loop.

> The Web Preview and the KMP code share the **same data, the same AI envelope,
> the same Cash Conversion Score math, the same ledger event types and the same
> 6 moat objects**, so the prototype is a faithful, runnable mirror of the native app.
