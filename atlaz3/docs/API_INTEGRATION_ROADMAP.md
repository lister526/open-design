# Atlaz — API Integration Roadmap

The 15 tools in the **TradeToolRegistry** are "connected (mock) · production API reserved." Each
declares its production contract so the MVP→production swap changes implementations, not signatures.

| Tool | Production API (reserved) | Credentials | Risk | Approval | Future providers |
|------|---------------------------|-------------|------|----------|------------------|
| supplierDatabaseTool | supplierApi | supplier_api_key | Low | No | 1688 / Alibaba-style sourcing |
| supplierTrustGraphTool | (internal) | — | Low | No | Atlaz Supplier Trust Graph |
| complianceDatabaseTool | complianceApi | — | Medium | No | Regulatory data vendors |
| complianceRouteTool | complianceApi | — | Medium | No | Atlaz Compliance Route Engine |
| logisticsRateTool | logisticsApi | logistics_api_key | Low | No | Freight forwarders |
| currencyRateTool | fxApi | — | Low | No | FX rate vendors |
| paymentTool | paymentApi | payment_api_key | High | **Yes** | Stripe / Airwallex / PingPong-style |
| inspectionTool | inspectionApi | — | Medium | No | 3rd-party QC vendors |
| certificationVerificationTool | certApi | — | Medium | No | Certification bodies / labs |
| adPlatformTool | adApi | ad_platform_token | Medium | **Yes** | TikTok Ads / Meta Ads |
| ecommerceListingTool | listingApi | store_oauth | Medium | **Yes** | Shopify / Amazon SP-API / TikTok Shop |
| financeEligibilityTool | financeApi | — | High | **Yes** | Trade-finance / BNPL partners (future) |
| customsDutyTool | customsApi | — | Medium | No | Customs / HS-code vendors |
| documentExportTool | (internal) | — | Low | No | PDF / export services |
| tradeLedgerTool | (internal) | — | Low | No | Atlaz Trade Loop Ledger |

## Integration order
1. **Read-only, low-risk first:** FX, logistics rates, customs/duty, supplier DB.
2. **Compliance & inspection:** route data, cert verification, QC.
3. **Write/side-effect (gated by Agent Action approval):** listing publish, ad platform, payment.
4. **Finance (last, highest care):** eligibility & trade-finance referrals — never guarantees.

## Principle
Every external side effect passes through the **Agent Action Safety Model** approval gate
(`AGENT_ACTION_SAFETY_MODEL.md`). In the MVP, all tools are mock and create no real effects.
