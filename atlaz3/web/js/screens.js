/* ============================================================================
 * Atlaz · Screens (28 pages). Each returns {title, back, html}.
 * Depends on: I18N(t), DB, TradeAiService, TradeToolRegistry,
 *             TradeLoopLedgerService, UI, Store, Nav
 * Global: Screens
 * ==========================================================================*/
const Screens = (() => {
  const t = (k) => I18N.t(k);
  const E = UI.esc;
  const money = (usd) => I18N.fmtMoney(usd, Store.pref.currency);

  /* ---------------- 1. Splash (handled by app boot) ---------------- */

  /* ---------------- 4. AI Trade Command Center (Radar tab home) ----- */
  function commandCenter(){
    const p = Store.pref;
    const opps = DB.opportunities;
    const orders = DB.tradeOrders;
    const highRisk = opps.filter(o=>o.riskLevel==="High");
    const ccsAvg = Math.round(DB.cashConversionScores.reduce((a,b)=>a+b.score,0)/DB.cashConversionScores.length);
    const recent = TradeLoopLedgerService.recent(4);
    const pendingActions = DB.agentActions.filter(a=>a.requiresUserApproval).slice(0,3);
    let h = `<div class="hero">
        <div class="tag">${t("brand_tagline")}</div>
        <h2>${t("cmd_title")}</h2>
        <p>${E(p.identity)} · ${E(p.market)} · ${E(p.platform)}</p>
        <div class="stats">
          <div class="stat"><div class="n">${opps.length}</div><div class="l">${t("cc_week_opps")}</div></div>
          <div class="stat"><div class="n">${highRisk.length}</div><div class="l">${t("cc_risk_alerts")}</div></div>
          <div class="stat"><div class="n">${ccsAvg}</div><div class="l">${t("cc_ccs_avg")}</div></div>
        </div>
      </div>`;
    h += UI.PrimaryButton("➤ "+t("cc_start_loop"),"go","radar_list");
    // metric tiles
    h += `<div style="height:12px"></div>` + UI.tiles([
      [orders.filter(o=>o.currentStatus!=="Reorder Decision").length, t("cc_orders_active")],
      ["62%", t("cc_loop_completion")],
      [DB.agentActions.filter(a=>a.requiresUserApproval).length, t("cc_actions_pending")],
    ]);
    // recommended
    h += `<div class="section-label">${t("cc_recommended")}</div>`;
    opps.slice(0,3).forEach(o=>{ h += oppRow(o); });
    h += UI.GhostButton(t("tab_radar")+" →","go","radar_list");
    // active orders
    h += `<div class="section-label">${t("cc_active_orders")}</div>`;
    orders.slice(0,2).forEach(o=>{ h += `<div class="row-link" data-act="go" data-arg="order:${o.opportunityId}">
      <div class="t"><div class="n">${E(o.product)}</div><div class="m">${E(o.currentStatus)} · ${E(o.supplierName)}</div></div><span class="chev">›</span></div>`; });
    // compliance alerts
    h += `<div class="section-label">${t("cc_compliance_alerts")}</div>`;
    highRisk.slice(0,2).forEach(o=>{ h += `<div class="row-link" data-act="go" data-arg="compliance:${o.opportunityId}">
      <div class="t"><div class="n">${E(o.productConcept)}</div><div class="m">${E(o.targetRegion)}</div></div>${UI.RiskBadge("High")}</div>`; });
    // pending actions
    h += `<div class="section-label">${t("cc_actions_pending")}</div>`;
    pendingActions.forEach(a=>{ h += `<div class="row-link" data-act="open_action" data-arg="${a.actionId}">
      <div class="t"><div class="n">${E(a.title)}</div><div class="m">${E(a.actionType)}</div></div>${UI.RiskBadge(a.riskLevel)}</div>`; });
    // recent ledger
    h += `<div class="section-label">${t("cc_recent_ledger")}</div>` + UI.LedgerTimeline(recent);
    // AI next-step
    h += `<div class="section-label">${t("cc_ai_next")}</div><div class="card"><div class="meta">Start a Trade Loop on a high-confidence opportunity, then create its SKU Passport and match suppliers.</div></div>`;
    return { title: t("app_name"), home:true, html:h };
  }

  function oppRow(o){
    return `<div class="card" data-act="go" data-arg="opportunity:${o.opportunityId}" style="cursor:pointer">
      <div style="display:flex;gap:8px;align-items:flex-start">
        <div style="flex:1"><div class="lead">${E(o.productConcept)}</div>
        <div class="meta">${E(o.category)} · ${E(o.targetRegion)} · ${E(o.platform)}</div></div>
        ${UI.RiskBadge(o.riskLevel)}
      </div>
      <div class="metric-row" style="margin-top:10px">
        ${UI.MarginBadge(o.estimatedMargin)} ${UI.CashBadge(0)===""?"":`<span class="badge b-cash">${E(o.cashConversionPotential)} cash</span>`}
        <span class="badge b-trust">${Math.round(o.confidenceScore*100)}% conf</span>
      </div>
      <div class="meta" style="margin-top:8px">${E(o.evidenceSummary)}</div>
    </div>`;
  }

  /* ---------------- 5. Radar list ---------------- */
  function radarList(){
    let h = `<p class="subtitle">${t("radar_sub")}</p>`;
    DB.opportunities.forEach(o=>{
      h += `<div class="card" data-act="go" data-arg="opportunity:${o.opportunityId}" style="cursor:pointer">
        <div style="display:flex;gap:8px;align-items:flex-start">
          <div style="flex:1"><div class="lead">${E(o.productConcept)}</div>
          <div class="meta">${E(o.category)} · ${E(o.targetRegion)} · ${E(o.platform)}</div></div>${UI.RiskBadge(o.riskLevel)}</div>
        <div class="metric-row" style="margin-top:10px">
          <span class="badge b-neutral">${t("f_price_band")}: ${E(o.priceBand)}</span>
          ${UI.MarginBadge(o.estimatedMargin)}
          <span class="badge b-trust">${Math.round(o.confidenceScore*100)}%</span>
          <span class="badge b-cash">${E(o.cashConversionPotential)}</span>
        </div>
        <div class="meta" style="margin-top:8px">${E(o.evidenceSummary)}</div>
        <div class="meta" style="margin-top:6px"><b>${t("f_moat")}:</b> ${E(o.moatNote)}</div>
        <div class="btn-row">
          ${UI.SecondaryButton(t("analyze"),"go","opportunity:"+o.opportunityId)}
          ${UI.PrimaryButton(t("create_passport"),"go","passport:"+o.opportunityId)}
        </div>
      </div>`;
    });
    return { title: t("radar_title"), home:true, html:h };
  }

  /* ---------------- 6. Opportunity Detail ---------------- */
  function opportunity(id){
    const o = DB.getOpportunity(id);
    if(!o) return notFound();
    const env = TradeAiService.generateOpportunityReport(o);
    const pay = env.payload;
    let h = `<div class="card"><div class="lead">${E(o.productConcept)}</div>
      <div class="meta">${E(o.category)} · ${E(o.targetRegion)} · ${E(o.platform)}</div>
      <div class="metric-row" style="margin-top:10px">${UI.RiskBadge(o.riskLevel)}${UI.MarginBadge(o.estimatedMargin)}<span class="badge b-trust">${Math.round(o.confidenceScore*100)}% conf</span></div></div>`;
    // structured fields
    h += `<div class="card">
      ${UI.kv(t("r_painpoint"),pay.painPoint)}
      ${UI.kv(t("r_why_now"),pay.whyNow)}
      ${UI.kv(t("r_persona"),pay.persona)}
      ${UI.kv(t("r_content_logic"),pay.contentLogic)}
      ${UI.kv(t("r_test_budget"),money(pay.testBudget))}
      ${UI.kv(t("r_buy_qty"),pay.recommendedQty)}
      ${UI.kv(t("r_target_price"),money(pay.targetPrice))}
      ${UI.kv(t("r_margin"),Math.round(pay.estimatedMargin*100)+"%")}
      ${UI.kv(t("r_ccp"),pay.cashConversionPotential)}
      ${UI.kv(t("r_supplier_region"),pay.supplierRegion)}
      ${UI.kv(t("r_compliance"),pay.complianceFocus)}
      ${UI.field(t("r_hooks"),pay.hooks)}
      ${UI.field(t("r_risks"),pay.coreRisks)}
      ${UI.field(t("r_metrics"),pay.validationMetrics)}
      ${UI.field(t("r_supplier_criteria"),pay.supplierCriteria)}
    </div>`;
    h += UI.AiGeneratedBlock(env, t("opp_report"));
    h += `<div class="btn-row">${UI.PrimaryButton(t("create_passport"),"go","passport:"+id)}${UI.SecondaryButton(t("match_suppliers"),"go","suppliers:"+id)}</div>`;
    h += `<div class="btn-row">${UI.SecondaryButton(t("generate_listing"),"go","listing:"+id)}${UI.SecondaryButton(t("run_compliance"),"go","compliance:"+id)}</div>`;
    h += `<div class="btn-row">${UI.SecondaryButton(t("calc_cash"),"go","cashflow:"+id)}${UI.SecondaryButton(t("build_growth"),"go","growth:"+id)}</div>`;
    h += `<div class="btn-row">${UI.SecondaryButton(t("create_order"),"go","order:"+id)}${UI.GhostButton(t("export_json"),"export_opp",id)}</div>`;
    return { title: o.productConcept, back:true, html:h };
  }

  /* ---------------- 7. SKU Passport ---------------- */
  function passport(id){
    const o = DB.getOpportunity(id) || (DB.getPassport(id) && DB.getOpportunity(DB.getPassport(id).opportunityId));
    const p = DB.getPassport(id);
    if(!o||!p) return notFound();
    const comp = DB.getCompliance(o);
    const cf = DB.cashflowEvents.find(c=>c.skuPassportId===p.skuPassportId);
    const sup = DB.getSuppliers(o.opportunityId)[0];
    const ledger = DB.getLedgerFor(p.skuPassportId);
    let h = UI.SkuPassportHeader(p);
    const sec = (label, body) => `<div class="section-label">${label}</div><div class="card">${body}</div>`;
    h += sec(t("sp_identity"), UI.kv("Product",p.productConcept)+UI.kv(t("f_category"),p.category)+UI.kv(t("sp_export"),p.skuPassportId));
    h += sec(t("sp_market"), UI.kv(t("f_market"),p.targetMarket)+UI.kv(t("sp_platform"),p.targetPlatform)+UI.kv(t("sp_persona"),p.targetPersona));
    h += sec(t("sp_material"), UI.kv("Primary",p.materialProfile.primaryMaterial)+UI.kv("Food contact",p.materialProfile.foodContact?"Yes":"No")+UI.kv("Electrical",p.materialProfile.electrical?"Yes":"No")+UI.kv("Battery",p.materialProfile.battery?"Yes":"No"));
    h += sec(t("sp_certs"), p.certificationClaims.map(c=>UI.kv(c.certification,c.status)).join(""));
    h += sec(t("sp_candidates"), p.supplierCandidates.map(sid=>`<span class="chip">${E(sid)}</span>`).join(" "));
    h += sec(t("sp_selected_supplier"), UI.kvHtml(sup.factoryName,UI.SupplierScoreBadge(sup.trustScore))+UI.kv(t("sup_region"),sup.factoryRegion));
    h += sec(t("sp_route"), UI.kvHtml(t("comp_level"),UI.RiskBadge(comp.riskLevel))+UI.kv(t("comp_route"),comp.recommendedRoute));
    if(cf) h += sec(t("sp_ccs"), UI.kvHtml(t("co_ccs"),UI.CashBadge(cf.output.cashConversionScore))+UI.kv(t("co_decision"),cf.output.decision)+UI.kv(t("co_landed"),money(cf.output.landedUnitCost)));
    const order = DB.getOrder(o.opportunityId);
    if(order) h += sec(t("sp_timeline"), UI.ProgressTimeline(order.steps.map(s=>({name:s.name,done:s.done}))));
    h += sec(t("sp_risk"), UI.kvHtml(t("f_risk"),UI.RiskBadge(p.riskSummary.complianceRisk))+UI.kv("Cash risk",p.riskSummary.cashRisk));
    h += sec(t("sp_trust"), UI.kvHtml("Trust",UI.SupplierScoreBadge(p.supplierTrustSnapshot.trustScore)));
    h += `<div class="section-label">${t("sp_ledger")}</div>` + UI.LedgerTimeline(ledger.slice(-5).reverse());
    const exportEnv = TradeAiService.exportSkuPassportJson(o);
    h += `<div class="section-label">${t("sp_export")}</div>` + UI.JsonPreviewPanel(exportEnv.payload);
    h += `<div class="btn-row">${UI.PrimaryButton(t("match_suppliers"),"go","suppliers:"+o.opportunityId)}${UI.SecondaryButton(t("run_compliance"),"go","compliance:"+o.opportunityId)}</div>`;
    h += `<div class="btn-row">${UI.SecondaryButton(t("calc_cash"),"go","cashflow:"+o.opportunityId)}${UI.SecondaryButton(t("build_growth"),"go","growth:"+o.opportunityId)}</div>`;
    return { title: t("passport_title"), back:true, html:h };
  }

  /* ---------------- 3/8. Suppliers tab + Supplier Match ---------------- */
  function suppliersTab(){
    let h = `<p class="subtitle">${t("sup_match_sub")}</p>`;
    h += `<div class="row-link" data-act="go" data-arg="trustgraph:all"><div class="t"><div class="n">${t("sup_trust_graph")}</div><div class="m">${DB.allSuppliers.length} factories · ${DB.supplierTrustSignals.length} trust signals</div></div><span class="chev">›</span></div>`;
    DB.opportunities.forEach(o=>{
      const top = DB.getSuppliers(o.opportunityId)[0];
      h += `<div class="row-link" data-act="go" data-arg="suppliers:${o.opportunityId}">
        <div class="t"><div class="n">${E(o.productConcept)}</div><div class="m">${E(top.factoryName)} · ${E(top.factoryRegion)}</div></div>${UI.SupplierScoreBadge(top.trustScore)}</div>`;
    });
    return { title: t("sup_title"), home:true, html:h };
  }
  function suppliers(id){
    const o = DB.getOpportunity(id);
    if(!o) return notFound();
    const env = TradeAiService.recommendSuppliers(o);
    let h = `<p class="subtitle">${t("sup_match_sub")}</p>`;
    h += UI.AiGeneratedBlock(env, t("sup_match_title"));
    DB.getSuppliers(id).forEach(s=>{
      h += `<div class="card">
        <div style="display:flex;gap:10px;align-items:center">
          ${UI.TrustRing(s.trustScore)}
          <div style="flex:1"><div class="lead">${E(s.factoryName)}</div><div class="meta">${E(s.factoryRegion)} · ${E(s.verificationStatus)}</div></div>
        </div>
        <div class="metric-row" style="margin-top:10px">
          <span class="badge b-neutral">MOQ ${s.MOQ}</span>
          <span class="badge b-neutral">${E(s.sampleLeadTime)}</span>
          <span class="badge b-margin">${Math.round(s.onTimeFulfillmentRate*100)}% on-time</span>
          ${s.riskFlags.length?UI.RiskBadge("Medium"):UI.RiskBadge("Low")}
        </div>
        ${UI.field(t("sup_certs"),s.certifications)}
        <div class="meta" style="margin-top:8px"><b>${t("sup_reason")}:</b> ${E(s.recommendedReason)}</div>
        ${s.riskFlags.length?`<div class="meta" style="margin-top:4px"><b>${t("sup_riskflags")}:</b> ${E(s.riskFlags.join("; "))}</div>`:""}
        <div class="btn-row">${UI.PrimaryButton(t("select"),"select_supplier",o.opportunityId+"|"+s.supplierId)}${UI.SecondaryButton(t("open"),"go","supplier:"+s.supplierId)}</div>
        <div class="btn-row">${UI.SecondaryButton(t("compare_quotes"),"go","quotes:"+o.opportunityId)}${UI.GhostButton(t("generate_rfq"),"open_action","ACT-4000")}</div>
      </div>`;
    });
    return { title: t("sup_match_title"), back:true, html:h };
  }

  /* ---------------- 9. Supplier Detail ---------------- */
  function supplier(sid){
    const s = DB.getSupplier(sid);
    if(!s) return notFound();
    const o = DB.getOpportunity(s.opportunityId);
    const env = TradeAiService.generateSupplierTrustSummary(s);
    let h = `<div class="card"><div style="display:flex;gap:10px;align-items:center">${UI.TrustRing(s.trustScore)}
      <div style="flex:1"><div class="lead">${E(s.factoryName)}</div><div class="meta">${E(s.factoryRegion)} · ${E(s.yearsInBusiness)}y · ${E(s.verificationStatus)}</div></div></div></div>`;
    h += `<div class="card">
      ${UI.kv(t("sup_categories"),s.mainCategories.join(", "))}
      ${UI.kv(t("sup_moq"),s.MOQ)} ${UI.kv(t("sup_price"),s.priceRange)}
      ${UI.kv(t("sup_sample_lt"),s.sampleLeadTime)} ${UI.kv(t("sup_prod_lt"),s.productionLeadTime)}
      ${UI.kv(t("sup_ontime"),Math.round(s.onTimeFulfillmentRate*100)+"%")}
      ${UI.kv(t("sup_dispute"),(s.returnDisputeRate*100).toFixed(1)+"%")}
      ${UI.kv(t("sup_rating"),s.platformRating)} ${UI.kvHtml(t("sup_trust"),UI.SupplierScoreBadge(s.trustScore))}
      ${UI.kv(t("sup_payment"),s.paymentTermsMock)} ${UI.kv(t("sup_response"),s.responseSpeedMock)}
      ${UI.field(t("sup_certs"),s.certifications)} ${UI.field(t("sup_markets"),s.exportMarkets)}
    </div>`;
    h += UI.AiGeneratedBlock(env, t("gen_trust_summary"));
    if(o){
      h += `<div class="btn-row">${UI.PrimaryButton(t("gen_inquiry"),"gen","inquiry:"+o.opportunityId+":"+sid)}${UI.SecondaryButton(t("gen_wechat"),"gen","wechat:"+o.opportunityId+":"+sid)}</div>`;
      h += `<div class="btn-row">${UI.SecondaryButton(t("gen_brief"),"gen","brief:"+o.opportunityId+":"+sid)}${UI.SecondaryButton(t("gen_inspection"),"gen","inspection:"+o.opportunityId+":"+sid)}</div>`;
      h += `<div class="btn-row">${UI.GhostButton(t("gen_cert_verify"),"open_action","ACT-4003")}</div>`;
      h += `<div id="genslot"></div>`;
    }
    return { title: s.factoryName, back:true, html:h };
  }

  /* ---------------- 10. Supplier Trust Graph ---------------- */
  function trustGraph(){
    const sorted = DB.allSuppliers.slice().sort((a,b)=>b.trustScore-a.trustScore);
    let h = `<p class="subtitle">A graph of supplier trust signals — the basis of Atlaz's future network effects. Mock data.</p>`;
    h += `<div class="card">${UI.tiles([[DB.allSuppliers.length,"factories"],[DB.supplierTrustSignals.length,"signals"],[Math.round(sorted[0].trustScore*100),"top trust"]])}</div>`;
    h += `<div class="section-label">Top suppliers by trust</div>`;
    sorted.slice(0,10).forEach(s=>{ h += `<div class="row-link" data-act="go" data-arg="supplier:${s.supplierId}">
      <div class="t"><div class="n">${E(s.factoryName)}</div><div class="m">${E(s.factoryRegion)} · ${E(s.verificationStatus)}</div></div>${UI.SupplierScoreBadge(s.trustScore)}</div>`; });
    h += `<div class="section-label">Recent trust signals</div>`;
    DB.supplierTrustSignals.slice(0,8).forEach(sig=>{ h += `<div class="ledger-ev"><div class="t">${E(sig.signalType)} <span class="actor ${sig.direction==="negative"?"supplier":"ai"}">${E(sig.direction)}</span></div><div class="m">${E(sig.supplierId)} · weight ${sig.weight} · Δtrust ${sig.effectOnTrustScore}</div></div>`; });
    return { title: t("sup_trust_graph"), back:true, html:h };
  }

  /* ---------------- 11/12. Inquiry / Quote comparison ---------------- */
  function quotes(id){
    const o = DB.getOpportunity(id);
    if(!o) return notFound();
    const env = TradeAiService.generateQuotationComparison(o);
    let h = UI.AiGeneratedBlock(env, t("gen_quote"));
    env.payload.rows.forEach(r=>{ h += `<div class="card">
      <div class="lead">${E(r.factory)}</div>
      ${UI.kv("Unit price",money(r.unitPrice))}${UI.kv("MOQ",r.MOQ)}${UI.kv(t("sup_sample_lt"),r.sampleLeadTime)}
      ${UI.kvHtml(t("sup_trust"),UI.SupplierScoreBadge(r.trustScore))}${UI.kv(t("sup_payment"),r.paymentTerms)}
      ${UI.kvHtml("Recommendation",`<span class="badge ${r.recommendation==="Preferred"?"b-margin":r.recommendation==="Consider"?"b-medium":"b-high"}">${E(r.recommendation)}</span>`)}
    </div>`; });
    return { title: t("gen_quote"), back:true, html:h };
  }

  /* ---------------- 13. Listing Studio ---------------- */
  function listing(id){
    const o = DB.getOpportunity(id);
    if(!o) return notFound();
    const env = TradeAiService.generateListingDraft(o);
    const d = env.payload;
    let h = `<p class="subtitle">${t("listing_sub")}</p>`;
    h += `<div class="card">${UI.kv(t("lst_output_lang"),d.language)}${UI.kv(t("f_platform"),d.platform)}${UI.kvHtml(t("comp_level"),UI.RiskBadge(d.riskLevel))}</div>`;
    h += UI.AiGeneratedBlock(env, t("listing_title"));
    h += `<div class="card">
      ${UI.kv(t("lst_title"),d.title)}
      ${UI.field(t("lst_bullets"),d.bullets)}
      <div class="section-label">${t("lst_desc")}</div><div class="meta">${E(d.description)}</div>
      ${UI.field(t("lst_seo"),d.seoKeywords)}
      <div class="section-label">${t("lst_tiktok")}</div><div class="meta">${E(d.tiktokScript)}</div>
      ${UI.field(t("lst_amazon"),d.amazonSections)} ${UI.field(t("lst_shopify"),d.shopifySections)}
      ${UI.field(t("lst_images"),d.imagePrompts)}
      ${UI.field(t("lst_banned"),d.bannedWordRisks)}
      ${UI.field(t("lst_avoid"),d.claimsToAvoid)}
      ${UI.field(t("lst_safe"),d.complianceSafeAlternatives)}
      ${UI.field(t("lst_agentfacts"),d.aiShoppingAgentFacts)}
      ${UI.field(t("lst_abtests"),d.abTestTitles)}
      <div class="section-label">${t("lst_creator")}</div><div class="meta">${E(d.creatorBrief)}</div>
    </div>`;
    h += `<div class="btn-row">${UI.PrimaryButton(t("run_compliance"),"go","compliance:"+id)}${UI.GhostButton(t("generate_listing"),"open_action","ACT-4005")}</div>`;
    return { title: t("listing_title"), back:true, html:h };
  }

  /* ---------------- 14. Compliance Route Check ---------------- */
  function compliance(id){
    const o = DB.getOpportunity(id);
    if(!o) return notFound();
    const env = TradeAiService.runComplianceRouteCheck(o);
    const c = env.payload;
    let h = `<p class="subtitle">${t("comp_sub")}</p>`;
    if(c.riskLevel==="Blocked") h += `<div class="blocked-banner">⛔ ${E((c.blockedReasons||[]).join("; ")||"Blocked")}</div>`;
    h += `<div class="card">
      ${UI.kvHtml(t("comp_level"),UI.RiskBadge(c.riskLevel))}
      ${UI.kv(t("comp_country"),c.targetCountry)} ${UI.kv(t("comp_category"),c.category)}
      ${UI.kv(t("comp_material"),c.materialProfile)} ${UI.kv(t("comp_customs"),c.customsRisk)}
      ${UI.kv(t("comp_review"),c.requiresProfessionalReview?"Yes":"No")}
      ${UI.field(t("comp_required"),c.requiredChecks)}
      ${UI.field(t("comp_forbidden"),c.forbiddenClaims)}
      ${UI.field(t("comp_labeling"),c.labelingRequirements)}
      ${UI.field(t("comp_gaps"),c.certificationGaps)}
      ${UI.field(t("comp_platform_rules"),c.platformRuleRisks)}
      ${UI.field("Material risks",c.materialRisks)}
      ${UI.field("IP risks",c.intellectualPropertyRisks)}
      ${UI.field("Banned words",c.advertisingBannedWords)}
      <div class="section-label">${t("comp_route")}</div><div class="meta">${E(c.recommendedRoute)}</div>
      <div class="section-label">${t("comp_safe")}</div><div class="meta">${E(c.safeAlternativePositioning)}</div>
    </div>`;
    if(c.riskLevel==="High") h += `<div class="card">${UI.SecondaryButton("⛔ "+t("aa_requires"),"open_action","ACT-4004")}</div>`;
    h += UI.AiGeneratedBlock(env, t("comp_title"));
    h += `<div class="disclaimer">${E(c.disclaimer)}</div>`;
    return { title: t("comp_title"), back:true, html:h };
  }

  /* ---------------- 15/16. Trade Order Timeline + Ledger ---------------- */
  function order(id){
    const ord = DB.getOrder(id);
    if(!ord) return notFound();
    let h = `<div class="card"><div class="lead">${E(ord.product)}</div><div class="meta">${E(ord.supplierName)} · ${ord.quantity} units · ${E(ord.tradeOrderId)}</div>
      <div class="metric-row" style="margin-top:8px"><span class="badge b-trust">${E(ord.currentStatus)}</span></div></div>`;
    h += `<div class="section-label">${t("order_title")}</div>`;
    ord.steps.forEach(s=>{
      h += `<div class="card">
        <div style="display:flex;gap:8px;align-items:center"><span class="badge ${s.done?"b-margin":"b-neutral"}">${s.done?"✓":"○"} ${E(s.name)}</span>${s.approvalRequired?UI.RiskBadge("Medium"):""}</div>
        <div class="meta" style="margin-top:6px"><b>${t("order_ai")}:</b> ${E(s.aiGuidance)}</div>
        ${s.requiredDocs.length?`<div class="meta" style="margin-top:4px"><b>${t("order_docs")}:</b> ${E(s.requiredDocs.join(", "))}</div>`:""}
        <div class="meta" style="margin-top:4px"><b>${t("order_risk")}:</b> ${E(s.risk)}</div>
        ${s.requiredDocs.length?`<div class="btn-row">${UI.GhostButton(t("order_template"),"gen_doc",ord.opportunityId+"|"+s.requiredDocs[0])}</div>`:""}
      </div>`;
    });
    h += `<div class="btn-row">${UI.SecondaryButton(t("ledger_title"),"go","ledger:"+ord.skuPassportId)}${UI.PrimaryButton(t("build_growth"),"go","growth:"+ord.opportunityId)}</div>`;
    h += `<div class="disclaimer">${E(ord.disclaimer)}</div>`;
    return { title: t("order_title"), back:true, html:h };
  }
  function ordersTab(){
    let h = `<p class="subtitle">Mock trade orders across your SKU Passports. No real payment or logistics is initiated.</p>`;
    DB.tradeOrders.forEach(o=>{ h += `<div class="row-link" data-act="go" data-arg="order:${o.opportunityId}">
      <div class="t"><div class="n">${E(o.product)}</div><div class="m">${E(o.supplierName)} · ${o.quantity} units</div></div><span class="pill">${E(o.currentStatus)}</span></div>`; });
    h += `<div class="section-label">Trade Loop Ledger</div>`;
    h += `<div class="row-link" data-act="go" data-arg="ledger:all"><div class="t"><div class="n">${t("ledger_title")}</div><div class="m">${TradeLoopLedgerService.all().length} events</div></div><span class="chev">›</span></div>`;
    h += `<div class="row-link" data-act="go" data-arg="docs:all"><div class="t"><div class="n">${t("order_template")}</div><div class="m">${DB.documentTemplates.length} templates</div></div><span class="chev">›</span></div>`;
    return { title: t("tab_orders"), home:true, html:h };
  }
  function ledger(skuId){
    let events = skuId==="all"? TradeLoopLedgerService.all().slice().reverse() : TradeLoopLedgerService.forSku(skuId).slice().reverse();
    let h = `<p class="subtitle">${t("ledger_sub")}</p>`;
    if(!events.length) h += UI.EmptyStateView();
    else h += UI.LedgerTimeline(events);
    return { title: t("ledger_title"), back:true, html:h };
  }

  /* ---------------- 17. Document Template Generator ---------------- */
  function docs(){
    let h = `<p class="subtitle">Generate trade-document templates. Output is mock JSON — verify before real use.</p>`;
    DB.documentTemplates.forEach(d=>{ h += `<div class="card">
      <div class="lead">${E(d.name)}</div><div class="meta">${E(d.fields.join(" · "))}</div>
      <div class="btn-row">${UI.SecondaryButton(t("generate"),"gen_doc","OPP-2001|"+d.name)}</div></div>`; });
    h += `<div id="genslot"></div>`;
    return { title: t("order_template"), back:true, html:h };
  }

  /* ---------------- 18. Cash Conversion Calculator ---------------- */
  function cashflow(id){
    const o = DB.getOpportunity(id) || DB.opportunities[0];
    const inputs = Store.cashInputs[o.opportunityId] || DB.getCashInputs(o);
    Store.cashInputs[o.opportunityId] = inputs;
    const env = TradeAiService.calculateCashConversionScore(inputs, `SKU-${o.opportunityId.slice(4)}`);
    const out = env.payload.output;
    let h = `<p class="subtitle">${t("cash_sub")}</p>`;
    // inputs (editable subset)
    const fld = (k,key,step)=>`<div class="field"><label>${k}</label><input type="number" step="${step||"any"}" value="${inputs[key]}" data-cash="${key}" data-opp="${o.opportunityId}"></div>`;
    h += `<div class="card"><div class="grid2">
      ${fld(t("ci_unit"),"unitCost")}${fld(t("ci_qty"),"qty","1")}
      ${fld(t("ci_price"),"targetPrice")}${fld(t("ci_ifreight"),"internationalFreight")}
      ${fld(t("ci_duty"),"dutyRate")}${fld(t("ci_platfee"),"platformFee")}
      ${fld(t("ci_adunit"),"adBudgetPerUnit")}${fld(t("ci_refund"),"refundRate")}
      ${fld(t("ci_terms"),"paymentTerms","1")}${fld(t("ci_invdays"),"inventoryDays","1")}
    </div>${UI.PrimaryButton(t("recalculate"),"recalc_cash",o.opportunityId)}</div>`;
    // outputs (15)
    h += `<div class="card">
      ${UI.tiles([[money(out.landedUnitCost),t("co_landed")],[Math.round(out.grossMarginRate*100)+"%",t("co_grossr")],[Math.round(out.netMarginRate*100)+"%",t("co_netr")]])}
      ${UI.kv(t("co_gross"),money(out.grossMargin))}${UI.kv(t("co_net"),money(out.netMargin))}
      ${UI.kv(t("co_breakeven"),out.breakEvenUnits)}${UI.kv(t("co_cashlock"),money(out.cashLocked))}
      ${UI.kv(t("co_recovery"),out.cashRecoveryDays+" d")}${UI.kv(t("co_invpressure"),out.inventoryPressure)}
      ${UI.kvHtml(t("co_adrisk"),UI.RiskBadge(out.adRisk))}${UI.kvHtml(t("co_fxrisk"),UI.RiskBadge(out.fxRisk))}
      ${UI.kvHtml(t("co_dutyrisk"),UI.RiskBadge(out.dutyRisk))}${UI.kvHtml(t("co_returnrisk"),UI.RiskBadge(out.returnRisk))}
      ${UI.kvHtml(t("co_termrisk"),UI.RiskBadge(out.paymentTermRisk))}
      ${UI.kvHtml(t("co_ccs"),UI.CashBadge(out.cashConversionScore))}
      ${UI.kv(t("co_firstqty"),out.recommendedFirstOrderQty)}
      ${UI.kvHtml(t("co_decision"),`<span class="badge ${out.decision==="buy"?"b-margin":out.decision==="stop"?"b-high":"b-medium"}">${E(out.decision)}</span>`)}
    </div>`;
    h += UI.AiGeneratedBlock(env, t("cash_title"));
    h += `<div class="disclaimer">${E(out.disclaimer)}</div>`;
    return { title: t("cash_title"), home: id===undefined, back: id!==undefined, html:h };
  }
  function cashflowTab(){
    let h = `<p class="subtitle">${t("cash_sub")}</p>`;
    DB.cashflowEvents.forEach(c=>{ const o=DB.getOpportunity(c.opportunityId); h += `<div class="row-link" data-act="go" data-arg="cashflow:${c.opportunityId}">
      <div class="t"><div class="n">${E(o.productConcept)}</div><div class="m">${money(c.output.netMargin)} net · ${c.output.decision}</div></div>${UI.CashBadge(c.output.cashConversionScore)}</div>`; });
    return { title: t("tab_cashflow"), home:true, html:h };
  }

  /* ---------------- 19/20. Growth Playbook + Experiment tracker ---------------- */
  function growth(id){
    const o = DB.getOpportunity(id) || DB.opportunities[0];
    const env = TradeAiService.generateGrowthPlaybook(o);
    const g = DB.getGrowth(o.opportunityId);
    let h = `<p class="subtitle">${t("growth_sub")}</p>`;
    h += `<div class="card"><div class="section-label">${t("g_7")}</div>${UI.chips(env.payload.plan7)}
      <div class="section-label">${t("g_14")}</div>${UI.chips(env.payload.plan14)}
      <div class="section-label">${t("g_30")}</div>${UI.chips(env.payload.plan30)}
      ${UI.field("Elements",env.payload.elements)}</div>`;
    h += UI.AiGeneratedBlock(env, t("growth_title"));
    h += `<div class="btn-row">${UI.PrimaryButton(t("record_result"),"go","experiment:"+o.opportunityId)}</div>`;
    return { title: t("growth_title"), back: id!==undefined, home: id===undefined, html:h };
  }
  function growthTab(){
    let h = `<p class="subtitle">${t("growth_sub")}</p>`;
    DB.growthExperiments.forEach(g=>{ const o=DB.getOpportunity(g.opportunityId); h += `<div class="row-link" data-act="go" data-arg="experiment:${g.opportunityId}">
      <div class="t"><div class="n">${E(o.productConcept)}</div><div class="m">ROAS ${g.metrics.ROAS} · ${g.metrics.orders} orders</div></div><span class="pill">${E(g.recommendedDecision)}</span></div>`; });
    return { title: t("tab_growth"), home:true, html:h };
  }
  function experiment(id){
    const g = DB.getGrowth(id);
    if(!g) return notFound();
    const o = DB.getOpportunity(g.opportunityId);
    const env = TradeAiService.evaluateExperimentResult(g);
    const m = g.metrics;
    let h = `<div class="card"><div class="lead">${E(o.productConcept)}</div><div class="meta">${t("g_result_title")}</div>
      ${UI.tiles([[m.views.toLocaleString(),"views"],[(m.CTR*100).toFixed(1)+"%","CTR"],[(m.conversionRate*100).toFixed(1)+"%","CVR"]])}
      ${UI.tiles([[m.orders,"orders"],[m.ROAS,"ROAS"],[money(m.CAC),"CAC"]])}
      ${UI.kv("Refund rate",(m.refundRate*100).toFixed(1)+"%")}${UI.kv("Inventory left",m.inventoryRemaining)}
      ${UI.kv("Comments",m.commentsSummary)}${UI.kv("Creator feedback",m.creatorFeedback)}
      ${UI.kv("Pain points",m.customerPainPoints)}
    </div>`;
    h += UI.AiGeneratedBlock(env, t("g_decision"));
    h += `<div class="card"><div class="section-label">${t("g_decision")}</div>
      <div style="display:flex;gap:8px;align-items:center"><span class="badge ${env.payload.decision==="stop"?"b-high":env.payload.decision==="reorder"?"b-margin":"b-medium"}">${E(env.payload.decision)}</span></div>
      <div class="meta" style="margin-top:8px">${E(env.payload.reasoning)}</div>
      ${UI.field("Decision space",env.payload.decisionSpace)}
      <div class="btn-row">${UI.PrimaryButton(t("confirm_decision"),"confirm_decision",g.opportunityId)}${UI.GhostButton(t("export_json"),"export_opp",g.opportunityId)}</div>
    </div>`;
    return { title: t("g_result_title"), back:true, html:h };
  }

  /* ---------------- 21. AI Decision Page ---------------- */
  function aiDecision(id){
    const g = DB.getGrowth(id) || DB.growthExperiments[0];
    const env = TradeAiService.evaluateExperimentResult(g);
    let h = UI.AiGeneratedBlock(env, t("g_decision"));
    h += `<div class="card">${UI.kv("Recommendation",env.payload.decision)}${UI.kv("Reasoning",env.payload.reasoning)}</div>`;
    h += `<div class="btn-row">${UI.PrimaryButton(t("approve"),"confirm_decision",g.opportunityId)}${UI.DestructiveButton(t("reject"),"noop","")}</div>`;
    return { title: t("g_decision"), back:true, html:h };
  }

  /* ---------------- 23. Pricing ---------------- */
  function pricing(){
    let h = `<p class="subtitle">RaaS subscription + transaction and service network revenue. Mock pricing.</p>`;
    DB.plans.forEach(pl=>{ h += `<div class="card ${pl.id===Store.pref.plan?"elevated":""}">
      <div style="display:flex;align-items:center;gap:8px"><div class="lead" style="flex:1">${E(pl.name)}</div>
      <div class="lead">${pl.priceNote?E(pl.priceNote):pl.priceUsd===0?"$0":"$"+pl.priceUsd+"/mo"}</div></div>
      <ul class="assump-list">${pl.features.map(f=>`<li>${E(f)}</li>`).join("")}</ul>
      ${pl.id!==Store.pref.plan?UI.SecondaryButton(t("price_upgrade"),"set_plan",pl.id):`<div class="center-muted">Current plan</div>`}
    </div>`; });
    h += `<div class="section-label">${t("price_revenue")}</div>` + UI.chips(DB.revenueStreams);
    return { title: t("price_title"), back:true, html:h };
  }

  /* ---------------- 24. Privacy & Disclaimer ---------------- */
  function privacy(){
    const statements = [
      "Atlaz processes merchant preferences.","May process product, order, supplier, financial and ad-test data.",
      "This MVP uses mock data.","User-generated content should be reviewed by the user.",
      "AI outputs may be inaccurate.","Compliance results do not constitute legal advice.",
      "Financial calculations are not investment, tax, accounting or financing advice.","Atlaz does not promise loans.",
      "Atlaz does not automatically contact real suppliers.","Atlaz does not automatically submit real platform listings.",
      "Atlaz does not automatically initiate real payments.","Atlaz does not automatically purchase logistics.",
      "Atlaz does not automatically purchase insurance.","Atlaz does not automatically submit customs declarations.",
      "High-risk actions require user confirmation.",
    ];
    let h = `<div class="card"><div class="section-label">Data & boundaries</div><ul class="assump-list">${statements.map(s=>`<li>${E(s)}</li>`).join("")}</ul></div>`;
    h += `<div class="card"><div class="section-label">Mandatory disclaimers</div>
      <div class="disclaimer">${t("disc_ai")}</div><div class="disclaimer">${t("disc_comp")}</div>
      <div class="disclaimer">${t("disc_fin")}</div><div class="disclaimer">${t("disc_mock")}</div>
      <div class="disclaimer">${t("disc_guarantee")}</div><div class="disclaimer">${t("disc_action")}</div></div>`;
    h += `<div class="card"><div class="section-label">Data right consents (mock)</div>${DB.dataRightConsents.map(c=>UI.kvHtml(c.scope,`<span class="badge ${c.granted?"b-margin":"b-neutral"}">${c.granted?"granted":"opt-in"}</span>`)).join("")}</div>`;
    return { title: t("priv_title"), back:true, html:h };
  }

  /* ---------------- 27. About / Ownership ---------------- */
  function about(){
    let h = `<div class="card"><div class="lead">${t("app_name")}</div><div class="meta">${t("positioning")}</div></div>`;
    h += `<div class="card"><div class="section-label">Ownership notice</div><div class="meta">${t("ownership_notice")}</div></div>`;
    h += `<div class="card"><div class="meta">Third-party open-source libraries, platform SDKs, fonts, icons, AI models and external services remain under their own licenses. Atlaz does not claim their copyright.</div></div>`;
    return { title: t("about_title"), back:true, html:h };
  }

  /* ---------------- 28. Mock API Registry ---------------- */
  function mockApi(){
    let h = `<p class="subtitle">${t("mockapi_sub")}</p>`;
    TradeToolRegistry.list().forEach(name=>{
      const tool = TradeToolRegistry[name];
      h += `<div class="card"><div style="display:flex;align-items:center;gap:8px"><div class="lead" style="flex:1">${E(tool.name)}</div>
        <span class="badge ${tool.reservedProductionApi?"b-medium":"b-margin"}">${tool.reservedProductionApi?t("api_reserved"):t("api_connected")}</span></div>
        ${UI.kv("Production API",tool.reservedProductionApi||"—")}
        ${UI.kvHtml(t("api_approval"),tool.userApprovalRequired?UI.RiskBadge("Required"):UI.RiskBadge("Low"))}
        ${tool.requiredCredentials.length?UI.field(t("api_creds"),tool.requiredCredentials):""}
        ${tool.futureProviderExamples.length?UI.field(t("api_providers"),tool.futureProviderExamples):""}
      </div>`;
    });
    return { title: t("mockapi_title"), back:true, html:h };
  }

  /* ---------------- 25. Settings ---------------- */
  function settings(){
    const p = Store.pref;
    const langOpts = I18N.LANGS.map(l=>`<option value="${l.code}" ${l.code===p.language?"selected":""}>${l.label}</option>`).join("");
    const curOpts = I18N.CURRENCIES.map(c=>`<option value="${c.code}" ${c.code===p.currency?"selected":""}>${c.code} (${c.symbol})</option>`).join("");
    let h = `<div class="card">
      <div class="field"><label>${t("set_language")}</label><select data-set="language">${langOpts}</select></div>
      <div class="field"><label>${t("set_currency")}</label><select data-set="currency">${curOpts}</select></div>
      <div class="field"><label>${t("set_theme")}</label><select data-set="theme"><option value="light" ${p.theme==="light"?"selected":""}>Off</option><option value="dark" ${p.theme==="dark"?"selected":""}>On</option></select></div>
    </div>`;
    h += `<div class="card">${UI.kv(t("set_identity"),p.identity)}${UI.kv(t("set_market"),p.market)}${UI.kv(t("set_platform"),p.platform)}
      ${UI.kvHtml("AI output language (US example)",`<span class="pill">${E(I18N.aiOutputLangFor("United States"))}</span>`)}</div>`;
    h += `<div class="section-label">More</div>`;
    [["pricing",t("price_title")],["privacy",t("priv_title")],["mockapi",t("mockapi_title")],["about",t("about_title")],["states",t("st_error")+" / "+t("st_empty")]].forEach(([r,l])=>{
      h += `<div class="row-link" data-act="go" data-arg="${r}"><div class="t"><div class="n">${E(l)}</div></div><span class="chev">›</span></div>`;
    });
    h += UI.DestructiveButton(t("set_reset"),"reset_onboarding","");
    return { title: t("settings_title"), home:true, html:h, settings:true };
  }

  /* ---------------- 26. Error/Empty state demo ---------------- */
  function states(){
    let h = `<div class="section-label">State components</div>`;
    h += UI.LoadingView();
    h += UI.EmptyStateView();
    h += UI.ErrorStateView("Mock error message","go");
    h += UI.BlockedRiskView(["High-risk category for this MVP"]);
    h += UI.StateView("offline"); h += UI.StateView("perm"); h += UI.StateView("review");
    h += UI.StateView("api"); h += UI.StateView("verify"); h += UI.StateView("approval");
    return { title: "States", back:true, html:h };
  }

  function notFound(){ return { title:"Not found", back:true, html: UI.EmptyStateView("This item was not found.") }; }

  return { commandCenter, radarList, opportunity, passport, suppliersTab, suppliers, supplier, trustGraph,
    quotes, listing, compliance, order, ordersTab, ledger, docs, cashflow, cashflowTab, growth, growthTab,
    experiment, aiDecision, pricing, privacy, about, mockApi, settings, states, notFound };
})();
if (typeof window !== "undefined") window.Screens = Screens;
