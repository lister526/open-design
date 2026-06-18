package com.atlaz.domain.model

import kotlinx.serialization.Serializable

/* ============================================================================
 * Atlaz v4 · Domain models (21 total across this file + AiEnvelope.kt)
 *
 * These models are the IRREPLACEABLE trade-data assets that compound into the
 * Atlaz moat: SKU Passport, Supplier Trust Graph, Trade Loop Ledger,
 * Compliance Memory and Cash Conversion Score.
 *
 * 1  ProductOpportunity        8  ComplianceCheck       15 GrowthMetric
 * 2  SkuPassport               9  ComplianceRoute       16 TradeLoopLedgerEvent
 * 3  Supplier                 10  ListingDraft          17 AgentAction
 * 4  SupplierRating           11  CashflowEvent         18 UserPreference
 * 5  SupplierTrustSignal      12  CashConversionScore   19 DocumentTemplate
 * 6  Inquiry                  13  GrowthExperiment      20 MarketDemandSignal
 * 7  TradeOrder + step        14  (GrowthExperiment)    21 AiGenerationLog
 *   (TradeOrderStep is #7b)
 * ========================================================================== */

@Serializable
enum class TradeDecision { RECOMMENDED, WATCH, HIGH_RISK_REVIEW }

@Serializable
enum class RiskLevel { LOW, MEDIUM, HIGH }

@Serializable
enum class TradeStage {
    OPPORTUNITY_CONFIRMED, SUPPLIER_INQUIRY, QUOTE_RECEIVED, SAMPLE_REQUESTED,
    SAMPLE_IN_PRODUCTION, SAMPLE_RECEIVED, SAMPLE_FEEDBACK, SMALL_BATCH_PO,
    PRODUCTION, QUALITY_INSPECTION, SHIPPING_QUOTE, CUSTOMS_CLEARANCE,
    DELIVERED, AFTER_SALES, REORDER_DECISION
}

/* 1 — ProductOpportunity (the investment-memo data) */
@Serializable
data class ProductOpportunity(
    val opportunityId: String,
    val scenario: String,
    val category: String,
    val productConcept: String,
    val targetRegion: String,
    val targetPersona: String,
    val platform: String,
    val trendVelocity: String,
    val demandSignal: String,
    val contentSignal: String,
    val competitionIntensity: String,
    val priceBand: String,
    val estimatedMargin: String,
    val landedCostEstimate: String,
    val complianceRisk: String,
    val cashCycleRisk: String,
    val recommendedSupplierRegion: String,
    val firstTestBudget: String,
    val suggestedFirstOrderQty: Int,
    val returnRateEst: String,
    val platformCommission: String,
    val evidenceSummary: String,
    val whyNow: String,
    val antiThesis: String,
    val decision: TradeDecision
)

/* 2 — SkuPassport (full reusable product history) */
@Serializable
data class SkuPassport(
    val skuPassportId: String,
    val opportunityId: String,
    val skuName: String,
    val category: String,
    val targetRegion: String,
    val platform: String,
    val targetPersona: String,
    val currentStage: TradeStage,
    val overallRisk: RiskLevel,
    val leadSupplierId: String,
    val leadSupplierTrust: Int,
    val createdAt: String,
    val history: List<String>
)

/* 3 — Supplier */
@Serializable
data class Supplier(
    val supplierId: String,
    val opportunityId: String,
    val factoryName: String,
    val factoryRegion: String,
    val factoryTag: String,
    val mainCategories: List<String>,
    val moq: Int,
    val unitPriceUsd: Double,
    val priceRange: String,
    val sampleLeadTimeDays: Int,
    val productionLeadTimeDays: Int,
    val certifications: List<String>,
    val exportMarkets: List<String>,
    val onTimeFulfillmentRate: String,
    val returnDisputeRate: String,
    val platformRating: Double,
    val responseSpeedHours: Double,
    val qualityConsistencyScore: Int,
    val communicationRisk: String,
    val certificationConfidence: Int,
    val marketFit: Int,
    val quoteSpeedScore: Int,
    val recommend: String,
    val bestFor: String,
    val watchOut: String,
    val recommendedNegotiation: String
)

/* 4 — SupplierRating (the DYNAMIC trust score output) */
@Serializable
data class SupplierRating(
    val supplierId: String,
    val trustScore: Int,
    val trustTier: String,
    val trustTrend: String, // improving / stable / declining
    val computedAt: String
)

/* 5 — SupplierTrustSignal (append-only feed behind the score) */
@Serializable
data class SupplierTrustSignal(
    val signalId: String,
    val supplierId: String,
    val signalType: String, // quote_returned / sample_consistency / on_time / cert_confidence / dispute / market_fit
    val weight: Double,
    val note: String,
    val observedAt: String
)

/* 6 — Inquiry */
@Serializable
data class Inquiry(
    val inquiryId: String,
    val opportunityId: String,
    val supplierId: String,
    val channel: String, // email / wechat / platform
    val subject: String,
    val body: String,
    val humanApprovalRequired: Boolean = true,
    val status: String = "draft"
)

/* 7 — TradeOrder + 7b TradeOrderStep */
@Serializable
data class TradeOrder(
    val orderId: String,
    val skuPassportId: String,
    val supplierId: String,
    val quantity: Int,
    val unitPriceUsd: Double,
    val incoterm: String,
    val currentStage: TradeStage,
    val steps: List<TradeOrderStep>
)

@Serializable
data class TradeOrderStep(
    val stepId: String,
    val stage: TradeStage,
    val goal: String,
    val aiAssist: String,
    val riskLevel: RiskLevel,
    val documents: List<String>,
    val ledgerEventType: String,
    val done: Boolean
)
