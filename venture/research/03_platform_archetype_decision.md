# 03 — Platform Archetype Decision (Phase 5)
Date: 2026-08-17. Author: agent. Evidence tags: [E] verified/≥2 src · [M] media-single · [3P] third-party est · [I] inference · [A] assumption

> **Founder reality (verbatim, Phase 5):** "我最近在鼓捣ai应用、agent等原型，是文科出身准创业者，没什么资源…目标就是建立巨头企业，身家持续数百亿甚至千亿。企业偏线上。做出能建立未来时代的 google、meta，至少 uber、canva、airbnb 的企业。"
>
> Decoded hard constraints: (1) NO vertical access / NO capital / NO eng team; (2) non-technical, humanities; (3) actively prototyping AI apps + agents; (4) online-first; (5) wants a **network-effect platform**, not an agency.

---

## 0. The honest reframe (this changes the earlier shortlist)

Phase 4's survivors (cross-border e-comm ops, B2B export lead-gen) are **high-probability MONEY** but they are **agencies/services** — they cap around $1–5B, are labor-linear, and do NOT compound network effects. They do not become Google/Meta. The founder just told me the objective is explicitly the **platform / network-effect** class. So the selection function changes:

- OLD objective: maximize P(real after-tax profit in 24 months).
- NEW objective: maximize P(building a network-effect platform to $10B+ **while being fundable/feasible for a non-technical, resourceless, AI-prototyping founder**).

These are different optimizations. I will be honest about the trade: the platform path has a **lower probability of ANY money** but a **higher ceiling**. Given the founder's stated goal, the platform path is the correct one to optimize — but the *survival* design must let it earn revenue early so it doesn't die before the network ignites.

---

## 1. Evidence gathered this turn

### 1.1 Consumer-AI engagement is real but retention is a TRAP [E]
- Character.AI: ~22M MAU (Aug 2024) [M]; combined top-6 companion apps large user base [M/electroiq].
- BUT 2025–26: regulatory shutdown of minors, lawsuits (teen-suicide), "I finally quit" departure waves, content-filter backlash, users fleeing to alternatives. [E, ≥3 src: WSJ, TechCrunch, CNN, Decrypt-via-prinsessa, medium]
- Consumer AI monthly churn ~4.0% vs business AI ~3.5% (prior turn) [M] → consumer AI is a **leaky bucket + regulatory landmine**.
- **Verdict:** pure consumer-companion archetype FAILS the retention/durability gate (G5) and adds catastrophic reg-risk. REJECT as the core company. Emotional engagement is a *feature to borrow*, not a *company to build*.

### 1.2 Solo / non-technical founders CAN reach scale via AI + self-serve [E]
- Base44 (Maor Shlomo, solo, bootstrapped): 0 → 300K users / $3.5M ARR in 6 months → acquired by Wix ~$80M. [M/multi]
- Lovable: $10M run-rate in 8 weeks; $200M raise @ ~$1.8B. [M/multi]
- Canva (non-technical-friendly, design-thinking founders): waitlist → 50K pre-launch users; template + share flywheel; ~230M+ users; ~$42B (Aug 2025). [E, ≥2 src]
- **Verdict:** the modern AI + self-serve + UGC/template flywheel IS accessible to a non-technical founder. BUT note: solo AI-app founders mostly get **acquired**, not independent $100B. Independence requires a **compounding network/data moat**, which app-builders lack.

### 1.3 Cold-start is a SOLVED, teachable problem — and it dictates the design [E]
From Andrew Chen / a16z "The Cold Start Problem" [E, ≥3 src]:
- No successful marketplace starts as a marketplace. Start with an **atomic network** (smallest stable, engaged network that delivers value on its own).
- Solve the **hard side / supply side first** (Uber = drivers first; reduce ETA).
- **Do things that don't scale** (Airbnb founders door-to-door in NYC, reshot listing photos, refused to move to user #2 until user #1 *loved* it).
- Implication for us: the product must deliver **standalone single-player value on day one** (so it's useful with N=1), and *then* turn users into supply that makes it better for the next user.

### 1.4 The distribution channel the founder named is structurally real [E]
- WeChat Mini Programs: ~410M–1B+ DAU; ~1.4B WeChat MAU; ~79 min/day; overseas mini-program transactions +40% in 2025, ~5B annual overseas user sessions. [E, ≥2 src: statista, walkthechat, tmogroup, ashleydudarenok]
- **Verdict:** "企业偏线上" + WeChat Mini Program is a legitimate zero-CAC distribution surface **inside China**, and a bridge to overseas. This is a real asymmetry a China founder has that a US founder does not.

---

## 2. The 5 candidate platform ARCHETYPES (gate scan)

Rubric gates: G1 global expanding demand · G2 structural recurring pain someone pays for · G3 compounding proprietary interaction/outcome-data moat · G4 non-substitutable by frontier LLM · G5 durable ≥60% margin + retention. Plus founder-fit (non-technical/no-capital) and cold-start feasibility (atomic network reachable by ONE person).

| # | Archetype | Example north-star | G1 | G2 | G3 moat | G4 vs GPT | G5 retention | Founder-fit | Cold-start feasible solo | Verdict |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Consumer AI companion / chat | Character.ai | ✓ | ~ | ~ | ✗ | ✗ churn+reg | ✓ | ✓ | **REJECT** (1.1) |
| 2 | Horizontal AI app-builder | Base44/Lovable | ✓ | ✓ | ~ | ✗ (labs eat) | ~ | ✗ needs deep eng | ✗ | **REJECT** (get-acquired, not independent) |
| 3 | AI creator/UGC tool w/ template network | Canva-for-X | ✓ | ✓ | ✓ (template+remix graph) | ~→✓ if data-loop | ✓ | ✓ self-serve | ✓ atomic = one creator niche | **KEEP — strong** |
| 4 | Vertical AI-agent marketplace (agents as supply) | "Uber for AI agents / done-for-you outcomes" | ✓ | ✓ | ✓ (outcome+rating+workflow data) | ✓ | ✓ | ~ (curate, not code) | ~ hard side = quality agents | **KEEP — highest ceiling** |
| 5 | AI-native knowledge/answer network | OpenEvidence-for-consumers | ✓ | ~ | ✓ (Q→answer→outcome loop) | ~ | ~ | ✗ trust/reg | ✗ | DEMOTE |

Two survivors: **#3 (Canva-class AI creation network)** and **#4 (agent-outcome marketplace)**.

---

## 3. Head-to-head: #3 vs #4 (the real decision)

### #4 Agent-outcome marketplace — highest ceiling, but…
- Ceiling: genuinely Uber/Upwork-class ($10B+). Moat = outcome + rating + routing data compounds.
- KILLER PROBLEM (cold-start): it's **three-sided** (buyers, agent-builders, trust/QA). Two-sided cold-start already penalized −10; three-sided is worse. A resourceless solo founder cannot seed *quality agent supply* AND *paying demand* AND *trust* simultaneously in 2026 when agent reliability is still shaky. High reg/liability if agents act wrongly. **Feasibility fail for THIS founder, THIS year.** Park as the 24-month expansion, not the wedge.

### #3 Canva-class AI creation network — the FEASIBLE platform
- **Single-player value day one:** a creator makes something valuable with AI *alone* (no other users needed) → no cold-start death.
- **Then it becomes multiplayer/networked:** what they create (templates, styles, prompt-recipes, characters, remixable assets) becomes **supply** that helps the next creator → template/remix graph = compounding UGC + interaction-data moat (this is exactly Canva's flywheel, now AI-native). [E, UX Planet + Canva CPO]
- **Founder-fit:** self-serve, no enterprise sales, non-technical founder can seed the atomic network personally (be the first 100 creators, "do things that don't scale"), and AI does the "engineering-heavy" production the founder can't.
- **Distribution asymmetry:** ships as web + iOS + Android + **WeChat Mini Program** (zero-CAC in China) + short-video/UGC virality (every output is an ad). Matches "企业偏线上".
- **Retention/moat vs GPT:** raw generation IS substitutable by GPT — so the moat is NOT the generation. The moat is (a) the **accumulating remixable asset/template network**, (b) **creator identity + following + earnings** (they can't take their audience to ChatGPT), (c) **outcome/engagement data** telling us what converts, (d) **a monetization rail** where creators earn (marketplace inside the network). That's the Canva+Meta+marketplace hybrid — non-substitutable because it's a *network*, not a *model*.

**DECISION: Bet on Archetype #3, instantiated as a specific vertical (see §4). Archetype #4 is the deliberate 24-month expansion once we own the creators + the outcome data.**

---

## 4. Narrowing #3 to ONE concrete BET

Canva-for-everything is too broad for a solo cold-start (violates "atomic network"). Pick ONE creator niche where: (a) global + exploding demand, (b) AI gives a 10× production advantage, (c) every output is inherently shareable (built-in viral loop), (d) creators can EARN (marketplace → retention + our take-rate), (e) China + WeChat distribution is a real edge.

Scan of niches (short-video assets / avatars / AI music / marketing creative / AI comics-manga / AI storytelling & short-drama / product photos for sellers):

- **AI short-video / short-drama creation + distribution** — huge global + China demand, but heavy compute, and drama IP/reg risk. Watch.
- **AI marketing-creative for the ~200M+ small merchants & cross-border sellers** — strong pain + they PAY + WeChat/e-comm distribution + our Phase-4 seller-access asymmetry. **Highest founder-fit.**
- AI avatars/companions — reject (reg + churn, §1.1).

### ⭐ THE ONE BET (v1 wedge, expandable to the platform)
**An AI-native creator network for MARKETING & PRODUCT CONTENT — "Canva × CapCut × a creator marketplace," AI-first, mobile+WeChat-first — starting with the atomic network of cross-border & China small-merchant creators who must produce endless localized selling content (product images, short video, ad copy, listings) and today pay agencies/VAs or burn hours in generic tools.**

- **Single-player value (N=1):** merchant uploads a product → gets ready-to-post localized image/video/copy sets in minutes. Useful alone → beats cold-start.
- **Network turn:** best outputs become **remixable templates/recipes**; top creators become **suppliers** other merchants hire/subscribe to; a **template + creator marketplace** forms → take-rate + compounding asset graph.
- **Moat that GPT can't copy:** the template/remix graph + which templates actually *convert to sales* (outcome data from merchants) + creator followings/earnings + the WeChat/e-comm distribution + a payments/marketplace rail.
- **Why this founder wins:** non-technical (AI does production), no capital (self-serve + zero-CAC WeChat/UGC virality), asymmetric China-seller access (Phase-4 finding), online-first, and it plugs straight into AppLovin/Meta ad SDKs (the founder's stated integration requirement) both to monetize and because merchants want to *place* the ads we help them make.

---

## 5. Why NOT the alternatives (kept honest)
- **Not consumer companion** — churn + regulation (§1.1).
- **Not app-builder** — labs will eat it; ends in acquisition, not independence (§1.2).
- **Not agent marketplace *yet*** — three-sided cold-start infeasible solo in 2026; it's the *expansion* (§3).
- **Not a pure B2B export agency** — no network effect; caps at ~$1–5B; contradicts the stated Google/Meta goal (§0). (It remains a viable *fallback* if the platform fails its kill-criteria.)

---

## 6. 15-point short thesis (how this dies — pre-mortem)
1. Generation commoditizes → we're a thin GPT wrapper. **Guard:** moat = network/asset graph + outcome data + marketplace, not the model.
2. Cold-start: template network too sparse to matter. **Guard:** seed 200 templates personally; single-player value first.
3. Retention leak like companions. **Guard:** creators have followers + earnings → switching cost.
4. Canva/CapCut/Meta/字节 add the same feature. **Guard:** own a niche + marketplace + China distribution they under-serve; be the *network*, not the tool.
5. No willingness-to-pay. **Guard:** merchants already pay VAs/agencies (validate user-voice next).
6. WeChat platform risk (Tencent changes rules / bans category). **Guard:** multi-surface (web/iOS/Android) from day one.
7. Content moderation / IP / deepfake liability. **Guard:** policy + provenance + no-face-swap-of-strangers rules.
8. Two-/three-sided marketplace never ignites. **Guard:** stay single-player-useful; marketplace is upside, not survival.
9. Unit economics: GPU/gen cost > revenue. **Guard:** tiered credits, cache/reuse templates, cheaper models for drafts.
10. Non-technical founder can't ship maturity. **Guard:** AI-built codebase + hire/partner one eng; ship thin, iterate.
11. Paid-UA trap. **Guard:** virality (every output is an ad) + WeChat zero-CAC; ads SDK is monetization, not acquisition.
12. China-only ceiling. **Guard:** cross-border merchants are the wedge → global demand baked in.
13. Regulatory (China content/algo filing, data). **Guard:** compliant content categories; keep out of sensitive verticals.
14. Founder burnout / focus. **Guard:** ONE niche, ONE atomic network, kill-criteria enforced.
15. It works but stays small ($1–5B, not $100B). **Accept:** that's still life-changing; the agent-marketplace expansion (§3) is the $100B option-value on top.

## 7. Kill criteria (falsify fast, cheap, no code needed for #1–2)
- **K1 (2 wks):** ≥20 target merchants confirm they pay for content today AND would try/pay us → else pivot niche.
- **K2 (4 wks):** landing/WeChat test → ≥X waitlist / ≥Y% who "would pay" → else re-scope.
- **K3 (8–12 wks MVP):** D30 retention of first cohort ≥ threshold AND ≥N creators publish a reusable template → else the network isn't forming; revert to the B2B service fallback.

---

## 8. Decision
**BET = Archetype #3 → the AI-native marketing/product-content CREATOR NETWORK for cross-border & small merchants** ("Canva × CapCut × creator-marketplace," mobile + WeChat-first), with the agent-outcome marketplace as the 24-month expansion. Proceed to build the **company-founding kit** (model, GTM/cold-start, moat roadmap, 24-mo plan) and then a mature multi-surface product (web + iOS + Android + WeChat Mini Program) with AppLovin/Meta ad-SDK hooks — consistent with the standing "prove WHAT before HOW" principle, which §1–7 now satisfies for the platform question.
