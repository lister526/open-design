package com.atlaz.ai

import kotlinx.serialization.Serializable

/**
 * Every AI output in Atlaz is wrapped in this 13-field envelope so that the UI,
 * ledger and JSON export all consume a single predictable, auditable shape.
 */
@Serializable
data class AiEnvelope(
    val schemaVersion: String,
    val generatedAt: String,
    val sourceType: String,
    val skuPassportId: String?,
    val confidenceScore: Double,
    val riskLevel: String,
    val assumptions: List<String>,
    val userActionRequired: List<String>,
    val suggestedAgentActions: List<String>,
    val nextStep: String,
    val disclaimer: String,
    val auditLogPreview: String,
    val rawJsonPreview: String
)

object Disclaimers {
    const val AI = "AI-generated draft. Review before acting. Atlaz does not guarantee accuracy, sales, or outcomes."
    const val COMPLIANCE = "Risk guidance only — NOT legal advice. Verify with a qualified professional and official sources before selling."
    const val FINANCE = "Estimates only. Atlaz provides no loan commitment and this is not investment, tax, lending, accounting, or financing advice."
    const val SUPPLIER = "Supplier trust scores are mock estimates from sample signals — verify independently before transacting."
    const val NETWORK = "Mock data for prototype. No real orders, messages, payments or certifications are created."
    const val OWNERSHIP = "All concepts, data models, schemas and designs in this project belong to the founding team / user. This is an original work, not affiliated with any third party."
}
