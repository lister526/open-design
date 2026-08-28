package com.atlaz.designsystem

import androidx.compose.material3.Typography
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

/**
 * Atlaz Design System — named color tokens (shared with the web prototype's CSS),
 * risk-state colors, spacing scale and a status-state enum. iOS-first visual
 * language: clean cards, clear risk colors, generous spacing, SF-style type.
 */
object AtlazColors {
    val AtlazBlue = Color(0xFF1F4FFF)
    val TradeGreen = Color(0xFF0FA958)
    val RiskRed = Color(0xFFE03131)
    val RiskBlocked = Color(0xFF7A1212)
    val WarningAmber = Color(0xFFF59F00)
    val CompliancePurple = Color(0xFF7048E8)
    val CashflowGold = Color(0xFFC08A1E)
    val NeutralGray = Color(0xFF6B7280)
    val CardBackground = Color(0xFFF7F8FA)
    val ElevatedCard = Color(0xFFFFFFFF)
    val InkDark = Color(0xFF0E1525)

    fun forRisk(level: String): Color = when (level.lowercase()) {
        "low" -> TradeGreen
        "medium" -> WarningAmber
        "high" -> RiskRed
        "blocked" -> RiskBlocked
        else -> NeutralGray
    }
}

object Spacing { const val xs = 4; const val sm = 8; const val md = 12; const val lg = 16; const val xl = 24 }

/** 17 UI status states surfaced across screens. */
enum class StatusState {
    LOADING, EMPTY, ERROR, SUCCESS, RISK_LOW, RISK_MEDIUM, RISK_HIGH, RISK_BLOCKED,
    AWAITING_APPROVAL, APPROVED, REJECTED, IN_PROGRESS, DONE, DRAFT, VERIFIED,
    UNVERIFIED, NEEDS_REVIEW
}

object AtlazTypography {
    @Composable fun typography(): Typography = Typography()
}
