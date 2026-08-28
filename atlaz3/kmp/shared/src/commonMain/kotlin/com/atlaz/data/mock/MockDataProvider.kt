package com.atlaz.data.mock

import com.atlaz.data.repository.TradeRepository
import com.atlaz.domain.model.*
import kotlin.math.max

/**
 * MockDataProvider — deterministic mock implementation of [TradeRepository].
 * Mirrors the web prototype's data.js: 12 opportunities (23 fields each),
 * 5 suppliers per opportunity (60 total, 28 fields each), 12 SKU Passports,
 * compliance routes, listings, orders, cash scores, growth experiments, agent
 * actions, trust signals, ledger seed, personas, plans and revenue streams.
 *
 * For brevity in this repo the 12 opportunities are listed in full; the derived
 * collections (suppliers, passports, etc.) are generated from them so counts and
 * relationships match the runnable web prototype exactly.
 */
object MockDataProvider : TradeRepository {

    private val opps: List<ProductOpportunity> = listOf(
        opp("OPP-2001", "Pet Care Tools", "Portable pet grooming vacuum", "United States",
            "Urban dog owners 25-40 on TikTok", "TikTok Shop", "$39–59", 0.58, "Low", "Shenzhen", 300, 1500.0, "Low"),
        opp("OPP-2002", "Kitchenware", "Foldable electric kettle", "Japan",
            "Small-apartment professionals", "Amazon", "$28–42", 0.49, "Medium", "Ningbo", 400, 1800.0, "Medium"),
        opp("OPP-2003", "Health & Posture", "Smart posture corrector", "Germany",
            "Desk workers concerned about back health", "Shopify", "$25–39", 0.55, "High", "Dongguan", 250, 1600.0, "High"),
        opp("OPP-2004", "Outdoor", "Solar camping light", "Southeast Asia",
            "Budget campers and travelers", "TikTok Shop", "$15–25", 0.52, "Low", "Guangzhou", 500, 1200.0, "Low"),
        opp("OPP-2005", "Kitchen Storage", "Reusable silicone food bags", "France",
            "Eco-conscious home cooks", "Shopify", "$12–22", 0.6, "Medium", "Xiamen", 600, 1400.0, "Medium"),
        opp("OPP-2006", "Beauty Tools", "Mini beauty fridge", "United States",
            "Beauty creators and skincare fans", "Creator (TikTok/IG)", "$45–69", 0.5, "Low", "Foshan", 300, 2000.0, "Low"),
        opp("OPP-2007", "Home Organization", "Modular closet organizer set", "United Kingdom",
            "Renters optimizing small spaces", "Amazon", "$22–35", 0.47, "Low", "Yiwu", 400, 1500.0, "Low"),
        opp("OPP-2008", "Lunch & Bento", "Bento box accessory kit", "Japan",
            "Parents packing kids' lunches", "Amazon", "$14–24", 0.54, "Medium", "Hangzhou", 500, 1300.0, "Medium"),
        opp("OPP-2009", "Recovery", "Percussion massage gun", "Germany",
            "Amateur athletes and gym-goers", "Shopify", "$49–79", 0.45, "High", "Shenzhen", 200, 2200.0, "High"),
        opp("OPP-2010", "Seasonal Decor", "Ramadan decorative lights", "Middle East",
            "Families decorating for Ramadan", "Marketplace + Creator", "$18–32", 0.56, "Medium", "Suzhou", 500, 1400.0, "Medium"),
        opp("OPP-2011", "Creator Merch", "Creator merch starter kit", "United States",
            "Mid-size creators launching merch", "Shopify", "$30–55", 0.51, "Low", "Qingdao", 250, 1700.0, "Low"),
        opp("OPP-2012", "Home Office", "Under-desk cable & storage rack", "Germany",
            "Remote workers tidying desks", "Shopify", "$20–34", 0.5, "Low", "Dongguan", 350, 1300.0, "Low")
    )

    private fun opp(
        id: String, cat: String, concept: String, region: String, persona: String, platform: String,
        band: String, margin: Double, comp: String, supRegion: String, qty: Int, budget: Double, compRisk: String
    ) = ProductOpportunity(
        opportunityId = id, category = cat, productConcept = concept, targetRegion = region,
        targetPersona = persona, platform = platform, priceBand = band, trendVelocity = "Rising",
        competitionIntensity = comp, estimatedMargin = margin, complianceRisk = compRisk,
        recommendedSupplierRegion = supRegion,
        evidenceSummary = "Demand signals trending up for $concept in $region; converts on short-form demos.",
        recommendedFirstOrderQty = qty, testBudget = budget, riskLevel = compRisk, confidenceScore = 0.7 + (id.last().code % 5) * 0.04,
        demandSignal = if (id.endsWith("4") || id.endsWith("9")) "Sharp rise" else "Steady rise",
        seasonality = if (id.endsWith("10")) "Seasonal (Ramadan)" else "Year-round",
        cashConversionPotential = if (margin >= 0.55) "High" else "Medium",
        complianceComplexity = compRisk, creatorAngle = "Problem→result demo on $platform",
        moatNote = "Each loop enriches the SKU Passport, Trade Ledger and Supplier Trust Graph."
    )

    private val regions = listOf("Shenzhen","Guangzhou","Dongguan","Yiwu","Ningbo","Foshan","Xiamen","Qingdao","Suzhou","Hangzhou")
    private val certs = listOf("CE","FCC","RoHS","FDA","LFGB","CPSIA","REACH","ISO9001","BSCI","Sedex","PSE","UKCA")
    private val factoryNames = listOf("Hongtai","Yuansheng","Jinhe","Lianxin","Borui","Mingda","Zhuoyue","Kaiyue","Shenghui","Ruize")

    private fun hash(s: String): Int { var h = 0; for (c in s) h = (h * 31 + c.code) and 0x7fffffff; return h }

    private val suppliersMap: Map<String, List<Supplier>> = opps.mapIndexed { idx, o ->
        o.opportunityId to (0 until 5).map { i ->
            val h = hash(o.opportunityId + "-" + i)
            val trust = max(0.4, 0.92 - i * 0.08 - (h % 5) * 0.01)
            Supplier(
                supplierId = "SUP-${o.opportunityId.removePrefix("OPP-")}-${i + 1}", opportunityId = o.opportunityId,
                factoryName = "${factoryNames[(h + i) % factoryNames.size]} ${o.category.split(" ")[0]} Mfg.",
                factoryRegion = regions[(idx + i) % regions.size], mainCategories = listOf(o.category, "OEM/ODM"),
                moq = listOf(100,200,300,500,1000)[(h + i) % 5], priceRange = o.priceBand,
                sampleLeadTime = "${3 + (h % 5)} days", productionLeadTime = "${15 + (h % 15)} days",
                certifications = (0 until (2 + h % 3)).map { certs[(h + it + idx) % certs.size] }.distinct(),
                exportMarkets = listOf("US","EU","JP","SEA").take(2 + h % 3),
                onTimeFulfillmentRate = (0.97 - i * 0.03 - (h % 4) * 0.01),
                returnDisputeRate = (0.01 + i * 0.012), platformRating = (4.9 - i * 0.18),
                yearsInBusiness = 3 + h % 18,
                recommendedReason = "Recommended supplier #${i + 1} based on trust, sampling and export track record.",
                riskFlags = if (i >= 3) listOf("Verify certifications before bulk order") else emptyList(),
                bestFor = listOf("First serious order","Low-MOQ testing","Price negotiation","Compliance-heavy markets","Rapid iteration")[i],
                paymentTermsMock = "30% deposit / 70% before shipment", responseSpeedMock = "${1 + h % 6}h avg",
                sampleAccuracyScore = (0.95 - i * 0.05), moqFlexibilityScore = (0.6 + if (i == 1) 0.3 else 0.0),
                communicationQuality = (0.9 - i * 0.06),
                verificationStatus = if (i == 0) "Verified (mock)" else if (i <= 2) "Partially verified (mock)" else "Unverified (mock)",
                trustScore = trust, trustScoreExplanation = "Weighted from on-time, dispute, sample accuracy, communication and certs.",
                lastTradeSignal = if (i == 0) "Completed 2 mock sample orders, 0 disputes" else "No recent mock signal",
                dataConsentStatus = if (i == 0) "Consented to anonymized sharing (mock)" else "Not yet onboarded (mock)"
            )
        }.sortedByDescending { it.trustScore }
    }.toMap()

    private val allSuppliers = suppliersMap.values.flatten()

    private val passports: List<SkuPassport> = opps.map { o ->
        val sku = "SKU-${o.opportunityId.removePrefix("OPP-")}"
        SkuPassport(
            skuPassportId = sku, opportunityId = o.opportunityId, productConcept = o.productConcept,
            category = o.category, targetRegion = o.targetRegion, platform = o.platform,
            materialProfileId = "MAT-${o.opportunityId.removePrefix("OPP-")}", hsCodeMock = "85" + o.opportunityId.takeLast(2) + ".00",
            originRegion = o.recommendedSupplierRegion, certificationsClaimed = listOf("CE","RoHS"),
            complianceRouteId = "ROUTE-${o.opportunityId.removePrefix("OPP-")}",
            selectedSupplierId = suppliersMap[o.opportunityId]?.firstOrNull()?.supplierId,
            landedUnitCostEstimate = 0.0, targetPrice = parsePrice(o.priceBand),
            cashConversionScoreId = "CCS-${o.opportunityId.removePrefix("OPP-")}", listingId = "LST-${o.opportunityId.removePrefix("OPP-")}",
            tradeStage = "sourcing",
            riskSummary = RiskSummary(o.complianceRisk, o.cashConversionPotential, "Low"),
            ledgerEventCount = 0, dataRightConsentId = "DRC-001", createdAt = "2026-05-01T00:00:00Z",
            updatedAt = "2026-06-07T00:00:00Z", ownerNote = "Owned by the merchant.", schemaVersion = "atlaz.sku.v3"
        )
    }

    private fun parsePrice(band: String): Double {
        val nums = Regex("[0-9]+(\\.[0-9]+)?").findAll(band).map { it.value.toDouble() }.toList()
        if (nums.isEmpty()) return 29.0
        return ((nums[0] + (nums.getOrNull(1) ?: nums[0])) / 2)
    }

    override fun cashInputsFor(o: ProductOpportunity): CashInputs {
        val price = parsePrice(o.priceBand)
        val compBump = when (o.competitionIntensity) { "High" -> 0.12; "Medium" -> 0.05; else -> 0.0 }
        val unitCost = max(2.0, price * (1 - o.estimatedMargin) + compBump * price)
        return CashInputs(
            unitCost = unitCost, moq = suppliersMap[o.opportunityId]!!.first().moq, qty = o.recommendedFirstOrderQty,
            domesticFreight = 120.0, internationalFreight = o.recommendedFirstOrderQty * 1.4,
            dutyRate = if (o.targetRegion in listOf("Germany","France")) 0.05 else if (o.targetRegion == "Japan") 0.03 else 0.02,
            platformFee = if (o.platform.contains("Amazon")) 0.15 else if (o.platform.contains("TikTok")) 0.08 else 0.029,
            paymentFee = 0.03, adBudgetPerUnit = price * 0.18, targetPrice = price,
            refundRate = if (o.complianceRisk == "High") 0.08 else 0.04, returnHandlingCost = 3.5,
            fxRate = 1.0, paymentTerms = 30, inventoryDays = if (o.demandSignal.contains("Sharp")) 20 else 35,
            sampleCost = 60.0, packagingCost = 0.6, complianceReserveCost = if (o.complianceRisk == "High") 400.0 else 120.0
        )
    }

    // --- TradeRepository surface (derived/minimal mock collections) ---
    override fun opportunities() = opps
    override fun opportunity(id: String) = opps.firstOrNull { it.opportunityId == id }
    override fun suppliers(opportunityId: String) = suppliersMap[opportunityId] ?: emptyList()
    override fun supplier(supplierId: String) = allSuppliers.firstOrNull { it.supplierId == supplierId }
    override fun suppliersByOpp() = suppliersMap
    override fun skuPassports() = passports
    override fun skuPassport(id: String) = passports.firstOrNull { it.skuPassportId == id }
    override fun complianceRoute(opportunityId: String): ComplianceRoute? = opportunity(opportunityId)?.let { o ->
        ComplianceRoute(
            routeId = "ROUTE-${o.opportunityId.removePrefix("OPP-")}", opportunityId = o.opportunityId,
            productType = o.category, material = "Plastic/Electronics (mock)", targetRegion = o.targetRegion,
            platform = o.platform, claims = listOf("durable","effective"),
            hasElectronics = o.category.contains("Health") || o.productConcept.contains("electric") || o.productConcept.contains("massage"),
            contactsFood = o.category.contains("Kitchen") || o.category.contains("Bento"),
            contactsSkin = o.category.contains("Beauty") || o.category.contains("Posture"), targetAgeGroup = "Adult",
            requiredCertifications = if (o.complianceRisk == "High") listOf("CE","RoHS","Safety report") else listOf("CE"),
            recommendedTests = listOf("Safety","EMC"), requiredDocs = listOf("Commercial invoice","Packing list","Declaration of conformity"),
            forbiddenClaims = listOf("cures disease","medical-grade","guaranteed results"),
            labelingRequirements = listOf("Origin label","Importer info","Safety warnings"),
            riskLevel = o.complianceRisk,
            riskReasons = if (o.complianceRisk == "High") listOf("Health/skin/electronic claims need verification") else listOf("Standard consumer-goods route"),
            professionalReviewRequired = o.complianceRisk == "High",
            estimatedCertCostUsd = if (o.complianceRisk == "High") "$1,200–3,500 (mock)" else "$300–900 (mock)",
            estimatedLeadTime = "2–6 weeks (mock)",
            nextSteps = listOf("Verify certifications","Remove forbidden claims","Prepare required docs"),
            disclaimer = com.atlaz.ai.Disclaimers.COMPLIANCE
        )
    }
    override fun listing(opportunityId: String): ListingDraft? = opportunity(opportunityId)?.let { o ->
        ListingDraft("LST-${o.opportunityId.removePrefix("OPP-")}", o.opportunityId,
            "${o.productConcept} — for ${o.targetRegion}", listOf("Solves a real daily pain","Easy to use","Compact"),
            "A practical ${o.productConcept.lowercase()} designed for ${o.targetPersona}.",
            listOf(o.category.lowercase(), "best ${o.productConcept.lowercase()}"),
            "Use outcome-focused, non-medical language.", listOf("cures","medical-grade"),
            "English (+ local)", o.complianceRisk)
    }
    override fun order(opportunityId: String): TradeOrder? = opportunity(opportunityId)?.let { o ->
        TradeOrder("ORD-${o.opportunityId.removePrefix("OPP-")}", o.opportunityId,
            suppliersMap[o.opportunityId]!!.first().supplierId, o.recommendedFirstOrderQty, 0.0, "sample",
            tradeStepsKey(), "in_progress", "2026-06-01T00:00:00Z")
    }
    override fun orders() = opps.take(8).mapNotNull { order(it.opportunityId) }
    override fun cashScores() = opps.take(8).map { o ->
        CashConversionScore("CCS-${o.opportunityId.removePrefix("OPP-")}", "SKU-${o.opportunityId.removePrefix("OPP-")}",
            cashInputsFor(o), com.atlaz.ai.CashEngine.calculate(cashInputsFor(o)))
    }
    override fun growthExperiments() = opps.take(8).mapIndexed { i, o ->
        GrowthExperiment("EXP-${1000 + i}", "SKU-${o.opportunityId.removePrefix("OPP-")}",
            "Short-form demo drives profitable conversions", "TikTok/Meta", 500.0,
            ExperimentMetrics(50000, 0.04, 0.022 + i * 0.002, 1.8 + i * 0.2, 9.0 + i, 0.05), "running")
    }
    override fun agentActions() = AgentActionTypes.all.take(12).mapIndexed { i, type ->
        AgentAction("ACT-${4000 + i}", passports[i % passports.size].skuPassportId, type,
            type.lowercase().replace('_', ' '), "Proposed to advance the Trade Loop.",
            "context summary", "proposed output (mock)", if (type.contains("BLOCK") || type.contains("ORDER")) "Medium" else "Low",
            reversible = !type.contains("ORDER"), requiresHumanApproval = true, approvalState = "proposed",
            toolToInvoke = null, sideEffects = listOf("Records a ledger event"), createdAt = "2026-06-07T00:00:00Z",
            schemaVersion = "atlaz.action.v3")
    }
    override fun trustSignals(supplierId: String) = (0 until 4).map { i ->
        SupplierTrustSignal("STS-$supplierId-$i", supplierId,
            listOf("sample_order_completed","on_time_delivery","dispute_resolved","fast_response")[i],
            "2026-0${1 + i}-10T00:00:00Z", 0.2 + i * 0.1, if (i == 2) "negative" else "positive",
            "Mock trade signal recorded by Atlaz ledger.")
    }
    override fun ledgerSeed(): List<TradeLoopLedgerEvent> {
        val out = mutableListOf<TradeLoopLedgerEvent>()
        var n = 1000
        passports.take(5).forEach { p ->
            com.atlaz.ledger.EventTypes.all.forEach { type ->
                out.add(TradeLoopLedgerEvent("EVT-${n++}", p.skuPassportId, type,
                    com.atlaz.ledger.EventTypes.actorFor(type), com.atlaz.ledger.EventTypes.actorIdFor(type),
                    "Seeded $type", "Low", type in com.atlaz.ledger.EventTypes.approvalEvents,
                    "Mock seed event", null, "2026-05-15T00:00:00Z", "atlaz.ledger.v3"))
            }
        }
        return out // 5 passports * 15 types = 75 (>= 50 required)
    }
    override fun documentTemplates() = listOf(
        "Commercial Invoice","Packing List","Proforma Invoice","Purchase Order","RFQ",
        "Declaration of Conformity","Inspection Report","Supplier Agreement (mock)","NNN Agreement (mock)","Shipping Label"
    ).mapIndexed { i, name -> DocumentTemplate("TPL-$i", name, "Mock $name template", listOf("seller","supplier","sku","qty"), com.atlaz.ai.Disclaimers.NETWORK) }
    override fun marketDemandSignals(opportunityId: String) = (0 until 1).map {
        MarketDemandSignal("MDS-$opportunityId", opportunityId, "TikTok hashtag", "views QoQ", "+38%", "Rising", "2026-05-20T00:00:00Z")
    }
    override fun personas() = listOf(
        persona("US","US TikTok shopper"), persona("Japan","JP Amazon shopper"), persona("Germany","DE Shopify buyer"),
        persona("France","FR eco shopper"), persona("UK","UK Amazon buyer"), persona("SEA","SEA value shopper"))
    private fun persona(region: String, name: String) =
        MarketPersona("P-$region", region, name, "Researches then buys on social proof",
            listOf("TikTok","Amazon","Shopify"), "Medium", "Expects clear, honest claims")
    override fun plans() = listOf(
        Plan("free","Free",0.0, listOf("1 active SKU Passport","Core AI drafts","Mock tools"), "1 trade loop"),
        Plan("pro","Pro",29.0, listOf("Unlimited SKU Passports","Compliance Route Engine","Cash Conversion Score","Agent actions"), "Fair-use"),
        Plan("enterprise","Enterprise",0.0, listOf("Team seats","API access","Priority support","Custom data rights"), "Custom"))
    override fun revenueStreams() = listOf(
        "Pro subscription","Enterprise seats","Supplier verification fees","Trade document/export add-ons",
        "Compliance route premium","Logistics rate referrals","Payment/FX referrals","Ad-platform integration tier",
        "Listing publishing add-on","Trade-finance referrals (future)","Data insights (anonymized, consented)","Marketplace take-rate (future)")
        .mapIndexed { i, n -> RevenueStream("RS-$i", n, "Revenue stream #${i + 1}", if (i < 4) "MVP/near-term" else "future") }
    override fun preference() = UserPreference("TikTok Shop seller","United States","TikTok Shop","en","USD","light", true)

    private fun tradeStepsKey() = listOf(
        "opportunity" to "Opportunity", "passport" to "SKU Passport", "suppliers" to "Suppliers",
        "rfq" to "RFQ", "sample" to "Sample", "compliance" to "Compliance", "order" to "Order", "growth" to "Growth"
    ).mapIndexed { i, (k, l) -> TradeStep(k, l, if (i == 0) "done" else if (i == 1) "active" else "pending", "") }
}

object AgentActionTypes {
    val all = listOf(
        "CREATE_RFQ","REQUEST_SUPPLIER_COUNTERQUOTE","GENERATE_LISTING","BLOCK_HIGH_RISK_CLAIM",
        "CALCULATE_LANDED_COST","CREATE_SAMPLE_ORDER","REQUEST_INSPECTION","VERIFY_CERTIFICATION",
        "PLACE_TEST_ORDER","LAUNCH_EXPERIMENT","EVALUATE_REORDER","GENERATE_TRADE_DOCUMENT","EXPORT_SKU_PASSPORT"
    )
}
