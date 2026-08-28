package com.atlaz.android

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import com.atlaz.presentation.AtlazApp

// Atlaz v4 · Android host (optional target). Hosts the shared Compose UI.
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { AtlazApp() }
    }
}
