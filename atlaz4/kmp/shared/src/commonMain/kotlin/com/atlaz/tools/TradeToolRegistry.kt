package com.atlaz.tools

/* ============================================================================
 * Atlaz v4 · Tool Adapter layer.
 *
 * Atlaz is an EXECUTION network. The day we wire real APIs (1688, Alibaba,
 * shipping, Stripe, marketplace listing, compliance DBs, inspection), only
 * these adapters change — the UI/AI layer talks to the registry, never to a
 * vendor SDK. Today every adapter is mock=true and performs no network call.
 * ========================================================================== */

data class ToolResult(
    val ok: Boolean,
    val summary: String,
    val payload: Map<String, String>,
    val mock: Boolean = true,
    val requiresApproval: Boolean = false
)

interface TradeToolAdapter {
    val name: String
    val capability: String
    val mock: Boolean
    fun invoke(args: Map<String, String>): ToolResult
}

abstract class MockAdapter(
    override val name: String,
    override val capability: String
) : TradeToolAdapter {
    override val mock: Boolean = true
}

class SupplierApiAdapter : MockAdapter("SupplierApiAdapter", "Search & enrich supplier records (1688/Alibaba)") {
    override fun invoke(args: Map<String, String>) =
        ToolResult(true, "Mock supplier lookup for ${args["category"] ?: "category"}", mapOf("count" to "5"))
}

class LogisticsApiAdapter : MockAdapter("LogisticsApiAdapter", "Freight quote & transit estimate") {
    override fun invoke(args: Map<String, String>) =
        ToolResult(true, "Mock freight quote ${args["from"] ?: "CN"} → ${args["to"] ?: "US"}", mapOf("etaDays" to "22"))
}

class PaymentApiAdapter : MockAdapter("PaymentApiAdapter", "Escrow / deposit / credit-terms (HIGH RISK)") {
    override fun invoke(args: Map<String, String>) =
        ToolResult(true, "Mock payment intent (NOT executed)", mapOf("amount" to (args["amount"] ?: "0")), requiresApproval = true)
}

class ComplianceDatabaseAdapter : MockAdapter("ComplianceDatabaseAdapter", "Region+platform rule & banned-word lookup") {
    override fun invoke(args: Map<String, String>) =
        ToolResult(true, "Mock compliance lookup ${args["region"]}/${args["platform"]}", mapOf("flags" to "review_required"))
}

class AdPlatformAdapter : MockAdapter("AdPlatformAdapter", "Campaign cost & creative-performance estimate") {
    override fun invoke(args: Map<String, String>) =
        ToolResult(true, "Mock ad estimate", mapOf("cpmUsd" to "9.5"))
}

class MarketplaceListingAdapter : MockAdapter("MarketplaceListingAdapter", "Publish listing draft (HIGH RISK)") {
    override fun invoke(args: Map<String, String>) =
        ToolResult(true, "Mock listing draft prepared (NOT submitted)", mapOf("platform" to (args["platform"] ?: "")), requiresApproval = true)
}

class InspectionServiceAdapter : MockAdapter("InspectionServiceAdapter", "Pre-shipment QC booking estimate") {
    override fun invoke(args: Map<String, String>) =
        ToolResult(true, "Mock inspection booking", mapOf("feeUsd" to "120"))
}

object TradeToolRegistry {
    val adapters: List<TradeToolAdapter> = listOf(
        SupplierApiAdapter(),
        LogisticsApiAdapter(),
        PaymentApiAdapter(),
        ComplianceDatabaseAdapter(),
        AdPlatformAdapter(),
        MarketplaceListingAdapter(),
        InspectionServiceAdapter()
    )

    fun list(): List<String> = adapters.map { "${it.name} — ${it.capability} (mock=${it.mock})" }

    fun byName(n: String): TradeToolAdapter? = adapters.firstOrNull { it.name == n }
}
