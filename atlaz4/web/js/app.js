/* ============================================================================
 * Atlaz v4 · App shell (Store, Nav, App)
 * Deal Room-centric navigation. Real-time i18n + currency. Query-param bypass:
 *   ?demo=1 (skip onboarding) · ?reset=1 · ?lang=xx · ?ccy=XXX · ?go=route:id
 * Global: App
 * ==========================================================================*/
const App = (() => {
  const $ = (s,r)=> (r||document).querySelector(s);
  const params = new URLSearchParams(location.search);

  /* ---- routes (Deal Room is the pivot, not a flat tab set) ---- */
  const NAV = [
    {key:"command", label:"nav_command"},
    {key:"radar", label:"nav_radar"},
    {key:"dealrooms", label:"nav_dealrooms"},
    {key:"compliance", label:"nav_compliance"},
    {key:"cash", label:"nav_cash"},
    {key:"growth", label:"nav_growth"},
    {key:"flow", label:"nav_flow"},
    {key:"factory", label:"nav_factory"}
  ];

  const Store = {
    route:"command", routeId:null,
    onboarded: localStorage.getItem("atlaz4_ob")==="1",
    setRoute(r,id){ this.route=r; this.routeId=id||null; App.render(); }
  };

  function screenFor(route,id){
    const S=Screens;
    switch(route){
      case "command": return S.commandCenter();
      case "radar": return S.opportunityRadar();
      case "dealrooms": return S.dealRoomList();
      case "dealroom": return S.dealRoom(id||"OPP-4001");
      case "suppliers": case "warroom": return S.supplierWarRoom(id||"OPP-4001");
      case "compliance": return S.complianceCopilot(id||firstId());
      case "listing": return S.listingStudio(id||"OPP-4001");
      case "flow": return S.tradeFlow(id||firstId());
      case "cash": return S.cashCockpit(id||firstId());
      case "growth": return S.growthPlaybook(id||firstId());
      case "factory": return S.factoryPortal();
      default: return UI.ErrorStateView("Unknown route.");
    }
  }
  function firstId(){ return (DB.dealRoomIds&&DB.dealRoomIds[0])||"OPP-4001"; }

  /* ---- header (language + currency + AI language) ---- */
  function header(){
    const langOpts=I18N.langs().map(l=>`<option value="${l.code}" ${l.code===I18N.getLang()?"selected":""}>${l.label}</option>`).join("");
    const ccyOpts=I18N.currencies().map(c=>`<option value="${c}" ${c===I18N.getCurrency()?"selected":""}>${c}</option>`).join("");
    const aiOpts=["auto"].concat(I18N.LANGS).map(c=>`<option value="${c}" ${c===I18N.getAiLang()?"selected":""}>${c==="auto"?"Auto (by market)":c}</option>`).join("");
    return `<header class="topbar">
      <div class="brand"><span class="brand-mark">A</span><span class="brand-name">Atlaz</span><span class="brand-tag" data-i18n="tagline">${I18N.t("tagline")}</span></div>
      <div class="topbar-ctl">
        <label class="sel"><span>${I18N.t("ui_language")}</span><select id="langSel">${langOpts}</select></label>
        <label class="sel"><span>${I18N.t("ai_language")}</span><select id="aiSel">${aiOpts}</select></label>
        <label class="sel"><span>${I18N.t("currency")}</span><select id="ccySel">${ccyOpts}</select></label>
      </div>
    </header>`;
  }
  function nav(){
    return `<nav class="sidenav">${NAV.map(n=>`<button class="nav-item ${Store.route===n.key?"active":""}" data-go="${n.key}">${I18N.t(n.label)}</button>`).join("")}</nav>`;
  }

  /* ---- onboarding (identity-based) ---- */
  function onboarding(){
    return `<div class="onboarding"><div class="ob-card">
      <span class="brand-mark big">A</span>
      <h1>Atlaz</h1><p class="ob-tag">${I18N.t("tagline")}</p>
      <p class="muted">Tell us who you are. Atlaz will run a real trade loop from opportunity → reorder, sedimenting a SKU Passport, Supplier Trust Graph, Trade Loop Ledger and Compliance Memory.</p>
      <div class="ob-identities">
        ${["US TikTok Shop new seller · $3,000","UK Shopify pet brand","DE Amazon kitchen seller","SEA TikTok beauty volume seller"].map((x,i)=>`<button class="ob-id ${i===0?"sel":""}" data-ob-id="${i}">${x}</button>`).join("")}
      </div>
      <button class="btn primary big" id="obStart">Enter Trade Command Center</button>
      <p class="muted small">${I18N.t("mock_notice")}</p>
    </div></div>`;
  }

  function render(){
    const root=$("#app");
    if(!root) return;
    if(!Store.onboarded){ root.innerHTML=onboarding(); wireOnboarding(); return; }
    root.innerHTML=`${header()}<div class="layout">${nav()}<main class="content">${screenFor(Store.route,Store.routeId)}</main></div>`;
    wire();
  }

  /* ---- event wiring ---- */
  function wireOnboarding(){
    document.querySelectorAll("[data-ob-id]").forEach(b=>b.addEventListener("click",()=>{
      document.querySelectorAll("[data-ob-id]").forEach(x=>x.classList.remove("sel")); b.classList.add("sel");
    }));
    const start=$("#obStart"); if(start) start.addEventListener("click",()=>{ Store.onboarded=true; localStorage.setItem("atlaz4_ob","1"); render(); });
  }

  function wire(){
    // language / currency
    const ls=$("#langSel"); if(ls) ls.addEventListener("change",e=>{ I18N.setLang(e.target.value); });
    const as=$("#aiSel"); if(as) as.addEventListener("change",e=>{ I18N.setAiLang(e.target.value); render(); });
    const cs=$("#ccySel"); if(cs) cs.addEventListener("change",e=>{ I18N.setCurrency(e.target.value); render(); });

    // navigation (data-go="route" or "route:id")
    document.querySelectorAll("[data-go]").forEach(el=>el.addEventListener("click",(e)=>{
      e.preventDefault(); const v=el.getAttribute("data-go"); const [r,id]=v.split(":"); Store.setRoute(r,id);
      window.scrollTo(0,0);
    }));

    // deal room tabs
    document.querySelectorAll("[data-drtab]").forEach(b=>b.addEventListener("click",()=>{
      const k=b.getAttribute("data-drtab");
      document.querySelectorAll("[data-drtab]").forEach(x=>x.classList.toggle("active",x===b));
      document.querySelectorAll("[data-drpanel]").forEach(p=>p.classList.toggle("active",p.getAttribute("data-drpanel")===k));
    }));
    // listing tabs
    bindSubTabs("data-listingtab","data-listingpanel");

    // copy JSON
    document.querySelectorAll('[data-act="copy-json"]').forEach(b=>b.addEventListener("click",()=>{
      const pre=b.parentElement.querySelector("pre[data-copy]"); if(!pre) return;
      try{ navigator.clipboard.writeText(pre.textContent); b.textContent=I18N.t("copied"); setTimeout(()=>b.textContent=I18N.t("copy"),1200);}catch(e){}
    }));

    // approve / reject agent actions
    document.querySelectorAll('[data-act="approve"],[data-act="reject"]').forEach(b=>b.addEventListener("click",()=>{
      const ok=b.getAttribute("data-act")==="approve"; const card=b.closest(".agent-card");
      if(card){ card.classList.add(ok?"approved":"rejected"); card.querySelector(".agent-actions").innerHTML=`<span class="muted small">${ok?"Approved (mock) — recorded to ledger.":"Rejected."}</span>`;
        if(ok && typeof TradeLoopLedgerService!=="undefined") TradeLoopLedgerService.record("SKU-approval","human_approved_action",{riskLevel:"Medium",userApprovalRequired:true}); }
    }));
    // high-risk next-action buttons => show approval requirement
    document.querySelectorAll('button[data-risk="High"],button[data-risk="Medium"]').forEach(b=>b.addEventListener("click",(e)=>{
      if(b.hasAttribute("data-go")) return; // nav buttons pass through
      e.preventDefault(); alert(I18N.t("approval_required")+"\n\n"+(b.textContent||"")+"\n\n("+I18N.t("mock_notice")+")");
    }));

    // cash cockpit sliders (live recompute)
    wireCockpit();
  }
  function bindSubTabs(tabAttr,panelAttr){
    document.querySelectorAll(`[${tabAttr}]`).forEach(b=>b.addEventListener("click",()=>{
      const k=b.getAttribute(tabAttr);
      document.querySelectorAll(`[${tabAttr}]`).forEach(x=>x.classList.toggle("active",x===b));
      document.querySelectorAll(`[${panelAttr}]`).forEach(p=>p.classList.toggle("active",p.getAttribute(panelAttr)===k));
    }));
  }
  function wireCockpit(){
    const ck=document.querySelector(".cockpit"); if(!ck) return;
    const oppId=ck.getAttribute("data-opp"); const o=DB.getOpp(oppId);
    const base=Object.assign({},DB.getCashInputs(o));
    function recompute(){
      ck.querySelectorAll("[data-cash]").forEach(inp=>{ base[inp.getAttribute("data-cash")]=parseFloat(inp.value);
        const out=ck.querySelector(`[data-cash-out="${inp.getAttribute("data-cash")}"]`); if(out){ const k=inp.getAttribute("data-cash");
          out.textContent = (k.indexOf("Pct")>=0)?(Math.round(base[k]*1000)/10)+"%":base[k]; } });
      const g=CashEngine.compute(base);
      const outEl=ck.querySelector("[data-cockpit-out]"); if(outEl) outEl.innerHTML=Screens.cashOutputs(g);
    }
    ck.querySelectorAll("[data-cash]").forEach(inp=>inp.addEventListener("input",recompute));
  }

  /* ---- boot ---- */
  function boot(){
    // query-param bypass
    if(params.get("reset")==="1"){ localStorage.removeItem("atlaz4_ob"); Store.onboarded=false; }
    if(params.get("demo")==="1"){ Store.onboarded=true; localStorage.setItem("atlaz4_ob","1"); }
    const lang=params.get("lang"); if(lang) I18N.setLang(lang); else I18N.setLang(I18N.getLang());
    const ccy=params.get("ccy"); if(ccy) I18N.setCurrency(ccy);
    const go=params.get("go"); if(go){ const [r,id]=go.split(":"); Store.route=r; Store.routeId=id||null; Store.onboarded=true; }
    // re-render on i18n change (real-time switching)
    I18N.onChange(()=>render());
    render();
  }

  return { Store, render, boot, screenFor, NAV };
})();
if (typeof document!=="undefined") document.addEventListener("DOMContentLoaded", ()=>App.boot());
if (typeof window!=="undefined") window.App=App;
