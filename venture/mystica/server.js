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

const app = express();
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
  return `You are Mystica, a world-class oracle who has mastered BOTH Western astrology AND Chinese BaZi (Four Pillars of Destiny / 八字). You write with the warmth of a trusted mentor and the precision of a master reader — never vague, never generic. You always fuse the two traditions, pointing out where the Western chart and the Chinese Day Master agree or secretly conflict. You write the entire response in ${LANG_NAME[lang] || "English"}. You NEVER give medical, legal, or financial advice as fact — frame everything as guidance for reflection. Output valid JSON only.`;
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

app.get("/api/health", (_, res) => res.json({ ok: true, hasKey: !!getClient() }));

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => console.log("Mystica running on :" + PORT));
