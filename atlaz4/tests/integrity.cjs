/* ============================================================================
 * Atlaz v4 · Integrity test harness (CommonJS).
 *
 * The web JS modules attach their public objects to `global` (and `window` /
 * module.exports). Because the parent package.json is "type":"module", a plain
 * require of a .js file returns the pre-assignment object — so we load the files
 * for their SIDE EFFECT (global assignment) and then read from `global`.
 *
 * Run: node integrity.cjs
 * ========================================================================== */
const path = require("path");
const JS = path.join(__dirname, "..", "web", "js");

// Load in dependency order purely for side effects (global.* assignment).
require(path.join(JS, "data.js"));
require(path.join(JS, "i18n.js"));
require(path.join(JS, "ledger.js"));
require(path.join(JS, "ai.js"));

const DB = global.DB;
const I18N = global.I18N;
const TradeAiService = global.TradeAiService;
const TradeToolRegistry = global.TradeToolRegistry;
const CashEngine = global.CashEngine;

let pass = 0, fail = 0;
const fails = [];
function check(name, cond, extra = "") {
  if (cond) { pass++; }
  else { fail++; fails.push(name + (extra ? " :: " + extra : "")); }
}

// ---- B. Data minimums ------------------------------------------------------
check("DB loaded", !!DB);
check(">=18 opportunities", DB.opportunities.length >= 18, "got " + DB.opportunities.length);
check(">=90 suppliers", DB.allSuppliers.length >= 90, "got " + DB.allSuppliers.length);
check(">=5 suppliers per opp", DB.opportunities.every(o => (DB.getSuppliers(o.opportunityId) || []).length >= 5));
check(">=12 Deal Rooms", DB.dealRoomIds.length >= 12, "got " + DB.dealRoomIds.length);
check(">=60 ledger events", DB.ledgerEvents.length >= 60, "got " + DB.ledgerEvents.length);
check(">=12 compliance routes", DB.complianceRoutes.length >= 12, "got " + DB.complianceRoutes.length);
const highRisk = DB.complianceRoutes.filter(c => /high/i.test(c.riskLevel) || c.goNoGo === "no_go_until_certified");
check(">=8 high-risk compliance", highRisk.length >= 8, "got " + highRisk.length);
check(">=12 growth experiments", DB.growthExperiments.length >= 12, "got " + DB.growthExperiments.length);
check(">=8 agent actions", DB.agentActions.length >= 8, "got " + DB.agentActions.length);

// No lorem
const blob = JSON.stringify(DB.opportunities) + JSON.stringify(DB.allSuppliers);
check("no lorem ipsum", !/lorem ipsum/i.test(blob));

// Role spread: every opp has small-test + certified + high-risk
check("supplier role spread present", DB.opportunities.every(o => {
  const recs = (DB.getSuppliers(o.opportunityId) || []).map(s => s.recommend);
  return recs.includes("recommended_test") && recs.includes("recommended_cert") && recs.includes("not_recommended");
}));

// ---- C. AI envelope --------------------------------------------------------
const opp = DB.getOpp("OPP-4001");
check("OPP-4001 exists", !!opp);
const ENV_FIELDS = ["id","type","inputSnapshot","market","platform","confidence","evidence","assumptions","risks","recommendation","nextActions","generatedAssets","humanApprovalRequired","legalDisclaimer","createdAt"];
function has15(env) { return ENV_FIELDS.every(f => Object.prototype.hasOwnProperty.call(env, f)); }

const rep = TradeAiService.generateOpportunityReport(opp);
check("opportunity report has 15 fields", has15(rep), Object.keys(rep).join(","));

const inquiry = TradeAiService.generateInquiryEmail(opp, DB.getSuppliers("OPP-4001")[0]);
check("inquiry has 15 fields", has15(inquiry));
check("inquiry requires approval (high-risk)", inquiry.humanApprovalRequired === true);

// per-platform listing
const tt = TradeAiService.generateListingDraft(opp, "TikTok Shop");
const az = TradeAiService.generateListingDraft(opp, "Amazon");
check("listing per-platform differs", JSON.stringify(tt.generatedAssets) !== JSON.stringify(az.generatedAssets));

// compliance high-risk on a high-risk opp
const hrOpp = DB.opportunities.find(o => o.decision === "HIGH_RISK_REVIEW") || DB.getOpp("OPP-4004");
const comp = TradeAiService.runComplianceRouteCheck(hrOpp, DB.getCompliance(hrOpp));
check("high-risk compliance needs approval", comp.humanApprovalRequired === true);
check("high-risk compliance has disclaimer", /legal advice|consult|professional/i.test(comp.legalDisclaimer));

// growth decision is one of 6
const SIX = ["scale","modify","lower_price","change_market","change_angle","stop"];
const expEnv = TradeAiService.evaluateExperimentResult(opp, DB.growthExperiments[0].metrics);
const decision = (expEnv.generatedAssets && expEnv.generatedAssets.decision) || expEnv.recommendation.split(/\s|—/)[0];
check("growth decision in 6 set", SIX.some(d => (expEnv.recommendation + JSON.stringify(expEnv.generatedAssets)).includes(d)), expEnv.recommendation);

// agent actions need approval
const agents = TradeAiService.proposeAgentActions(opp);
check("agent actions envelope ok", has15(agents));

// ---- Tool registry ---------------------------------------------------------
check("7 tool adapters", (TradeToolRegistry.adapters || []).length >= 7, "got " + (TradeToolRegistry.adapters||[]).length);

// ---- Cash engine: realistic spread ----------------------------------------
const decisions = DB.opportunities.map(o => CashEngine.compute(DB.getCashInputs(o)).recommendation);
const uniq = [...new Set(decisions)];
check("cash decisions are not all the same", uniq.length >= 2, decisions.join(","));
const cash4001 = CashEngine.compute(DB.getCashInputs(DB.getOpp("OPP-4001"))).recommendation;
check("OPP-4001 cash decision = buy", cash4001 === "buy", cash4001);

// ---- D. i18n ---------------------------------------------------------------
check("7 UI languages", I18N.LANGS.length === 7, I18N.LANGS.join(","));
check("Arabic is RTL", (Array.isArray(I18N.RTL) ? I18N.RTL.includes("ar") : I18N.isRTL && (I18N.setLang("ar"), I18N.isRTL())));
check("10 currencies", I18N.currencies().length >= 10, "got " + I18N.currencies().length);
// FX MX$ / R$ parse (the bug we fixed)
check("parsePrice handles MX$", Math.abs(DB.parsePrice("MX$120–MX$220") - (170 * DB.FX_TO_USD["MX$"])) < 5,
  "got " + DB.parsePrice("MX$120–MX$220"));
check("parsePrice handles R$", Math.abs(DB.parsePrice("R$80–R$160") - (120 * DB.FX_TO_USD["R$"])) < 5,
  "got " + DB.parsePrice("R$80–R$160"));
check("parsePrice plain $", Math.abs(DB.parsePrice("$18–$29") - 23.5) < 1, "got " + DB.parsePrice("$18–$29"));

// ---- F. Honesty (no false claims in docs) ----------------------------------
const fs = require("fs");
const docDir = path.join(__dirname, "..", "docs");
const allDocs = fs.readdirSync(docDir).map(f => fs.readFileSync(path.join(docDir, f), "utf8")).join("\n");
check("README states v4 supersedes v3", /v4 supersedes v3/i.test(fs.readFileSync(path.join(__dirname, "..", "README.md"), "utf8")));
check("no 'registered company' false claim", !/is a registered company/i.test(allDocs));
check("ownership belongs to owner", /belong(s)? (exclusively )?to the project owner/i.test(allDocs));

// ---- Report ----------------------------------------------------------------
console.log("\n=== Atlaz v4 Integrity ===");
console.log("PASS:", pass, " FAIL:", fail);
if (fails.length) { console.log("\nFailures:"); fails.forEach(f => console.log("  ✗ " + f)); process.exit(1); }
console.log("ALL INTEGRITY CHECKS PASSED ✓");
