/* ============================================================================
 * Atlaz v4 · UI render helpers (UI)
 * Pure functions returning HTML strings. Every AI result renders as a
 * structured work-order (why / evidence / risk / next action / copyable file).
 * Includes all 6 states: loading, empty, error, risk-blocked, permission-denied,
 * human-approval-required.
 * Global: UI
 * ==========================================================================*/
const UI = (() => {
  const t = (k)=> (typeof I18N!=="undefined"?I18N.t(k):k);
  const money = (usd)=> (typeof I18N!=="undefined"?I18N.fmtMoney(usd):"$"+usd);
  const esc = (s)=> String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");

  /* ---- badges ---- */
  function riskClass(level){ const l=(level||"").toLowerCase();
    return l.indexOf("high")>=0?"risk-high":l.indexOf("medium")>=0?"risk-med":l.indexOf("caution")>=0?"risk-high":"risk-low"; }
  function RiskBadge(level){ return `<span class="badge ${riskClass(level)}">${esc(level)}</span>`; }
  function Badge(text,cls){ return `<span class="badge ${cls||""}">${esc(text)}</span>`; }
  function TrustTier(tier){ const c=(tier||"").indexOf("A")===0?"tier-a":(tier||"").indexOf("B")===0?"tier-b":(tier||"").indexOf("C")===0?"tier-c":"tier-d"; return `<span class="badge ${c}">${esc(tier)}</span>`; }
  function GoBadge(go){ const c=go==="go"?"risk-low":go==="go_with_conditions"?"risk-med":"risk-high"; const txt=go==="go"?t("comp_go"):go==="go_with_conditions"?t("comp_go_cond"):t("comp_nogo"); return `<span class="badge ${c}">${esc(txt)}</span>`; }

  /* ---- key/value ---- */
  function kv(label,value){ return `<div class="kv"><span class="kv-k">${esc(label)}</span><span class="kv-v">${value}</span></div>`; }
  function stat(label,value,sub){ return `<div class="stat"><div class="stat-v">${value}</div><div class="stat-k">${esc(label)}</div>${sub?`<div class="stat-sub">${esc(sub)}</div>`:""}</div>`; }

  /* ---- buttons ---- */
  function btn(label,action,opts){ opts=opts||{}; const risk=opts.risk?` data-risk="${esc(opts.risk)}"`:"";
    return `<button class="btn ${opts.variant||""}"${opts.go?` data-go="${esc(opts.go)}"`:""}${opts.act?` data-act="${esc(opts.act)}"`:""}${risk}${opts.id?` data-id="${esc(opts.id)}"`:""}>${esc(label)}</button>`; }
  function nbaBar(label,buttons){ return `<div class="nba"><span class="nba-label">${esc(label)}</span><div class="nba-actions">${buttons.join("")}</div></div>`; }

  /* =======================================================================
   * THE 6 STATES
   * ===================================================================== */
  function LoadingView(msg){ return `<div class="state state-loading"><div class="spinner"></div><p>${esc(msg||t("loading"))}</p></div>`; }
  function EmptyStateView(msg,cta){ return `<div class="state state-empty"><div class="state-ico">∅</div><p>${esc(msg||t("empty"))}</p>${cta||""}</div>`; }
  function ErrorStateView(msg){ return `<div class="state state-error"><div class="state-ico">!</div><p>${esc(msg||t("error"))}</p>${btn(t("retry"),null,{variant:"ghost",go:"command"})}</div>`; }
  function BlockedRiskView(msg){ return `<div class="state state-blocked"><div class="state-ico">⛔</div><p class="risk-high-text">${t("blocked_risk")}</p><p>${esc(msg||"")}</p></div>`; }
  function PermissionDeniedView(msg,plan){ return `<div class="state state-denied"><div class="state-ico">🔒</div><p>${t("permission_denied")}</p><p class="muted">${esc(msg||"")}</p>${btn(t("upgrade"),null,{variant:"primary",go:"command"})}${plan?`<p class="muted small">${esc(plan)}</p>`:""}</div>`; }
  function ApprovalRequiredView(action){ return `<div class="state state-approval"><div class="state-ico">✋</div><p>${t("approval_required")}</p><p class="muted">${esc(action&&action.summary||"")}</p></div>`; }

  /* =======================================================================
   * AI WORK-ORDER BLOCK — renders the 15-field envelope as an actionable card,
   * NOT just JSON. Shows why / evidence / assumptions / risk / recommendation /
   * next actions / copyable file, plus collapsible raw JSON work-order.
   * ===================================================================== */
  function AiWorkOrder(env, opts){
    opts = opts || {};
    const confPct = Math.round((env.confidence||0)*100);
    const risks = (env.risks||[]).filter(Boolean);
    const evs = (env.evidence||[]).filter(Boolean);
    const next = (env.nextActions||[]);
    const approval = env.humanApprovalRequired
      ? `<div class="approval-flag">${t("approval_required")}</div>` : "";
    const nextBtns = next.map(a=>btn(a.label||a.action, a.action,{
      variant: a.riskLevel==="High"?"danger":a.riskLevel==="Medium"?"warn":"primary",
      act:a.action, risk:a.riskLevel||"Low", id:env.id })).join("");
    const assetsJson = JSON.stringify(env, null, 2);
    return `<div class="workorder ${env.humanApprovalRequired?"wo-approval":""}">
      <div class="wo-head">
        <span class="wo-type">${esc(env.type)}</span>
        <span class="wo-conf" title="${t("confidence")}">${t("confidence")}: ${confPct}%</span>
        ${env.market!=="—"?`<span class="wo-meta">${esc(env.market)} · ${esc(env.platform)}</span>`:""}
      </div>
      ${approval}
      ${env.recommendation?`<div class="wo-rec"><strong>${t("next_best_action")}:</strong> ${esc(env.recommendation)}</div>`:""}
      ${evs.length?`<div class="wo-sec"><h5>${t("evidence")}</h5><ul>${evs.map(e=>`<li>${esc(e)}</li>`).join("")}</ul></div>`:""}
      ${(env.assumptions||[]).length?`<div class="wo-sec"><h5>Assumptions</h5><ul>${env.assumptions.map(a=>`<li>${esc(a)}</li>`).join("")}</ul></div>`:""}
      ${risks.length?`<div class="wo-sec wo-risk"><h5>${t("risks")}</h5><ul>${risks.map(r=>`<li>${esc(r)}</li>`).join("")}</ul></div>`:""}
      ${nextBtns?`<div class="wo-actions"><span class="muted small">${t("next_steps")}</span> ${nextBtns}</div>`:""}
      <details class="wo-json"><summary>${t("json_workorder")} · ${t("copyable")}</summary>
        <pre class="json" data-copy>${esc(assetsJson)}</pre>
        ${btn(t("copy"),null,{variant:"ghost",act:"copy-json"})}
      </details>
      <div class="wo-disclaimer">${esc(env.legalDisclaimer)}</div>
    </div>`;
  }

  /* =======================================================================
   * SUPPLIER TRUST GRAPH — dynamic score bar (not a static card)
   * ===================================================================== */
  function TrustBar(score){ const c=score>=82?"tier-a":score>=70?"tier-b":score>=58?"tier-c":"tier-d";
    return `<div class="trustbar"><div class="trustbar-fill ${c}" style="width:${score}%"></div><span class="trustbar-num">${score}</span></div>`; }
  function trendIcon(trend){ return trend==="improving"?"▲":trend==="declining"?"▼":"▬"; }

  function SupplierCard(s, opts){ opts=opts||{};
    const recCls = s.recommend.indexOf("recommended")===0?"sup-ok":s.recommend==="not_recommended"?"sup-no":"sup-mid";
    return `<div class="sup-card ${recCls}">
      <div class="sup-head"><div><strong>${esc(s.factoryName)}</strong><div class="muted small">${esc(s.factoryRegion)} · ${esc(s.factoryTag)}</div></div>${TrustTier(s.trustTier)}</div>
      ${TrustBar(s.trustScore)}
      <div class="sup-grid">
        ${kv("MOQ",esc(s.moq))}
        ${kv("Unit",money(s.unitPriceUsd))}
        ${kv("On-time",esc(s.onTimeFulfillmentRate))}
        ${kv("Sample lead",esc(s.sampleLeadTimeDays)+"d")}
        ${kv("Cert conf.",esc(s.certificationConfidence)+"/100")}
        ${kv("Trend",trendIcon(s.trustTrend)+" "+esc(s.trustTrend))}
      </div>
      <div class="sup-certs">${(s.certifications||[]).map(c=>Badge(c,"chip")).join("")}</div>
      <div class="sup-reason"><span class="ok">✓ ${esc(s.bestFor)}</span><span class="watch">⚠ ${esc(s.watchOut)}</span></div>
      ${opts.actions||""}
    </div>`;
  }

  /* SUPPLIER WAR ROOM — A/B/C side-by-side compare */
  function WarRoom(suppliers){
    const top = suppliers.slice(0,3);
    const rows=[["Trust","trustScore"],["Tier","trustTier"],["MOQ","moq"],["Unit price","unitPriceUsd"],
      ["On-time","onTimeFulfillmentRate"],["Sample lead","sampleLeadTimeDays"],["Prod lead","productionLeadTimeDays"],
      ["Cert conf.","certificationConfidence"],["Dispute","returnDisputeRate"],["Recommend","recommend"]];
    return `<div class="warroom"><table class="cmp"><thead><tr><th></th>${top.map((s,i)=>`<th>${["A","B","C"][i]}: ${esc(s.factoryName)}</th>`).join("")}</tr></thead><tbody>
      ${rows.map(([label,key])=>`<tr><td class="cmp-k">${label}</td>${top.map(s=>{let v=s[key]; if(key==="unitPriceUsd")v=money(v); if(key==="sampleLeadTimeDays"||key==="productionLeadTimeDays")v=v+"d"; return `<td>${esc(v)}</td>`;}).join("")}</tr>`).join("")}
      <tr><td class="cmp-k">Negotiation</td>${top.map(s=>`<td class="small">${esc(s.recommendedNegotiation)}</td>`).join("")}</tr>
    </tbody></table></div>`;
  }

  /* =======================================================================
   * CASH COCKPIT — live sliders + decision
   * ===================================================================== */
  function slider(id,label,value,min,max,step,suffix){
    return `<label class="slider"><span>${esc(label)}</span>
      <input type="range" data-cash="${id}" min="${min}" max="${max}" step="${step}" value="${value}">
      <output data-cash-out="${id}">${value}${suffix||""}</output></label>`;
  }
  function CashDecisionBadge(rec){ const map={buy:"risk-low",negotiate:"risk-med",test_smaller:"risk-med",stop:"risk-high"};
    const label={buy:t("cash_buy"),negotiate:t("cash_negotiate"),test_smaller:t("cash_test_smaller"),stop:t("cash_stop")}[rec]||rec;
    return `<span class="badge ${map[rec]||""} decision-badge">${esc(label)}</span>`; }

  /* =======================================================================
   * TIMELINES
   * ===================================================================== */
  function StageTimeline(stages,currentIdx){
    return `<div class="timeline">${stages.map((s,i)=>`<div class="tl-step ${i<currentIdx?"done":i===currentIdx?"current":""}"><span class="tl-dot"></span><span class="tl-lbl">${esc(s.replace(/_/g," "))}</span></div>`).join("")}</div>`;
  }
  function LedgerTimeline(events){
    if(!events||!events.length) return EmptyStateView("No ledger events yet.");
    return `<div class="ledger">${events.map(e=>`<div class="ledger-row actor-${e.actorType}">
      <span class="ledger-actor">${e.actorType}</span>
      <span class="ledger-type">${esc(e.eventType.replace(/_/g," "))}</span>
      <span class="ledger-meta">${RiskBadge(e.riskLevel)} ${e.confidenceScore!=null?Math.round(e.confidenceScore*100)+"%":""}</span>
      <span class="ledger-time muted small">${esc((e.timestamp||"").slice(0,10))}</span></div>`).join("")}</div>`;
  }

  /* AGENT ACTION + HUMAN APPROVAL SHEET */
  function AgentActionCard(a){
    return `<div class="agent-card ${a.humanApprovalRequired?"needs-approval":""}">
      <div class="agent-head"><strong>${esc(a.actionType.replace(/_/g," "))}</strong>${RiskBadge(a.riskLevel)}</div>
      <p class="muted small">${esc(a.summary)}</p>
      ${a.reversible===false?`<p class="risk-high-text small">Irreversible — requires explicit approval.</p>`:""}
      <div class="agent-actions">${btn(t("approve"),null,{variant:"primary",act:"approve",id:a.agentActionId})}${btn(t("reject"),null,{variant:"ghost",act:"reject",id:a.agentActionId})}</div>
    </div>`;
  }

  function card(title,body,opts){ opts=opts||{};
    return `<section class="card ${opts.cls||""}">${title?`<div class="card-head"><h3>${esc(title)}</h3>${opts.aside||""}</div>`:""}<div class="card-body">${body}</div></section>`; }

  return { t, money, esc, RiskBadge, Badge, TrustTier, GoBadge, kv, stat, btn, nbaBar,
    LoadingView, EmptyStateView, ErrorStateView, BlockedRiskView, PermissionDeniedView, ApprovalRequiredView,
    AiWorkOrder, TrustBar, SupplierCard, WarRoom, slider, CashDecisionBadge,
    StageTimeline, LedgerTimeline, AgentActionCard, card };
})();
if (typeof window!=="undefined") window.UI=UI;
if (typeof module!=="undefined" && module.exports) module.exports=UI;
if (typeof global!=="undefined") global.UI=UI;
