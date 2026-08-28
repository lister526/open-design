import UIKit
import SwiftUI
import Shared

// ============================================================================
// Atlaz v4 · iOS SwiftUI shell.
//
// SwiftUI hosts the shared Compose Multiplatform UI. The SwiftUI layer stays
// thin — it only embeds the Kotlin-produced UIViewController. All product
// logic lives in the shared KMP module.
// ============================================================================

struct ComposeView: UIViewControllerRepresentable {
    func makeUIViewController(context: Context) -> UIViewController {
        MainViewControllerKt.MainViewController()
    }
    func updateUIViewController(_ uiViewController: UIViewController, context: Context) {}
}

struct ContentView: View {
    var body: some View {
        ComposeView()
            .ignoresSafeArea(.keyboard)
            .ignoresSafeArea(edges: .all)
    }
}
