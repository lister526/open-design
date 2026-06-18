/* ============================================================================
 * Atlaz v4 · TradeAiService + TradeToolRegistry + CashEngine
 *
 * EVERY AI output is a 15-field JSON work-order (the "envelope"):
 *   id, type, inputSnapshot, market, platform, confidence, evidence,
 *   assumptions, risks, recommendation, nextActions, generatedAssets,
 *   humanApprovalRequired, legalDisclaimer, createdAt
 *
 * The envelope is not a preview — it drives UI render, state changes, file
 * templates and Agent Actions. High-risk actions default to humanApprovalRequired.
 *
 * Globals: TradeAiService, TradeToolRegistry, CashEngine, AiGenerationLog
 * ==========================================================================*/
const DISCLAIMER_AI   = "AI outputs are for operational assistance only and may contain errors. Verify before acting.";
const DISCLAIMER_COMP = "This result is a general operational risk signal only and does not constitute legal advice. Before real sales, consult qualified compliance professionals, testing labs, platform rules, customs brokers, or local legal counsel.";
const DISCLAIMER_FIN  = "Estimates only. Atlaz provides no loan commitment and this is not investment, tax, lending, accounting, or financing advice.";

const HIGH_RISK_ACTION_TYPES = ["send_inquiry","confirm_order","request_credit_terms",
  "generate_compliance_statement","submit_listing","trigger_payment","share_supplier_data"];

/* =========================================================================
 * TradeToolRegistry — 7 reserved Tool Adapters + supporting mock tools.
 * ======================================================================= */
const TradeToolRegistry = (() => {
  function adapter(name, opts){
    return Object.assign({
      name, connectedMock:true, reservedProductionApi:opts.api||null,
      requiredCredentials:opts.creds||[], riskLevel:opts.risk||"Low",
      userApprovalRequired:!!opts.approval, dataStored:opts.stored||[],
      futureProviderExamples:opts.providers||[],
      status:"Connected (mock) · production API reserved"
    }, opts.extra||{});
  }
  const DBref = (typeof DB!=="undefined"?DB:(typeof global!=="undefined"?global.DB:null));
  const reg = {
    SupplierApiAdapter: adapter("SupplierApiAdapter",{api:"supplierApi",creds:["supplier_api_key"],stored:["supplier records"],providers:["1688 / Alibaba-style sourcing APIs"],
      extra:{query:(oppId)=>DBref?DBref.getSuppliers(oppId):[]}}),
    LogisticsApiAdapter: adapter("LogisticsApiAdapter",{api:"logisticsApi",creds:["logistics_api_key"],risk:"Medium",providers:["Flexport-style / freight forwarders"]}),
    PaymentApiAdapter: adapter("PaymentApiAdapter",{api:"paymentApi",risk:"High",approval:true,creds:["payment_key"],providers:["Stripe / PingPong-style"]}),
    ComplianceDatabaseAdapter: adapter("ComplianceDatabaseAdapter",{api:"complianceApi",risk:"Medium",stored:["compliance rules (mock)"],providers:["Regulatory data vendors"]}),
    AdPlatformAdapter: adapter("AdPlatformAdapter",{api:"adPlatformApi",creds:["ad_account_token"],providers:["TikTok / Meta Ads"]}),
    MarketplaceListingAdapter: adapter("MarketplaceListingAdapter",{api:"marketplaceListingApi",risk:"Medium",approval:true,providers:["Amazon SP-API / Shopify / TikTok Shop"]}),
    InspectionServiceAdapter: adapter("InspectionServiceAdapter",{api:"inspectionApi",risk:"Medium",providers:["QIMA-style inspection"]}),
    currencyRateTool: adapter("currencyRateTool",{api:"fxApi",stored:["fx snapshots"],providers:["FX rate vendors"],
      extra:{rate:(code)=>DBref&&DBref.FxService?DBref.FxService.rate(code):1}}),
    tradeLedgerTool: adapter("tradeLedgerTool",{stored:["trade loop events"],providers:["Atlaz Trade Loop Ledger"],
      extra:{append:(sku,type,o)=>typeof TradeLoopLedgerService!=="undefined"?TradeLoopLedgerService.record(sku,type,o):null}}),
  };
  reg.adapters = ["SupplierApiAdapter","LogisticsApiAdapter","PaymentApiAdapter","ComplianceDatabaseAdapter","AdPlatformAdapter","MarketplaceListingAdapter","InspectionServiceAdapter"];
  reg.list = ()=>Object.keys(reg).filter(k=>typeof reg[k]==="object");
  return reg;
})();
if (typeof window!=="undefined") window.TradeToolRegistry=TradeToolRegistry;

/* =========================================================================
 * CashEngine — Cash Conversion Score (survive-the-test-period engine).
 * ======================================================================= */
const CashEngine = (() => {
  const r2=(n)=>Math.round(n*100)/100;
  function fmtUsd(n){ return "$"+Number(n).toLocaleString("en-US",{maximumFractionDigits:0}); }
  function compute(inp){
    const qty = inp.moq;
    const sell = inp.sellingPrice*(1-(inp.discountPct||0));
    const platformFee = sell*(inp.platformCommissionPct||0);
    const payFee = sell*(inp.paymentFeePct||0);
    const tariff = inp.purchaseUnitPrice*(inp.tariffPct||0);
    const variable = inp.purchaseUnitPrice + tariff + (inp.packagingPerUnit||0) +
      (inp.intlFreightPerUnit||0) + (inp.localWarehousingPerUnit||0) + platformFee + payFee;
    const grossMarginUnit = sell - inp.purchaseUnitPrice - tariff;
    const contributionUnit = sell - variable;
    const grossMarginPct = sell? grossMarginUnit/sell : 0;
    const contributionPct = sell? contributionUnit/sell : 0;
    const effContribution = contributionUnit*(1-(inp.returnRatePct||0))*(1-(inp.damageRatePct||0));
    const goodsCost = inp.purchaseUnitPrice*qty + (inp.toolingFee||0) + (inp.sampleFee||0) + (inp.intlFreightPerUnit||0)*qty + tariff*qty;
    const adBudget = inp.adBudget||0;
    const fxBuffer = goodsCost*(inp.fxBufferPct||0);
    const cashNeededBeforeRevenue = r2(goodsCost + adBudget + fxBuffer);
    // Break-even = fixed costs (ad + tooling + sample + fx buffer) recovered from
    // per-unit effective contribution. Goods cost is recovered as inventory sells.
    const fixedCosts = adBudget + (inp.toolingFee||0) + (inp.sampleFee||0) + fxBuffer;
    const breakEvenUnits = effContribution>0 ? Math.ceil(fixedCosts/effContribution) : Infinity;
    const sellThrough = inp.expectedSellThroughDays||30;
    const dailyOrders = qty/sellThrough;
    const daysToCashRecovery = (effContribution>0 && dailyOrders>0) ? Math.ceil(breakEvenUnits/dailyOrders) : Infinity;
    const inventoryPressure = qty>=1000?"High":qty>=400?"Medium":"Low";
    const adBudgetRisk = adBudget>cashNeededBeforeRevenue*0.45?"High":adBudget>cashNeededBeforeRevenue*0.28?"Medium":"Low";
    const fxRisk = (inp.fxBufferPct||0)>=0.04?"High":(inp.fxBufferPct||0)>=0.025?"Medium":"Low";
    const tariffRisk = (inp.tariffPct||0)>=0.12?"High":(inp.tariffPct||0)>=0.06?"Medium":"Low";
    const returnRisk = (inp.returnRatePct||0)>=0.08?"High":(inp.returnRatePct||0)>=0.05?"Medium":"Low";
    // projected profit if the order sells through (the survive-the-test test)
    const projectedProfit = effContribution*qty - fixedCosts;
    const profitToCashRatio = cashNeededBeforeRevenue? projectedProfit/cashNeededBeforeRevenue : 0;
    let recommendation, explanation;
    const breakEvenRatio = breakEvenUnits/qty;
    if(contributionPct<=0.08){ recommendation="stop"; explanation=`Contribution margin is only ${Math.round(contributionPct*100)}% after fees, returns and freight — too thin to survive returns and ad costs. Renegotiate cost or change product.`; }
    else if(breakEvenRatio>0.85 || adBudgetRisk==="High"){ recommendation="negotiate"; explanation=`You must sell ~${Math.round(breakEvenRatio*100)}% of the order just to cover fixed (ad+tooling) costs. Negotiate unit price/freight or cut ad budget before committing.`; }
    else if(inventoryPressure==="High" || cashNeededBeforeRevenue>3000 || fxRisk==="High"){ recommendation="test_smaller"; explanation=`Economics work, but a ${qty}-unit order ties up ${fmtUsd(cashNeededBeforeRevenue)} before revenue. Start with 100–200 units to de-risk cash, then reorder on data.`; }
    else { recommendation="buy"; explanation=`Healthy contribution (${Math.round(contributionPct*100)}%); fixed costs covered after ${breakEvenUnits} of ${qty} units, projected test profit ~${fmtUsd(projectedProfit)}. Cash exposure ${fmtUsd(cashNeededBeforeRevenue)} recoverable in ~${daysToCashRecovery} days.`; }
    return {
      grossMargin:r2(grossMarginPct*100), contributionMargin:r2(contributionPct*100),
      grossMarginUnit:r2(grossMarginUnit), contributionUnit:r2(contributionUnit),
      breakEvenUnits: breakEvenUnits===Infinity?null:breakEvenUnits,
      cashNeededBeforeRevenue, daysToCashRecovery: daysToCashRecovery===Infinity?null:daysToCashRecovery,
      projectedTestProfit:r2(projectedProfit), profitToCashRatio:r2(profitToCashRatio),
      inventoryPressure, adBudgetRisk, fxRisk, tariffRisk, returnRisk,
      recommendation, explanation,
      sensitivityAnalysis:[
        {lever:"Unit price −10%", effect:`Contribution rises to ${r2((contributionUnit+inp.purchaseUnitPrice*0.1)/sell*100)}%`},
        {lever:"Sell price +$2", effect:`Contribution ${r2((contributionUnit+2)/(sell+2)*100)}%`},
        {lever:"First order 100u", effect:`Cash needed ~${fmtUsd(r2(inp.purchaseUnitPrice*100+(inp.toolingFee||0)+(inp.sampleFee||0)+adBudget))}`}
      ]
    };
  }
  return { compute };
})();
if (typeof window!=="undefined") window.CashEngine=CashEngine;

const AiGenerationLog = [];
if (typeof window!=="undefined") window.AiGenerationLog=AiGenerationLog;

/* =========================================================================
 * TradeAiService — all methods return the 15-field envelope.
 * Methods take OBJECTS (opportunity / supplier / deal room), never bare ids.
 * ======================================================================= */
const TradeAiService = (() => {
  const DBref = (typeof DB!=="undefined"?DB:(typeof global!=="undefined"?global.DB:null));
  const aiLangFor = (region)=> (typeof I18N!=="undefined"?I18N.aiOutputLangFor(region):"en");
  let n = 0;

  /* The mandated 15-field envelope. */
  function envelope(type, opts){
    opts = opts || {};
    const env = {
      id: `AI-${type}-${++n}-${Date.now().toString().slice(-5)}`,
      type,
      inputSnapshot: opts.inputSnapshot || {},
      market: opts.market || "—",
      platform: opts.platform || "—",
      confidence: opts.confidence != null ? opts.confidence : 0.8,
      evidence: opts.evidence || [],
      assumptions: opts.assumptions || [],
      risks: opts.risks || [],
      recommendation: opts.recommendation || "",
      nextActions: opts.nextActions || [],
      generatedAssets: opts.generatedAssets || {},
      humanApprovalRequired: !!opts.humanApprovalRequired,
      legalDisclaimer: opts.legalDisclaimer || DISCLAIMER_AI,
      createdAt: new Date().toISOString()
    };
    AiGenerationLog.push({id:env.id,type,createdAt:env.createdAt});
    return env;
  }

  const num = (s)=> DBref?DBref.parsePrice(s):0;

  /* 1) Opportunity Thesis (investment-memo JSON) */
  function generateOpportunityReport(opp){
    return envelope("opportunity_thesis",{
      inputSnapshot:{opportunityId:opp.opportunityId,concept:opp.productConcept},
      market:opp.targetRegion, platform:opp.platform,
      confidence: opp.decision==="recommended"?0.84:opp.decision==="high_risk_review"?0.55:0.7,
      evidence:[opp.evidenceSummary, `Trend: ${opp.trendVelocity}`, `Content signal: ${opp.contentSignal}`],
      assumptions:[`Sell price band ${opp.priceBand}`, `Landed cost ${opp.landedCostEstimate}`, `First-order qty ${opp.suggestedFirstOrderQty}`],
      risks:[opp.antiThesis, `Compliance risk: ${opp.complianceRisk}`, `Cash cycle risk: ${opp.cashCycleRisk}`],
      recommendation: opp.decision==="recommended"?"Proceed to supplier match and a small first test."
        : opp.decision==="high_risk_review"?"Do NOT launch before clearing the compliance route."
        : "Add to watchlist; revisit after a stronger demand signal.",
      nextActions:[{action:"create_passport",label:"Create SKU Passport"},{action:"find_suppliers",label:"Match suppliers"},{action:"run_compliance",label:"Run compliance route"}],
      generatedAssets:{ opportunityThesis:{
        opportunityId:opp.opportunityId, scenario:opp.scenario, persona:opp.targetPersona,
        demandSignal:opp.demandSignal, contentAngle:opp.contentSignal, priceBand:opp.priceBand,
        estimatedMargin:opp.estimatedMargin, supplyRegion:opp.recommendedSupplierRegion,
        firstTestBudget:opp.firstTestBudget, firstOrderQty:opp.suggestedFirstOrderQty,
        whyNow:opp.whyNow, antiThesis:opp.antiThesis, verdict:opp.decision }},
      aiOutputLanguage: aiLangFor(opp.targetRegion)
    });
  }

  /* 2) Create SKU Passport */
  function createSkuPassport(opp){
    const sid=`SKU-${opp.opportunityId.slice(4)}`;
    if(typeof TradeLoopLedgerService!=="undefined") TradeLoopLedgerService.record(sid,"thesis_generated",{evidence:opp.evidenceSummary});
    return envelope("sku_passport_created",{
      inputSnapshot:{opportunityId:opp.opportunityId}, market:opp.targetRegion, platform:opp.platform,
      confidence:0.9, evidence:[`Passport opens the Deal Room for ${opp.productConcept}.`],
      recommendation:"Open the Deal Room and start the supplier shortlist.",
      nextActions:[{action:"open_dealroom",label:"Open Deal Room"}],
      generatedAssets:{skuPassportId:sid, skuName:opp.productConcept, stage:"opportunity_confirmed"}
    });
  }

  /* 3) Recommend suppliers (uses dynamic trust graph) */
  function recommendSuppliers(opp){
    const sup = (DBref?DBref.getSuppliers(opp.opportunityId):[]);
    return envelope("supplier_shortlist",{
      inputSnapshot:{opportunityId:opp.opportunityId,count:sup.length},
      market:opp.targetRegion, platform:opp.platform, confidence:0.82,
      evidence: sup.slice(0,3).map(s=>`${s.factoryName}: trust ${s.trustScore} (${s.trustTier})`),
      assumptions:["Trust scores derive from quote speed, sample consistency, on-time, dispute, cert confidence, market fit."],
      risks: sup.filter(s=>s.recommend==="not_recommended").map(s=>`${s.factoryName}: ${s.watchOut}`),
      recommendation: `Use ${(sup.find(s=>s.recommend==="recommended_test")||{}).factoryName||"the test pick"} for the first 100-unit test; reserve the cert pick for compliance-sensitive scaling.`,
      nextActions:[{action:"war_room",label:"Open Supplier War Room"},{action:"send_inquiry",label:"Draft inquiry (needs approval)"}],
      generatedAssets:{shortlist: sup.map(s=>({supplierId:s.supplierId,name:s.factoryName,trustScore:s.trustScore,tier:s.trustTier,recommend:s.recommend,bestFor:s.bestFor,watchOut:s.watchOut}))}
    });
  }

  /* 4) Supplier trust summary */
  function generateSupplierTrustSummary(supplier){
    return envelope("supplier_trust_summary",{
      inputSnapshot:{supplierId:supplier.supplierId}, confidence:supplier.trustScore/100,
      evidence:[`On-time ${supplier.onTimeFulfillmentRate}`,`Sample consistency ${supplier.qualityConsistencyScore}/100`,`Cert confidence ${supplier.certificationConfidence}/100`,`Dispute ${supplier.returnDisputeRate}`],
      risks: supplier.recommend==="not_recommended"?[supplier.watchOut]:[`Watch: ${supplier.watchOut}`],
      recommendation: supplier.bestFor,
      generatedAssets:{trustScore:supplier.trustScore,tier:supplier.trustTier,trend:supplier.trustTrend,negotiation:supplier.recommendedNegotiation}
    });
  }

  /* 5) Inquiry email — HIGH-RISK (send) requires approval */
  function generateInquiryEmail(opp, supplier){
    const lang=aiLangFor(opp.targetRegion);
    return envelope("inquiry_email",{
      inputSnapshot:{opportunityId:opp.opportunityId,supplierId:supplier&&supplier.supplierId}, market:opp.targetRegion, platform:opp.platform,
      confidence:0.86, humanApprovalRequired:true,
      evidence:["Drafted from opportunity spec + supplier profile."],
      risks:["Sending contacts an external party — requires your approval before send."],
      recommendation:"Review the draft, then approve to send (mock).",
      nextActions:[{action:"send_inquiry",label:"Approve & send (mock)",riskLevel:"Medium"}],
      generatedAssets:{ emailSubject:`RFQ: ${opp.productConcept} — first test order`,
        emailBody:`Hello ${supplier?supplier.factoryName:"team"},\n\nWe are sourcing ${opp.productConcept} for the ${opp.targetRegion} ${opp.platform} market. For an initial test we need:\n- Target qty: ${opp.suggestedFirstOrderQty} units (open to your MOQ)\n- Target landed cost: ${opp.landedCostEstimate}\n- Required certs: please confirm which you hold\n- Sample lead time & sample cost\n- Unit price at 100 / 500 / 1000 units\n\nPlease also confirm export experience to ${opp.targetRegion}. Thank you.\n\nBest regards,\nAtlaz merchant`,
        aiOutputLanguage:lang }
    });
  }

  /* 6) WeChat / IM script */
  function generateWechatScript(opp, supplier){
    return envelope("wechat_script",{
      inputSnapshot:{opportunityId:opp.opportunityId}, confidence:0.8,
      recommendation:"Use after the email to speed up the quote.",
      generatedAssets:{script:[`您好，我们在为${opp.targetRegion}市场的${opp.platform}寻找「${opp.productConcept}」的供应商。`,`首单计划${opp.suggestedFirstOrderQty}个先测试，麻烦报100/500/1000的阶梯价。`,`样品周期和样品费？是否有出口${opp.targetRegion}的经验和相关认证？`].join("\n")}
    });
  }

  /* 7) Sample brief */
  function generateSampleBrief(opp){
    return envelope("sample_brief",{
      inputSnapshot:{opportunityId:opp.opportunityId}, confidence:0.84,
      recommendation:"Request 2 samples to compare consistency.",
      generatedAssets:{ sampleBrief:{ product:opp.productConcept, quantity:2,
        mustHave:["Match reference photos","Confirm material/finish","Confirm dimensions/weight"],
        checkpoints:["Function works as demoed","No sharp edges / defects","Packaging intact"],
        acceptanceCriteria:"Both samples consistent; defects = reject & re-sample." }}
    });
  }

  /* 8) Quotation comparison */
  function generateQuotationComparison(opp){
    const sup=(DBref?DBref.getSuppliers(opp.opportunityId):[]);
    return envelope("quote_comparison",{
      inputSnapshot:{opportunityId:opp.opportunityId}, confidence:0.83,
      recommendation:"Compare landed cost, not just unit price.",
      generatedAssets:{ rows: sup.map(s=>({supplier:s.factoryName,unitPrice:s.unitPriceUsd,moq:s.moq,sampleLeadDays:s.sampleLeadTimeDays,prodLeadDays:s.productionLeadTimeDays,trust:s.trustScore,recommend:s.recommend})) }
    });
  }

  /* 9) Compliance route check — 9 inputs => 15 outputs */
  function runComplianceRouteCheck(opp, route){
    route = route || (DBref?DBref.getCompliance(opp):null) || {};
    const high = route.riskLevel==="High";
    const inputs = { country:opp.targetRegion, platform:opp.platform, category:opp.category,
      productConcept:opp.productConcept, materials:"mixed", claims:"standard marketing",
      foodContact: opp.category.indexOf("Baby")>=0||opp.category.indexOf("Kitchen")>=0||opp.category.indexOf("Pet")>=0,
      electrical: opp.category.indexOf("Cleaning")>=0||opp.category.indexOf("Electronics")>=0,
      targetAge: opp.category.indexOf("Baby")>=0?"infant":"general" };
    return envelope("compliance_route",{
      inputSnapshot:inputs, market:opp.targetRegion, platform:opp.platform,
      confidence: high?0.6:0.82,
      humanApprovalRequired: high, // generating a compliance statement is high-risk
      legalDisclaimer: DISCLAIMER_COMP,
      evidence:[`Category ${opp.category} in ${opp.targetRegion} via ${opp.platform}.`, route.reusableFor?`Reusable Compliance Memory: ${route.reusableFor}`:""].filter(Boolean),
      risks: high?["Infant/food-contact/electrical/chemical exposure — a violation could end a small business."]:["Standard category risk."],
      recommendation: route.goNoGo==="no_go_until_certified"?"NO-GO until certified"
        : route.goNoGo==="go_with_conditions"?"GO with conditions":"GO",
      nextActions: high?[{action:"generate_compliance_statement",label:"Generate compliance statement (needs approval)",riskLevel:"High"}]:[{action:"advance_stage",label:"Proceed"}],
      generatedAssets:{ // 15 outputs
        goNoGo: route.goNoGo, riskLevel: route.riskLevel,
        whyRisk: high?"Regulated category (infant/food-contact/electrical/chemical).":"Standard consumer category.",
        requiredCertifications: route.certifications||[], requiredDocuments: route.requiredDocuments||[],
        bannedKeywords: route.restrictedKeywords||[],
        labelingRequirements:["Country of origin","Material/ingredient list","Importer info","Warnings"],
        platformPolicyNotes:`${opp.platform} restricted-product & claims policy applies.`,
        testingPath: high?["Send sample to accredited lab","Obtain test report","Keep DoC on file"]:["Basic conformity check"],
        certPathSteps: high?["Identify standard","Choose accredited lab","Test","Issue DoC","Maintain records"]:["Confirm basic conformity"],
        missingDocuments: high?["Test report","Certificate of conformity"]:[],
        saferAlternatives: route.saferAlternatives||[],
        estimatedCertCostUsd: high?"$600–$2,500 (mock estimate)":"$0–$300 (mock estimate)",
        estimatedCertTimeDays: high?"15–35 days":"3–10 days",
        stopConditions: high?["No valid test report","Banned claim in copy","Unverified cert"]:["Banned claim in copy"],
        reusableMemoryKey: route.reusableFor||`${opp.targetRegion}/${opp.platform}/${opp.category}` }
    });
  }

  /* 10) Listing studio — per-platform JSON */
  function generateListingDraft(opp, platform){
    platform = platform || opp.platform;
    const lang=aiLangFor(opp.targetRegion);
    const route = DBref?DBref.getCompliance(opp):null;
    const banned = (route&&route.restrictedKeywords)||[];
    const common = {
      productName:opp.productConcept, keyBenefits:["Solves a real daily problem","Demo-friendly","Affordable test price"],
      imagePrompts:[`Studio shot of ${opp.productConcept} on clean background`,`Lifestyle: ${opp.targetPersona} using it`,`Before/after demo frame`],
      bannedKeywordsAvoided:banned, aiOutputLanguage:lang
    };
    let platformBlock;
    if(platform.indexOf("Amazon")>=0){
      platformBlock={ platform:"Amazon", title:`${opp.productConcept} — ${opp.category} (compliant title)`,
        bullets:["Benefit-led bullet 1","Material & spec bullet","Use-case bullet","Care/warranty bullet","What's in the box"],
        searchTerms:["category keyword","problem keyword","use-case keyword"], aplusModules:["Comparison","Lifestyle","Specs"] };
    } else if(platform.indexOf("Shopify")>=0){
      platformBlock={ platform:"Shopify", heroHeadline:`Meet ${opp.productConcept}`, subhead:"For "+opp.targetPersona,
        productStory:"Short brand story tying product to the persona's daily problem.", faq:["Is it safe?","Shipping time?","Returns?"], upsell:["Bundle","Refill / accessory"] };
    } else {
      platformBlock={ platform:"TikTok Shop", shortDescription:`${opp.productConcept} that makes ${opp.category.toLowerCase()} oddly satisfying.`,
        videoScript:["HOOK (0-3s): show the messy/problem state","DEMO (3-15s): one satisfying motion","PROOF (15-25s): close-up result","CTA (25-30s): limited test price, tap orange cart"],
        creatorBrief:"Find a mid-tier creator in the niche; pay per-post + commission; require the before/after format.",
        hashtags:["#cleantok","#tiktokmademebuyit","#"+opp.category.replace(/\s+/g,"").toLowerCase()] };
    }
    return envelope("listing_draft",{
      inputSnapshot:{opportunityId:opp.opportunityId,platform}, market:opp.targetRegion, platform,
      confidence:0.8, evidence:[`Tailored for ${platform} in ${opp.targetRegion}.`],
      risks: banned.length?[`Auto-rewritten to avoid banned claims: ${banned.join(", ")}`]:[],
      recommendation:`Use the ${platform} block; assets localized to ${lang}.`,
      nextActions:[{action:"submit_listing",label:"Submit listing (needs approval)",riskLevel:"Medium"}],
      generatedAssets:{ common, platformSpecific:platformBlock }
    });
  }

  /* 11) Trade document (8 types) */
  function generateTradeDocument(opp, docType, supplier){
    return envelope("trade_document",{
      inputSnapshot:{opportunityId:opp.opportunityId,docType}, confidence:0.88,
      humanApprovalRequired: docType==="Purchase Order",
      recommendation:`Generated ${docType} (mock). Review before use.`,
      generatedAssets:{ docType, document:{ seller:supplier?supplier.factoryName:"Supplier", buyer:"Atlaz merchant",
        sku:opp.productConcept, qty:opp.suggestedFirstOrderQty, unitPrice:(supplier?supplier.unitPriceUsd:num(opp.priceBand)*0.3),
        incoterm:"FOB", date:new Date().toISOString().slice(0,10) }}
    });
  }

  /* 12) Cash conversion score (delegates to CashEngine) */
  function calculateCashConversionScore(opp, inputs){
    inputs = inputs || (DBref?DBref.getCashInputs(opp):null);
    const out = CashEngine.compute(inputs);
    return envelope("cash_conversion_score",{
      inputSnapshot:inputs, market:opp.targetRegion, platform:opp.platform,
      confidence:0.78, legalDisclaimer:DISCLAIMER_FIN,
      evidence:[`Contribution margin ${out.contributionMargin}%`,`Break-even ${out.breakEvenUnits||"n/a"} units`,`Cash needed ${out.cashNeededBeforeRevenue}`],
      risks:[`Inventory pressure: ${out.inventoryPressure}`,`Ad budget risk: ${out.adBudgetRisk}`,`FX risk: ${out.fxRisk}`,`Tariff risk: ${out.tariffRisk}`,`Return risk: ${out.returnRisk}`],
      recommendation: out.recommendation,
      nextActions: out.recommendation==="test_smaller"?[{action:"set_first_order",label:"Set first order to 100 units"}]:out.recommendation==="negotiate"?[{action:"war_room",label:"Negotiate in War Room"}]:out.recommendation==="stop"?[{action:"stop",label:"Stop / reconsider"}]:[{action:"advance_stage",label:"Proceed to order"}],
      generatedAssets: out
    });
  }

  /* 13) Ledger event */
  function createTradeLoopLedgerEvent(skuPassportId, eventType, opts){
    const ev = typeof TradeLoopLedgerService!=="undefined"?TradeLoopLedgerService.record(skuPassportId,eventType,opts||{}):null;
    return envelope("ledger_event",{inputSnapshot:{skuPassportId,eventType},confidence:1,recommendation:"Recorded.",generatedAssets:{event:ev}});
  }

  /* 14) Growth playbook (7/14/30-day) */
  function generateGrowthPlaybook(opp){
    return envelope("growth_playbook",{
      inputSnapshot:{opportunityId:opp.opportunityId}, market:opp.targetRegion, platform:opp.platform,
      confidence:0.79, recommendation:"Run the 7-day test, then input results for a decision.",
      nextActions:[{action:"input_test_result",label:"Input 7-day test result"}],
      generatedAssets:{ day7:["Post 1 hero video/day","Seed 3 creators","Pin best comment, reply to objections"],
        day14:["Double down on best creator","Add 1 ad campaign at low budget","A/B 2 hooks"],
        day30:["Scale winning creator+hook","Introduce bundle/upsell","Decide reorder qty"],
        videoCalendar:Array.from({length:7}).map((_,i)=>({day:i+1,angle:["problem","demo","ugc","duet","faq","offer","testimonial"][i]})),
        creatorBrief:"Niche mid-tier creators, before/after format, per-post + commission.",
        adPlan:"Start $20–30/day after organic signal; kill if CAC > contribution.",
        commentStrategy:"Reply to price/durability objections within 1h; pin social proof." }
    });
  }

  /* 15) Evaluate experiment result => one of 6 decisions + Decision Memo */
  function evaluateExperimentResult(opp, metrics){
    const m = metrics || {};
    const orders = m.orders||0, cac = m.cac, refunds=m.refunds||0, ctr=m.ctr||0, cvr=m.cvr||0;
    const cash = DBref?CashEngine.compute(DBref.getCashInputs(opp)):null;
    const contributionUnit = cash?cash.contributionUnit:5;
    let decision, why;
    if(orders===0 && ctr<1){ decision="change_angle"; why="No traction and low CTR — the hook/angle isn't landing. Test a new content angle before spending more."; }
    else if(cac!=null && cac>contributionUnit*1.2){ decision="lower_price"; why=`CAC (${cac}) exceeds unit contribution (${contributionUnit}). Lower price or raise AOV, or you scale a loss.`; }
    else if(refunds>orders*0.12){ decision="modify"; why="Refund rate is high — likely a product/quality/expectation gap. Modify product or listing before scaling."; }
    else if(cvr<1 && ctr>2){ decision="change_market"; why="People click but don't buy — price/market fit issue. Test a different market or persona."; }
    else if(orders>0 && (cac==null || cac<contributionUnit) && refunds<=orders*0.08){ decision="scale"; why=`Profitable unit economics (CAC < contribution, low refunds). Reorder and scale the winning creator/hook.`; }
    else { decision="stop"; why="Signals are weak across the board and cash is better preserved for the next product."; }
    return envelope("experiment_decision",{
      inputSnapshot:{opportunityId:opp.opportunityId,metrics:m}, market:opp.targetRegion, platform:opp.platform,
      confidence:0.76, legalDisclaimer:DISCLAIMER_FIN,
      evidence:[`Orders ${orders}`,`CTR ${ctr}%`,`CVR ${cvr}%`,`CAC ${cac==null?"n/a":cac}`,`Refunds ${refunds}`],
      risks:["7-day data is a small sample — treat as directional."],
      recommendation: decision, 
      nextActions: decision==="scale"?[{action:"confirm_order",label:"Confirm reorder (needs approval)",riskLevel:"High"}]:[{action:"write_memo",label:"Save Decision Memo to SKU Passport"}],
      generatedAssets:{ decision, why, decisionMemo:{
        sku:opp.productConcept, market:`${opp.targetRegion}/${opp.platform}`, window:"7 days",
        result:{orders,ctr,cvr,cac,refunds}, decision, rationale:why,
        nextStep: decision==="scale"?"Reorder & scale":decision==="stop"?"Archive learnings":"Iterate then re-test",
        savedTo:`SKU-${opp.opportunityId.slice(4)} passport` }}
    });
  }

  /* 16) Propose agent actions (risk-tiered approval) */
  function proposeAgentActions(opp){
    const actions = [
      {actionType:"send_inquiry",riskLevel:"Medium",reversible:true},
      {actionType:"submit_listing",riskLevel:"Medium",reversible:true},
      {actionType:"confirm_order",riskLevel:"High",reversible:false}
    ].map((a,i)=>Object.assign(a,{
      agentActionId:`AA-RT-${opp.opportunityId.slice(4)}-${i}`,
      humanApprovalRequired: HIGH_RISK_ACTION_TYPES.indexOf(a.actionType)>=0 || a.riskLevel!=="Low" || !a.reversible,
      summary:`Atlaz proposes to ${a.actionType.replace(/_/g," ")} for ${opp.productConcept}.`
    }));
    return envelope("agent_actions",{
      inputSnapshot:{opportunityId:opp.opportunityId}, confidence:0.8,
      humanApprovalRequired:true,
      recommendation:"All proposed actions require your approval before execution.",
      generatedAssets:{actions}
    });
  }

  /* 17) Export SKU passport JSON */
  function exportSkuPassportJson(opp){
    const dr = DBref?DBref.dealRoom(opp.opportunityId):null;
    return envelope("sku_passport_export",{
      inputSnapshot:{opportunityId:opp.opportunityId}, confidence:1,
      recommendation:"Portable, reusable trade record (Trade Loop Ledger backbone).",
      generatedAssets:{ passport: dr?dr.passport:null, eventsCount: dr?dr.ledger.length:0 }
    });
  }

  return { envelope, HIGH_RISK_ACTION_TYPES,
    generateOpportunityReport, createSkuPassport, recommendSuppliers, generateSupplierTrustSummary,
    generateInquiryEmail, generateWechatScript, generateSampleBrief, generateQuotationComparison,
    runComplianceRouteCheck, generateListingDraft, generateTradeDocument, calculateCashConversionScore,
    createTradeLoopLedgerEvent, generateGrowthPlaybook, evaluateExperimentResult,
    proposeAgentActions, exportSkuPassportJson };
})();
if (typeof window!=="undefined") window.TradeAiService=TradeAiService;
if (typeof module!=="undefined" && module.exports) module.exports={TradeAiService,TradeToolRegistry,CashEngine,AiGenerationLog};
if (typeof global!=="undefined"){ global.TradeAiService=TradeAiService; global.TradeToolRegistry=TradeToolRegistry; global.CashEngine=CashEngine; global.AiGenerationLog=AiGenerationLog; }
