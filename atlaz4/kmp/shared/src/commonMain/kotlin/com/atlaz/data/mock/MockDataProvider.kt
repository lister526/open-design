package com.atlaz.data.mock

import com.atlaz.domain.model.*

/* ============================================================================
 * Atlaz v4 · MockDataProvider.
 *
 * Hand-authored, realistic seed data across 8 real scenarios. No lorem.
 * Mirrors the web prototype's data.js so the KMP app demos the SAME story.
 * Minimums: >=18 opportunities, >=90 suppliers (>=5/opp, role-spread),
 * >=12 Deal Rooms, >=8 high-risk compliance cases.
 * ========================================================================== */
object MockDataProvider {

    private val now = "2026-06-15T09:00:00Z"

    /** 8 real scenarios + 10 more to reach >=18 opportunities. */
    val opportunities: List<ProductOpportunity> by lazy { buildOpps() }

    val suppliers: List<Supplier> by lazy {
        opportunities.flatMap { buildSuppliersFor(it) } // 5 role-based suppliers each => 90
    }

    val complianceRoutes: List<ComplianceRoute> by lazy {
        opportunities.map { buildComplianceFor(it) }
    }

    val cashScores: List<CashConversionScore> by lazy {
        opportunities.take(12).map { buildCashFor(it) }
    }

    val growthExperiments: List<GrowthExperiment> by lazy {
        opportunities.take(12).map { buildGrowthFor(it) }
    }

    val ledgerSeed: List<TradeLoopLedgerEvent> by lazy {
        opportunities.take(12).flatMapIndexed { i, opp ->
            val sku = "SKU-${opp.opportunityId.removePrefix("OPP-")}"
            listOf(
                ev(sku, "opportunity_confirmed", i, "user", RiskLevel.LOW),
                ev(sku, "supplier_shortlisted", i, "ai", RiskLevel.LOW),
                ev(sku, "inquiry_sent", i, "user", RiskLevel.MEDIUM),
                ev(sku, "quote_received", i, "supplier", RiskLevel.LOW),
                ev(sku, "sample_requested", i, "user", RiskLevel.MEDIUM),
                ev(sku, "compliance_checked", i, "ai", if (HIGH_RISK_OPPS.contains(opp.opportunityId)) RiskLevel.HIGH else RiskLevel.LOW)
            )
        }
    }

    val agentActions: List<AgentAction> by lazy {
        opportunities.take(8).map { opp ->
            val sku = "SKU-${opp.opportunityId.removePrefix("OPP-")}"
            AgentAction(
                agentActionId = "AGT-${opp.opportunityId}",
                skuPassportId = sku,
                opportunityId = opp.opportunityId,
                actionType = "send_inquiry",
                riskLevel = RiskLevel.HIGH,
                humanApprovalRequired = true,
                reversible = false,
                status = "pending_approval",
                summary = "Send inquiry for ${opp.productConcept} to top-ranked supplier",
                proposedAt = now
            )
        }
    }

    fun dealRoom(opportunityId: String): DealRoom? {
        val opp = opportunities.firstOrNull { it.opportunityId == opportunityId } ?: return null
        val sku = "SKU-${opp.opportunityId.removePrefix("OPP-")}"
        return DealRoom(
            opportunity = opp,
            passport = SkuPassport(
                skuPassportId = sku, opportunityId = opp.opportunityId, skuName = opp.productConcept,
                category = opp.category, targetRegion = opp.targetRegion, platform = opp.platform,
                targetPersona = opp.targetPersona, currentStage = TradeStage.SUPPLIER_INQUIRY,
                overallRisk = if (HIGH_RISK_OPPS.contains(opp.opportunityId)) RiskLevel.HIGH else RiskLevel.MEDIUM,
                leadSupplierId = "SUP-${opp.opportunityId}-2", leadSupplierTrust = 82, createdAt = now,
                history = listOf("Opportunity confirmed", "Suppliers shortlisted", "Inquiry drafted")
            ),
            suppliers = suppliers.filter { it.opportunityId == opp.opportunityId },
            compliance = complianceRoutes.firstOrNull { it.opportunityId == opp.opportunityId },
            cashScore = cashScores.firstOrNull { it.opportunityId == opp.opportunityId },
            growth = growthExperiments.firstOrNull { it.opportunityId == opp.opportunityId },
            ledger = ledgerSeed.filter { it.skuPassportId == sku },
            agentActions = agentActions.filter { it.opportunityId == opp.opportunityId }
        )
    }

    val dealRoomIds: List<String> by lazy { opportunities.take(12).map { it.opportunityId } }

    // ---- builders ----------------------------------------------------------

    private val HIGH_RISK_OPPS = setOf(
        "OPP-4004", "OPP-4005", "OPP-4009", "OPP-4011", "OPP-4013", "OPP-4015", "OPP-4016", "OPP-4018"
    )

    private fun ev(sku: String, type: String, i: Int, actor: String, risk: RiskLevel) =
        TradeLoopLedgerEvent(
            eventId = "LEDG-$sku-$type", skuPassportId = sku, eventType = type,
            timestamp = "2026-06-${(10 + i % 20).toString().padStart(2, '0')}T10:00:00Z",
            actorType = actor, source = "atlaz", confidenceScore = 0.8, riskLevel = risk,
            userApprovalRequired = risk == RiskLevel.HIGH, evidence = "seed", nextAction = "", auditNote = ""
        )

    private fun buildOpps(): List<ProductOpportunity> {
        val rows = listOf(
            // scenario, category, concept, region, persona, platform, comp-risk, cash-risk, priceBand, margin, qty
            S("US TikTok home cleaning", "Home Cleaning", "Refillable spray-mop with microfiber pads", "United States", "Busy renters 25–40", "TikTok Shop", "Medium", "Medium", "$18–$29", "44%", 300, TradeDecision.RECOMMENDED),
            S("UK Shopify pet", "Pet Supplies", "Slow-feeder dog bowl, anti-gulp", "United Kingdom", "Dog owners", "Shopify", "Low", "Low", "£12–£20", "52%", 250, TradeDecision.RECOMMENDED),
            S("DE Amazon kitchen", "Kitchen", "Stackable glass meal-prep containers", "Germany", "Meal-preppers", "Amazon", "Medium", "Medium", "€16–€26", "41%", 400, TradeDecision.RECOMMENDED),
            S("FR baby high-risk", "Baby", "Silicone baby feeding set", "France", "New parents", "Amazon", "High", "High", "€14–€22", "38%", 200, TradeDecision.HIGH_RISK_REVIEW),
            S("SEA beauty", "Beauty", "Vitamin-C serum (topical cosmetic)", "Southeast Asia", "Gen-Z skincare", "TikTok Shop", "High", "Medium", "$9–$16", "55%", 300, TradeDecision.HIGH_RISK_REVIEW),
            S("ME gifts", "Gifts", "Premium dates gift box (non-food packaging)", "Middle East", "Gift buyers", "Shopify", "Medium", "Medium", "د.إ45–د.إ90", "47%", 200, TradeDecision.WATCH),
            S("LatAm wholesale", "Apparel", "Cotton basics bulk pack", "Mexico", "Resellers", "Shopify", "Low", "High", "MX$120–MX$220", "35%", 600, TradeDecision.WATCH),
            S("US boutique restock", "Accessories", "Minimalist crossbody bag", "United States", "Boutique shoppers", "Shopify", "Low", "Low", "$28–$45", "58%", 150, TradeDecision.RECOMMENDED),
            S("US TikTok gadget", "Electronics", "Magnetic phone car mount", "United States", "Commuters", "TikTok Shop", "Medium", "Medium", "$14–$22", "46%", 350, TradeDecision.RECOMMENDED),
            S("UK fitness", "Fitness", "Resistance band set with door anchor", "United Kingdom", "Home gym", "Amazon", "Low", "Low", "£15–£25", "50%", 300, TradeDecision.RECOMMENDED),
            S("DE supplement high-risk", "Supplement", "Collagen powder (ingestible)", "Germany", "Wellness", "Amazon", "High", "High", "€19–€32", "53%", 200, TradeDecision.HIGH_RISK_REVIEW),
            S("US outdoor", "Outdoor", "Collapsible insulated water bottle", "United States", "Hikers", "Amazon", "Low", "Low", "$16–$26", "49%", 350, TradeDecision.RECOMMENDED),
            S("FR electronics high-risk", "Electronics", "USB-C fast charger (mains powered)", "France", "Tech buyers", "Amazon", "High", "Medium", "€12–€20", "40%", 400, TradeDecision.HIGH_RISK_REVIEW),
            S("SEA home", "Home", "LED motion night-light", "Southeast Asia", "Families", "TikTok Shop", "Medium", "Low", "$6–$12", "57%", 500, TradeDecision.RECOMMENDED),
            S("US baby high-risk", "Baby", "Baby teether toy", "United States", "New parents", "Amazon", "High", "Medium", "$9–$16", "44%", 250, TradeDecision.HIGH_RISK_REVIEW),
            S("ME beauty high-risk", "Beauty", "Hair growth serum (cosmetic claims)", "Middle East", "Beauty", "Shopify", "High", "Medium", "د.إ60–د.إ120", "60%", 200, TradeDecision.HIGH_RISK_REVIEW),
            S("AU pet", "Pet Supplies", "Cat self-groomer brush", "Australia", "Cat owners", "Amazon", "Low", "Low", "A$18–A$30", "51%", 300, TradeDecision.RECOMMENDED),
            S("BR electronics high-risk", "Electronics", "Power bank 10000mAh (lithium)", "Brazil", "Mobile users", "Shopify", "High", "High", "R$80–R$160", "42%", 300, TradeDecision.HIGH_RISK_REVIEW)
        )
        return rows.mapIndexed { i, s ->
            val id = "OPP-${4001 + i}"
            ProductOpportunity(
                opportunityId = id, scenario = s.scenario, category = s.category,
                productConcept = s.concept, targetRegion = s.region, targetPersona = s.persona,
                platform = s.platform, trendVelocity = if (i % 3 == 0) "Rising fast" else "Steady",
                demandSignal = "Search & marketplace demand trending up for ${s.category.lowercase()}",
                contentSignal = "Organic ${s.platform} content gaining traction",
                competitionIntensity = if (i % 2 == 0) "Medium" else "High",
                priceBand = s.priceBand, estimatedMargin = s.margin,
                landedCostEstimate = "~55–60% of sell price (mock)",
                complianceRisk = s.compRisk, cashCycleRisk = s.cashRisk,
                recommendedSupplierRegion = "Guangdong / Zhejiang, CN",
                firstTestBudget = "$3000", suggestedFirstOrderQty = s.qty,
                returnRateEst = if (s.category == "Apparel") "8–12%" else "3–6%",
                platformCommission = if (s.platform == "TikTok Shop") "6–8%" else if (s.platform == "Amazon") "12–15%" else "2.9%+fees",
                evidenceSummary = "Mock evidence: demand signal + content velocity + competitor pricing for ${s.concept}",
                whyNow = "Window open while ${s.platform} pushes this category and competition is still ${if (i % 2 == 0) "moderate" else "rising"}.",
                antiThesis = if (HIGH_RISK_OPPS.contains(id)) "Regulatory/certification cost could erase margin — do not list before clearance." else "Margin compresses if ad costs rise faster than conversion.",
                decision = s.decision
            )
        }
    }

    private data class S(
        val scenario: String, val category: String, val concept: String, val region: String,
        val persona: String, val platform: String, val compRisk: String, val cashRisk: String,
        val priceBand: String, val margin: String, val qty: Int, val decision: TradeDecision
    )

    // 5 deterministic roles guarantee a useful supplier spread per opportunity.
    private data class Role(val tag: String, val recommend: String, val bestFor: String, val watch: String)
    private val ROLES = listOf(
        Role("small-test", "recommended_test", "Low-MOQ first test", "Higher unit price"),
        Role("certified", "recommended_cert", "Certifications & compliance", "Slower, premium price"),
        Role("scale", "recommended_scale", "Best price at volume", "High MOQ, slower comms"),
        Role("balanced", "conditional", "Balanced reorder partner", "Mid on every axis"),
        Role("high-risk", "not_recommended", "Price reference only", "Unverified claims, dispute history")
    )

    private fun buildSuppliersFor(opp: ProductOpportunity): List<Supplier> =
        ROLES.mapIndexed { i, role ->
            val hi = role.tag == "high-risk"
            Supplier(
                supplierId = "SUP-${opp.opportunityId}-${i + 1}",
                opportunityId = opp.opportunityId,
                factoryName = "${opp.category.replace(" ", "")} ${role.tag.replaceFirstChar { it.uppercase() }} Works",
                factoryRegion = "Guangdong, CN", factoryTag = role.tag,
                mainCategories = listOf(opp.category),
                moq = when (role.tag) { "small-test" -> 50; "scale" -> 1000; else -> 300 },
                unitPriceUsd = when (role.tag) { "small-test" -> 6.8; "scale" -> 4.2; "high-risk" -> 3.5; else -> 5.5 },
                priceRange = opp.priceBand,
                sampleLeadTimeDays = if (role.tag == "scale") 10 else 5,
                productionLeadTimeDays = when (role.tag) { "scale" -> 35; "small-test" -> 18; else -> 25 },
                certifications = if (role.tag == "certified") listOf("CE", "FCC", "Lab report") else if (hi) emptyList() else listOf("CE"),
                exportMarkets = listOf(opp.targetRegion),
                onTimeFulfillmentRate = if (hi) "78%" else "94%",
                returnDisputeRate = if (hi) "9%" else "1.5%",
                platformRating = if (hi) 3.6 else 4.6,
                responseSpeedHours = if (role.tag == "scale") 12.0 else 3.0,
                qualityConsistencyScore = if (hi) 52 else if (role.tag == "certified") 90 else 80,
                communicationRisk = if (hi) "High" else "Low",
                certificationConfidence = if (role.tag == "certified") 92 else if (hi) 30 else 70,
                marketFit = if (role.tag == "balanced") 75 else if (hi) 55 else 82,
                quoteSpeedScore = if (role.tag == "scale") 60 else 85,
                recommend = role.recommend, bestFor = role.bestFor, watchOut = role.watch,
                recommendedNegotiation = "Ask for tiered pricing and sample-cost credit on first PO."
            )
        }

    private fun buildComplianceFor(opp: ProductOpportunity): ComplianceRoute {
        val high = HIGH_RISK_OPPS.contains(opp.opportunityId)
        return ComplianceRoute(
            complianceRouteId = "CMP-${opp.opportunityId}",
            opportunityId = opp.opportunityId,
            country = opp.targetRegion, platform = opp.platform, category = opp.category,
            riskLevel = if (high) RiskLevel.HIGH else RiskLevel.MEDIUM,
            goNoGo = if (high) "no_go_until_certified" else "go_with_conditions",
            certifications = if (high) listOf("Mandatory certification", "Lab test report") else listOf("Standard labeling"),
            requiredDocuments = if (high) listOf("Declaration of conformity", "Test report") else listOf("Truthful claim sheet"),
            restrictedKeywords = listOf("cure", "heal", "FDA-approved", "medical-grade", "100% safe"),
            saferAlternatives = listOf("Use 'designed for'", "Avoid health claims", "State materials accurately"),
            reusableFor = "All ${opp.category} SKUs in ${opp.targetRegion}/${opp.platform}"
        )
    }

    private fun buildCashFor(opp: ProductOpportunity): CashConversionScore {
        val danger = opp.cashCycleRisk.contains("High", true)
        return CashConversionScore(
            opportunityId = opp.opportunityId,
            grossMargin = 0.44, contributionMargin = 0.30,
            breakEvenUnits = if (danger) 180 else 95,
            cashNeededBeforeRevenue = if (danger) 3400.0 else 1900.0,
            daysToCashRecovery = if (danger) 55 else 28,
            projectedTestProfit = if (danger) -120.0 else 640.0,
            inventoryPressure = if (danger) RiskLevel.HIGH else RiskLevel.MEDIUM,
            adBudgetRisk = RiskLevel.MEDIUM,
            fxRisk = if (opp.targetRegion in listOf("Brazil", "Mexico")) RiskLevel.HIGH else RiskLevel.LOW,
            tariffRisk = RiskLevel.MEDIUM, returnRisk = RiskLevel.LOW,
            recommendation = if (danger) "test_smaller" else "buy",
            explanation = if (danger)
                "Cash exposure is dangerous; start with ~100 units to protect the $3000 test budget."
            else "Economics support the planned first order."
        )
    }

    private fun buildGrowthFor(opp: ProductOpportunity): GrowthExperiment {
        val good = opp.decision == TradeDecision.RECOMMENDED
        return GrowthExperiment(
            growthExperimentId = "GRW-${opp.opportunityId}",
            opportunityId = opp.opportunityId, platform = opp.platform, windowDays = 7,
            metrics = GrowthMetric(
                views = if (good) 42000 else 8000, clicks = if (good) 1700 else 240,
                ctr = if (good) 0.04 else 0.03, cvr = if (good) 0.025 else 0.006,
                orders = if (good) 42 else 5, refunds = if (good) 1 else 3,
                adSpend = 105.0, cac = if (good) 9.5 else 38.0,
                commentsSummary = if (good) "Positive: 'works as shown'" else "Mixed: 'looks cheaper than video'",
                creatorPerformance = if (good) "1 of 3 creators drove 70% of orders" else "All 3 underperformed",
                customerComplaints = if (good) "Minor: shipping speed" else "Quality vs expectation gap"
            ),
            status = "completed"
        )
    }
}
