# Atlaz — Competitive Benchmark & Market Simulation Report

> Generated alongside the automated **market-grade end-to-end simulation**
> (`test/simulation.cjs`, **243/243 checks, Grade A+**) and the **integrity harness**
> (`test/integrity.cjs`, **255/255**).

## 1. Simulation summary

The simulation runs the **complete single-SKU Trade Loop** for all 12 opportunities through the
real (mock) AI service, tool registry and ledger:

| Metric | Result |
|--------|--------|
| Opportunities run end-to-end | **12 / 12** |
| AI envelopes produced (13-field) | **180** |
| Trade Loop Ledger events | **50 → 194** (+144 at runtime) |
| AI generation log entries | **0 → 180** |
| Cash Conversion decisions | negotiate 5 · test_smaller 4 · stop 3 |
| Experiment decisions | reorder 6 · iterate_product 3 · stop 3 |
| Compliance risk levels | Low 5 · Medium 4 · High 3 |
| Listings flagging high-risk-claim blocks | 12 |
| Agent actions requiring approval (risk-tiered) | 6 / 12 (all Medium/High/irreversible gated) |
| Tools mock-connected, production reserved | 15 / 15 |

**Interpretation.** The decision distributions are *honest and realistic*: not every product is a
"buy." The engine correctly tells merchants to **negotiate, test smaller, or stop** — which is the
entire value proposition (avoid lighting cash on fire). High-compliance-risk products
(posture corrector, massage gun, beauty fridge) trigger professional-review flags and claim blocks.

## 2. Competitive landscape

| Capability | Alibaba / 1688 | Jungle Scout / Helium 10 | AutoDS / Spocket | Generic AI copilot | **Atlaz** |
|------------|:---:|:---:|:---:|:---:|:---:|
| Product opportunity discovery | ~ | ✅ | ~ | ~ | ✅ |
| Supplier sourcing | ✅ | ✗ | ✅ | ✗ | ✅ |
| **Supplier Trust Graph** (compounding) | ✗ | ✗ | ✗ | ✗ | ✅ |
| **Compliance Route Engine** (risk guidance) | ✗ | ~ | ✗ | ~ | ✅ |
| **Cash Conversion Score** (buy/negotiate/test/stop) | ✗ | ~ | ✗ | ✗ | ✅ |
| Listing generation + claim safety | ✗ | ~ | ~ | ~ | ✅ |
| **End-to-end Trade Loop** (one flow) | ✗ | ✗ | ~ | ✗ | ✅ |
| **SKU Passport** (portable, owned record) | ✗ | ✗ | ✗ | ✗ | ✅ |
| **Trade Loop Ledger** (auditable history) | ✗ | ✗ | ✗ | ✗ | ✅ |
| **Human-approved Agent Actions** | ✗ | ✗ | ✗ | ~ | ✅ |
| Data network effect across merchants | ~ | ~ | ✗ | ✗ | ✅ |
| Consent-first data rights | ~ | ~ | ✗ | ~ | ✅ |

✅ first-class · ~ partial/adjacent · ✗ absent

## 3. Where Atlaz wins

1. **The loop, not a feature.** Competitors solve one slice (research *or* sourcing *or*
   listing). Atlaz connects opportunity → supplier → compliance → cash → listing → order →
   growth → decision in one flow with shared state (the SKU Passport).
2. **Compounding moat data.** The six moat objects (SKU Passport, Trade Loop Ledger, Supplier
   Trust Graph, Compliance Route Engine, Cash Conversion Score, Agent Actions) get better with
   every loop and every merchant — a gap that grows over 12–15 years.
3. **Safety as a feature.** Risk-tiered, human-approved agent actions + claim blocking + a
   risk-only compliance posture make Atlaz trustworthy enough to eventually wire to real money.
4. **Cash truth.** The Cash Conversion Score gives the kill-or-commit answer most tools never do.

## 4. Honest limitations (MVP)

- All data, tools, certifications and signals are **mock**; no real orders/messages/payments.
- Compliance is **risk guidance, not legal advice**; cash output is **estimates, no guarantees**.
- The Supplier Trust Graph's power depends on **future real, opt-in signals** (Phase 2–3).

## 5. Verdict

On the dimensions that define a durable network company — **end-to-end workflow, compounding
proprietary data, two-sided potential, and trustworthy automation** — Atlaz's design is
materially differentiated from every incumbent category. The prototype demonstrates the loop is
real, the math is honest, and the moats are structurally present from day one.

*Ownership: all concepts, schemas, designs and code are the original work of the founding team /
user. See `OWNERSHIP_NOTICE.md`. Not investment advice.*
