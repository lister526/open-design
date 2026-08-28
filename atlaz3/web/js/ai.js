/* ============================================================================
 * Atlaz · TradeAiService (17 methods) + TradeToolRegistry (15 tools)
 * All AI output is a JSON envelope with the mandated fields. No plain text.
 * Globals: TradeAiService, TradeToolRegistry, AiGenerationLog
 * ==========================================================================*/

const DISCLAIMER_AI = "AI outputs are for operational assistance only and may contain errors.";
const DISCLAIMER_COMP = "This result is a general operational risk signal only and does not constitute legal advice. Before real sales, consult qualified compliance professionals, testing labs, platform rules, customs brokers, or local legal counsel.";
const DISCLAIMER_FIN = "Estimates only. Atlaz provides no loan commitment and this is not investment, tax, lending, accounting, or financing advice.";

/* ---------------------------------------------------------- TradeToolRegistry (15 mock tools) */
const TradeToolRegistry = (() => {
  function tool(name, opts) {
    return Object.assign({
      name,
      connectedMock: true,
      reservedProductionApi: opts.api || null,
      requiredCredentials: opts.creds || [],
      riskLevel: opts.risk || "Low",
      userApprovalRequired: !!opts.approval,
      dataStored: opts.stored || [],
      futureProviderExamples: opts.providers || [],
      status: "Connected (mock) · production API reserved",
    }, opts.extra || {});
  }
  const reg = {
    supplierDatabaseTool: tool("supplierDatabaseTool", { api: "supplierApi", creds: ["supplier_api_key"], stored: ["supplier records"], providers: ["1688/Alibaba-style sourcing APIs"],
      extra: { query: (oppId) => (typeof DB !== "undefined" ? DB.getSuppliers(oppId) : []) } }),
    supplierTrustGraphTool: tool("supplierTrustGraphTool", { stored: ["trust signals"], providers: ["Atlaz Supplier Trust Graph"],
      extra: { signals: (sid) => (typeof DB !== "undefined" ? DB.supplierTrustSignals.filter(s => s.supplierId === sid) : []) } }),
    complianceDatabaseTool: tool("complianceDatabaseTool", { api: "complianceApi", risk: "Medium", stored: ["compliance rules(mock)"], providers: ["Regulatory data vendors"] }),
    complianceRouteTool: tool("complianceRouteTool", { api: "complianceApi", risk: "Medium", approval: false, providers: ["Atlaz Compliance Route Engine"] }),
    logisticsRateTool: tool("logisticsRateTool", { api: "logisticsApi", creds: ["logistics_api_key"], providers: ["Flexport-style / freight forwarders"] }),
    currencyRateTool: tool("currencyRateTool", { api: "fxApi", stored: ["fx snapshots"], providers: ["FX rate vendors"],
      extra: { rate: (code) => (typeof DB !== "undefined" ? (DB.currencyRates.find(r => r.quote === code) || {}).rate : 1) } }),
    paymentTool: tool("paymentTool", { api: "paymentApi", risk: "High", approval: true, creds: ["payment_key"], providers: ["Stripe/PingPong-style"] }),
    inspectionTool: tool("inspectionTool", { api: "inspectionApi", risk: "Medium", providers: ["QIMA-style inspection"] }),
    certificationVerificationTool: tool("certificationVerificationTool", { api: "certificationApi", risk: "Medium", approval: true, providers: ["Accredited labs/issuers"] }),
    adPlatformTool: tool("adPlatformTool", { api: "adPlatformApi", creds: ["ad_account_token"], providers: ["TikTok/Meta Ads"] }),
    ecommerceListingTool: tool("ecommerceListingTool", { api: "marketplaceListingApi", risk: "Medium", approval: true, providers: ["Amazon SP-API / Shopify / TikTok Shop"] }),
    financeEligibilityTool: tool("financeEligibilityTool", { api: "financeApi", risk: "High", approval: true, providers: ["Supply-chain finance partners"] }),
    customsDutyTool: tool("customsDutyTool", { api: "customsApi", risk: "Medium", providers: ["HS-code / customs data vendors"] }),
    documentExportTool: tool("documentExportTool", { api: null, stored: ["generated documents"], providers: ["PDF/export services"] }),
    tradeLedgerTool: tool("tradeLedgerTool", { stored: ["trade loop events"], providers: ["Atlaz Trade Loop Ledger"],
      extra: { append: (sku, type, o) => (typeof TradeLoopLedgerService !== "undefined" ? TradeLoopLedgerService.record(sku, type, o) : null) } }),
  };
  reg.list = () => Object.keys(reg).filter(k => typeof reg[k] === "object");
  return reg;
})();
if (typeof window !== "undefined") window.TradeToolRegistry = TradeToolRegistry;

/* ---------------------------------------------------------- AiGenerationLog */
const AiGenerationLog = [];
if (typeof window !== "undefined") window.AiGenerationLog = AiGenerationLog;

/* ---------------------------------------------------------- TradeAiService */
const TradeAiService = (() => {
  let n = 0;
  function envelope(sourceType, payload, opts = {}) {
    const env = {
      schemaVersion: "1.0",
      generatedAt: new Date().toISOString(),
      sourceType,
      skuPassportId: opts.skuPassportId || null,
      confidenceScore: opts.confidenceScore != null ? opts.confidenceScore : 0.75,
      riskLevel: opts.riskLevel || "Low",
      assumptions: opts.assumptions || ["Mock data used", "Figures are estimates"],
      userActionRequired: opts.userActionRequired || [],
      suggestedAgentActions: opts.suggestedAgentActions || [],
      nextStep: opts.nextStep || "Review the output and continue the Trade Loop.",
      disclaimer: opts.disclaimer || DISCLAIMER_AI,
      auditLogPreview: `[mock] ${sourceType} generated at ${new Date().toISOString()} (#${++n}).`,
      payload,
    };
    env.rawJsonPreview = JSON.stringify({ sourceType, skuPassportId: env.skuPassportId, confidenceScore: env.confidenceScore, riskLevel: env.riskLevel, payload }, null, 2);
    AiGenerationLog.push({ id: `AILOG-${n}`, sourceType, at: env.generatedAt, skuPassportId: env.skuPassportId, riskLevel: env.riskLevel });
    return env;
  }

  function log(sku, type, opts) { try { TradeLoopLedgerService.record(sku, type, opts); } catch (e) {} }

  // 1
  function generateOpportunityReport(opp) {
    const sku = `SKU-${opp.opportunityId.slice(4)}`;
    log(sku, "opportunity_analyzed", { confidenceScore: opp.confidenceScore, riskLevel: opp.riskLevel });
    return envelope("opportunity_report", {
      painPoint: `${opp.targetPersona} need a better ${opp.category.toLowerCase()} solution.`,
      whyNow: opp.evidenceSummary, persona: opp.targetPersona,
      contentLogic: `${opp.platform} short-form demos showing the problem→result.`,
      hooks: [`Stop doing X the hard way`, `Watch this ${opp.productConcept.toLowerCase()} in action`],
      testBudget: opp.testBudget, recommendedQty: opp.recommendedFirstOrderQty, targetPrice: DB.parsePrice(opp.priceBand),
      estimatedMargin: opp.estimatedMargin, cashConversionPotential: opp.cashConversionPotential,
      coreRisks: [opp.complianceRisk + " compliance risk", opp.competitionIntensity + " competition"],
      alternatives: ["Adjacent variant", "Bundle option"], supplierRegion: opp.recommendedSupplierRegion,
      validationMetrics: ["CTR > 4%", "Conversion > 2%", "ROAS > 2", "Refund < 6%"],
      complianceFocus: opp.complianceComplexity, supplierCriteria: ["Trust score > 0.8", "Sample lead < 7d", "Relevant certs"],
    }, { skuPassportId: sku, confidenceScore: opp.confidenceScore, riskLevel: opp.riskLevel,
      userActionRequired: ["Create SKU Passport", "Match suppliers"],
      suggestedAgentActions: ["CREATE_RFQ", "GENERATE_LISTING", "CALCULATE_LANDED_COST"],
      nextStep: "Create a SKU Passport to start the Trade Loop." });
  }
  // 2
  function createSkuPassport(opp) {
    const passport = DB.getPassport(opp.opportunityId) || {};
    log(passport.skuPassportId, "sku_passport_created", { riskLevel: opp.riskLevel });
    return envelope("sku_passport", passport, { skuPassportId: passport.skuPassportId, confidenceScore: opp.confidenceScore, riskLevel: opp.riskLevel,
      userActionRequired: ["Match suppliers", "Run compliance route"], nextStep: "Match suppliers for this SKU Passport." });
  }
  // 3
  function recommendSuppliers(opp) {
    const sku = `SKU-${opp.opportunityId.slice(4)}`;
    const suppliers = TradeToolRegistry.supplierDatabaseTool.query(opp.opportunityId);
    log(sku, "suppliers_matched", { confidenceScore: 0.8 });
    return envelope("supplier_recommendations", { suppliers, count: suppliers.length, topTrust: suppliers[0] && suppliers[0].trustScore },
      { skuPassportId: sku, confidenceScore: 0.8, userActionRequired: ["Select a supplier", "Compare quotes"],
        suggestedAgentActions: ["CREATE_RFQ", "REQUEST_SUPPLIER_COUNTERQUOTE"], nextStep: "Select a supplier or compare quotes." });
  }
  // 4
  function generateSupplierTrustSummary(supplier) {
    const signals = TradeToolRegistry.supplierTrustGraphTool.signals(supplier.supplierId);
    return envelope("supplier_trust_summary", {
      supplierId: supplier.supplierId, factory: supplier.factoryName, trustScore: supplier.trustScore,
      explanation: supplier.trustScoreExplanation, onTime: supplier.onTimeFulfillmentRate, disputeRate: supplier.returnDisputeRate,
      verification: supplier.verificationStatus, signals, riskFlags: supplier.riskFlags,
    }, { confidenceScore: 0.76, riskLevel: supplier.trustScore < 0.65 ? "Medium" : "Low",
      userActionRequired: supplier.verificationStatus.includes("Unverified") ? ["Request certificate verification"] : [],
      nextStep: "Generate RFQ or request verification." });
  }
  // 5
  function generateInquiryEmail(opp, supplier) {
    const lang = I18N.aiOutputLangFor(opp.targetRegion);
    const sku = `SKU-${opp.opportunityId.slice(4)}`;
    log(sku, "rfq_generated", { userApprovalRequired: true, riskLevel: "Medium" });
    return envelope("inquiry_email", {
      to: supplier.factoryName, language: lang + " + Chinese (for factory)",
      subject: `Inquiry: ${opp.productConcept} — sample & quote request`,
      body: `Hello ${supplier.factoryName},\n\nWe're sourcing a ${opp.productConcept} for the ${opp.targetRegion} market (${opp.platform}). Please share: best unit price at MOQ ${supplier.MOQ}, sample lead time, production lead time, certifications (${supplier.certifications.join(", ")}), and payment terms.\n\nWe plan a first test order of ~${opp.recommendedFirstOrderQty} units.\n\nThank you,\nAtlaz merchant (mock)`,
      chinese: `您好 ${supplier.factoryName}，我们正在为${opp.targetRegion}市场（${opp.platform}）采购「${opp.productConcept}」。请提供：MOQ ${supplier.MOQ} 的最优单价、打样周期、量产周期、认证（${supplier.certifications.join("、")}）及付款条件。首单测试约 ${opp.recommendedFirstOrderQty} 件。谢谢。`,
    }, { skuPassportId: sku, confidenceScore: 0.82, riskLevel: "Medium", userActionRequired: ["Approve RFQ before sending"],
      suggestedAgentActions: ["CREATE_RFQ"], nextStep: "Approve to record the RFQ (no real message is sent in MVP)." });
  }
  // 6
  function generateWechatScript(opp, supplier) {
    const sku = `SKU-${opp.opportunityId.slice(4)}`;
    return envelope("wechat_script", {
      script: `您好，看到贵厂做${opp.category}。想了解「${opp.productConcept}」的样品和报价：MOQ、单价、打样周期、认证和账期。我们做${opp.targetRegion}市场，先小批量测试。方便发一下报价表吗？`,
      tone: "Professional, concise, relationship-building",
    }, { skuPassportId: sku, confidenceScore: 0.78, nextStep: "Use to start a supplier conversation (mock)." });
  }
  // 7
  function generateSampleBrief(opp, supplier) {
    const mat = DB.materialFor(opp);
    const sku = `SKU-${opp.opportunityId.slice(4)}`;
    log(sku, "sample_brief_generated", {});
    return envelope("sample_brief", {
      product: opp.productConcept, material: mat.primaryMaterial, targetSpec: "Per reference + tolerances below",
      tolerances: "±2% dimension, function pass, no visible defects", color: "Per approved sample", quantity: 3,
      deadline: supplier.sampleLeadTime, packaging: "Retail-ready (mock)", inspectionPoints: ["Dimension", "Function", "Appearance", "Packaging"],
    }, { skuPassportId: sku, confidenceScore: 0.8, suggestedAgentActions: ["GENERATE_QC_CHECKLIST"], nextStep: "Generate a QC checklist for sample inspection." });
  }
  // 8
  function generateQuotationComparison(opp) {
    const rows = DB.quoteComparisonFor(opp);
    const sku = `SKU-${opp.opportunityId.slice(4)}`;
    return envelope("quotation_comparison", { rows, recommended: rows[0] && rows[0].supplierId, criteria: "Trust score, price, lead time, terms" },
      { skuPassportId: sku, confidenceScore: 0.79, userActionRequired: ["Select a supplier"], nextStep: "Select the best-fit supplier." });
  }
  // 9
  function generateListingDraft(opp) {
    const draft = DB.getListing(opp);
    const sku = `SKU-${opp.opportunityId.slice(4)}`;
    log(sku, "listing_generated", { userApprovalRequired: true, riskLevel: opp.riskLevel });
    return envelope("listing_draft", draft, { skuPassportId: sku, confidenceScore: opp.confidenceScore, riskLevel: opp.riskLevel,
      userActionRequired: ["Review claims", "Run compliance route"], suggestedAgentActions: ["GENERATE_LISTING", "BLOCK_HIGH_RISK_CLAIM"],
      nextStep: "Run a Compliance Route Check before publishing." });
  }
  // 10
  function runComplianceRouteCheck(opp) {
    const c = DB.getCompliance(opp);
    const sku = `SKU-${opp.opportunityId.slice(4)}`;
    log(sku, "compliance_route_checked", { riskLevel: c.riskLevel, userApprovalRequired: c.riskLevel === "High" });
    return envelope("compliance_route", c, { skuPassportId: sku, confidenceScore: 0.7, riskLevel: c.riskLevel, disclaimer: DISCLAIMER_COMP,
      userActionRequired: c.riskLevel === "High" ? ["Rewrite high-risk claims", "Seek professional review"] : ["Confirm labeling"],
      suggestedAgentActions: c.riskLevel === "High" ? ["BLOCK_HIGH_RISK_CLAIM", "REQUEST_CERTIFICATE_VERIFICATION"] : [],
      nextStep: c.riskLevel === "High" ? "Reposition claims and verify certifications before selling." : "Proceed to landed-cost calculation." });
  }
  // 11
  function generateTradeDocument(opp, templateId) {
    const tpl = DB.documentTemplates.find(t => t.templateId === templateId) || DB.documentTemplates[0];
    const sku = `SKU-${opp.opportunityId.slice(4)}`;
    const filled = {}; tpl.fields.forEach(f => { filled[f] = `<${f}> (mock)`; });
    return envelope("trade_document", { template: tpl.name, templateId: tpl.templateId, fields: filled },
      { skuPassportId: sku, confidenceScore: 0.85, nextStep: "Export the document (mock)." });
  }
  // 12
  function calculateCashConversionScore(inputs, sku) {
    const out = DB.calcCash(inputs);
    log(sku || null, "cash_conversion_calculated", { riskLevel: out.decision === "stop" ? "High" : "Low" });
    return envelope("cash_conversion", { inputs, output: out }, { skuPassportId: sku || null, confidenceScore: 0.74,
      riskLevel: out.decision === "stop" ? "High" : out.decision === "test_smaller" ? "Medium" : "Low", disclaimer: DISCLAIMER_FIN,
      userActionRequired: out.decision === "negotiate" ? ["Negotiate unit cost / MOQ"] : [],
      suggestedAgentActions: ["CALCULATE_LANDED_COST", out.decision === "buy" ? "CREATE_SAMPLE_ORDER" : "REQUEST_SUPPLIER_COUNTERQUOTE"],
      nextStep: `Decision: ${out.decision}. ${out.explanation}` });
  }
  // 13
  function createTradeLoopLedgerEvent(sku, eventType, opts) { return TradeLoopLedgerService.record(sku, eventType, opts || {}); }
  // 14
  function generateGrowthPlaybook(opp) {
    const g = DB.getGrowth(opp.opportunityId) || {};
    const sku = `SKU-${opp.opportunityId.slice(4)}`;
    log(sku, "growth_playbook_created", {});
    return envelope("growth_playbook", { plan7: g.plan7, plan14: g.plan14, plan30: g.plan30,
      elements: ["Video cadence", "Ad budget", "Creator collab", "Comment scripts", "Feedback", "A/B tests", "Price test", "Creative test", "Reorder", "Competitor watch", "Stop conditions", "Scale conditions"],
      creatorBrief: DB.getListing(opp).creatorBrief },
      { skuPassportId: sku, confidenceScore: 0.73, userActionRequired: ["Record results after 7/14/30 days"], nextStep: "Run the 7-day test and record results." });
  }
  // 15
  function evaluateExperimentResult(growth) {
    const m = growth.metrics || {};
    let decision, reasoning;
    if (m.refundRate > 0.1 || m.ROAS < 1) { decision = "stop"; reasoning = "High refund and/or weak ROAS — stop and reallocate."; }
    else if (m.ROAS >= 3 && m.conversionRate >= 0.03) { decision = "reorder"; reasoning = "Strong ROAS and conversion — reorder and prep supplier restock."; }
    else if (m.CAC > 15) { decision = "lower_price"; reasoning = "CAC too high — test a lower price point to improve conversion."; }
    else if (m.conversionRate < 0.015) { decision = "switch_market"; reasoning = "Conversion weak in this market — test an alternative market."; }
    else { decision = "iterate_product"; reasoning = "Mixed signals — iterate creative/offer before scaling."; }
    const sku = growth.skuPassportId;
    log(sku, "experiment_result_recorded", {});
    log(sku, "ai_decision_generated", { userApprovalRequired: true, riskLevel: decision === "stop" ? "High" : "Low" });
    return envelope("experiment_evaluation", { metrics: m, decision, reasoning,
      decisionSpace: ["reorder", "iterate_product", "lower_price", "switch_market", "stop", "renegotiate_supplier", "lower_moq", "change_creative"] },
      { skuPassportId: sku, confidenceScore: 0.71, riskLevel: decision === "stop" ? "High" : "Low",
        userActionRequired: ["Confirm final decision"], suggestedAgentActions: ["EVALUATE_REORDER"], nextStep: "Confirm the human final decision." });
  }
  // 16
  function proposeAgentActions(context) {
    const sku = context && context.skuPassportId || null;
    const actions = (typeof DB !== "undefined" ? DB.agentActions : []).slice(0, 4).map(a => ({
      actionId: a.actionId, actionType: a.actionType, title: a.title, riskLevel: a.riskLevel,
      requiresUserApproval: a.requiresUserApproval, confidenceScore: a.confidenceScore,
    }));
    return envelope("agent_action_proposal", { actions }, { skuPassportId: sku, confidenceScore: 0.7,
      userActionRequired: ["Approve high-risk actions"], disclaimer: "High-risk actions require human review and approval.",
      nextStep: "Review and approve/reject each proposed action." });
  }
  // 17
  function exportSkuPassportJson(opp) {
    const passport = DB.getPassport(opp.opportunityId);
    const sku = passport && passport.skuPassportId;
    const ledger = TradeLoopLedgerService.forSku(sku);
    const full = Object.assign({}, passport, { ledgerEvents: ledger.length, exportedAt: new Date().toISOString() });
    log(sku, "human_decision_confirmed", { evidence: "SKU Passport exported." });
    return envelope("sku_passport_export", full, { skuPassportId: sku, confidenceScore: 0.95, nextStep: "Download / share the SKU Passport JSON (mock)." });
  }

  return {
    generateOpportunityReport, createSkuPassport, recommendSuppliers, generateSupplierTrustSummary,
    generateInquiryEmail, generateWechatScript, generateSampleBrief, generateQuotationComparison,
    generateListingDraft, runComplianceRouteCheck, generateTradeDocument, calculateCashConversionScore,
    createTradeLoopLedgerEvent, generateGrowthPlaybook, evaluateExperimentResult, proposeAgentActions,
    exportSkuPassportJson,
  };
})();
if (typeof window !== "undefined") window.TradeAiService = TradeAiService;
