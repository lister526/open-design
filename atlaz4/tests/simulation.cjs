/* ============================================================================
 * Atlaz v4 · MUST-PASS simulation.
 *
 * The story: a US TikTok Shop new seller, $3,000 budget, home cleaning product.
 * If this does not run end-to-end, the product has failed.
 *
 * Run: node simulation.cjs
 * ========================================================================== */
const path = require("path");
const JS = path.join(__dirname, "..", "web", "js");
require(path.join(JS, "data.js"));
require(path.join(JS, "i18n.js"));
require(path.join(JS, "ledger.js"));
require(path.join(JS, "ai.js"));

const DB = global.DB;
const AI = global.TradeAiService;
const CashEngine = global.CashEngine;
const Ledger = global.TradeLoopLedgerService || global.LedgerService || null;

let step = 0, fail = 0;
const log = [];
function ok(name, cond, detail = "") {
  step++;
  const mark = cond ? "✓" : "✗";
  if (!cond) fail++;
  log.push(`  ${mark} Step ${step}: ${name}${detail ? "  →  " + detail : ""}`);
}

console.log("\n=== Atlaz v4 · Must-Pass Story: US TikTok Shop, $3,000, home cleaning ===\n");

// 1) Identity + 3 recommendations in US/TikTok/home-cleaning context.
const candidates = DB.opportunities.filter(o =>
  /united states|us/i.test(o.targetRegion) && /tiktok/i.test(o.platform));
ok("US TikTok opportunities exist", candidates.length >= 1, candidates.length + " found");

// The home cleaning opportunity is OPP-4001 (the seed scenario).
const homeOpp = DB.getOpp("OPP-4001");
ok("Home-cleaning opportunity present", !!homeOpp && /clean/i.test(homeOpp.category + homeOpp.productConcept), homeOpp && homeOpp.productConcept);

// "3 recommendations" — radar surfaces >=3 recommended opportunities to choose from.
const recommended = DB.opportunities.filter(o => o.decision === "recommended");
ok("At least 3 recommendations to choose from", recommended.length >= 3, recommended.length + " recommended");

// 2) Pick one → SKU Passport / Deal Room opens.
const room = DB.dealRoom("OPP-4001");
ok("Deal Room opens for chosen SKU", !!room && !!room.opportunity);
const passport = AI.createSkuPassport(homeOpp);
ok("SKU Passport created (15-field envelope)", passport && /sku_passport/.test(passport.type), passport && passport.type);

// 3) 5 suppliers incl small-test / certified / high-risk.
const suppliers = DB.getSuppliers("OPP-4001");
ok("5 suppliers in shortlist", suppliers.length >= 5, suppliers.length + " suppliers");
const recs = suppliers.map(s => s.recommend);
ok("Small-test supplier present", recs.includes("recommended_test"));
ok("Certified supplier present", recs.includes("recommended_cert"));
ok("High-risk supplier present (reference only)", recs.includes("not_recommended"));

// 4) Inquiry email + IM script + sample brief + quote comparison.
const lead = suppliers.find(s => s.recommend === "recommended_test") || suppliers[0];
const inquiry = AI.generateInquiryEmail(homeOpp, lead);
ok("Inquiry email generated", inquiry && inquiry.type === "inquiry_email");
ok("Inquiry is approval-gated (high-risk)", inquiry.humanApprovalRequired === true);
const script = AI.generateWechatScript(homeOpp, lead);
ok("IM negotiation script generated", !!script && script.type === "wechat_script");
const sample = AI.generateSampleBrief(homeOpp, lead);
ok("Sample brief generated", !!sample);
const quotes = AI.generateQuotationComparison(homeOpp, suppliers);
ok("Quotation comparison generated", !!quotes);

// 5) US/TikTok compliance flags banned words.
const compRoute = DB.getCompliance(homeOpp);
const comp = AI.runComplianceRouteCheck(homeOpp, compRoute);
ok("Compliance route check produced", !!comp && comp.type === "compliance_route");
const banned = (comp.generatedAssets && comp.generatedAssets.bannedKeywords) || [];
const bannedStr = Array.isArray(banned) ? banned.join(" | ") : String(banned);
ok("Banned/restricted words flagged", banned.length >= 1, bannedStr.slice(0, 70));

// 6) Cash check → buy, or test_smaller (~100 units) if dangerous.
const cashOK = CashEngine.compute(DB.getCashInputs(homeOpp));
ok("Cash conversion computed", !!cashOK && !!cashOK.recommendation, "decision=" + cashOK.recommendation);
ok("Cash decision is one of buy/negotiate/test_smaller/stop",
  ["buy","negotiate","test_smaller","stop"].includes(cashOK.recommendation), cashOK.recommendation);
// Demonstrate the protective behavior on a dangerous SKU.
const danger = DB.opportunities.find(o => /high/i.test(o.cashCycleRisk));
if (danger) {
  const cd = CashEngine.compute(DB.getCashInputs(danger));
  ok("Dangerous-cash SKU → test_smaller (protect $3,000)",
    cd.recommendation === "test_smaller" || cd.recommendation === "negotiate" || cd.recommendation === "stop",
    danger.opportunityId + " → " + cd.recommendation);
}

// 7) TikTok description + video script + creator brief.
const listing = AI.generateListingDraft(homeOpp, "TikTok Shop");
const ps = (listing.generatedAssets && listing.generatedAssets.platformSpecific) || {};
ok("TikTok video script generated", Array.isArray(ps.videoScript) && ps.videoScript.length >= 1, (ps.videoScript || [])[0]);
ok("Creator brief generated", !!ps.creatorBrief);
ok("Description/caption generated", !!ps.shortDescription || !!(listing.generatedAssets.common));

// 8) Mock sample/PO order.
const doc = AI.generateTradeDocument(homeOpp, "Proforma Invoice", lead);
ok("Mock trade document (PI/PO) generated", !!doc);

// 9) 7-day test data.
const exp = DB.growthExperiments.find(g => g.opportunityId === "OPP-4001");
ok("7-day test data present", !!exp && exp.windowDays === 7 && !!exp.metrics, exp && ("orders=" + exp.metrics.orders));

// 10) AI decides reorder/modify/lower-price/change-market/change-angle/stop + Decision Memo.
const evalEnv = AI.evaluateExperimentResult(homeOpp, exp.metrics);
const SIX = ["scale","reorder","modify","lower_price","change_market","change_angle","stop"];
const decided = (evalEnv.generatedAssets && evalEnv.generatedAssets.decision) || SIX.find(d => evalEnv.recommendation.includes(d));
ok("AI returns one of the 6 decisions", SIX.includes(decided), "decision=" + decided);
const hasMemo = (evalEnv.generatedAssets && !!evalEnv.generatedAssets.decisionMemo) ||
  (evalEnv.nextActions || []).some(n => /memo/i.test(n.action + n.label));
ok("Decision Memo produced", hasMemo,
  (evalEnv.nextActions || []).map(n => n.action).join(","));

// Ledger sediments the loop.
const sku = "SKU-4001";
const events = DB.ledgerEvents.filter(e => e.skuPassportId === sku || (e.skuPassportId || "").includes("4001"));
ok("Trade Loop Ledger has events for this SKU", events.length >= 1, events.length + " events");

console.log(log.join("\n"));
console.log("\n--------------------------------------------------");
if (fail === 0) {
  console.log(`MUST-PASS STORY: ALL ${step} STEPS PASSED ✓  (decision=${decided}, cash=${cashOK.recommendation})`);
} else {
  console.log(`MUST-PASS STORY FAILED: ${fail}/${step} steps failed ✗`);
  process.exit(1);
}
