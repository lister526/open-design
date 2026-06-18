package com.atlaz.ai

import com.atlaz.domain.model.ProductOpportunity
import com.atlaz.domain.model.Supplier
import com.atlaz.domain.model.GrowthMetric

/* ============================================================================
 * Atlaz v4 · TradeAiService — the single contract every AI feature speaks.
 *
 * Every method returns an AiEnvelope (the 15-field work-order). This interface
 * is implemented by MockTradeAiService now and a real LLM-backed service later
 * WITHOUT changing the UI / ViewModel layer. That stability is the point.
 * ========================================================================== */
interface TradeAiService {

    /** 1 — Opportunity investment memo from a raw demand signal. */
    fun generateOpportunityReport(opp: ProductOpportunity): AiEnvelope

    /** 2 — Create a SKU Passport seed (the per-SKU compounding record). */
    fun createSkuPassport(opp: ProductOpportunity): AiEnvelope

    /** 3 — Rank a supplier shortlist into A/B/C tiers + roles. */
    fun recommendSuppliers(opp: ProductOpportunity, suppliers: List<Supplier>): AiEnvelope

    /** 4 — Plain-language trust summary for one supplier. */
    fun generateSupplierTrustSummary(supplier: Supplier): AiEnvelope

    /** 5 — Inquiry email (HIGH RISK · human approval required). */
    fun generateInquiryEmail(opp: ProductOpportunity, supplier: Supplier): AiEnvelope

    /** 6 — WeChat / IM negotiation script. */
    fun generateWechatScript(opp: ProductOpportunity, supplier: Supplier): AiEnvelope

    /** 7 — Sample request brief. */
    fun generateSampleBrief(opp: ProductOpportunity, supplier: Supplier): AiEnvelope

    /** 8 — A/B/C quotation comparison + landed-cost reasoning. */
    fun generateQuotationComparison(opp: ProductOpportunity, suppliers: List<Supplier>): AiEnvelope

    /** 9 — Compliance route check (9 in / 16 out, HIGH RISK if statement). */
    fun runComplianceRouteCheck(opp: ProductOpportunity): AiEnvelope

    /** 10 — Per-platform listing draft (Amazon / Shopify / TikTok Shop). */
    fun generateListingDraft(opp: ProductOpportunity, platform: String): AiEnvelope

    /** 11 — Generate a trade document (PI, PO, packing list...). */
    fun generateTradeDocument(opp: ProductOpportunity, docType: String): AiEnvelope

    /** 12 — Cash Conversion Score from current economics. */
    fun calculateCashConversionScore(opp: ProductOpportunity): AiEnvelope

    /** 13 — Append a Trade Loop Ledger event. */
    fun createTradeLoopLedgerEvent(skuPassportId: String, eventType: String, detail: String): AiEnvelope

    /** 14 — 7/14/30-day growth playbook. */
    fun generateGrowthPlaybook(opp: ProductOpportunity, platform: String): AiEnvelope

    /** 15 — Evaluate a test result → 6 decisions. */
    fun evaluateExperimentResult(opp: ProductOpportunity, metric: GrowthMetric): AiEnvelope

    /** 16 — Propose Agent Actions for a Deal Room (all need approval if high-risk). */
    fun proposeAgentActions(opp: ProductOpportunity): AiEnvelope

    /** 17 — Export the SKU Passport as portable JSON. */
    fun exportSkuPassportJson(opp: ProductOpportunity): AiEnvelope
}
