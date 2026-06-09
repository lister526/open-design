# Atlaz — Agent Action Safety Model

Atlaz's agent **proposes**; the human **approves**. Nothing risky happens silently. This is what
makes it safe to eventually trust the AI with real money and real listings.

## The 15-field AgentAction schema
`actionId, skuPassportId, actionType, title, rationale, inputSummary, proposedOutput, riskLevel,
reversible, requiresHumanApproval, approvalState, toolToInvoke, sideEffects, createdAt, schemaVersion`

## 13 action types
`CREATE_RFQ, REQUEST_SUPPLIER_COUNTERQUOTE, GENERATE_LISTING, BLOCK_HIGH_RISK_CLAIM,
CALCULATE_LANDED_COST, CREATE_SAMPLE_ORDER, REQUEST_INSPECTION, VERIFY_CERTIFICATION,
PLACE_TEST_ORDER, LAUNCH_EXPERIMENT, EVALUATE_REORDER, GENERATE_TRADE_DOCUMENT, EXPORT_SKU_PASSPORT`

## Safety rules
1. **Human approval required** for any action with side effects, money, or external messages.
2. **Risk-tiered:** each action carries a `riskLevel`; high-risk actions get a prominent warning.
3. **Reversibility flagged:** irreversible actions (e.g. `PLACE_TEST_ORDER`) are clearly marked.
4. **Auditable:** every proposal and decision appends a `TradeLoopLedgerEvent` with evidence.
5. **No silent tool calls:** `toolToInvoke` and `sideEffects` are shown before approval.
6. **Approval flow:** a bottom-sheet shows rationale, inputs, proposed output, risk and side
   effects; the human Approves or Rejects with an optional note (`HumanApprovalRecord`).

## Production posture
When real tools are connected (`API_INTEGRATION_ROADMAP.md`), this model is the gate: the same
approval UI stands between the AI and any real-world effect. In the MVP, **no real actions occur**.
