/* ============================================================================
 * Atlaz v4 · Screens (Screens)
 * Deal Room-centric product. The Trade Command Center answers 5 daily
 * questions; the SKU Deal Room is the core, tying every module to ONE SKU.
 * Global: Screens
 * ==========================================================================*/
const Screens = (() => {
  const DBref = ()=> (typeof DB!=="undefined"?DB:window.DB);
  const AI = ()=> (typeof TradeAiService!=="undefined"?TradeAiService:window.TradeAiService);
  const t = (k)=> UI.t(k);
  const money = (u)=> UI.money(u);
  const esc = UI.esc;

  /* =======================================================================
   * 1) TRADE COMMAND CENTER — answers the 5 daily questions
   * ===================================================================== */
  function commandCenter(){
    const DB=DBref(), ai=AI();
    const recommended = DB.opportunities.filter(o=>o.decision==="recommended");
    const todayOpp = recommended[0];
    const thesis = ai.generateOpportunityReport(todayOpp);
    const cash = ai.calculateCashConversionScore(todayOpp);

    // identity card
    const identity = `<section class="card identity"><div class="card-head"><h3>${t("cc_identity")}</h3>${UI.Badge("Pro (mock)","chip")}</div>
      <div class="card-body identity-grid">
        ${UI.kv("Profile","US TikTok Shop new seller")}
        ${UI.kv("Budget","$3,000 test budget")}
        ${UI.kv("Goal","Low-risk, video-friendly, small-batch testable product")}
        ${UI.kv("Markets","US · UK · DE · FR · SEA · ME · LatAm")}
      </div></section>`;

    // 5 questions answered
    const questions = `<section class="card questions"><div class="card-body">
      <div class="q"><span class="q-q">${t("cc_q1")}</span><span class="q-a"><a data-go="dealroom:${todayOpp.opportunityId}">${esc(todayOpp.productConcept)}</a></span></div>
      <div class="q"><span class="q-q">${t("cc_q2")}</span><span class="q-a">${esc(todayOpp.whyNow)}</span></div>
      <div class="q"><span class="q-q">${t("cc_q3")}</span><span class="q-a">${esc((DB.getSuppliers(todayOpp.opportunityId).find(s=>s.recommend==="recommended_test")||{}).factoryName||"")} (test) · ${esc((DB.getSuppliers(todayOpp.opportunityId).find(s=>s.recommend==="recommended_cert")||{}).factoryName||"")} (cert)</span></div>
      <div class="q"><span class="q-q">${t("cc_q4")}</span><span class="q-a">${UI.GoBadge((DB.getCompliance(todayOpp)||{}).goNoGo)} · ${UI.CashDecisionBadge(cash.recommendation)}</span></div>
      <div class="q"><span class="q-q">${t("cc_q5")}</span><span class="q-a">${esc(thesis.recommendation)}</span></div>
    </div></section>`;

    // today's recommended action (NBA)
    const nba = UI.nbaBar(t("cc_today_action"),[
      UI.btn(t("open_dealroom"),null,{variant:"primary",go:"dealroom:"+todayOpp.opportunityId}),
      UI.btn(t("find_suppliers"),null,{variant:"ghost",go:"suppliers:"+todayOpp.opportunityId}),
      UI.btn(t("run_compliance"),null,{variant:"ghost",go:"compliance:"+todayOpp.opportunityId})
    ]);

    // opportunity funnel
    const stages=["f_discover","f_supplier","f_compliance","f_sample","f_smallbatch","f_content","f_decision"];
    const counts=[DB.opportunities.length,DB.passports.length,DB.complianceRoutes.length,8,6,DB.growthExperiments.length,4];
    const funnel=`<section class="card"><div class="card-head"><h3>${t("cc_funnel")}</h3></div><div class="card-body funnel">
      ${stages.map((s,i)=>`<div class="funnel-step"><div class="funnel-num">${counts[i]}</div><div class="funnel-lbl">${t(s)}</div></div>`).join("")}
    </div></section>`;

    // risk radar — 5 types
    const risks=[["risk_cash","Medium","2 SKUs need smaller first orders"],["risk_compliance","High","FR baby & GaN charger need certification"],
      ["risk_supplier","Low","All lead suppliers tier A/B"],["risk_platform","Medium","TikTok Shop claim policy on cleaning"],["risk_ad","Medium","Watch CAC vs contribution"]];
    const radar=`<section class="card"><div class="card-head"><h3>${t("cc_risk_radar")}</h3></div><div class="card-body radar">
      ${risks.map(([k,lvl,note])=>`<div class="radar-row">${UI.RiskBadge(lvl)}<span class="radar-lbl">${t(k)}</span><span class="muted small">${esc(note)}</span></div>`).join("")}
    </div></section>`;

    // active deal rooms
    const rooms=`<section class="card"><div class="card-head"><h3>${t("cc_active_rooms")}</h3>${UI.Badge(DB.dealRoomIds.length+" rooms","chip")}</div><div class="card-body room-grid">
      ${DB.passports.map(p=>{const o=DB.getOpp(p.opportunityId);return `<a class="room-tile" data-go="dealroom:${p.opportunityId}">
        <div class="room-top">${UI.RiskBadge(p.overallRisk)}<span class="muted small">${esc(o.targetRegion)} · ${esc(o.platform)}</span></div>
        <div class="room-name">${esc(p.skuName)}</div>
        <div class="room-stage">${esc(p.currentStage.replace(/_/g," "))}</div>
        <div class="room-trust">${t("dr_trust")}: ${UI.TrustBar(p.leadSupplierTrust)}</div></a>`;}).join("")}
    </div></section>`;

    // agent actions needing approval
    const actions=`<section class="card"><div class="card-head"><h3>${t("cc_pending_actions")}</h3>${UI.Badge(DB.agentActions.length,"chip")}</div><div class="card-body action-grid">
      ${DB.agentActions.map(a=>UI.AgentActionCard(a)).join("")}
    </div></section>`;

    // one-click starts
    const quick=`<section class="card"><div class="card-head"><h3>${t("cc_quickstart")}</h3></div><div class="card-body quick">
      ${UI.btn(t("nav_radar"),null,{variant:"ghost",go:"radar"})}
      ${UI.btn(t("nav_dealrooms"),null,{variant:"ghost",go:"dealrooms"})}
      ${UI.btn(t("nav_compliance"),null,{variant:"ghost",go:"compliance:"+todayOpp.opportunityId})}
      ${UI.btn(t("nav_cash"),null,{variant:"ghost",go:"cash:"+todayOpp.opportunityId})}
    </div></section>`;

    return `<div class="screen command-center"><h1>${t("cc_title")}</h1>
      <p class="muted">${t("mock_notice")}</p>
      ${identity}${questions}${nba}
      <div class="cols-2">${funnel}${radar}</div>
      ${rooms}${actions}${quick}</div>`;
  }

  /* =======================================================================
   * 2) OPPORTUNITY RADAR — investment-memo cards
   * ===================================================================== */
  function opportunityRadar(){
    const DB=DBref();
    return `<div class="screen"><h1>${t("nav_radar")}</h1>
      <p class="muted">${DB.opportunities.length} opportunities · 8 real cross-border scenarios. Each card is an investment memo, not a listing.</p>
      <div class="memo-grid">${DB.opportunities.map(o=>memoCard(o)).join("")}</div></div>`;
  }
  function memoCard(o){
    const decCls=o.decision==="recommended"?"dec-go":o.decision==="high_risk_review"?"dec-risk":"dec-watch";
    const decLbl=o.decision==="recommended"?"Recommended":o.decision==="high_risk_review"?"High-risk review":"Watch";
    return `<div class="memo ${decCls}">
      <div class="memo-head"><span class="memo-scn">${esc(o.scenario)}</span><span class="badge ${decCls}">${decLbl}</span></div>
      <h3>${esc(o.productConcept)}</h3>
      <div class="memo-grid2">
        ${UI.kv("Region/Platform",esc(o.targetRegion)+" · "+esc(o.platform))}
        ${UI.kv("Persona",esc(o.targetPersona))}
        ${UI.kv("Demand",esc(o.demandSignal))}
        ${UI.kv("Content",esc(o.contentSignal))}
        ${UI.kv("Price band",esc(o.priceBand))}
        ${UI.kv("Est. margin",esc(o.estimatedMargin))}
        ${UI.kv("Landed cost",esc(o.landedCostEstimate))}
        ${UI.kv("Supply region",esc(o.recommendedSupplierRegion))}
        ${UI.kv("First test budget",esc(o.firstTestBudget))}
        ${UI.kv("First order qty",esc(o.suggestedFirstOrderQty))}
        ${UI.kv("Return rate",esc(o.returnRateEst))}
        ${UI.kv("Commission",esc(o.platformCommission))}
        ${UI.kv("Compliance risk",UI.RiskBadge(o.complianceRisk))}
        ${UI.kv("Cash cycle risk",UI.RiskBadge(o.cashCycleRisk))}
      </div>
      <div class="memo-thesis"><strong>Why now:</strong> ${esc(o.whyNow)}</div>
      <div class="memo-anti"><strong>Anti-thesis:</strong> ${esc(o.antiThesis)}</div>
      <div class="memo-actions">
        ${UI.btn(t("open_dealroom"),null,{variant:"primary",go:"dealroom:"+o.opportunityId})}
        ${UI.btn(t("find_suppliers"),null,{variant:"ghost",go:"suppliers:"+o.opportunityId})}
        ${UI.btn(t("run_compliance"),null,{variant:"ghost",go:"compliance:"+o.opportunityId})}
        ${UI.btn(t("estimate_cash"),null,{variant:"ghost",go:"cash:"+o.opportunityId})}
        ${UI.btn(t("generate_content"),null,{variant:"ghost",go:"listing:"+o.opportunityId})}
      </div></div>`;
  }

  function dealRoomList(){
    const DB=DBref();
    return `<div class="screen"><h1>${t("nav_dealrooms")}</h1><p class="muted">${DB.dealRoomIds.length} active SKU Deal Rooms.</p>
      <div class="memo-grid">${DB.passports.map(p=>{const o=DB.getOpp(p.opportunityId);return `<a class="room-tile big" data-go="dealroom:${p.opportunityId}">
        <div class="room-top">${UI.RiskBadge(p.overallRisk)}<span class="muted small">${esc(o.targetRegion)} · ${esc(o.platform)}</span></div>
        <div class="room-name">${esc(p.skuName)}</div><div class="room-stage">${esc(p.currentStage.replace(/_/g," "))}</div>
        ${UI.TrustBar(p.leadSupplierTrust)}</a>`;}).join("")}</div></div>`;
  }

  /* =======================================================================
   * 3) SKU DEAL ROOM — the core. 10-field header + 10 modules tied to one SKU.
   * ===================================================================== */
  function dealRoom(opportunityId){
    const DB=DBref(), ai=AI();
    const dr = DB.dealRoom(opportunityId);
    if(!dr) return UI.ErrorStateView("Deal Room not found.");
    const o=dr.opportunity, p=dr.passport;
    const thesis=ai.generateOpportunityReport(o);
    const supRec=ai.recommendSuppliers(o);
    const comp=ai.runComplianceRouteCheck(o,dr.compliance);
    const cash=ai.calculateCashConversionScore(o,dr.cashInputs);
    const growth=ai.generateGrowthPlaybook(o);
    const lead=dr.suppliers[0];

    const header=`<section class="card dr-header"><div class="card-body">
      <div class="dr-title"><h1>${esc(o.productConcept)}</h1>${UI.Badge(p?p.skuPassportId:"new SKU","chip")}</div>
      <div class="dr-meta-grid">
        ${UI.kv("Scenario",esc(o.scenario))}
        ${UI.kv(t("dr_stage"),esc(p?p.currentStage.replace(/_/g," "):"opportunity confirmed"))}
        ${UI.kv("Region/Platform",esc(o.targetRegion)+" · "+esc(o.platform))}
        ${UI.kv(t("dr_overall_risk"),UI.RiskBadge(p?p.overallRisk:o.complianceRisk))}
        ${UI.kv(t("dr_trust"),lead?UI.TrustBar(lead.trustScore):"—")}
        ${UI.kv(t("dr_cash_score"),UI.CashDecisionBadge(cash.recommendation))}
        ${UI.kv("Compliance",UI.GoBadge((dr.compliance||{}).goNoGo))}
        ${UI.kv(t("dr_ai_conf"),Math.round(thesis.confidence*100)+"%")}
        ${UI.kv("First order",esc(o.suggestedFirstOrderQty)+" units")}
        ${UI.kv("Test budget",esc(o.firstTestBudget))}
      </div></div></section>`;

    const tabs=["thesis","supplier","compliance","econ","sample","listing","growth","order","ledger","memo"];
    const tabBar=`<div class="dr-tabs">${tabs.map((tb,i)=>`<button class="dr-tab ${i===0?"active":""}" data-drtab="${tb}">${t("dr_"+tb)}</button>`).join("")}</div>`;

    // module bodies
    const modThesis=UI.AiWorkOrder(thesis);
    const modSupplier=`${UI.nbaBar(t("dr_supplier"),[UI.btn("Open War Room",null,{variant:"primary",go:"warroom:"+o.opportunityId})])}
      <div class="sup-list">${dr.suppliers.map(s=>UI.SupplierCard(s,{actions:UI.btn("Trust summary",null,{variant:"ghost",act:"trust",id:s.supplierId})})).join("")}</div>
      ${UI.AiWorkOrder(supRec)}`;
    const modCompliance=UI.AiWorkOrder(comp)+complianceDetail(comp,dr.compliance);
    const modEcon=cashCockpitBody(o,dr.cashInputs,cash);
    const modSample=UI.AiWorkOrder(ai.generateSampleBrief(o))+UI.AiWorkOrder(ai.generateQuotationComparison(o));
    const modListing=listingBody(o);
    const modGrowth=UI.AiWorkOrder(growth)+growthBody(o,dr.growth);
    const modOrder=tradeFlowBody(o,p);
    const modLedger=UI.LedgerTimeline(dr.ledger.length?dr.ledger:(typeof TradeLoopLedgerService!=="undefined"?TradeLoopLedgerService.forSku(p?p.skuPassportId:""):[]));
    const memoEnv=ai.evaluateExperimentResult(o,dr.growth?dr.growth.metrics:{});
    const modMemo=UI.AiWorkOrder(memoEnv);

    const bodies={thesis:modThesis,supplier:modSupplier,compliance:modCompliance,econ:modEcon,sample:modSample,listing:modListing,growth:modGrowth,order:modOrder,ledger:modLedger,memo:modMemo};
    const panels=tabs.map((tb,i)=>`<div class="dr-panel ${i===0?"active":""}" data-drpanel="${tb}">${bodies[tb]}</div>`).join("");

    return `<div class="screen deal-room">${header}${tabBar}<div class="dr-body">${panels}</div></div>`;
  }

  function complianceDetail(env,route){
    const g=env.generatedAssets;
    return `<section class="card ${env.humanApprovalRequired?"high-risk-card":""}"><div class="card-head"><h3>${t("nav_compliance")} detail</h3>${UI.GoBadge(g.goNoGo)}</div><div class="card-body">
      <div class="comp-grid">
        ${UI.kv("Why risk",esc(g.whyRisk))}
        ${UI.kv("Required certs",(g.requiredCertifications||[]).map(c=>UI.Badge(c,"chip")).join(" "))}
        ${UI.kv("Required docs",(g.requiredDocuments||[]).join(", "))}
        ${UI.kv("Banned keywords",(g.bannedKeywords||[]).map(c=>UI.Badge(c,"chip risk-high")).join(" "))}
        ${UI.kv("Cert path",(g.certPathSteps||[]).join(" → "))}
        ${UI.kv("Missing docs",(g.missingDocuments||["—"]).join(", "))}
        ${UI.kv("Safer alternatives",(g.saferAlternatives||["—"]).join("; "))}
        ${UI.kv("Est. cert cost",esc(g.estimatedCertCostUsd))}
        ${UI.kv("Est. cert time",esc(g.estimatedCertTimeDays))}
        ${UI.kv("Stop conditions",(g.stopConditions||[]).join("; "))}
      </div>
      <div class="comp-disclaimer">${esc(env.legalDisclaimer)}</div>
    </div></section>`;
  }

  /* =======================================================================
   * 4) SUPPLIER WAR ROOM
   * ===================================================================== */
  function supplierWarRoom(opportunityId){
    const DB=DBref(), ai=AI();
    const o=DB.getOpp(opportunityId); const sup=DB.getSuppliers(opportunityId);
    if(!sup.length) return UI.EmptyStateView("No suppliers matched yet.");
    return `<div class="screen"><h1>Supplier War Room</h1><p class="muted">${esc(o.productConcept)} — compare top 3 side by side.</p>
      ${UI.WarRoom(sup)}
      <div class="sup-list">${sup.map(s=>UI.SupplierCard(s)).join("")}</div>
      ${UI.AiWorkOrder(ai.recommendSuppliers(o))}</div>`;
  }
  function supplierMatch(opportunityId){ return supplierWarRoom(opportunityId); }

  /* =======================================================================
   * 5) COMPLIANCE COPILOT
   * ===================================================================== */
  function complianceCopilot(opportunityId){
    const DB=DBref(), ai=AI();
    const o=DB.getOpp(opportunityId); const route=DB.getCompliance(o);
    const env=ai.runComplianceRouteCheck(o,route);
    return `<div class="screen"><h1>${t("nav_compliance")}</h1><p class="muted">${esc(o.productConcept)} · ${esc(o.targetRegion)} · ${esc(o.platform)}</p>
      ${UI.AiWorkOrder(env)}${complianceDetail(env,route)}</div>`;
  }

  /* =======================================================================
   * 6) AI LISTING STUDIO — per-platform
   * ===================================================================== */
  function listingStudio(opportunityId){
    const DB=DBref(); const o=DB.getOpp(opportunityId);
    return `<div class="screen"><h1>${t("nav_listing")}</h1><p class="muted">${esc(o.productConcept)} — per-platform assets, localized.</p>${listingBody(o)}</div>`;
  }
  function listingBody(o){
    const ai=AI();
    const platforms=["Amazon","Shopify","TikTok Shop"];
    return `<div class="listing-tabs">${platforms.map((p,i)=>`<button class="dr-tab ${i===0?"active":""}" data-listingtab="${esc(p)}">${esc(p)}</button>`).join("")}</div>
      <div class="listing-panels">${platforms.map((p,i)=>`<div class="listing-panel ${i===0?"active":""}" data-listingpanel="${esc(p)}">${UI.AiWorkOrder(ai.generateListingDraft(o,p))}</div>`).join("")}</div>`;
  }

  /* =======================================================================
   * 7) TRADE FLOW — 15 states
   * ===================================================================== */
  function tradeFlow(opportunityId){
    const DB=DBref(); const o=DB.getOpp(opportunityId); const p=DB.passportByOpp[opportunityId];
    return `<div class="screen"><h1>${t("nav_flow")}</h1><p class="muted">${esc(o.productConcept)}</p>${tradeFlowBody(o,p)}</div>`;
  }
  function tradeFlowBody(o,p){
    const DB=DBref(); const ai=AI();
    const cur=p?p.stageIndex:0;
    const docs=DB.documentTemplates.map(d=>UI.Badge(d.docType,"chip")).join(" ");
    const poEnv=ai.generateTradeDocument(o,"Purchase Order",DB.getSuppliers(o.opportunityId)[0]);
    return `${UI.StageTimeline(DB.STAGES,cur)}
      <section class="card"><div class="card-head"><h3>Documents this flow can generate (8 types)</h3></div><div class="card-body">${docs}
      <div class="muted small" style="margin-top:8px">7 Tool Adapters reserved: ${esc((typeof TradeToolRegistry!=="undefined"?TradeToolRegistry.adapters:[]).join(", "))}</div></div></section>
      ${UI.AiWorkOrder(poEnv)}`;
  }

  /* =======================================================================
   * 8) CASH COCKPIT
   * ===================================================================== */
  function cashCockpit(opportunityId){
    const DB=DBref(), ai=AI(); const o=DB.getOpp(opportunityId); const ci=DB.getCashInputs(o);
    const cash=ai.calculateCashConversionScore(o,ci);
    return `<div class="screen"><h1>${t("nav_cash")}</h1><p class="muted">${esc(o.productConcept)} — Cash Conversion cockpit. Move sliders; the decision updates live.</p>${cashCockpitBody(o,ci,cash)}</div>`;
  }
  function cashCockpitBody(o,ci,cash){
    const g=cash.generatedAssets;
    return `<div class="cockpit" data-opp="${o.opportunityId}">
      <div class="cockpit-controls">
        ${UI.slider("purchaseUnitPrice","Unit cost",ci.purchaseUnitPrice,0.5,Math.max(20,ci.purchaseUnitPrice*2),0.1,"")}
        ${UI.slider("moq","First order qty",ci.moq,50,1500,50,"")}
        ${UI.slider("sellingPrice","Sell price",ci.sellingPrice,1,Math.max(60,ci.sellingPrice*2),0.5,"")}
        ${UI.slider("adBudget","Ad budget",ci.adBudget,0,4000,50,"")}
        ${UI.slider("returnRatePct","Return rate",ci.returnRatePct,0,0.25,0.005,"")}
        ${UI.slider("tariffPct","Tariff",ci.tariffPct,0,0.3,0.005,"")}
      </div>
      <div class="cockpit-out" data-cockpit-out>
        ${cashOutputs(g)}
      </div></div>`;
  }
  function cashOutputs(g){
    return `<div class="cockpit-decision">${t("cash_recommendation")}: ${UI.CashDecisionBadge(g.recommendation)}</div>
      <p class="cockpit-expl">${esc(g.explanation)}</p>
      <div class="cockpit-stats">
        ${UI.stat("Gross margin",g.grossMargin+"%")}
        ${UI.stat("Contribution",g.contributionMargin+"%")}
        ${UI.stat("Break-even",(g.breakEvenUnits||"—")+" u")}
        ${UI.stat("Cash needed",money(g.cashNeededBeforeRevenue))}
        ${UI.stat("Recovery",(g.daysToCashRecovery||"—")+"d")}
        ${UI.stat("Test profit",money(g.projectedTestProfit))}
      </div>
      <div class="cockpit-risks">
        ${UI.RiskBadge(g.inventoryPressure)} Inventory ${UI.RiskBadge(g.adBudgetRisk)} Ad ${UI.RiskBadge(g.fxRisk)} FX ${UI.RiskBadge(g.tariffRisk)} Tariff ${UI.RiskBadge(g.returnRisk)} Return
      </div>
      <div class="cockpit-sens"><strong>Sensitivity:</strong><ul>${(g.sensitivityAnalysis||[]).map(s=>`<li>${esc(s.lever)} → ${esc(s.effect)}</li>`).join("")}</ul></div>`;
  }

  /* =======================================================================
   * 9) GROWTH PLAYBOOK
   * ===================================================================== */
  function growthPlaybook(opportunityId){
    const DB=DBref(), ai=AI(); const o=DB.getOpp(opportunityId); const gx=DB.growthExperiments.find(g=>g.opportunityId===opportunityId);
    return `<div class="screen"><h1>${t("nav_growth")}</h1><p class="muted">${esc(o.productConcept)}</p>${UI.AiWorkOrder(ai.generateGrowthPlaybook(o))}${growthBody(o,gx)}</div>`;
  }
  function growthBody(o,gx){
    const ai=AI();
    if(!gx) return UI.EmptyStateView("No experiment yet.");
    const m=gx.metrics;
    const dec=ai.evaluateExperimentResult(o,m);
    return `<section class="card"><div class="card-head"><h3>7-day test result (input)</h3></div><div class="card-body">
      <div class="cockpit-stats">
        ${UI.stat("Views",m.views.toLocaleString())}
        ${UI.stat("CTR",m.ctr+"%")}
        ${UI.stat("CVR",m.cvr+"%")}
        ${UI.stat("Orders",m.orders)}
        ${UI.stat("CAC",m.cac?money(m.cac):"—")}
        ${UI.stat("Refunds",m.refunds)}
      </div>
      <p class="muted small">${esc(m.commentsSummary)} · ${esc(m.creatorPerformance)}</p>
    </div></section>
    ${UI.AiWorkOrder(dec)}`;
  }

  /* =======================================================================
   * 10) FACTORY PORTAL (reserved — supplier side of the two-sided network)
   * ===================================================================== */
  function factoryPortal(){
    return `<div class="screen"><h1>${t("nav_factory")}</h1>
      <section class="card"><div class="card-body">
      <p>The Factory Portal is the supplier side of the Atlaz two-sided trade network. Reserved in the v4 architecture and documented in <code>FACTORY_PORTAL_ROADMAP</code> / <code>SUPPLIER_TRUST_GRAPH</code>.</p>
      <ul>
        <li>Suppliers claim their profile and respond to inquiries (mock).</li>
        <li>Quote speed, sample consistency and on-time delivery feed the Supplier Trust Graph — building each supplier's reputation as merchants transact.</li>
        <li>Verified factories surface higher in shortlists, creating a network-effect moat.</li>
      </ul>
      ${UI.Badge("Reserved · architecture + docs","chip")}
    </div></section></div>`;
  }

  return { commandCenter, opportunityRadar, dealRoomList, dealRoom, supplierWarRoom, supplierMatch,
    complianceCopilot, listingStudio, tradeFlow, cashCockpit, cashOutputs, growthPlaybook, factoryPortal };
})();
if (typeof window!=="undefined") window.Screens=Screens;
