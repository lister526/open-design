/* ============================================================================
 * Atlaz · UI render helpers (the 30-component design system, rendered)
 * Pure string-building; no framework. Global: UI
 * ==========================================================================*/
const UI = (() => {
  const t = (k) => I18N.t(k);
  function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }
  function riskClass(level){ const l=String(level||"").toLowerCase();
    return l.includes("block")?"b-blocked":l.includes("high")?"b-high":l.includes("med")?"b-medium":"b-low"; }

  // badges
  function RiskBadge(level){ return `<span class="badge ${riskClass(level)}"><span class="dot"></span>${esc(level||"Low")}</span>`; }
  function ComplianceBadge(level){ return `<span class="badge b-comp"><span class="dot"></span>${esc(level)}</span>`; }
  function MarginBadge(rate){ return `<span class="badge b-margin">${Math.round((rate||0)*100)}% margin</span>`; }
  function CashBadge(score){ const cls=score>=70?"b-margin":score>=50?"b-medium":"b-high"; return `<span class="badge ${cls}">CCS ${score}</span>`; }
  function SupplierScoreBadge(score){ return `<span class="badge b-trust">Trust ${Math.round(score*100)}</span>`; }
  function pill(txt){ return `<span class="pill">${esc(txt)}</span>`; }
  function chips(arr){ return `<div class="chips">${(arr||[]).map(x=>`<span class="chip">${esc(x)}</span>`).join("")}</div>`; }

  // buttons
  function PrimaryButton(label,action,arg){ return `<button class="btn btn-primary" data-act="${action}" data-arg="${esc(arg||"")}">${esc(label)}</button>`; }
  function SecondaryButton(label,action,arg){ return `<button class="btn btn-secondary" data-act="${action}" data-arg="${esc(arg||"")}">${esc(label)}</button>`; }
  function GhostButton(label,action,arg){ return `<button class="btn btn-ghost" data-act="${action}" data-arg="${esc(arg||"")}">${esc(label)}</button>`; }
  function DestructiveButton(label,action,arg){ return `<button class="btn btn-destructive" data-act="${action}" data-arg="${esc(arg||"")}">${esc(label)}</button>`; }

  function kv(k,v){ return `<div class="kv"><span class="k">${esc(k)}</span><span class="v">${v==null?"—":esc(v)}</span></div>`; }
  function kvHtml(k,html){ return `<div class="kv"><span class="k">${esc(k)}</span><span class="v">${html}</span></div>`; }
  function tile(n,l){ return `<div class="tile"><div class="n">${esc(n)}</div><div class="l">${esc(l)}</div></div>`; }
  function tiles(arr){ return `<div class="metric-row">${arr.map(a=>tile(a[0],a[1])).join("")}</div>`; }
  function field(k, arr){ if(!arr||!arr.length) return ""; return `<div class="section-label">${esc(k)}</div>${chips(arr)}`; }

  // state views
  function LoadingView(msg){ return `<div class="state loading"><div class="spinner"></div><div class="ttl">${esc(msg||t("st_loading"))}</div></div>`; }
  function EmptyStateView(msg){ return `<div class="state empty"><div class="ic">📭</div><div class="ttl">${esc(msg||t("st_empty"))}</div></div>`; }
  function ErrorStateView(msg,retryAct){ return `<div class="state error"><div class="ic">⚠️</div><div class="ttl">${esc(t("st_error"))}</div><div class="ds">${esc(msg||"")}</div>${retryAct?`<button class="btn btn-secondary small" data-act="${retryAct}">${esc(t("st_retry"))}</button>`:""}</div>`; }
  function BlockedRiskView(reasons){ return `<div class="state blocked"><div class="ic">⛔</div><div class="ttl">${esc(t("st_blocked"))}</div><div class="ds">${esc((reasons||[]).join(" · "))}</div></div>`; }
  function StateView(kind,msg){ const m={offline:["📡",t("st_offline")],perm:["🔒",t("st_perm")],review:["👤",t("st_review")],api:["🔌",t("st_api_reserved")],verify:["🕓",t("st_verify_pending")],approval:["✅",t("st_approval")]}[kind]||["ℹ️",msg||""];
    return `<div class="state empty"><div class="ic">${m[0]}</div><div class="ttl">${esc(m[1])}</div><div class="ds">${esc(msg||"")}</div></div>`; }

  // JSON preview panel (collapsible)
  let jsonId=0;
  function JsonPreviewPanel(obj){
    const id="json"+(++jsonId);
    const text = typeof obj==="string"?obj:JSON.stringify(obj,null,2);
    return `<button class="btn btn-ghost small" data-toggle="${id}">${t("view_json")}</button>
      <pre class="json-panel" id="${id}" style="display:none">${esc(text)}</pre>`;
  }

  // AiGeneratedBlock — renders an AI envelope with all mandated fields visible
  function AiGeneratedBlock(env, title){
    if(!env) return "";
    const ua = (env.userActionRequired||[]).map(x=>`<li>${esc(x)}</li>`).join("");
    const sa = (env.suggestedAgentActions||[]).map(x=>pill(x)).join(" ");
    const assum = (env.assumptions||[]).map(x=>`<li>${esc(x)}</li>`).join("");
    return `<div class="ai-block">
      <div class="ai-head"><span class="icon">AI</span><span class="ttl">${esc(title||env.sourceType)}</span>${RiskBadge(env.riskLevel)}</div>
      <div class="ai-body">
        <div class="kv"><span class="k">${t("f_confidence")}</span><span class="v">${Math.round((env.confidenceScore||0)*100)}%</span></div>
        ${env.nextStep?`<div class="kv"><span class="k">${t("r_next")}</span><span class="v">${esc(env.nextStep)}</span></div>`:""}
        ${assum?`<div class="section-label">Assumptions</div><ul class="assump-list">${assum}</ul>`:""}
        ${ua?`<div class="section-label">${t("aa_requires")}</div><ul class="assump-list">${ua}</ul>`:""}
        ${sa?`<div class="section-label">${t("r_actions")}</div><div class="chips">${sa}</div>`:""}
        ${JsonPreviewPanel({schemaVersion:env.schemaVersion,sourceType:env.sourceType,skuPassportId:env.skuPassportId,generatedAt:env.generatedAt,confidenceScore:env.confidenceScore,riskLevel:env.riskLevel,nextStep:env.nextStep,auditLogPreview:env.auditLogPreview,payload:env.payload})}
      </div>
      <div class="ai-foot">${esc(env.disclaimer)}</div>
    </div>`;
  }

  // ProgressTimeline / LedgerTimeline
  function ProgressTimeline(steps){
    return `<div class="timeline">${steps.map((s,i)=>{
      const cls = s.done?(steps[i+1]&&steps[i+1].done?"done":"current"):"";
      return `<div class="tl-step ${cls}"><div class="tl-dot"></div><div class="tl-body"><div class="tl-name">${esc(s.name)}</div>${s.meta?`<div class="tl-meta">${esc(s.meta)}</div>`:""}</div></div>`;
    }).join("")}</div>`;
  }
  function LedgerTimeline(events){
    if(!events||!events.length) return EmptyStateView();
    return events.map(e=>`<div class="ledger-ev">
      <div class="t">${esc(e.eventType)} <span class="actor ${e.actorType}">${esc(e.actorType)}</span></div>
      <div class="m">${esc(new Date(e.timestamp).toLocaleString())} · ${esc(e.source)} · ${t("le_next")}: ${esc(e.nextAction)}${e.userApprovalRequired?` · <span class="badge b-medium">approval</span>`:""}</div>
    </div>`).join("");
  }

  // AgentActionCard + HumanApprovalSheet
  function AgentActionCard(a){
    return `<div class="action-card">
      <div class="h"><span class="t">${esc(a.title)}</span>${RiskBadge(a.riskLevel)}</div>
      <div class="meta" style="margin:6px 0">${esc(a.description)}</div>
      <div class="kv"><span class="k">${t("aa_confidence")}</span><span class="v">${Math.round((a.confidenceScore||0)*100)}%</span></div>
      <div class="kv"><span class="k">${t("aa_irreversible")}</span><span class="v">${a.irreversible?"Yes":"No"}</span></div>
      <div class="kv"><span class="k">${t("aa_external")}</span><span class="v">${a.externalApiRequired?"Reserved":"None"}</span></div>
      <div class="btn-row">
        ${a.requiresUserApproval?PrimaryButton(t("approve"),"approve_action",a.actionId):SecondaryButton(t("open"),"noop","")}
        ${a.requiresUserApproval?GhostButton(t("reject"),"reject_action",a.actionId):""}
      </div>
    </div>`;
  }
  function HumanApprovalSheet(a){
    return `<div class="sheet-backdrop" data-act="close_sheet"><div class="sheet" onclick="event.stopPropagation()">
      <div class="grip"></div>
      <h3>${t("aa_title")}</h3>
      <div class="meta" style="margin-bottom:10px">${esc(a.title)} — ${esc(a.actionType)}</div>
      ${kv(t("aa_risk"),a.riskLevel)}
      ${kv(t("aa_confidence"),Math.round((a.confidenceScore||0)*100)+"%")}
      ${kv(t("aa_irreversible"),a.irreversible?"Yes":"No")}
      ${kv(t("aa_external"),a.externalApiRequired?"Reserved (mock)":"None")}
      ${kv(t("aa_rollback"),a.rollbackOption)}
      <div class="section-label">${t("aa_audit")}</div>
      <pre class="json-panel" style="display:block">${esc(a.auditLogPreview)}</pre>
      <div class="disclaimer">${esc(a.disclaimer)}</div>
      <div class="btn-row">${PrimaryButton(t("approve"),"approve_action",a.actionId)}${DestructiveButton(t("reject"),"reject_action",a.actionId)}</div>
    </div></div>`;
  }

  function TrustRing(score){ const p=Math.round(score*100); return `<div class="trust-ring" style="--p:${p}"><span>${p}</span></div>`; }

  function SkuPassportHeader(p){
    return `<div class="hero"><div class="tag">SKU PASSPORT</div><h2>${esc(p.productConcept)}</h2>
      <p>${esc(p.skuPassportId)} · ${esc(p.targetMarket)} · ${esc(p.targetPlatform)}</p>
      <div class="stats">
        <div class="stat"><div class="n">${(p.supplierCandidates||[]).length}</div><div class="l">candidates</div></div>
        <div class="stat"><div class="n">${Math.round((p.supplierTrustSnapshot&&p.supplierTrustSnapshot.trustScore||0)*100)}</div><div class="l">trust</div></div>
        <div class="stat"><div class="n">${esc((p.riskSummary&&p.riskSummary.complianceRisk)||"Low")}</div><div class="l">risk</div></div>
      </div></div>`;
  }

  return { esc, riskClass, RiskBadge, ComplianceBadge, MarginBadge, CashBadge, SupplierScoreBadge, pill, chips,
    PrimaryButton, SecondaryButton, GhostButton, DestructiveButton, kv, kvHtml, tile, tiles, field,
    LoadingView, EmptyStateView, ErrorStateView, BlockedRiskView, StateView, JsonPreviewPanel,
    AiGeneratedBlock, ProgressTimeline, LedgerTimeline, AgentActionCard, HumanApprovalSheet, TrustRing, SkuPassportHeader };
})();
if (typeof window !== "undefined") window.UI = UI;
