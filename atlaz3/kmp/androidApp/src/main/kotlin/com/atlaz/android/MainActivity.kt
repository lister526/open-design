package com.atlaz.android

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import com.atlaz.presentation.AtlazApp

/**
 * Android entry point. Hosts the same Compose Multiplatform [AtlazApp] used on iOS.
 * Android is the "future Android" target promised in the brief — code is 100% shared.
 */
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { AtlazApp() }
    }
}
