package com.atlaz.ai

import com.atlaz.domain.model.GrowthMetric
import com.atlaz.domain.model.ProductOpportunity
import com.atlaz.domain.model.Supplier

/* ============================================================================
 * Atlaz v4 · MockTradeAiService.
 *
 * Deterministic, demoable implementation of TradeAiService. Returns fully
 * populated 15-field AiEnvelopes built from the SKU's own data — no lorem,
 * no random text. A real LLM-backed service swaps in behind the SAME interface.
 * ========================================================================== */
class MockTradeAiService : TradeAiService {

    private var seq = 0
    private fun envId(t: String): String { seq += 1; return "ENV-$t-$seq" }
    private val now = "2026-06-15T09:00:00Z"

    private fun highRisk(action: String) = AiEnvelope.HIGH_RISK_ACTION_TYPES.contains(action)

    private fun base(
        type: String,
        opp: ProductOpportunity,
        confidence: Double,
        evidence: List<String>,
        assumptions: List<String>,
        risks: List<String>,
        recommendation: String,
        nextActions: List<NextAction>,
        assets: Map<String, String> = emptyMap(),
        approval: Boolean = false,
        disclaimer: String = AiEnvelope.DISCLAIMER_AI,
        input: Map<String, String> = emptyMap()
    ) = AiEnvelope(
        id = envId(type),
        type = type,
        inputSnapshot = input + mapOf(
            "opportunityId" to opp.opportunityId,
            "region" to opp.targetRegion,
            "platform" to opp.platform
        ),
        market = opp.targetRegion,
        platform = opp.platform,
        confidence = confidence,
        evidence = evidence,
        assumptions = assumptions,
        risks = risks,
        recommendation = recommendation,
        nextActions = nextActions,
        generatedAssets = assets,
        humanApprovalRequired = approval,
        legalDisclaimer = disclaimer,
        createdAt = now
    )

    override fun generateOpportunityReport(opp: ProductOpportunity): AiEnvelope = base(
        type = "opportunity_report",
        opp = opp,
        confidence = 0.78,
        evidence = listOf(opp.evidenceSummary, "Demand: ${opp.demandSignal}", "Content: ${opp.contentSignal}"),
        assumptions = listOf("Trend velocity ${opp.trendVelocity} holds 60–90 days", "Landed cost ≈ ${opp.landedCostEstimate}"),
        risks = listOf("Compliance: ${opp.complianceRisk}", "Cash cycle: ${opp.cashCycleRisk}", "Counter-thesis: ${opp.antiThesis}"),
        recommendation = "${opp.decision} — ${opp.whyNow}",
        nextActions = listOf(
            NextAction("create_passport", "Open SKU Deal Room"),
            NextAction("recommend_suppliers", "Match suppliers")
        )
    )

    override fun createSkuPassport(opp: ProductOpportunity): AiEnvelope = base(
        type = "sku_passport",
        opp = opp,
        confidence = 0.82,
        evidence = listOf("Persona: ${opp.targetPersona}", "Price band: ${opp.priceBand}"),
        assumptions = listOf("First test budget ${opp.firstTestBudget}", "First order ${opp.suggestedFirstOrderQty} units"),
        risks = listOf("Return rate est ${opp.returnRateEst}"),
        recommendation = "Passport opened. Every action from here compounds into reusable SKU memory.",
        nextActions = listOf(NextAction("recommend_suppliers", "Build supplier shortlist")),
        assets = mapOf("skuName" to opp.productConcept)
    )

    override fun recommendSuppliers(opp: ProductOpportunity, suppliers: List<Supplier>): AiEnvelope {
        val ranked = suppliers.sortedByDescending { it.qualityConsistencyScore + it.marketFit + it.certificationConfidence }
        return base(
            type = "supplier_shortlist",
            opp = opp,
            confidence = 0.74,
            evidence = ranked.take(3).map { "${it.factoryName} (${it.recommend}) — fit ${it.marketFit}, cert ${it.certificationConfidence}" },
            assumptions = listOf("Supplier-stated metrics unverified until sampling"),
            risks = listOf("At least one high-risk supplier included for price reference only"),
            recommendation = "Shortlist A/B/C ready. Roles guarantee a small-test, a certified, and a scale option.",
            nextActions = listOf(
                NextAction("generate_inquiry", "Draft inquiry (needs approval)", "High"),
                NextAction("compare_quotes", "Open War Room")
            ),
            assets = mapOf("count" to suppliers.size.toString())
        )
    }

    override fun generateSupplierTrustSummary(supplier: Supplier): AiEnvelope = AiEnvelope(
        id = envId("trust_summary"), type = "trust_summary",
        inputSnapshot = mapOf("supplierId" to supplier.supplierId),
        market = supplier.exportMarkets.firstOrNull() ?: "", platform = "",
        confidence = 0.7,
        evidence = listOf("On-time ${supplier.onTimeFulfillmentRate}", "Disputes ${supplier.returnDisputeRate}", "Rating ${supplier.platformRating}"),
        assumptions = listOf("Trust score is dynamic and updates as the ledger grows"),
        risks = listOf("Communication risk: ${supplier.communicationRisk}", supplier.watchOut),
        recommendation = "${supplier.recommend}. Best for: ${supplier.bestFor}.",
        nextActions = listOf(NextAction("generate_inquiry", "Contact (needs approval)", "High")),
        generatedAssets = mapOf("negotiation" to supplier.recommendedNegotiation),
        humanApprovalRequired = false, legalDisclaimer = AiEnvelope.DISCLAIMER_AI, createdAt = now
    )

    override fun generateInquiryEmail(opp: ProductOpportunity, supplier: Supplier): AiEnvelope = base(
        type = "inquiry_email",
        opp = opp, confidence = 0.8,
        evidence = listOf("Targeting ${supplier.factoryName}"),
        assumptions = listOf("Buyer is a small first-time importer"),
        risks = listOf("Sends external communication on your behalf"),
        recommendation = "Inquiry drafted. Review then approve to send.",
        nextActions = listOf(NextAction("send_inquiry", "Approve & send", "High")),
        assets = mapOf(
            "subject" to "Inquiry: ${opp.productConcept} — MOQ, unit price, sample, lead time",
            "body" to "Hello ${supplier.factoryName} team,\n\nWe are sourcing ${opp.productConcept} for ${opp.targetRegion} (${opp.platform}). Please share: 1) MOQ & tiered unit price, 2) sample cost & lead time, 3) certifications (${opp.complianceRisk}), 4) production lead time. We plan an initial test of ${opp.suggestedFirstOrderQty} units.\n\nThank you."
        ),
        approval = true
    )

    override fun generateWechatScript(opp: ProductOpportunity, supplier: Supplier): AiEnvelope = base(
        type = "wechat_script", opp = opp, confidence = 0.76,
        evidence = listOf("Negotiation lever: ${supplier.recommendedNegotiation}"),
        assumptions = listOf("Informal IM channel"),
        risks = listOf("Keep claims factual"),
        recommendation = "Short IM script ready for ${supplier.factoryName}.",
        nextActions = listOf(NextAction("send_inquiry", "Approve to send", "High")),
        assets = mapOf("script" to "您好，我们想做 ${opp.productConcept}，先小批量测试 ${opp.suggestedFirstOrderQty} 件。请问起订量、单价、样品费和打样周期？")
    )

    override fun generateSampleBrief(opp: ProductOpportunity, supplier: Supplier): AiEnvelope = base(
        type = "sample_brief", opp = opp, confidence = 0.79,
        evidence = listOf("Sample lead time ${supplier.sampleLeadTimeDays} days"),
        assumptions = listOf("1–2 samples sufficient to validate"),
        risks = listOf("Sample may differ from bulk"),
        recommendation = "Sample brief ready with acceptance checklist.",
        nextActions = listOf(NextAction("request_sample", "Request sample")),
        assets = mapOf("checklist" to "Material, finish, packaging, weight, function test, ${opp.targetRegion} labeling")
    )

    override fun generateQuotationComparison(opp: ProductOpportunity, suppliers: List<Supplier>): AiEnvelope {
        val rows = suppliers.take(3).map { "${it.factoryName}: \$${it.unitPriceUsd}/unit, MOQ ${it.moq}, lead ${it.productionLeadTimeDays}d" }
        return base(
            type = "quote_comparison", opp = opp, confidence = 0.77,
            evidence = rows,
            assumptions = listOf("Landed cost adds freight + duty + platform fee"),
            risks = listOf("Cheapest unit price is not always lowest landed cost"),
            recommendation = "Compare on landed cost & trust, not sticker price.",
            nextActions = listOf(NextAction("calculate_cash", "Run cash check")),
            assets = mapOf("rows" to rows.joinToString(" | "))
        )
    }

    override fun runComplianceRouteCheck(opp: ProductOpportunity): AiEnvelope {
        val high = opp.complianceRisk.contains("High", true) || opp.targetPersona.contains("baby", true)
        return AiEnvelope(
            id = envId("compliance"), type = "compliance_route",
            inputSnapshot = mapOf(
                "country" to opp.targetRegion, "platform" to opp.platform, "category" to opp.category,
                "persona" to opp.targetPersona, "concept" to opp.productConcept,
                "priceBand" to opp.priceBand, "claimIntent" to "standard marketing claims",
                "channel" to opp.platform, "ageGroup" to (if (high) "vulnerable/child" else "general adult")
            ),
            market = opp.targetRegion, platform = opp.platform,
            confidence = if (high) 0.62 else 0.75,
            evidence = listOf("Region ${opp.targetRegion} + ${opp.platform} category rules", "Stated risk ${opp.complianceRisk}"),
            assumptions = listOf("Rules current as of mock snapshot", "Final responsibility is the seller's"),
            risks = if (high)
                listOf("HIGH RISK category — certification likely mandatory before sale", "Banned/medical claims must be avoided", "Platform may require lab reports")
            else listOf("Standard labeling & truthful-claim requirements"),
            recommendation = if (high)
                "no_go_until_certified — do NOT list until required certifications & test reports are obtained."
            else "go_with_conditions — proceed with correct labeling and avoid restricted keywords.",
            nextActions = if (high)
                listOf(NextAction("obtain_certification", "Plan certification"), NextAction("generate_compliance_statement", "Draft statement", "High"))
            else listOf(NextAction("generate_listing", "Build listing")),
            generatedAssets = mapOf(
                "goNoGo" to if (high) "no_go_until_certified" else "go_with_conditions",
                "restrictedKeywords" to "cure, heal, FDA-approved, medical-grade, 100% safe, antibacterial(unverified)",
                "requiredDocs" to if (high) "Lab test report, certification, declaration of conformity" else "Truthful claim sheet, accurate labeling",
                "saferAlternatives" to "Use 'designed for', 'helps tidy', avoid health claims"
            ),
            humanApprovalRequired = high,
            legalDisclaimer = AiEnvelope.DISCLAIMER_COMPLIANCE,
            createdAt = now
        )
    }

    override fun generateListingDraft(opp: ProductOpportunity, platform: String): AiEnvelope {
        val assets = when (platform.lowercase()) {
            "amazon" -> mapOf(
                "title" to "${opp.productConcept} — ${opp.targetPersona} | Pack of 1",
                "bullets" to "5 keyword-rich benefit bullets; backend search terms; A+ outline",
                "format" to "amazon"
            )
            "shopify" -> mapOf(
                "title" to "${opp.productConcept}",
                "story" to "Brand-led PDP story + SEO meta + collection copy",
                "format" to "shopify"
            )
            else -> mapOf(
                "videoScript" to "0–3s hook, 3–10s problem, 10–20s product, 20–30s CTA for ${opp.productConcept}",
                "creatorBrief" to "3 creators, UGC demo angle, ${opp.targetRegion} audience",
                "caption" to "Short caption + trending-sound suggestion",
                "format" to "tiktok"
            )
        }
        return base(
            type = "listing_draft", opp = opp, confidence = 0.74,
            evidence = listOf("Platform-specific structure for $platform"),
            assumptions = listOf("Imagery produced separately"),
            risks = listOf("Avoid restricted keywords flagged by compliance"),
            recommendation = "Draft for $platform ready. Submit is a high-risk action.",
            nextActions = listOf(NextAction("submit_listing", "Submit listing", "High")),
            assets = assets,
            input = mapOf("platform" to platform)
        )
    }

    override fun generateTradeDocument(opp: ProductOpportunity, docType: String): AiEnvelope = base(
        type = "trade_document", opp = opp, confidence = 0.8,
        evidence = listOf("Template: $docType"),
        assumptions = listOf("Figures from current Deal Room"),
        risks = listOf("Verify incoterms & totals before signing"),
        recommendation = "$docType draft generated.",
        nextActions = listOf(NextAction("export_document", "Export $docType")),
        assets = mapOf("docType" to docType),
        input = mapOf("docType" to docType)
    )

    override fun calculateCashConversionScore(opp: ProductOpportunity): AiEnvelope {
        val (rec, expl) = mockCash(opp)
        return base(
            type = "cash_score", opp = opp, confidence = 0.72,
            evidence = listOf("Price band ${opp.priceBand}", "Est. margin ${opp.estimatedMargin}", "Commission ${opp.platformCommission}"),
            assumptions = listOf("60% sell-through during test", "FX buffer applied"),
            risks = listOf("Cash cycle ${opp.cashCycleRisk}", "Return ${opp.returnRateEst}"),
            recommendation = "$rec — $expl",
            nextActions = listOf(NextAction("adjust_order", "Adjust first order qty")),
            disclaimer = AiEnvelope.DISCLAIMER_FINANCE,
            assets = mapOf("decision" to rec)
        )
    }

    private fun mockCash(opp: ProductOpportunity): Pair<String, String> {
        val danger = opp.cashCycleRisk.contains("High", true)
        return if (danger)
            "test_smaller" to "Cash cycle risk is high; start with ~100 units to protect the \$${opp.firstTestBudget} test budget."
        else "buy" to "Economics support the planned first order of ${opp.suggestedFirstOrderQty} units."
    }

    override fun createTradeLoopLedgerEvent(skuPassportId: String, eventType: String, detail: String): AiEnvelope =
        AiEnvelope(
            id = envId("ledger_event"), type = "ledger_event",
            inputSnapshot = mapOf("skuPassportId" to skuPassportId, "eventType" to eventType),
            market = "", platform = "", confidence = 1.0,
            evidence = listOf(detail), assumptions = emptyList(), risks = emptyList(),
            recommendation = "Event recorded to the Trade Loop Ledger.",
            nextActions = emptyList(), generatedAssets = mapOf("eventType" to eventType),
            humanApprovalRequired = false, legalDisclaimer = AiEnvelope.DISCLAIMER_AI, createdAt = now
        )

    override fun generateGrowthPlaybook(opp: ProductOpportunity, platform: String): AiEnvelope = base(
        type = "growth_playbook", opp = opp, confidence = 0.71,
        evidence = listOf("Content signal ${opp.contentSignal}"),
        assumptions = listOf("Organic + small paid test"),
        risks = listOf("Creative fatigue", "CAC may exceed contribution"),
        recommendation = "7/14/30-day plan with measurable gates.",
        nextActions = listOf(NextAction("launch_test", "Launch 7-day test")),
        assets = mapOf(
            "d7" to "3 creative angles, \$15/day, measure CTR & CVR",
            "d14" to "Double down on best angle, add creator UGC",
            "d30" to "Decide reorder vs pivot on real data"
        ),
        input = mapOf("platform" to platform)
    )

    override fun evaluateExperimentResult(opp: ProductOpportunity, metric: GrowthMetric): AiEnvelope {
        val decision = when {
            metric.refunds > metric.orders / 3 -> "stop"
            metric.cvr < 0.01 && metric.ctr < 0.01 -> "change_market"
            metric.cvr < 0.01 -> "change_angle"
            (metric.cac ?: 999.0) > 25 -> "lower_price"
            metric.ctr < 0.02 -> "modify"
            else -> "scale"
        }
        val expl = when (decision) {
            "stop" -> "Refunds (${metric.refunds}) are too high vs orders (${metric.orders}). Stop and fix product/quality first."
            "change_market" -> "Both CTR and CVR are weak — the audience/market fit is wrong, not the creative."
            "change_angle" -> "Traffic converts poorly — change the content angle/hook."
            "lower_price" -> "CAC (\$${metric.cac}) exceeds healthy range — test a lower price or bundle."
            "modify" -> "CTR is low — refresh hooks/thumbnails before scaling."
            else -> "Metrics are healthy — scale spend on the winning angle."
        }
        return base(
            type = "experiment_eval", opp = opp, confidence = 0.73,
            evidence = listOf("Views ${metric.views}", "CTR ${metric.ctr}", "CVR ${metric.cvr}", "Orders ${metric.orders}", metric.commentsSummary),
            assumptions = listOf("7-day window representative"),
            risks = listOf(metric.customerComplaints),
            recommendation = "$decision — $expl",
            nextActions = listOf(NextAction("write_decision_memo", "Write Decision Memo")),
            assets = mapOf("decision" to decision)
        )
    }

    override fun proposeAgentActions(opp: ProductOpportunity): AiEnvelope {
        val actions = listOf(
            NextAction("send_inquiry", "Send inquiry to top supplier", "High"),
            NextAction("request_sample", "Request sample", "Medium"),
            NextAction("calculate_cash", "Run cash conversion check", "Low")
        )
        return base(
            type = "agent_actions", opp = opp, confidence = 0.7,
            evidence = listOf("Deal Room stage suggests these next moves"),
            assumptions = listOf("Nothing executes without explicit approval"),
            risks = listOf("High-risk actions require human approval"),
            recommendation = "3 next-best actions proposed; high-risk ones are gated.",
            nextActions = actions,
            approval = actions.any { highRisk(it.action) }
        )
    }

    override fun exportSkuPassportJson(opp: ProductOpportunity): AiEnvelope = base(
        type = "passport_export", opp = opp, confidence = 1.0,
        evidence = listOf("Full SKU memory serialized"),
        assumptions = emptyList(),
        risks = listOf("Contains your trade data — share carefully"),
        recommendation = "Portable SKU Passport JSON exported.",
        nextActions = listOf(NextAction("share_supplier_data", "Share with partner", "High")),
        assets = mapOf("json" to "{\"opportunityId\":\"${opp.opportunityId}\",\"sku\":\"${opp.productConcept}\"}")
    )
}
