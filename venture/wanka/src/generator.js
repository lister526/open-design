// generator.js — the single-player value layer.
// Turns a project (product + selling points + audience) into a set of localized
// marketing assets: image briefs, video scripts, ad copy, listings.
//
// Two modes:
//   - MOCK (default): deterministic, structured, multilingual — always works, zero cost,
//     good enough to demo the product and run tests without an API key.
//   - REAL: calls an OpenAI-compatible chat API when ENABLE_REAL_AI="true" and a key exists.
//
// The output SHAPE is identical in both modes so the frontend/tests never change.

const LANG_LABEL = {
  zh: '中文', en: 'English', ja: '日本語', ko: '한국어',
  es: 'Español', pt: 'Português', ar: 'العربية', hi: 'हिन्दी', fr: 'Français',
};

// ---- tiny helper: localized phrasing for the mock engine ----
const MOCK = {
  hook: {
    zh: (p) => `还在为「${p}」发愁？这一个改变，让结果完全不同。`,
    en: (p) => `Still struggling with ${p}? One change flips the result.`,
    ja: (p) => `${p}でお悩みですか？たった一つの違いで結果が変わります。`,
    ko: (p) => `${p} 때문에 고민이신가요? 하나만 바꿔도 결과가 달라집니다.`,
    es: (p) => `¿Sigues luchando con ${p}? Un cambio lo cambia todo.`,
    pt: (p) => `Ainda com dificuldade com ${p}? Uma mudança muda tudo.`,
    ar: (p) => `${p} لا يزال يشكل عائقًا لك؟ تغيير واحد يقلب النتيجة.`,
    hi: (p) => `${p} से अब भी परेशान? एक बदलाव सब कुछ बदल देता है।`,
    fr: (p) => `Toujours bloqué par ${p} ? Un seul changement change tout.`,
  },
  cta: {
    zh: '点击了解 →', en: 'Learn more →', ja: '詳しく見る →', ko: '자세히 보기 →',
    es: 'Descubre más →', pt: 'Saiba mais →', ar: '← اعرف المزيد', hi: 'और जानें →', fr: 'En savoir plus →',
  },
};

function t(map, lang, fallback = 'en') {
  return map[lang] || map[fallback];
}

// Split raw selling points into an array
function splitPoints(text) {
  if (!text) return [];
  return String(text)
    .split(/[\n,，、;；]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 6);
}

// ---------- MOCK generators (per kind) ----------
function mockAdCopy(project, lang) {
  const pts = splitPoints(project.selling_pts);
  const product = project.product || project.title;
  const headline = t(MOCK.hook, lang)(product);
  const reasons = (pts.length ? pts : [product]).slice(0, 3).map((p, i) => `${i + 1}. ${p}`);
  return {
    kind: 'ad_copy',
    lang,
    headline,
    body: reasons.join('\n'),
    cta: t(MOCK.cta, lang),
  };
}

function mockVideoScript(project, lang) {
  const product = project.product || project.title;
  const pts = splitPoints(project.selling_pts);
  const beats = [
    { t: '0-3s', label: 'HOOK', line: t(MOCK.hook, lang)(product) },
    { t: '3-8s', label: 'AGITATE', line: pts[0] || product },
    { t: '8-18s', label: 'REVEAL', line: `${product} — ${pts.slice(0, 2).join(' · ') || product}` },
    { t: '18-25s', label: 'PROOF', line: pts[2] || (lang === 'zh' ? '真实用户都在回购' : 'Real users keep coming back') },
    { t: '25-30s', label: 'CTA', line: t(MOCK.cta, lang) },
  ];
  return { kind: 'video_script', lang, len_s: 30, beats };
}

function mockImageBrief(project, lang) {
  const product = project.product || project.title;
  const pts = splitPoints(project.selling_pts).slice(0, 3);
  return {
    kind: 'image_brief',
    lang,
    layout: 'hero',
    prompt: `E-commerce hero image of "${product}", clean studio background, product centered, ` +
            `three selling-point badges${pts.length ? ': ' + pts.join(', ') : ''}, ` +
            `subtle brand mark, high contrast, conversion-optimized. Text overlay language: ${LANG_LABEL[lang] || lang}.`,
    badges: pts,
    note: 'Feed this prompt to your image model (or Wanka image credits) to render.',
  };
}

function mockListing(project, lang) {
  const product = project.product || project.title;
  const pts = splitPoints(project.selling_pts);
  const bullets = (pts.length ? pts : [product, product, product, product, product]).slice(0, 5);
  return {
    kind: 'listing',
    lang,
    title: `${product} | ${bullets.slice(0, 2).join(' ')}`.slice(0, 120),
    bullets,
    keywords: bullets.map((b) => b.split(' ')[0]).filter(Boolean),
  };
}

const MOCK_MAP = {
  ad_copy: mockAdCopy,
  video_script: mockVideoScript,
  image_brief: mockImageBrief,
  listing: mockListing,
};

// ---------- REAL (OpenAI-compatible) ----------
async function realGenerate(env, project, kind, lang) {
  const key = env.OPENAI_API_KEY;
  const base = env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
  const model = env.OPENAI_MODEL || 'gpt-4o-mini';
  const sys = `You are Wanka, an expert e-commerce marketing content generator. ` +
    `Output ONLY valid minified JSON matching the requested kind. Language: ${LANG_LABEL[lang] || lang}.`;
  const user = JSON.stringify({ task: kind, project, lang, want: 'conversion-optimized' });
  const res = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      messages: [{ role: 'system', content: sys }, { role: 'user', content: user }],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    }),
  });
  if (!res.ok) throw new Error(`ai_upstream_${res.status}`);
  const data = await res.json();
  const txt = data?.choices?.[0]?.message?.content || '{}';
  const parsed = JSON.parse(txt);
  parsed.kind = kind;
  parsed.lang = lang;
  return parsed;
}

// ---------- public API ----------
export function supportedKinds() {
  return ['image_brief', 'video_script', 'ad_copy', 'listing'];
}

// Generate one asset of a kind in a language.
export async function generateOne(env, project, kind, lang) {
  const realOn = String(env.ENABLE_REAL_AI || 'false') === 'true' && !!env.OPENAI_API_KEY;
  if (realOn) {
    try {
      return await realGenerate(env, project, kind, lang);
    } catch (e) {
      // graceful fallback to mock on any upstream error — product never hard-fails
      const fn = MOCK_MAP[kind];
      const out = fn ? fn(project, lang) : { kind, lang, error: 'unsupported' };
      out._fallback = String(e.message || e);
      return out;
    }
  }
  const fn = MOCK_MAP[kind];
  return fn ? fn(project, lang) : { kind, lang, error: 'unsupported' };
}

// Generate a full set: every requested kind × every target language.
export async function generateSet(env, project, kinds, langs) {
  const useKinds = (kinds && kinds.length ? kinds : supportedKinds());
  const useLangs = (langs && langs.length ? langs : String(project.target_langs || 'zh,en').split(','))
    .map((s) => s.trim()).filter(Boolean);
  const out = [];
  for (const lang of useLangs) {
    for (const kind of useKinds) {
      // eslint-disable-next-line no-await-in-loop
      out.push(await generateOne(env, project, kind, lang));
    }
  }
  return out;
}

// Apply a template recipe over a project (the remix graph edge).
export async function generateFromTemplate(env, project, template, lang) {
  let recipe = {};
  try { recipe = JSON.parse(template.recipe || '{}'); } catch { /* ignore */ }
  const base = await generateOne(env, project, template.kind, lang);
  base.template_id = template.id;
  base.template_title = template.title;
  base.recipe_applied = recipe;
  return base;
}
