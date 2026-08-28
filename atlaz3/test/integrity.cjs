#!/usr/bin/env node
/* Atlaz v3 integrity harness. Loads web JS in browser-like global scope with a DOM shim,
 * then asserts all acceptance criteria (data counts, 17 AI methods, 15 tools, 13-envelope
 * fields, 6 moat objects, decision space, i18n, ledger). */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

let PASS = 0, FAIL = 0;
const fails = [];
function ok(cond, msg) { if (cond) { PASS++; } else { FAIL++; fails.push(msg); } }
function eq(a, b, msg) { ok(a === b, `${msg} (got ${a}, want ${b})`); }
function gte(a, b, msg) { ok(a >= b, `${msg} (got ${a}, want >= ${b})`); }

// ---- DOM shim ----
function makeEl() {
  const el = {
    children: [], style: {}, dataset: {}, attrs: {}, _html: "",
    classList: { _s: new Set(), add(c){this._s.add(c);}, remove(c){this._s.delete(c);}, contains(c){return this._s.has(c);}, toggle(c){this._s.has(c)?this._s.delete(c):this._s.add(c);} },
    setAttribute(k,v){this.attrs[k]=v;}, getAttribute(k){return this.attrs[k]??null;}, removeAttribute(k){delete this.attrs[k];},
    appendChild(c){this.children.push(c); return c;}, addEventListener(){}, removeEventListener(){},
    querySelector(){return null;}, querySelectorAll(){return [];},
    focus(){}, blur(){}, click(){}, scrollTo(){}, remove(){},
    get innerHTML(){return this._html;}, set innerHTML(v){this._html=String(v);},
    get textContent(){return this._html;}, set textContent(v){this._html=String(v);},
  };
  return el;
}
const docEl = makeEl();
const body = makeEl();
const appEl = makeEl(); appEl.id = "app";
const document = {
  documentElement: docEl, body,
  createElement: () => makeEl(),
  getElementById: (id) => (id === "app" ? appEl : makeEl()),
  querySelector: (s) => (s === "#app" ? appEl : null),
  querySelectorAll: () => [],
  addEventListener(){}, head: makeEl(),
};
const localStore = {};
const localStorage = {
  getItem: (k) => (k in localStore ? localStore[k] : null),
  setItem: (k, v) => { localStore[k] = String(v); },
  removeItem: (k) => { delete localStore[k]; },
};
const location = { search: "", href: "http://localhost/", hash: "" };
const sandbox = {
  console, Date, Math, JSON, Object, Array, String, Number, Boolean, RegExp, Map, Set, Symbol,
  parseInt, parseFloat, isNaN, isFinite, encodeURIComponent, decodeURIComponent,
  setTimeout: (fn) => { try { fn(); } catch(e){} return 0; }, clearTimeout: () => {},
  document, localStorage, location,
  navigator: { language: "en-US" },
  URLSearchParams,
};
sandbox.window = sandbox;
vm.createContext(sandbox);

const jsDir = path.join(__dirname, "..", "web", "js");
const order = ["i18n", "data", "ledger", "ai", "components", "screens", "app"];
for (const f of order) {
  const code = fs.readFileSync(path.join(jsDir, f + ".js"), "utf8");
  try { vm.runInContext(code, sandbox, { filename: f + ".js" }); }
  catch (e) { FAIL++; fails.push(`LOAD ${f}.js: ${e.message}`); }
}

const { I18N, DB, TradeAiService, TradeToolRegistry, AiGenerationLog, TradeLoopLedgerService, UI, Screens } = sandbox;

console.log("\n=== ATLAZ v3 INTEGRITY HARNESS ===\n");

// ---- Globals present ----
["I18N","DB","TradeAiService","TradeToolRegistry","AiGenerationLog","TradeLoopLedgerService","UI","Screens","Store","Nav","App"]
  .forEach(g => ok(typeof sandbox[g] !== "undefined", `global ${g} present`));

// ---- i18n: 6 langs, 5 currencies, fallback, aiOutputLangFor ----
gte(I18N.LANGS.length, 6, "i18n LANGS >= 6");
gte(Object.keys(I18N.CURRENCIES).length, 5, "i18n CURRENCIES >= 5");
["en","zh","ja","es","fr","de"].forEach(l => ok(I18N.LANGS.some(x => x.code === l), `lang ${l} present`));
ok(typeof I18N.t("brand_tagline") === "string" && I18N.t("brand_tagline").length > 0, "t() returns string");
I18N.setLang("de");
ok(I18N.t("xx_nonexistent_key_zzz") === "xx_nonexistent_key_zzz", "t() falls back to key");
ok(/Deutsch|German|de/i.test(I18N.aiOutputLangFor("Germany")) || I18N.aiOutputLangFor("Germany").length>0, "aiOutputLangFor(Germany)");
ok(I18N.aiOutputLangFor("Japan").length > 0, "aiOutputLangFor(Japan)");
I18N.setLang("en");
ok(typeof I18N.fmtMoney(100, "JPY") === "string", "fmtMoney JPY");
ok(I18N.fmtMoney(100, "JPY").indexOf(".") === -1, "fmtMoney JPY no decimals");

// ---- Data counts (mock minimums) ----
gte(DB.opportunities.length, 12, "opportunities >= 12");
DB.opportunities.forEach(o => gte(Object.keys(o).length, 23, `opp ${o.id} has >=23 fields`));
gte(DB.allSuppliers.length, 60, "suppliers >= 60");
DB.allSuppliers.slice(0,3).forEach(s => gte(Object.keys(s).length, 28, `supplier ${s.id||s.supplierId} >=28 fields`));
gte(DB.skuPassports.length, 12, "skuPassports >= 12");
DB.skuPassports.slice(0,2).forEach(p => gte(Object.keys(p).length, 24, "passport >=24 fields"));
gte(DB.listingDrafts.length, 8, "listingDrafts >= 8");
gte(DB.tradeOrders.length, 8, "tradeOrders >= 8");
gte(DB.cashConversionScores.length, 8, "cashConversionScores >= 8");
gte(DB.growthExperiments.length, 8, "growthExperiments >= 8");
gte(DB.supplierRatings.length, 20, "supplierRatings >= 20");
gte(DB.ledgerEvents.length, 50, "ledgerEvents >= 50");
gte(DB.supplierTrustSignals.length, 20, "supplierTrustSignals >= 20");
gte(DB.agentActions.length, 12, "agentActions >= 12");
gte(DB.marketPersonas.length, 6, "marketPersonas >= 6");
gte(DB.plans.length, 3, "plans >= 3");
gte(DB.documentTemplates.length, 8, "documentTemplates >= 8");
gte(DB.sampleInspections.length, 8, "sampleInspections >= 8");
gte(DB.marketDemandSignals.length, 12, "marketDemandSignals >= 12");
gte(DB.REGIONS.length, 10, "REGIONS >= 10");
gte(DB.CERTS.length, 12, "CERTS >= 12");
gte(DB.revenueStreams.length, 12, "revenueStreams >= 12");
// suppliers per opp
DB.opportunities.forEach(o => eq(DB.getSuppliers(o.opportunityId).length, 5, `5 suppliers for ${o.opportunityId}`));

// ---- 17 AI methods present + callable ----
const methods = ["generateOpportunityReport","createSkuPassport","recommendSuppliers","generateSupplierTrustSummary",
  "generateInquiryEmail","generateWechatScript","generateSampleBrief","generateQuotationComparison","generateListingDraft",
  "runComplianceRouteCheck","generateTradeDocument","calculateCashConversionScore","createTradeLoopLedgerEvent",
  "generateGrowthPlaybook","evaluateExperimentResult","proposeAgentActions","exportSkuPassportJson"];
methods.forEach(m => ok(typeof TradeAiService[m] === "function", `AI method ${m}()`));
eq(methods.filter(m=>typeof TradeAiService[m]==="function").length, 17, "exactly 17 AI methods present");

// ---- 13-field envelope ----
const ENVELOPE = ["schemaVersion","generatedAt","sourceType","skuPassportId","confidenceScore","riskLevel",
  "assumptions","userActionRequired","suggestedAgentActions","nextStep","disclaimer","auditLogPreview","rawJsonPreview"];
const opp = DB.opportunities[0];
const env = TradeAiService.generateOpportunityReport(opp);
ENVELOPE.forEach(f => ok(f in env, `envelope field ${f}`));

// ---- 15 tools w/ 7 metadata fields ----
const tools = ["supplierDatabaseTool","supplierTrustGraphTool","complianceDatabaseTool","complianceRouteTool",
  "logisticsRateTool","currencyRateTool","paymentTool","inspectionTool","certificationVerificationTool",
  "adPlatformTool","ecommerceListingTool","financeEligibilityTool","customsDutyTool","documentExportTool","tradeLedgerTool"];
tools.forEach(tn => {
  const tl = TradeToolRegistry[tn];
  ok(tl && tl.name === tn, `tool ${tn} present`);
  if (tl) ["connectedMock","reservedProductionApi","requiredCredentials","riskLevel","userApprovalRequired","dataStored","futureProviderExamples"]
    .forEach(mf => ok(mf in tl, `tool ${tn}.${mf}`));
});
ok(typeof TradeToolRegistry.list === "function" && TradeToolRegistry.list().length >= 15, "TradeToolRegistry.list() >= 15");

// ---- Cash conversion: 18 inputs -> 20 outputs, decision space ----
const ci = DB.getCashInputs(opp);
gte(Object.keys(ci).length, 18, "cash inputs >= 18");
const cc = DB.calcCash(ci);
gte(Object.keys(cc).length, 20, "cash outputs >= 20");
ok(["buy","negotiate","test_smaller","stop"].includes(cc.decision), `cash decision in space (${cc.decision})`);
// drive cash decision space by varying inputs
const cashDecisions = new Set();
DB.opportunities.forEach(o => { const inp = DB.getCashInputs(o); cashDecisions.add(DB.calcCash(inp).decision); });
gte(cashDecisions.size, 2, "cash decision space >= 2 distinct across opps");

// ---- evaluateExperimentResult decision space (takes a growth object) ----
const decisions = new Set();
[
  {refundRate:0.2,  ROAS:0.5, conversionRate:0.02,  CAC:5},   // stop
  {refundRate:0.02, ROAS:3.5, conversionRate:0.05,  CAC:5},   // reorder
  {refundRate:0.02, ROAS:2,   conversionRate:0.02,  CAC:20},  // lower_price
  {refundRate:0.02, ROAS:2,   conversionRate:0.01,  CAC:5},   // switch_market
  {refundRate:0.02, ROAS:2,   conversionRate:0.02,  CAC:5},   // iterate_product
].forEach((metrics) => {
  const g = Object.assign({}, DB.growthExperiments[0], { metrics });
  const e = TradeAiService.evaluateExperimentResult(g);
  decisions.add((e.payload && e.payload.decision) || e.decision);
});
gte(decisions.size, 4, "experiment decision space >= 4 distinct");

// ---- 6 moat objects exist as data ----
ok(DB.skuPassports.length>0, "MOAT SkuPassport");
ok(DB.ledgerEvents.length>0, "MOAT TradeLoopLedgerEvent");
ok(DB.supplierTrustSignals.length>0, "MOAT SupplierTrustSignal");
ok(DB.complianceRoutesFor || DB.getCompliance, "MOAT ComplianceRoute");
ok(DB.cashConversionScores.length>0, "MOAT CashConversionScore");
ok(DB.agentActions.length>0, "MOAT AgentAction");

// ---- Ledger service: seed + append + notify ----
const before = TradeLoopLedgerService.all().length;
gte(before, 50, "ledger seeded >= 50");
let notified = false;
TradeLoopLedgerService.onRecord(() => { notified = true; });
const ev = TradeLoopLedgerService.record(DB.skuPassports[0].skuPassportId, "rfq_generated", {});
ok(TradeLoopLedgerService.all().length === before + 1, "ledger append +1");
ok(notified, "ledger notifies listeners");
gte(Object.keys(ev).length, 12, "ledger event >= 12 fields");

// ---- Screens: 28 renderers return {html} ----
const screenFns = Object.keys(Screens).filter(k => typeof Screens[k] === "function");
gte(screenFns.length, 28, "Screens has >= 28 functions");
// smoke render a representative set
const smoke = [
  ["commandCenter"], ["radarList"], ["opportunity", opp.opportunityId], ["passport", DB.skuPassports[0].skuPassportId],
  ["suppliersTab"], ["compliance", opp.opportunityId], ["cashflowTab"], ["growthTab"], ["pricing"], ["about"], ["mockApi"], ["settings"], ["states"],
];
smoke.forEach(([fn, arg]) => {
  try { const r = Screens[fn](arg); ok(r && typeof r.html === "string" && r.html.length > 0, `screen ${fn} renders html`); }
  catch (e) { FAIL++; fails.push(`screen ${fn} threw: ${e.message}`); }
});

// ---- AiGenerationLog populated ----
gte(AiGenerationLog.length, 1, "AiGenerationLog populated after calls");

// ---- Report ----
console.log("\n" + (fails.length ? "FAILURES:\n - " + fails.join("\n - ") + "\n" : "No failures.\n"));
console.log(`RESULT: ${PASS} passed, ${FAIL} failed (${PASS}/${PASS+FAIL})`);
process.exit(FAIL ? 1 : 0);
