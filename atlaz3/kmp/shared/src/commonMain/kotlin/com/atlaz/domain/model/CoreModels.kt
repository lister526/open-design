package com.atlaz.domain.model

import kotlinx.serialization.Serializable

/* ============================================================================
 * Atlaz domain models (30 total) — 15 core + 15 moat models.
 * Pure Kotlin, @Serializable so the same models flow through AI, ledger and JSON
 * export. This file holds the 15 CORE models. Moat models live in MoatModels.kt.
 * ========================================================================== */

// 1. ProductOpportunity (23 fields)
@Serializable
data class ProductOpportunity(
    val opportunityId: String,
    val category: String,
    val productConcept: String,
    val targetRegion: String,
    val targetPersona: String,
    val platform: String,
    val priceBand: String,
    val trendVelocity: String,
    val competitionIntensity: String,
    val estimatedMargin: Double,
    val complianceRisk: String,
    val recommendedSupplierRegion: String,
    val evidenceSummary: String,
    val recommendedFirstOrderQty: Int,
    val testBudget: Double,
    val riskLevel: String,
    val confidenceScore: Double,
    val demandSignal: String,
    val seasonality: String,
    val cashConversionPotential: String,
    val complianceComplexity: String,
    val creatorAngle: String,
    val moatNote: String
)

// 2. Supplier (28 fields)
@Serializable
data class Supplier(
    val supplierId: String,
    val opportunityId: String,
    val factoryName: String,
    val factoryRegion: String,
    val mainCategories: List<String>,
    val moq: Int,
    val priceRange: String,
    val sampleLeadTime: String,
    val productionLeadTime: String,
    val certifications: List<String>,
    val exportMarkets: List<String>,
    val onTimeFulfillmentRate: Double,
    val returnDisputeRate: Double,
    val platformRating: Double,
    val yearsInBusiness: Int,
    val recommendedReason: String,
    val riskFlags: List<String>,
    val bestFor: String,
    val paymentTermsMock: String,
    val responseSpeedMock: String,
    val sampleAccuracyScore: Double,
    val moqFlexibilityScore: Double,
    val communicationQuality: Double,
    val verificationStatus: String,
    val trustScore: Double,
    val trustScoreExplanation: String,
    val lastTradeSignal: String,
    val dataConsentStatus: String
)

// 3. MarketPersona
@Serializable
data class MarketPersona(
    val personaId: String,
    val region: String,
    val name: String,
    val buyingBehavior: String,
    val preferredPlatforms: List<String>,
    val priceSensitivity: String,
    val complianceExpectation: String
)

// 4. PlatformRule
@Serializable
data class PlatformRule(
    val platform: String,
    val listingRules: List<String>,
    val prohibitedClaims: List<String>,
    val feeModel: String,
    val payoutCycle: String
)

// 5. ListingDraft
@Serializable
data class ListingDraft(
    val listingId: String,
    val opportunityId: String,
    val title: String,
    val bulletPoints: List<String>,
    val description: String,
    val keywords: List<String>,
    val complianceSafeAlternatives: String,
    val forbiddenClaimsRemoved: List<String>,
    val targetLanguage: String,
    val riskLevel: String
)

// 6. TradeOrder
@Serializable
data class TradeOrder(
    val orderId: String,
    val opportunityId: String,
    val supplierId: String,
    val qty: Int,
    val unitCost: Double,
    val currentStep: String,
    val steps: List<TradeStep>,
    val status: String,
    val createdAt: String
)

// 7. TradeStep
@Serializable
data class TradeStep(
    val key: String,
    val label: String,
    val state: String, // pending | active | done | blocked
    val note: String
)

// 8. SupplierRating
@Serializable
data class SupplierRating(
    val ratingId: String,
    val supplierId: String,
    val criteria: String,
    val score: Double,
    val evidence: String
)

// 9. CashflowEvent
@Serializable
data class CashflowEvent(
    val cashflowEventId: String,
    val skuPassportId: String,
    val direction: String,
    val amountUsd: Double,
    val label: String,
    val occurredAt: String
)

// 10. GrowthExperiment
@Serializable
data class GrowthExperiment(
    val experimentId: String,
    val skuPassportId: String,
    val hypothesis: String,
    val channel: String,
    val budgetUsd: Double,
    val metrics: ExperimentMetrics,
    val status: String
)

// 11. ExperimentMetrics
@Serializable
data class ExperimentMetrics(
    val impressions: Int,
    val ctr: Double,
    val conversionRate: Double,
    val roas: Double,
    val cac: Double,
    val refundRate: Double
)

// 12. DocumentTemplate
@Serializable
data class DocumentTemplate(
    val templateId: String,
    val name: String,
    val purpose: String,
    val fields: List<String>,
    val disclaimer: String
)

// 13. UserPreference
@Serializable
data class UserPreference(
    val identity: String,
    val market: String,
    val platform: String,
    val language: String,
    val currency: String,
    val theme: String,
    val onboarded: Boolean
)

// 14. Plan
@Serializable
data class Plan(
    val planId: String,
    val name: String,
    val priceUsd: Double,
    val features: List<String>,
    val limits: String
)

// 15. RevenueStream
@Serializable
data class RevenueStream(
    val streamId: String,
    val name: String,
    val description: String,
    val stage: String
)
