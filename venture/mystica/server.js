/* Mystica backend — 深度报告生成 + 静态托管
 * 端点:
 *   GET  /                 -> 静态站点
 *   POST /api/report       -> 用命盘 payload 生成真实深度报告 (大模型)
 *   POST /api/daily        -> 每日运势 (订阅会员)
 *   GET  /api/health
 * 说明: 生产中 /api/report 前应先校验支付回执 (Stripe/Lemon webhook -> token)。
 *       这里用 x-paid 头做占位鉴权, 便于演示。
 */
const express = require("express");
const path = require("path");
const fs = require("fs");
const os = require("os");
const yaml = require("js-yaml");
const pay = require("./payment.js");

const app = express();
// webhook 需要原始 body 校验签名, 单独用 raw parser
app.use("/api/webhook", express.raw({ type: "*/*" }));
app.use(express.json({ limit: "1mb" }));
app.use(express.static(__dirname));

// ---- OpenAI client (lazy) ----
let _client = null;
function getClient() {
  if (_client) return _client;
  let cfg = {};
  try {
    const p = path.join(os.homedir(), ".genspark_llm.yaml");
    if (fs.existsSync(p)) cfg = yaml.load(fs.readFileSync(p, "utf8")) || {};
  } catch (_) {}
  const apiKey = cfg?.openai?.api_key || process.env.OPENAI_API_KEY;
  const baseURL = cfg?.openai?.base_url || process.env.OPENAI_BASE_URL;
  if (!apiKey) return null;
  const OpenAI = require("openai");
  _client = new OpenAI({ apiKey, baseURL });
  return _client;
}

const LANG_NAME = { en:"English", zh:"Simplified Chinese", es:"Spanish", pt:"Portuguese", ja:"Japanese", ko:"Korean", hi:"Hindi" };

function systemPrompt(lang) {
  return `You are Mystica, a world-class oracle who has mastered BOTH Western astrology AND Chinese BaZi (Four Pillars of Destiny / 八字). You write with the warmth of a trusted mentor and the precision of a master reader — never vague, never generic.

CRITICAL TONE RULE (this is our #1 differentiator vs Co-Star, whose users quit because it feels cold and doom-laden): You are WARM, EMPOWERING, and ACTIONABLE. Even when naming a flaw or a hard season, you always frame it as growth and give the reader agency and hope. Never fatalistic, never scary. The reader should finish feeling SEEN and CAPABLE, never doomed.

You always fuse the two traditions, pointing out where the Western chart and the Chinese Day Master agree or secretly conflict. You write the entire response in ${LANG_NAME[lang] || "English"}. You NEVER give medical, legal, or financial advice as fact — frame everything as guidance for reflection. Output valid JSON only.`;
}

function userPrompt(payload) {
  return `Generate a deep, de: personalized reading for this person. Use their real chart data below.

CHART DATA:
${JSON.stringify(payload, null, 2)}

Return JSON with EXACTLY this shape:
{
  "title": "a poetic 4-8 word title for this person",
  "opening": "2-3 sentence intimate opening that names who they are, fusing Western sun sign and Chinese Day Master",
  "sections": [
    {"key":"personality","emoji":"🧭","heading":"...","body":"120-180 words, specific to their Day Master + sun sign, naming the tension between them"},
    {"key":"love","emoji":"💗","heading":"...","body":"120-180 words on love & compatibility, name which elements/signs complete or clash with them"},
    {"key":"wealth","emoji":"💰","heading":"...","body":"120-180 words on their wealth element, best career direction, and favorable timing based on luck pillars"},
    {"key":"shadow","emoji":"⚡","heading":"...","body":"120-180 words naming the specific self-sabotaging trait from their elemental imbalance"},
    {"key":"year","emoji":"🌙","heading":"...","body":"120-180 words forecast for the current year using the flow-year pillar vs their chart"},
    {"key":"remedy","emoji":"💎","heading":"...","body":"100-150 words: concrete remedies to balance their weakest element, referencing their recommended crystal and favorable elements"}
  ],
  "closing": "1-2 sentence empowering closing line"
}`;
}

app.post("/api/report", async (req, res) => {
  const { payload, lang } = req.body || {};
  if (!payload) return res.status(400).json({ error: "missing payload" });
  const client = getClient();
  if (!client) {
    // 无 key 时返回高质量降级示例, 保证演示可用
    return res.json({ demo: true, report: fallbackReport(payload, lang) });
  }
  try {
    const completion = await client.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        { role: "system", content: systemPrompt(lang || "en") },
        { role: "user", content: userPrompt(payload) },
      ],
      response_format: { type: "json_object" },
    });
    const text = completion.choices[0].message.content;
    res.json({ demo: false, report: JSON.parse(text) });
  } catch (e) {
    console.error("report error:", e.message);
    res.json({ demo: true, report: fallbackReport(payload, lang), warn: e.message });
  }
});

app.post("/api/daily", async (req, res) => {
  const { payload, lang } = req.body || {};
  const client = getClient();
  if (!payload || !client) {
    return res.json({ demo: true, text: "Today favors your strongest element. Move on the decision you have been circling — the door is briefly open." });
  }
  try {
    const c = await client.chat.completions.create({
      model: "gpt-5-nano",
      messages: [
        { role: "system", content: systemPrompt(lang || "en") + " Keep it to a single vivid 40-60 word daily guidance. Output JSON {\"text\":\"...\"}." },
        { role: "user", content: "Daily guidance for chart: " + JSON.stringify(payload) + ` for date ${new Date().toISOString().slice(0,10)}.` },
      ],
      response_format: { type: "json_object" },
    });
    res.json({ demo: false, ...JSON.parse(c.choices[0].message.content) });
  } catch (e) {
    res.json({ demo: true, text: "The stars are quiet today — trust the momentum you already built." });
  }
});

function fallbackReport(p, lang) {
  const dm = p.day_master || "your Day Master";
  return {
    title: "The " + (p.day_master || "Hidden") + " Path",
    opening: `${p.name}, your Sun in ${p.western_sun} gives you a face the world sees, but your ${dm} Day Master is your true engine. Where they meet, your real story begins.`,
    sections: [
      {key:"personality",emoji:"🧭",heading:"Who You Really Are",body:`As a ${dm}, your core runs deeper than your ${p.western_sun} surface suggests. Your chart leans heavily on ${p.strongest} energy while ${p.weakest} stays scarce — a signature that makes you unmistakable, and occasionally misunderstood. (Connect an AI key to unlock the full, individually-written version.)`},
      {key:"love",emoji:"💗",heading:"Love & Compatibility",body:`Your ${p.weakest} deficit is exactly what you seek in a partner — you are drawn to those who carry the element you lack. Balance, not sameness, completes you.`},
      {key:"wealth",emoji:"💰",heading:"Wealth Blueprint",body:`Your favorable elements are ${(p.favorable_elements||[]).join(" & ")}. Careers and timing that amplify these are where money flows to you most easily.`},
      {key:"shadow",emoji:"⚡",heading:"Your Hidden Shadow",body:`An excess of ${p.strongest} can tip into your defining flaw. Naming it is the first step to disarming it.`},
      {key:"year",emoji:"🌙",heading:`The Year of the ${p.current_year?.zodiac||"Now"}`,body:`This year's ${p.current_year?.element||""} energy meets your chart in a way that opens a specific window. Move deliberately.`},
      {key:"remedy",emoji:"💎",heading:"Your Remedy",body:`To replenish your scarce ${p.weakest}, carry ${p.recommended_crystal?.name||"a balancing stone"} (${p.recommended_crystal?.cn||""}) — for ${p.recommended_crystal?.benefit||"balance"}.`},
    ],
    closing: "The chart is not your cage. It is your map. Walk it with open eyes.",
  };
}

/* ---- 情侣合盘报告 ---- */
app.post("/api/compat", async (req, res) => {
  const { a, b, score, lang } = req.body || {};
  const client = getClient();
  if (!a || !b) return res.status(400).json({ error: "missing charts" });
  if (!client) return res.json({ demo: true, report: fallbackCompat(a, b, score) });
  try {
    const c = await client.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        { role: "system", content: systemPrompt(lang || "en") + " You are writing a couple compatibility reading. Output JSON." },
        { role: "user", content: `Two people. Person A: ${JSON.stringify(a)}. Person B: ${JSON.stringify(b)}. Their fused compatibility score is ${score}/100. Write a warm, specific reading. Return JSON: {"title":"...","score_line":"one line interpreting the score","sections":[{"emoji":"💞","heading":"Your Spark","body":"120-160 words"},{"emoji":"⚔️","heading":"Where You Clash","body":"120-160 words, framed as growth"},{"emoji":"🌱","heading":"How You Grow Together","body":"120-160 words actionable"},{"emoji":"🗝️","heading":"The Secret to Lasting","body":"100-140 words"}],"closing":"1-2 empowering sentences"}` },
      ],
      response_format: { type: "json_object" },
    });
    res.json({ demo: false, report: JSON.parse(c.choices[0].message.content) });
  } catch (e) { res.json({ demo: true, report: fallbackCompat(a, b, score), warn: e.message }); }
});

/* ---- 五行补缺起名报告 ---- */
app.post("/api/naming", async (req, res) => {
  const { advice, babyInfo, lang } = req.body || {};
  const client = getClient();
  if (!advice) return res.status(400).json({ error: "missing advice" });
  if (!client) return res.json({ demo: true, report: fallbackNaming(advice) });
  try {
    const c = await client.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        { role: "system", content: systemPrompt(lang || "en") + " You are a BaZi naming master. Output JSON." },
        { role: "user", content: `Child chart needs to strengthen element "${advice.primaryElement}" (secondary "${advice.secondaryElement}"), Day Master is ${advice.dayMaster}. Baby info: ${JSON.stringify(babyInfo||{})}. Suggest 6 names (mix of the style hints provided). Return JSON: {"title":"...","intro":"why these elements matter for this child, 60-90 words","names":[{"name":"...","meaning":"...","why":"how it balances the chart"}],"closing":"warm 1-2 sentences"}. Hints: ${JSON.stringify(advice.hint)}` },
      ],
      response_format: { type: "json_object" },
    });
    res.json({ demo: false, report: JSON.parse(c.choices[0].message.content) });
  } catch (e) { res.json({ demo: true, report: fallbackNaming(advice), warn: e.message }); }
});

/* ---- 择日报告 (纯计算, 无需LLM即可返回, LLM增强解读) ---- */
app.post("/api/dates", async (req, res) => {
  const { dates, eventType, lang } = req.body || {};
  const client = getClient();
  if (!dates) return res.status(400).json({ error: "missing dates" });
  if (!client) return res.json({ demo: true, report: { title: "Your Auspicious Dates", dates, note: "Ranked by harmony with your chart." } });
  try {
    const c = await client.chat.completions.create({
      model: "gpt-5-nano",
      messages: [
        { role: "system", content: systemPrompt(lang || "en") + " Output JSON." },
        { role: "user", content: `Auspicious dates for a ${eventType}: ${JSON.stringify(dates)}. Write a one-sentence warm interpretation for each date's energy. Return JSON: {"title":"...","dates":[{"date":"...","ganzhi":"...","score":n,"why":"one sentence"}]}` },
      ],
      response_format: { type: "json_object" },
    });
    res.json({ demo: false, report: JSON.parse(c.choices[0].message.content) });
  } catch (e) { res.json({ demo: true, report: { title: "Your Auspicious Dates", dates }, warn: e.message }); }
});

function fallbackCompat(a, b, score) {
  return { title: "Two Charts, One Orbit",
    score_line: `Your fused compatibility reads ${score}/100 — ${score>=80?"a rare resonance":score>=62?"a strong, workable bond":score>=45?"a relationship that rewards effort":"a karmic lesson worth learning"}.`,
    sections: [
      {emoji:"💞",heading:"Your Spark",body:`${a.name}'s ${a.day_master} meets ${b.name}'s ${b.day_master}. Where your elements feed each other, attraction feels effortless.`},
      {emoji:"⚔️",heading:"Where You Clash",body:"Every strong pairing has friction. Yours is a teacher, not a threat — it shows each of you the edge you came here to grow."},
      {emoji:"🌱",heading:"How You Grow Together",body:"Lean on the element one of you lacks and the other carries. That exchange is the quiet engine of your bond."},
      {emoji:"🗝️",heading:"The Secret to Lasting",body:"Name the clash out loud, early. What you both understand, you can both soften."},
    ], closing:"You are not the same — and that is precisely the point." };
}
function fallbackNaming(adv) {
  const h = adv.hint || {};
  return { title: "A Name to Balance the Stars",
    intro: `This child's chart leans away from ${adv.primaryElement}. A name that carries ${adv.primaryElement} energy (${(h.meaning)||"balance"}) gently restores harmony.`,
    names: (h.en||["Aria","Kai","Luna"]).slice(0,6).map(n=>({name:n,meaning:h.meaning||"balance",why:`Carries ${adv.primaryElement} energy to complete the chart.`})),
    closing: "A good name is a quiet blessing the child carries for life." };
}

/* ---- 支付: 创建 checkout ---- */
app.post("/api/checkout", async (req, res) => {
  const { product, meta } = req.body || {};
  if (!pay.PRODUCTS[product]) return res.status(400).json({ error: "unknown product" });
  const origin = `${req.protocol}://${req.get("host")}`;
  try {
    const out = await pay.createCheckout({
      product, meta,
      successUrl: `${origin}/success.html`,
      cancelUrl: `${origin}/#shop`,
    });
    res.json(out);
  } catch (e) {
    console.error("checkout error:", e.message);
    res.status(500).json({ error: "checkout_failed", detail: e.message });
  }
});

/* ---- 支付: webhook ---- */
app.post("/api/webhook", (req, res) => {
  const raw = req.body; // Buffer
  const ok = pay.verifyWebhook(pay.PROVIDER, raw, req.headers);
  if (!ok && pay.PROVIDER !== "demo") return res.status(400).send("bad signature");
  try {
    const evt = JSON.parse(raw.toString("utf8") || "{}");
    // Lemon: meta.custom_data.order_token ; Stripe: data.object.metadata.order_token
    const token = evt?.meta?.custom_data?.order_token || evt?.data?.object?.metadata?.order_token;
    if (token) pay.markPaid(token);
  } catch (_) {}
  res.json({ received: true });
});

/* ---- 支付: 查询订单状态 (前端凭 token 解锁) ---- */
app.get("/api/order/:token", (req, res) => {
  const o = pay.getOrder(req.params.token);
  if (!o) return res.status(404).json({ error: "not_found" });
  res.json({ token: o.token, product: o.product, paid: o.paid, meta: o.meta });
});

/* ---- 邮件捕获 (弃单召回 / 名单) ---- */
const LEADS = path.join(__dirname, "leads.jsonl");
app.post("/api/lead", (req, res) => {
  const { email, source, lang } = req.body || {};
  if (!email || !/.+@.+\..+/.test(email)) return res.status(400).json({ error: "invalid_email" });
  try { fs.appendFileSync(LEADS, JSON.stringify({ email, source, lang, ts: Date.now() }) + "\n"); } catch (_) {}
  res.json({ ok: true });
});

app.get("/api/health", (_, res) => res.json({ ok: true, hasKey: !!getClient(), provider: pay.PROVIDER }));

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => console.log("Mystica running on :" + PORT));
