package com.atlaz.ai

import com.atlaz.domain.model.*
import com.atlaz.ledger.TradeLoopLedger
import com.atlaz.tools.TradeToolRegistry

/**
 * Deterministic mock implementation of [TradeAiService]. Mirrors the runnable
 * Web prototype's ai.js exactly. Every method builds a 13-field envelope and
 * appends a ledger event. No network calls; no real side effects.
 */
class MockTradeAiService(
    private val ledger: TradeLoopLedger,
    private val tools: TradeToolRegistry,
    private val now: () -> String = { "2026-06-07T00:00:00Z" }
) : TradeAiService {

    private fun skuOf(opp: ProductOpportunity) = "SKU-" + opp.opportunityId.removePrefix("OPP-")

    private fun envelope(
        sourceType: String,
        payload: String,
        sku: String? = null,
        confidence: Double = 0.8,
        risk: String = "Low",
        assumptions: List<String> = listOf("Mock data; figures are illustrative."),
        userAction: List<String> = emptyList(),
        agentActions: List<String> = emptyList(),
        nextStep: String = "Continue the Trade Loop.",
        disclaimer: String = Disclaimers.AI
    ): AiEnvelope = AiEnvelope(
        schemaVersion = "atlaz.ai.v3",
        generatedAt = now(),
        sourceType = sourceType,
        skuPassportId = sku,
        confidenceScore = confidence,
        riskLevel = risk,
        assumptions = assumptions,
        userActionRequired = userAction,
        suggestedAgentActions = agentActions,
        nextStep = nextStep,
        disclaimer = disclaimer,
        auditLogPreview = "[mock] $sourceType generated at ${now()}.",
        rawJsonPreview = payload
    )

    private fun log(sku: String?, type: String, summary: String, risk: String = "Low") {
        if (sku != null) ledger.record(sku, type, summary, risk)
    }

    override fun generateOpportunityReport(opp: ProductOpportunity): AiEnvelope {
        val sku = skuOf(opp); log(sku, "opportunity_analyzed", opp.productConcept, opp.riskLevel)
        return envelope("opportunity_report",
            payload = "{painPoint, whyNow, persona, hooks, testBudget=${opp.testBudget}, margin=${opp.estimatedMargin}}",
            sku = sku, confidence = opp.confidenceScore, risk = opp.riskLevel,
            userAction = listOf("Create SKU Passport", "Match suppliers"),
            agentActions = listOf("CREATE_RFQ", "GENERATE_LISTING", "CALCULATE_LANDED_COST"),
            nextStep = "Create a SKU Passport to start the Trade Loop.")
    }

    override fun createSkuPassport(opp: ProductOpportunity): AiEnvelope {
        val sku = skuOf(opp); log(sku, "sku_passport_created", opp.productConcept, opp.riskLevel)
        return envelope("sku_passport", "{skuPassportId=$sku, stage=created}", sku,
            userAction = listOf("Match suppliers", "Run compliance route"),
            nextStep = "Match suppliers for this SKU Passport.")
    }

    override fun recommendSuppliers(opp: ProductOpportunity): AiEnvelope {
        val sku = skuOf(opp); val list = tools.supplierDatabaseTool.query(opp.opportunityId)
        log(sku, "suppliers_matched", "${list.size} suppliers")
        return envelope("supplier_recommendations", "{matched=${list.size}}", sku,
            agentActions = listOf("CREATE_RFQ", "REQUEST_SUPPLIER_COUNTERQUOTE"),
            nextStep = "Select a supplier or compare quotes.")
    }

    override fun generateSupplierTrustSummary(supplier: Supplier): AiEnvelope =
        envelope("supplier_trust_summary",
            "{trustScore=${supplier.trustScore}, status=${supplier.verificationStatus}}",
            confidence = supplier.trustScore, risk = if (supplier.trustScore < 0.7) "Medium" else "Low",
            disclaimer = Disclaimers.SUPPLIER, nextStep = "Generate RFQ or request verification.")

    override fun generateInquiryEmail(opp: ProductOpportunity, supplier: Supplier): AiEnvelope {
        val sku = skuOf(opp); log(sku, "rfq_generated", "RFQ to ${supplier.factoryName}", "Medium")
        return envelope("inquiry_email", "{to=${supplier.factoryName}, en+zh body}", sku, risk = "Medium",
            agentActions = listOf("CREATE_RFQ"),
            nextStep = "Approve to record the RFQ (no real message is sent in MVP).")
    }

    override fun generateWechatScript(opp: ProductOpportunity, supplier: Supplier): AiEnvelope {
        val sku = skuOf(opp); log(sku, "wechat_script_generated", supplier.factoryName)
        return envelope("wechat_script", "{negotiation script, zh}", sku, nextStep = "Use as a negotiation guide.")
    }

    override fun generateSampleBrief(opp: ProductOpportunity, supplier: Supplier): AiEnvelope {
        val sku = skuOf(opp); log(sku, "sample_brief_generated", supplier.factoryName)
        return envelope("sample_brief", "{spec, qty, acceptance criteria}", sku,
            nextStep = "Send brief and request a sample.")
    }

    override fun generateQuotationComparison(opp: ProductOpportunity): AiEnvelope {
        val sku = skuOf(opp); log(sku, "quotes_compared", opp.opportunityId)
        return envelope("quotation_comparison", "{rows=5, recommendation}", sku,
            nextStep = "Pick a supplier and run the Cash Conversion Score.")
    }

    override fun generateListingDraft(opp: ProductOpportunity): AiEnvelope {
        val sku = skuOf(opp); log(sku, "listing_generated", opp.productConcept, opp.riskLevel)
        return envelope("listing_draft", "{title, bullets, compliance-safe alternatives}", sku, risk = opp.riskLevel,
            userAction = listOf("Review claims", "Run compliance route"),
            agentActions = listOf("GENERATE_LISTING", "BLOCK_HIGH_RISK_CLAIM"),
            nextStep = "Run a Compliance Route Check before publishing.")
    }

    override fun runComplianceRouteCheck(opp: ProductOpportunity): AiEnvelope {
        val sku = skuOf(opp); val risk = opp.complianceRisk
        log(sku, "compliance_route_checked", "$risk risk", risk)
        return envelope("compliance_route", "{required certs, tests, forbidden claims}", sku, risk = risk,
            disclaimer = Disclaimers.COMPLIANCE,
            nextStep = if (risk == "High") "Reposition claims and verify certifications before selling."
            else "Proceed to landed-cost calculation.")
    }

    override fun generateTradeDocument(opp: ProductOpportunity, templateId: String): AiEnvelope {
        val sku = skuOf(opp); log(sku, "document_generated", templateId)
        return envelope("trade_document", "{template=$templateId}", sku, nextStep = "Download / share the document.")
    }

    override fun calculateCashConversionScore(inputs: CashInputs, skuPassportId: String?): AiEnvelope {
        val out = CashEngine.calculate(inputs)
        log(skuPassportId, "cash_conversion_calculated", "decision=${out.decision}",
            if (out.decision == "stop") "High" else "Low")
        return envelope("cash_conversion_score", "{score=${out.cashConversionScore}, decision=${out.decision}}",
            skuPassportId, risk = if (out.decision == "stop") "High" else "Low", disclaimer = Disclaimers.FINANCE,
            agentActions = listOf("CALCULATE_LANDED_COST",
                if (out.decision == "buy") "CREATE_SAMPLE_ORDER" else "REQUEST_SUPPLIER_COUNTERQUOTE"),
            nextStep = out.recommendedNextStep)
    }

    override fun createTradeLoopLedgerEvent(skuPassportId: String, eventType: String, summary: String) =
        ledger.record(skuPassportId, eventType, summary, "Low")

    override fun generateGrowthPlaybook(opp: ProductOpportunity): AiEnvelope {
        val sku = skuOf(opp); log(sku, "growth_playbook_created", opp.creatorAngle)
        return envelope("growth_playbook", "{hooks, channels, test budget, metrics}", sku,
            nextStep = "Run the first experiment and log results.")
    }

    override fun evaluateExperimentResult(experiment: GrowthExperiment): AiEnvelope {
        val m = experiment.metrics
        val decision = when {
            m.refundRate > 0.1 || m.roas < 1 -> "stop"
            m.roas >= 3 && m.conversionRate >= 0.03 -> "reorder"
            m.cac > 15 -> "lower_price"
            m.conversionRate < 0.015 -> "switch_market"
            else -> "iterate_product"
        }
        log(experiment.skuPassportId, "ai_decision_generated", "decision=$decision",
            if (decision == "stop") "High" else "Low")
        return envelope("experiment_evaluation", "{decision=$decision}", experiment.skuPassportId,
            risk = if (decision == "stop") "High" else "Low", confidence = 0.71,
            userAction = listOf("Confirm final decision"), agentActions = listOf("EVALUATE_REORDER"),
            nextStep = "Confirm the human final decision.")
    }

    override fun proposeAgentActions(skuPassportId: String, context: String): AiEnvelope =
        envelope("agent_actions", "{proposed actions, each requires human approval}", skuPassportId,
            risk = "Medium",
            agentActions = listOf("CREATE_RFQ", "GENERATE_LISTING", "CALCULATE_LANDED_COST", "BLOCK_HIGH_RISK_CLAIM"),
            nextStep = "Review and approve/reject each proposed action.")

    override fun exportSkuPassportJson(opp: ProductOpportunity): AiEnvelope {
        val sku = skuOf(opp); log(sku, "human_decision_confirmed", "SKU Passport exported.")
        return envelope("sku_passport_export", "{full SKU Passport JSON}", sku,
            nextStep = "Share or archive the SKU Passport.")
    }
}
