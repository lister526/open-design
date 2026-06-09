package com.atlaz.data.repository

import com.atlaz.domain.model.*

/**
 * TradeRepository — single source of truth for all domain data. The MVP is
 * backed by [com.atlaz.data.mock.MockDataProvider]; the production implementation
 * (reserved) swaps to a local cache + sync layer over the Atlaz backend without
 * changing this interface.
 */
interface TradeRepository {
    fun opportunities(): List<ProductOpportunity>
    fun opportunity(id: String): ProductOpportunity?
    fun suppliers(opportunityId: String): List<Supplier>
    fun supplier(supplierId: String): Supplier?
    fun suppliersByOpp(): Map<String, List<Supplier>>
    fun skuPassports(): List<SkuPassport>
    fun skuPassport(id: String): SkuPassport?
    fun complianceRoute(opportunityId: String): ComplianceRoute?
    fun listing(opportunityId: String): ListingDraft?
    fun order(opportunityId: String): TradeOrder?
    fun orders(): List<TradeOrder>
    fun cashScores(): List<CashConversionScore>
    fun growthExperiments(): List<GrowthExperiment>
    fun agentActions(): List<AgentAction>
    fun trustSignals(supplierId: String): List<SupplierTrustSignal>
    fun ledgerSeed(): List<TradeLoopLedgerEvent>
    fun documentTemplates(): List<DocumentTemplate>
    fun marketDemandSignals(opportunityId: String): List<MarketDemandSignal>
    fun personas(): List<MarketPersona>
    fun plans(): List<Plan>
    fun revenueStreams(): List<RevenueStream>
    fun preference(): UserPreference
    fun cashInputsFor(opp: ProductOpportunity): CashInputs
}
