package com.atlaz.domain.model

import kotlinx.serialization.Serializable

/* ============================================================================
 * Atlaz v4 · Moat models (continued, #8–#21)
 * ========================================================================== */

/* 8 — ComplianceCheck */
@Serializable
data class ComplianceCheck(
    val complianceCheckId: String,
    val skuPassportId: String,
    val opportunityId: String,
    val riskLevel: RiskLevel,
    val passed: Boolean,
    val note: String
)

/* 9 — ComplianceRoute (reusable Compliance Memory per country/platform/category) */
@Serializable
data class ComplianceRoute(
    val complianceRouteId: String,
    val opportunityId: String,
    val country: String,
    val platform: String,
    val category: String,
    val riskLevel: RiskLevel,
    val goNoGo: String, // go / go_with_conditions / no_go_until_certified
    val certifications: List<String>,
    val requiredDocuments: List<String>,
    val restrictedKeywords: List<String>,
    val saferAlternatives: List<String>,
    val reusableFor: String
)

/* 10 — ListingDraft (per-platform) */
@Serializable
data class ListingDraft(
    val listingDraftId: String,
    val opportunityId: String,
    val platform: String, // Amazon / Shopify / TikTok Shop
    val aiOutputLanguage: String,
    val payloadJson: String, // platform-specific JSON assets
    val bannedKeywordsAvoided: List<String>
)

/* 11 — CashflowEvent */
@Serializable
data class CashflowEvent(
    val cashflowEventId: String,
    val skuPassportId: String,
    val type: String, // outflow_goods / outflow_ad / inflow_sale / refund
    val amountUsd: Double,
    val occurredAt: String
)

/* 12 — CashConversionScore (survive-the-test-period judgment) */
@Serializable
data class CashConversionScore(
    val opportunityId: String,
    val grossMargin: Double,
    val contributionMargin: Double,
    val breakEvenUnits: Int?,
    val cashNeededBeforeRevenue: Double,
    val daysToCashRecovery: Int?,
    val projectedTestProfit: Double,
    val inventoryPressure: RiskLevel,
    val adBudgetRisk: RiskLevel,
    val fxRisk: RiskLevel,
    val tariffRisk: RiskLevel,
    val returnRisk: RiskLevel,
    val recommendation: String, // buy / negotiate / test_smaller / stop
    val explanation: String
)

/* 13 — GrowthExperiment */
@Serializable
data class GrowthExperiment(
    val growthExperimentId: String,
    val opportunityId: String,
    val platform: String,
    val windowDays: Int,
    val metrics: GrowthMetric,
    val status: String
)

/* 15 — GrowthMetric */
@Serializable
data class GrowthMetric(
    val views: Int,
    val clicks: Int,
    val ctr: Double,
    val cvr: Double,
    val orders: Int,
    val refunds: Int,
    val adSpend: Double,
    val cac: Double?,
    val commentsSummary: String,
    val creatorPerformance: String,
    val customerComplaints: String
)

/* 16 — TradeLoopLedgerEvent (append-only) */
@Serializable
data class TradeLoopLedgerEvent(
    val eventId: String,
    val skuPassportId: String,
    val eventType: String,
    val timestamp: String,
    val actorType: String, // user / ai / supplier / system
    val source: String,
    val confidenceScore: Double,
    val riskLevel: RiskLevel,
    val userApprovalRequired: Boolean,
    val evidence: String,
    val nextAction: String,
    val auditNote: String
)

/* 17 — AgentAction (human-approved by default for high-risk) */
@Serializable
data class AgentAction(
    val agentActionId: String,
    val skuPassportId: String,
    val opportunityId: String,
    val actionType: String, // send_inquiry / confirm_order / trigger_payment / ...
    val riskLevel: RiskLevel,
    val humanApprovalRequired: Boolean,
    val reversible: Boolean,
    val status: String, // pending_approval / approved / rejected / executed
    val summary: String,
    val proposedAt: String
)

/* 18 — UserPreference (DataStore-backed in production) */
@Serializable
data class UserPreference(
    val uiLanguage: String = "en",
    val aiOutputLanguage: String = "auto",
    val currency: String = "USD",
    val onboarded: Boolean = false,
    val traderProfile: String = "US TikTok Shop new seller"
)

/* 19 — DocumentTemplate */
@Serializable
data class DocumentTemplate(
    val templateId: String,
    val docType: String,
    val fields: List<String>
)

/* 20 — MarketDemandSignal */
@Serializable
data class MarketDemandSignal(
    val signalId: String,
    val opportunityId: String,
    val region: String,
    val platform: String,
    val trendVelocity: String,
    val demandSignal: String,
    val contentSignal: String,
    val source: String
)

/* 21 — AiGenerationLog */
@Serializable
data class AiGenerationLog(
    val id: String,
    val type: String,
    val createdAt: String
)

/* Deal Room aggregate — assembles ONE SKU's full closed loop (the core view). */
data class DealRoom(
    val opportunity: ProductOpportunity,
    val passport: SkuPassport?,
    val suppliers: List<Supplier>,
    val compliance: ComplianceRoute?,
    val cashScore: CashConversionScore?,
    val growth: GrowthExperiment?,
    val ledger: List<TradeLoopLedgerEvent>,
    val agentActions: List<AgentAction>
)
