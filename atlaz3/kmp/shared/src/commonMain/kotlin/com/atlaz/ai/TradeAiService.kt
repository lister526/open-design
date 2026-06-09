package com.atlaz.ai

import com.atlaz.domain.model.*

/**
 * TradeAiService — the 17 AI generation methods that power Atlaz.
 *
 * In the MVP these are deterministic, template-backed mock generators that return
 * structured [AiEnvelope]s and record a [TradeLoopLedgerEvent] for each call. The
 * production implementation (reserved) swaps the body for a real LLM + tool-calling
 * pipeline while keeping these exact signatures, so the rest of the app never changes.
 */
interface TradeAiService {
    fun generateOpportunityReport(opp: ProductOpportunity): AiEnvelope            // 1
    fun createSkuPassport(opp: ProductOpportunity): AiEnvelope                    // 2
    fun recommendSuppliers(opp: ProductOpportunity): AiEnvelope                   // 3
    fun generateSupplierTrustSummary(supplier: Supplier): AiEnvelope              // 4
    fun generateInquiryEmail(opp: ProductOpportunity, supplier: Supplier): AiEnvelope // 5
    fun generateWechatScript(opp: ProductOpportunity, supplier: Supplier): AiEnvelope // 6
    fun generateSampleBrief(opp: ProductOpportunity, supplier: Supplier): AiEnvelope  // 7
    fun generateQuotationComparison(opp: ProductOpportunity): AiEnvelope          // 8
    fun generateListingDraft(opp: ProductOpportunity): AiEnvelope                 // 9
    fun runComplianceRouteCheck(opp: ProductOpportunity): AiEnvelope              // 10
    fun generateTradeDocument(opp: ProductOpportunity, templateId: String): AiEnvelope // 11
    fun calculateCashConversionScore(inputs: CashInputs, skuPassportId: String?): AiEnvelope // 12
    fun createTradeLoopLedgerEvent(skuPassportId: String, eventType: String, summary: String): TradeLoopLedgerEvent // 13
    fun generateGrowthPlaybook(opp: ProductOpportunity): AiEnvelope               // 14
    fun evaluateExperimentResult(experiment: GrowthExperiment): AiEnvelope        // 15
    fun proposeAgentActions(skuPassportId: String, context: String): AiEnvelope   // 16
    fun exportSkuPassportJson(opp: ProductOpportunity): AiEnvelope                // 17
}
