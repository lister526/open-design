/* ============================================================================
 * Atlaz v4 · TradeLoopLedgerService
 * Append-only record of every key event in a SKU's journey from opportunity
 * to reorder. In-memory for the MVP; structured to persist to SQLDelight.
 * Global: TradeLoopLedgerService
 * ==========================================================================*/
const TradeLoopLedgerService = (() => {
  const DBref = (typeof DB!=="undefined"?DB:(typeof window!=="undefined"?window.DB:(typeof global!=="undefined"?global.DB:null)));
  const events = (DBref && DBref.ledgerEvents ? DBref.ledgerEvents.slice() : []);
  let counter = 9000;
  const listeners = [];

  function record(skuPassportId, eventType, opts = {}) {
    const actorType = opts.actorType ||
      (eventType.startsWith("human") ? "user"
        : /generated|analyzed|matched|calculated|checked|discovered|drafted|scored/.test(eventType) ? "ai"
        : eventType.indexOf("supplier")>=0 ? "supplier" : "system");
    const ev = {
      eventId: `LE-${counter++}`, skuPassportId, eventType,
      timestamp: new Date().toISOString(), actorType,
      source: opts.source || (actorType==="ai"?"TradeAiService":actorType==="user"?"User action":"System"),
      confidenceScore: opts.confidenceScore!=null?opts.confidenceScore:(actorType==="ai"?0.8:1),
      riskLevel: opts.riskLevel || "Low",
      userApprovalRequired: !!opts.userApprovalRequired,
      evidence: opts.evidence || "Runtime event recorded by Atlaz.",
      nextAction: opts.nextAction || "monitor",
      auditNote: opts.auditNote || "Runtime ledger entry.",
    };
    events.push(ev);
    listeners.forEach(fn=>{try{fn(ev);}catch(e){}});
    return ev;
  }
  function forSku(skuPassportId){ return events.filter(e=>e.skuPassportId===skuPassportId); }
  function recent(n=8){ return events.slice(-n).reverse(); }
  function all(){ return events.slice(); }
  function onRecord(fn){ if(typeof fn==="function") listeners.push(fn); }

  return { record, forSku, recent, all, onRecord };
})();
if (typeof window !== "undefined") window.TradeLoopLedgerService = TradeLoopLedgerService;
if (typeof module !== "undefined" && module.exports) module.exports = TradeLoopLedgerService;
if (typeof global !== "undefined") global.TradeLoopLedgerService = TradeLoopLedgerService;
