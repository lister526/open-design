/* ============================================================================
 * Atlaz · App shell — Store, Nav, onboarding, boot, event handling.
 * Real-time language switching with no reload. Global: App
 * ==========================================================================*/
const Store = {
  pref: null,
  cashInputs: {},
  load(){
    let saved=null;
    try{ saved=JSON.parse(localStorage.getItem("atlaz.pref")||"null"); }catch(e){}
    this.pref = Object.assign({}, DB.userPreferenceDefault, saved||{});
    // honor query overrides
    const q = new URLSearchParams(location.search);
    if(q.get("lang")) this.pref.language = q.get("lang");
    if(q.get("demo")==="1") this.pref.onboarded = true;
    if(q.get("reset")==="1") this.pref.onboarded = false;
    I18N.setLang(this.pref.language);
  },
  save(){ try{ localStorage.setItem("atlaz.pref", JSON.stringify(this.pref)); }catch(e){} },
  set(k,v){ this.pref[k]=v; this.save(); },
};

const Nav = {
  stack: [{ route:"radar" }],
  tab: "radar",
  sheet: null,
  current(){ return this.stack[this.stack.length-1]; },
  go(route, id){ this.stack.push({ route, id }); App.render(); },
  back(){ if(this.stack.length>1){ this.stack.pop(); App.render(); } },
  setTab(tab){ this.tab=tab; this.stack=[{ route:tab }]; App.render(); },
  reset(route){ this.stack=[{ route }]; App.render(); },
};

const App = (() => {
  const TABS = [
    { id:"radar", icon:"📡", key:"tab_radar" },
    { id:"suppliers", icon:"🏭", key:"tab_suppliers" },
    { id:"orders", icon:"📦", key:"tab_orders" },
    { id:"cashflow", icon:"💵", key:"tab_cashflow" },
    { id:"growth", icon:"📈", key:"tab_growth" },
  ];

  function screenFor(route, id){
    switch(route){
      case "radar": return Screens.commandCenter();
      case "radar_list": return Screens.radarList();
      case "opportunity": return Screens.opportunity(id);
      case "passport": return Screens.passport(id);
      case "suppliers": return id?Screens.suppliers(id):Screens.suppliersTab();
      case "supplier": return Screens.supplier(id);
      case "trustgraph": return Screens.trustGraph();
      case "quotes": return Screens.quotes(id);
      case "listing": return Screens.listing(id);
      case "compliance": return Screens.compliance(id);
      case "order": return id?Screens.order(id):Screens.ordersTab();
      case "orders": return Screens.ordersTab();
      case "ledger": return Screens.ledger(id||"all");
      case "docs": return Screens.docs();
      case "cashflow": return id?Screens.cashflow(id):Screens.cashflowTab();
      case "growth": return id?Screens.growth(id):Screens.growthTab();
      case "experiment": return Screens.experiment(id);
      case "aidecision": return Screens.aiDecision(id);
      case "pricing": return Screens.pricing();
      case "privacy": return Screens.privacy();
      case "about": return Screens.about();
      case "mockapi": return Screens.mockApi();
      case "settings": return Screens.settings();
      case "states": return Screens.states();
      default: return Screens.notFound();
    }
  }

  function render(){
    const app = document.getElementById("app");
    if(!Store.pref.onboarded){ renderOnboarding(); return; }
    const cur = Nav.current();
    const scr = screenFor(cur.route, cur.id);
    const showTabs = !!scr.home || ["settings"].includes(cur.route) || isTabRoot(cur.route);
    let topbar = `<div class="topbar"><div class="row">
      ${scr.back?`<button class="back" data-act="back">‹ ${I18N.t("back")}</button>`:""}
      <div class="title">${UI.esc(scr.title)}</div>
      ${scr.home?`<button class="back" data-act="go" data-arg="settings">⚙︎</button>`:""}
    </div>${scr.home?marketLine():""}</div>`;
    app.innerHTML = topbar +
      `<div class="scroll" id="scroll">${scr.html}</div>` +
      tabbar() + (Nav.sheet?Nav.sheet:"");
    applyTheme();
    bindScroll();
  }

  function isTabRoot(route){ return ["radar","suppliers","orders","cashflow","growth"].includes(route); }

  function marketLine(){
    const p=Store.pref;
    return `<div class="marketline">
      <span class="chip">${UI.esc(p.identity)}</span>
      <span class="chip">${UI.esc(p.market)}</span>
      <span class="chip">${UI.esc(p.platform)}</span>
      <span class="chip">${UI.esc(p.language.toUpperCase())}</span>
      <span class="chip">${UI.esc(p.currency)}</span></div>`;
  }

  function tabbar(){
    const curTab = Nav.tab;
    return `<div class="tabbar">${TABS.map(tb=>`<button class="tab ${curTab===tb.id?"active":""}" data-tab="${tb.id}">
      <span class="ico">${tb.icon}</span><span class="lbl">${I18N.t(tb.key)}</span></button>`).join("")}</div>`;
  }

  /* -------- onboarding -------- */
  const OB = {
    step: 0,
    sel: {},
    identities: ["TikTok Shop seller","Shopify seller","Amazon seller","Local boutique buyer","Content creator merchant","China factory exporter","Agency / operator","Solo global brand builder"],
    markets: ["United States","United Kingdom","Germany","France","Japan","Southeast Asia","Middle East","Latin America"],
    platforms: ["TikTok Shop","Shopify","Amazon","Offline wholesale","Instagram / creator commerce","Multi-platform"],
  };
  function renderOnboarding(){
    const app = document.getElementById("app");
    const s = OB.step;
    let body="";
    if(s===0){
      body = `<div class="step">${I18N.t("ob_step")} 1/4</div><h2>${I18N.t("ob_identity")}</h2>` +
        OB.identities.map(x=>opt(x,"identity")).join("");
    } else if(s===1){
      body = `<div class="step">${I18N.t("ob_step")} 2/4</div><h2>${I18N.t("ob_market")}</h2>` +
        `<div class="ob-grid">`+OB.markets.map(x=>opt(x,"market")).join("")+`</div>`;
    } else if(s===2){
      body = `<div class="step">${I18N.t("ob_step")} 3/4</div><h2>${I18N.t("ob_platform")}</h2>` +
        OB.platforms.map(x=>opt(x,"platform")).join("");
    } else {
      const langOpts = I18N.LANGS.map(l=>`<div class="opt ${(OB.sel.language||Store.pref.language)===l.code?"sel":""}" data-ob="language" data-val="${l.code}"><div class="rd"></div>${l.label}</div>`).join("");
      const curOpts = I18N.CURRENCIES.map(c=>`<div class="opt ${(OB.sel.currency||Store.pref.currency)===c.code?"sel":""}" data-ob="currency" data-val="${c.code}"><div class="rd"></div>${c.code} (${c.symbol})</div>`).join("");
      body = `<div class="step">${I18N.t("ob_step")} 4/4</div><h2>${I18N.t("ob_lang")}</h2>
        <div class="section-label">${I18N.t("set_language")}</div>${langOpts}
        <div class="section-label">${I18N.t("set_currency")}</div><div class="ob-grid">${curOpts}</div>`;
    }
    const canNext = s===3 || OB.sel[["identity","market","platform"][s]];
    app.innerHTML = `<div class="ob">${s===0?`<div class="splash" style="flex:0;background:none;color:var(--Ink);padding:0 0 10px;align-items:flex-start"><div class="logo" style="color:var(--AtlazBlue)">Atlaz</div><div class="tg" style="color:var(--InkSoft);text-align:left">${I18N.t("positioning")}</div></div>`:""}
      ${body}
      <div class="ob-foot">
        ${s>0?`<button class="btn btn-ghost" data-ob-nav="back" style="margin-bottom:8px">${I18N.t("back")}</button>`:""}
        <button class="btn btn-primary ${canNext?"":""}" data-ob-nav="next" ${canNext?"":"disabled style=opacity:.5"}>${s<3?I18N.t("continue_"):I18N.t("ob_start")}</button>
      </div></div>`;
    applyTheme();
  }
  function opt(x, group){
    const sel = OB.sel[group]===x;
    return `<div class="opt ${sel?"sel":""}" data-ob="${group}" data-val="${UI.esc(x)}"><div class="rd"></div>${UI.esc(x)}</div>`;
  }

  /* -------- theme -------- */
  function applyTheme(){ document.documentElement.setAttribute("data-theme", Store.pref.theme==="dark"?"dark":"light"); }

  /* -------- scroll persistence (light) -------- */
  function bindScroll(){ /* placeholder for future scroll restore */ }

  /* -------- AI generation slot (supplier comms / docs) -------- */
  function runGen(kind, oppId, sid){
    const slot = document.getElementById("genslot");
    if(!slot) return;
    slot.innerHTML = UI.LoadingView();
    setTimeout(()=>{
      const o = DB.getOpportunity(oppId);
      const s = sid?DB.getSupplier(sid):null;
      let env;
      try{
        if(kind==="inquiry") env = TradeAiService.generateInquiryEmail(o,s);
        else if(kind==="wechat") env = TradeAiService.generateWechatScript(o,s);
        else if(kind==="brief") env = TradeAiService.generateSampleBrief(o,s);
        else if(kind==="inspection") env = TradeAiService.generateSampleBrief(o,s);
      }catch(e){ slot.innerHTML = UI.ErrorStateView(e.message); return; }
      let body = UI.AiGeneratedBlock(env, kind);
      if(env.payload.body) body += `<div class="card"><div class="section-label">Email</div><div class="meta" style="white-space:pre-wrap">${UI.esc(env.payload.body)}</div>${env.payload.chinese?`<div class="section-label">中文</div><div class="meta" style="white-space:pre-wrap">${UI.esc(env.payload.chinese)}</div>`:""}</div>`;
      if(env.payload.script) body += `<div class="card"><div class="meta" style="white-space:pre-wrap">${UI.esc(env.payload.script)}</div></div>`;
      slot.innerHTML = body;
      slot.scrollIntoView({behavior:"smooth",block:"nearest"});
    }, 420);
  }
  function runDoc(oppId, docName){
    const slot = document.getElementById("genslot");
    const tpl = DB.documentTemplates.find(d=>d.name===docName) || DB.documentTemplates[0];
    const env = TradeAiService.generateTradeDocument(DB.getOpportunity(oppId)||DB.opportunities[0], tpl.templateId);
    if(slot){ slot.innerHTML = UI.AiGeneratedBlock(env, tpl.name); slot.scrollIntoView({behavior:"smooth",block:"nearest"}); }
  }

  /* -------- event delegation -------- */
  function handle(e){
    const tabBtn = e.target.closest("[data-tab]");
    if(tabBtn){ Nav.setTab(tabBtn.getAttribute("data-tab")); return; }

    // onboarding option selection
    const ob = e.target.closest("[data-ob]");
    if(ob){
      const g = ob.getAttribute("data-ob"), v = ob.getAttribute("data-val");
      OB.sel[g]=v;
      if(g==="language"){ I18N.setLang(v); }
      renderOnboarding(); return;
    }
    const obnav = e.target.closest("[data-ob-nav]");
    if(obnav){
      const dir = obnav.getAttribute("data-ob-nav");
      if(dir==="back"){ OB.step=Math.max(0,OB.step-1); renderOnboarding(); return; }
      if(OB.step<3){ OB.step++; renderOnboarding(); return; }
      // finish
      Store.pref.identity = OB.sel.identity || Store.pref.identity;
      Store.pref.market = OB.sel.market || Store.pref.market;
      Store.pref.platform = OB.sel.platform || Store.pref.platform;
      Store.pref.language = OB.sel.language || Store.pref.language;
      Store.pref.currency = OB.sel.currency || Store.pref.currency;
      Store.pref.onboarded = true; Store.save();
      I18N.setLang(Store.pref.language);
      Nav.reset("radar"); return;
    }

    // JSON toggle
    const tog = e.target.closest("[data-toggle]");
    if(tog){ const el=document.getElementById(tog.getAttribute("data-toggle"));
      if(el){ const sh=el.style.display==="none"; el.style.display=sh?"block":"none"; tog.textContent=sh?I18N.t("hide_json"):I18N.t("view_json"); } return; }

    // settings selects handled by change; here handle action buttons
    const act = e.target.closest("[data-act]");
    if(act){
      const a = act.getAttribute("data-act");
      const arg = act.getAttribute("data-arg")||"";
      doAction(a, arg, e);
      return;
    }
  }

  function doAction(a, arg, e){
    if(a==="back"){ Nav.back(); return; }
    if(a==="noop"){ return; }
    if(a==="go"){ const [route,id]=arg.split(":"); Nav.go(route, id); return; }
    if(a==="close_sheet"){ Nav.sheet=null; render(); return; }
    if(a==="reset_onboarding"){ Store.pref.onboarded=false; Store.save(); OB.step=0; OB.sel={}; render(); return; }
    if(a==="set_plan"){ Store.set("plan",arg); render(); return; }
    if(a==="select_supplier"){
      const [oppId,sid]=arg.split("|");
      TradeLoopLedgerService.record(`SKU-${oppId.slice(4)}`,"supplier_selected",{actorType:"user",evidence:"User selected supplier "+sid});
      Nav.go("supplier", sid); return;
    }
    if(a==="open_action"){ const action=DB.agentActions.find(x=>x.actionId===arg)||DB.agentActions[0]; Nav.sheet=UI.HumanApprovalSheet(action); render(); return; }
    if(a==="approve_action"){
      const action=DB.agentActions.find(x=>x.actionId===arg);
      if(action) TradeLoopLedgerService.record(action.skuPassportId,"human_decision_confirmed",{actorType:"user",evidence:"Approved "+action.actionType});
      Nav.sheet=null; render(); return;
    }
    if(a==="reject_action"){ Nav.sheet=null; render(); return; }
    if(a==="gen"){ const [kind,oppId,sid]=arg.split(":"); runGen(kind,oppId,sid); return; }
    if(a==="gen_doc"){ const [oppId,docName]=arg.split("|"); runDoc(oppId,docName); return; }
    if(a==="recalc_cash"){ render(); return; }
    if(a==="confirm_decision"){
      TradeLoopLedgerService.record(`SKU-${arg.slice(4)}`,"human_decision_confirmed",{actorType:"user",evidence:"Confirmed reorder decision"});
      Nav.sheet=`<div class="sheet-backdrop" data-act="close_sheet"><div class="sheet" onclick="event.stopPropagation()"><div class="grip"></div><h3>✅ ${I18N.t("confirm_decision")}</h3><div class="meta">Decision recorded to the Trade Loop Ledger (mock).</div><div class="btn-row">${UI.PrimaryButton(I18N.t("open"),"close_sheet","")}</div></div></div>`;
      render(); return;
    }
    if(a==="export_opp"){
      const env=TradeAiService.exportSkuPassportJson(DB.getOpportunity(arg)||DB.opportunities[0]);
      Nav.sheet=`<div class="sheet-backdrop" data-act="close_sheet"><div class="sheet" onclick="event.stopPropagation()"><div class="grip"></div><h3>${I18N.t("sp_export")}</h3><pre class="json-panel" style="display:block">${UI.esc(env.rawJsonPreview)}</pre><div class="disclaimer">${UI.esc(env.disclaimer)}</div></div></div>`;
      render(); return;
    }
  }

  function handleChange(e){
    const set = e.target.closest("[data-set]");
    if(set){
      const k=set.getAttribute("data-set"), v=set.value;
      Store.set(k,v);
      if(k==="language"){ I18N.setLang(v); }
      if(k==="theme"){ applyTheme(); }
      render(); return;
    }
    const cash = e.target.closest("[data-cash]");
    if(cash){
      const key=cash.getAttribute("data-cash"), oppId=cash.getAttribute("data-opp");
      Store.cashInputs[oppId]=Store.cashInputs[oppId]||DB.getCashInputs(DB.getOpportunity(oppId));
      Store.cashInputs[oppId][key]=parseFloat(cash.value)||0;
    }
  }

  /* -------- boot -------- */
  function boot(){
    Store.load();
    applyTheme();
    // language change re-renders whole UI live
    I18N.onChange(()=>{ if(document.getElementById("scroll")||document.querySelector(".ob")) render(); });
    const app=document.getElementById("app");
    app.addEventListener("click", handle);
    app.addEventListener("change", handleChange);
    // deep link
    const q=new URLSearchParams(location.search);
    const go=q.get("go");
    // splash
    app.innerHTML=`<div class="splash"><div class="logo">Atlaz</div><div class="tg">${I18N.t("brand_tagline")}</div><div class="spinner"></div></div>`;
    const delay = q.get("demo")==="1"?250:1100;
    setTimeout(()=>{
      render();
      if(go){ const [route,id]=go.split(":"); if(route){ Nav.go(route,id); } }
    }, delay);
    window.__atlazGo=(route,id)=>Nav.go(route,id);
  }

  return { render, boot, renderOnboarding };
})();

if (typeof window !== "undefined"){
  window.Store=Store; window.Nav=Nav; window.App=App;
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", App.boot);
  else App.boot();
}
