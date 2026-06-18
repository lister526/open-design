package com.atlaz.ai

import kotlinx.serialization.Serializable

/* ============================================================================
 * Atlaz v4 · AiEnvelope — the mandated 15-field JSON work-order.
 * Every AI output is an AiEnvelope. It is not a preview; it drives UI render,
 * state changes, file templates and Agent Actions.
 * ========================================================================== */

@Serializable
data class NextAction(
    val action: String,
    val label: String,
    val riskLevel: String = "Low"
)

@Serializable
data class AiEnvelope(
    val id: String,
    val type: String,
    val inputSnapshot: Map<String, String>,
    val market: String,
    val platform: String,
    val confidence: Double,
    val evidence: List<String>,
    val assumptions: List<String>,
    val risks: List<String>,
    val recommendation: String,
    val nextActions: List<NextAction>,
    val generatedAssets: Map<String, String>, // serialized asset blobs / json
    val humanApprovalRequired: Boolean,
    val legalDisclaimer: String,
    val createdAt: String
) {
    companion object {
        const val DISCLAIMER_AI =
            "AI outputs are for operational assistance only and may contain errors. Verify before acting."
        const val DISCLAIMER_COMPLIANCE =
            "This result is a general operational risk signal only and does not constitute legal advice. " +
            "Before real sales, consult qualified compliance professionals, testing labs, platform rules, " +
            "customs brokers, or local legal counsel."
        const val DISCLAIMER_FINANCE =
            "Estimates only. Atlaz provides no loan commitment and this is not investment, tax, lending, " +
            "accounting, or financing advice."

        /** High-risk action types default to humanApprovalRequired = true. */
        val HIGH_RISK_ACTION_TYPES = listOf(
            "send_inquiry", "confirm_order", "request_credit_terms",
            "generate_compliance_statement", "submit_listing", "trigger_payment",
            "share_supplier_data"
        )
    }
}
