package com.atlaz.tools

import com.atlaz.domain.model.Supplier

/**
 * TradeToolRegistry — the 15 capability tools Atlaz's agent can call. Each tool
 * is "connected (mock) · production API reserved" and declares its production
 * integration contract: credentials, risk, approval requirement and what data
 * it stores. This is the API-integration spine of the network.
 */
data class TradeTool(
    val name: String,
    val connectedMock: Boolean = true,
    val reservedProductionApi: String?,
    val requiredCredentials: List<String> = emptyList(),
    val riskLevel: String = "Low",
    val userApprovalRequired: Boolean = false,
    val dataStored: List<String> = emptyList(),
    val futureProviderExamples: List<String> = emptyList(),
    val status: String = "Connected (mock) · production API reserved"
)

class TradeToolRegistry(
    private val suppliersByOpp: Map<String, List<Supplier>> = emptyMap()
) {
    // Tool with a query helper used by recommendSuppliers
    inner class SupplierDatabaseTool {
        val meta = TradeTool("supplierDatabaseTool", reservedProductionApi = "supplierApi",
            requiredCredentials = listOf("supplier_api_key"), dataStored = listOf("supplier records"),
            futureProviderExamples = listOf("1688 / Alibaba-style sourcing APIs"))
        fun query(opportunityId: String): List<Supplier> = suppliersByOpp[opportunityId] ?: emptyList()
    }

    val supplierDatabaseTool = SupplierDatabaseTool()

    val tools: List<TradeTool> = listOf(
        supplierDatabaseTool.meta,
        TradeTool("supplierTrustGraphTool", reservedProductionApi = null,
            dataStored = listOf("trust signals"), futureProviderExamples = listOf("Atlaz Supplier Trust Graph")),
        TradeTool("complianceDatabaseTool", reservedProductionApi = "complianceApi", riskLevel = "Medium",
            dataStored = listOf("compliance rules (mock)"), futureProviderExamples = listOf("Regulatory data vendors")),
        TradeTool("complianceRouteTool", reservedProductionApi = "complianceApi", riskLevel = "Medium",
            futureProviderExamples = listOf("Atlaz Compliance Route Engine")),
        TradeTool("logisticsRateTool", reservedProductionApi = "logisticsApi",
            requiredCredentials = listOf("logistics_api_key"),
            futureProviderExamples = listOf("Flexport-style / freight forwarders")),
        TradeTool("currencyRateTool", reservedProductionApi = "fxApi",
            dataStored = listOf("fx snapshots"), futureProviderExamples = listOf("FX rate vendors")),
        TradeTool("paymentTool", reservedProductionApi = "paymentApi", riskLevel = "High",
            requiredCredentials = listOf("payment_api_key"), userApprovalRequired = true,
            dataStored = listOf("payment intents (mock)"),
            futureProviderExamples = listOf("Stripe / Airwallex / PingPong-style")),
        TradeTool("inspectionTool", reservedProductionApi = "inspectionApi", riskLevel = "Medium",
            futureProviderExamples = listOf("3rd-party QC / inspection vendors")),
        TradeTool("certificationVerificationTool", reservedProductionApi = "certApi", riskLevel = "Medium",
            dataStored = listOf("certification claims (mock)"),
            futureProviderExamples = listOf("Certification bodies / test labs")),
        TradeTool("adPlatformTool", reservedProductionApi = "adApi", riskLevel = "Medium",
            requiredCredentials = listOf("ad_platform_token"), userApprovalRequired = true,
            futureProviderExamples = listOf("TikTok Ads / Meta Ads APIs")),
        TradeTool("ecommerceListingTool", reservedProductionApi = "listingApi", riskLevel = "Medium",
            requiredCredentials = listOf("store_oauth"), userApprovalRequired = true,
            futureProviderExamples = listOf("Shopify / Amazon SP-API / TikTok Shop")),
        TradeTool("financeEligibilityTool", reservedProductionApi = "financeApi", riskLevel = "High",
            userApprovalRequired = true, dataStored = listOf("eligibility snapshots (mock)"),
            futureProviderExamples = listOf("Trade-finance / BNPL partners (future)")),
        TradeTool("customsDutyTool", reservedProductionApi = "customsApi", riskLevel = "Medium",
            futureProviderExamples = listOf("Customs / HS-code data vendors")),
        TradeTool("documentExportTool", reservedProductionApi = null,
            dataStored = listOf("generated documents"), futureProviderExamples = listOf("PDF / export services")),
        TradeTool("tradeLedgerTool", reservedProductionApi = null,
            dataStored = listOf("trade loop events"), futureProviderExamples = listOf("Atlaz Trade Loop Ledger"))
    )

    fun list(): List<TradeTool> = tools
    fun byName(name: String): TradeTool? = tools.firstOrNull { it.name == name }
}
