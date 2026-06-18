# Acceptance Criteria

Atlaz v4 is accepted only if ALL of the following pass.

## A. The must-pass story (gating)
A US TikTok Shop new seller, $3,000 budget, home cleaning product:
1. [ ] Sees **3 recommendations**.
2. [ ] Picks one → a **SKU Passport / Deal Room** opens.
3. [ ] Sees **5 suppliers** including small-test, certified, and high-risk.
4. [ ] Generates inquiry email, IM script, sample brief, quote comparison.
5. [ ] Runs US/TikTok compliance → **banned words flagged**.
6. [ ] Runs cash check → suggests **~100 units if dangerous**, else buy.
7. [ ] Gets TikTok description + video script + creator brief.
8. [ ] Places a **mock sample order**.
9. [ ] Logs **7-day test data**.
10. [ ] AI returns one of **reorder / modify / lower-price / change-market /
       change-angle / stop** + a **Decision Memo**.

> Verified end-to-end by `tests/simulation.cjs`.

## B. Data minimums
- [ ] ≥18 opportunities
- [ ] ≥90 suppliers (≥5/opportunity, role-spread)
- [ ] ≥12 Deal Rooms
- [ ] ≥60 ledger events
- [ ] ≥12 compliance routes (≥8 high-risk)
- [ ] ≥12 cash scores
- [ ] ≥12 growth experiments
- [ ] ≥8 order flows
- [ ] 8 real scenarios, no lorem

## C. AI envelope
- [ ] Every AI output has all **15 fields**.
- [ ] High-risk actions set `humanApprovalRequired = true`.
- [ ] Compliance high-risk results carry the compliance disclaimer + red state.
- [ ] Listing output is **per-platform** (Amazon / Shopify / TikTok Shop).
- [ ] Experiment evaluation returns one of the **6 decisions**.

## D. i18n
- [ ] 7 UI languages switch in real time.
- [ ] Arabic renders **RTL**.
- [ ] 10 currencies format correctly via mock FX (incl. MX$ / R$ parsing).
- [ ] UI language is independent of AI output language.

## E. UX states
- [ ] Loading / empty / error / blocked-risk / permission-denied / approval-required
      states all exist.

## F. Honesty
- [ ] No "registered company" claim.
- [ ] No "legal permission obtained" claim.
- [ ] No real integrations claimed (all adapters mock).
- [ ] Ownership stated as the project owner's.

## G. Deployment
- [ ] Web prototype builds and runs as static files.
- [ ] A **permanent** deployment URL is provided.
- [ ] Deployment guide lists real long-term hosting options.

## Test commands
```bash
cd atlaz4/tests
node integrity.cjs      # B, C, D, E, F checks
node simulation.cjs     # A — the must-pass story
```
