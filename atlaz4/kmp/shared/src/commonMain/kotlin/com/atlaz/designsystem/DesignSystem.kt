package com.atlaz.designsystem

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

/* ============================================================================
 * Atlaz v4 · Design system.
 *
 * Visual language = Shopify clarity + Stripe trust + Alibaba density + Linear
 * speed. NO gradients, NO crypto-dashboard glow. Flat, dense, fast, legible.
 * ========================================================================== */
object AtlazColors {
    val Ink = Color(0xFF101720)        // primary text
    val InkSoft = Color(0xFF5A6675)    // secondary text
    val Line = Color(0xFFE3E8EF)       // hairline borders
    val Surface = Color(0xFFFFFFFF)
    val Canvas = Color(0xFFF6F8FB)     // page background
    val Brand = Color(0xFF1F6FEB)      // single flat accent (trust blue)
    val BrandInk = Color(0xFFFFFFFF)

    val RiskLow = Color(0xFF0B8457)
    val RiskMed = Color(0xFFB7791F)
    val RiskHigh = Color(0xFFD12F2F)

    val TierA = Color(0xFF0B8457)
    val TierB = Color(0xFF1F6FEB)
    val TierC = Color(0xFFB7791F)
    val TierD = Color(0xFF8A94A6)
}

object AtlazSpace {
    val xs = 4.dp
    val sm = 8.dp
    val md = 12.dp
    val lg = 16.dp
    val xl = 24.dp
    val xxl = 32.dp
    val radius = 10.dp
    val radiusSm = 6.dp
}

object AtlazType {
    val display = 26
    val title = 20
    val section = 16
    val body = 14
    val caption = 12
    val mono = 12
}
