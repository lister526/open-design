package com.atlaz.domain.model

import kotlinx.serialization.Serializable

/* ============================================================================
 * Atlaz MOAT models (15) — the proprietary, compounding data objects that turn
 * Atlaz from a tool into a 12–15 year network company:
 *   SKU Passport · Trade Loop Ledger · Supplier Trust Graph ·
 *   Compliance Route Engine · Cash Conversion Score · Human-approved Agent Actions
 * ========================================================================== */

// 16. SkuPassport (24 fields) — the portable, compounding record of one SKU's
//     entire trade journey. The core moat object.
@Serializable
data class SkuPassport(
    val skuPassportId: String,
    val opportunityId: String,
    val productConcept: String,
    val category: String,
    val targetRegion: String,
    val platform: String,
    val materialProfileId: String,
    val hsCodeMock: String,
    val originRegion: String,
    val certificationsClaimed: List<String>,
    val complianceRouteId: String,
    val selectedSupplierId: String?,
    val landedUnitCostEstimate: Double,
    val targetPrice: Double,
    val cashConversionScoreId: String?,
    val listingId: String?,
    val tradeStage: String,
    val riskSummary: RiskSummary,
    val ledgerEventCount: Int,
    val dataRightConsentId: String,
    val createdAt: String,
    val updatedAt: String,
    val ownerNote: String,
    val schemaVersion: String
)

@Serializable
data class RiskSummary(
    val complianceRisk: String,
    val cashRisk: String,
    val supplierRisk: String
)

// 17. TradeLoopLedgerEvent (12 fields) — append-only immutable trade-event ledger.
@Serializable
data class TradeLoopLedgerEvent(
    val eventId: String,
    val skuPassportId: String,
    val eventType: String, // one of 15 event types
    val actorType: String, // user | ai | tool | system
    val actorId: String,
    val payloadSummary: String,
    val riskLevel: String,
    val userApprovalRequired: Boolean,
    val evidence: String,
    val confidenceScore: Double?,
    val timestamp: String,
    val schemaVersion: String
)

// 18. SupplierTrustSignal — the edges/signals of the Supplier Trust Graph.
@Serializable
data class SupplierTrustSignal(
    val signalId: String,
    val supplierId: String,
    val signalType: String,
    val timestamp: String,
    val weight: Double,
    val direction: String, // positive | negative
    val evidence: String
)

// 19. ComplianceRoute (9 inputs -> 12 outputs) — Compliance Route Engine result.
@Serializable
data class ComplianceRoute(
    val routeId: String,
    val opportunityId: String,
    // inputs
    val productType: String,
    val material: String,
    val targetRegion: String,
    val platform: String,
    val claims: List<String>,
    val hasElectronics: Boolean,
    val contactsFood: Boolean,
    val contactsSkin: Boolean,
    val targetAgeGroup: String,
    // outputs
    val requiredCertifications: List<String>,
    val recommendedTests: List<String>,
    val requiredDocs: List<String>,
    val forbiddenClaims: List<String>,
    val labelingRequirements: List<String>,
    val riskLevel: String,
    val riskReasons: List<String>,
    val professionalReviewRequired: Boolean,
    val estimatedCertCostUsd: String,
    val estimatedLeadTime: String,
    val nextSteps: List<String>,
    val disclaimer: String
)

// 20. CashConversionScore (18 inputs -> 20 outputs) — margin & cash engine.
@Serializable
data class CashConversionScore(
    val scoreId: String,
    val skuPassportId: String,
    val inputs: CashInputs,
    val outputs: CashOutputs
)

@Serializable
data class CashInputs(
    val unitCost: Double, val moq: Int, val qty: Int,
    val domesticFreight: Double, val internationalFreight: Double, val dutyRate: Double,
    val platformFee: Double, val paymentFee: Double, val adBudgetPerUnit: Double,
    val targetPrice: Double, val refundRate: Double, val returnHandlingCost: Double,
    val fxRate: Double, val paymentTerms: Int, val inventoryDays: Int,
    val sampleCost: Double, val packagingCost: Double, val complianceReserveCost: Double
)

@Serializable
data class CashOutputs(
    val landedUnitCost: Double, val grossMargin: Double, val grossMarginRate: Double,
    val netMargin: Double, val netMarginRate: Double, val breakEvenUnits: String,
    val cashLocked: Double, val cashRecoveryDays: Int, val inventoryPressure: String,
    val adRisk: String, val fxRisk: String, val dutyRisk: String, val returnRisk: String,
    val paymentTermRisk: String, val cashConversionScore: Int, val recommendedFirstOrderQty: Int,
    val decision: String, // buy | negotiate | test_smaller | stop
    val explanation: String, val recommendedNextStep: String, val disclaimer: String
)

// 21. AgentAction (15 fields) — Human-approved Agent Actions schema.
@Serializable
data class AgentAction(
    val actionId: String,
    val skuPassportId: String,
    val actionType: String, // one of 13 action types
    val title: String,
    val rationale: String,
    val inputSummary: String,
    val proposedOutput: String,
    val riskLevel: String,
    val reversible: Boolean,
    val requiresHumanApproval: Boolean,
    val approvalState: String, // proposed | approved | rejected | executed
    val toolToInvoke: String?,
    val sideEffects: List<String>,
    val createdAt: String,
    val schemaVersion: String
)

// 22. HumanApprovalRecord
@Serializable
data class HumanApprovalRecord(
    val recordId: String,
    val actionId: String,
    val decision: String, // approved | rejected
    val approverNote: String,
    val decidedAt: String
)

// 23. QuoteComparison
@Serializable
data class QuoteComparison(
    val comparisonId: String,
    val opportunityId: String,
    val rows: List<QuoteRow>,
    val recommendation: String
)

@Serializable
data class QuoteRow(
    val supplierId: String,
    val factoryName: String,
    val unitPrice: Double,
    val moq: Int,
    val leadTime: String,
    val trustScore: Double,
    val landedEstimate: Double
)

// 24. SampleInspectionResult
@Serializable
data class SampleInspectionResult(
    val inspectionId: String,
    val supplierId: String,
    val skuPassportId: String,
    val visualQuality: String,
    val functionalPass: Boolean,
    val measurementAccuracy: String,
    val defects: List<String>,
    val verdict: String,
    val photosMock: List<String>
)

// 25. CertificationClaim
@Serializable
data class CertificationClaim(
    val claimId: String,
    val skuPassportId: String,
    val certification: String,
    val claimedBy: String,
    val verificationStatus: String, // unverified | partially_verified | verified (mock)
    val evidence: String
)

// 26. MaterialProfile
@Serializable
data class MaterialProfile(
    val materialProfileId: String,
    val primaryMaterial: String,
    val components: List<String>,
    val foodContact: Boolean,
    val skinContact: Boolean,
    val electronics: Boolean,
    val recyclable: Boolean
)

// 27. MarketDemandSignal
@Serializable
data class MarketDemandSignal(
    val signalId: String,
    val opportunityId: String,
    val source: String,
    val metric: String,
    val value: String,
    val trend: String,
    val capturedAt: String
)

// 28. CreatorSignal
@Serializable
data class CreatorSignal(
    val creatorSignalId: String,
    val opportunityId: String,
    val platform: String,
    val angle: String,
    val estimatedReach: String,
    val fitScore: Double
)

// 29. ReorderDecision
@Serializable
data class ReorderDecision(
    val decisionId: String,
    val skuPassportId: String,
    val decision: String, // reorder | iterate | stop | scale
    val basis: String,
    val recommendedQty: Int,
    val confidenceScore: Double
)

// 30. DataRightConsent — the legal/data backbone for the data network effect.
@Serializable
data class DataRightConsent(
    val consentId: String,
    val scope: String,
    val anonymized: Boolean,
    val purpose: String,
    val grantedAt: String,
    val revocable: Boolean
)
