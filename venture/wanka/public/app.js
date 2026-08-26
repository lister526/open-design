// Wanka web SPA — vanilla JS, no build step. Hash router + el() DOM helper.
import { t, setLang, getLang, LANGS } from '/i18n.js';

// ---------- DOM helper ----------
function el(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (k === 'class') e.className = v;
    else if (k === 'html') e.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2), v);
    else if (v !== null && v !== undefined && v !== false) e.setAttribute(k, v);
  }
  for (const kid of kids.flat()) {
    if (kid === null || kid === undefined || kid === false) continue;
    e.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
  }
  return e;
}
const $ = (s) => document.querySelector(s);

// ---------- state + api ----------
const S = {
  token: localStorage.getItem('wk_token') || null,
  user: null,
  config: null,
  route: location.hash.slice(1) || '/',
};
function saveToken(t) { S.token = t; t ? localStorage.setItem('wk_token', t) : localStorage.removeItem('wk_token'); }

async function api(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (S.token) headers.Authorization = `Bearer ${S.token}`;
  const res = await fetch(`/api${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || `http_${res.status}`), { data, status: res.status });
  return data;
}

function toast(msg) {
  const t = el('div', { class: 'toast' }, msg);
  document.body.append(t);
  setTimeout(() => t.remove(), 2600);
}

// ---------- render root ----------
function nav() {
  const link = (href, key) => el('a', {
    class: 'navlink' + (S.route === href ? ' active' : ''), href: '#' + href,
  }, t(key));
  return el('nav', { class: 'top' },
    el('div', { class: 'container' },
      el('a', { class: 'brand', href: '#/' }, S.config?.brand || 'Wanka'),
      el('div', { class: 'row grow' },
        link('/studio', 'nav_studio'),
        link('/templates', 'nav_templates'),
        S.user?.role === 'creator' ? link('/creator', 'nav_creator') : null,
        link('/metrics', 'nav_metrics'),
      ),
      langSelect(),
      S.user
        ? el('div', { class: 'row' },
            el('span', { class: 'credits' }, `⚡ ${S.user.credits}`),
            el('button', { class: 'btn sm ghost', onclick: logout }, t('logout')))
        : el('a', { class: 'btn sm', href: '#/auth' }, t('login')),
    ));
}

function langSelect() {
  const sel = el('select', { style: 'width:auto;padding:6px 8px', onchange: (e) => { setLang(e.target.value); render(); } });
  for (const l of LANGS) sel.append(el('option', { value: l.code, selected: l.code === getLang() }, l.label));
  return sel;
}

function logout() { saveToken(null); S.user = null; go('/'); }
function go(r) { location.hash = r; }

// ---------- screens ----------
function homeScreen() {
  return el('div', {},
    // ---- HERO ----
    el('section', { class: 'hero container' },
      el('div', { class: 'hero-badge' }, t('hero_badge')),
      el('div', { class: 'eyebrow' }, t('hero_eyebrow')),
      el('h1', { html: t('hero_title') }),
      el('p', { class: 'sub' }, t('hero_sub')),
      el('div', { class: 'row center', style: 'justify-content:center' },
        el('a', { class: 'btn lg', href: '#/studio' }, t('hero_cta')),
        el('a', { class: 'btn ghost lg', href: '#/templates' }, t('hero_cta2'))),
      el('div', { class: 'stat' },
        stat(t('stat1_n'), t('stat1_l')),
        stat(t('stat2_n'), t('stat2_l')),
        stat(t('stat3_n'), t('stat3_l'))),
    ),

    // ---- SOCIAL PROOF strip ----
    el('section', { class: 'container proof' },
      el('div', { class: 'muted center', style: 'margin-bottom:14px;font-size:13px;letter-spacing:.5px;text-transform:uppercase' }, t('social_proof_title')),
      el('div', { class: 'grid g4' },
        stat(t('sp1_n'), t('sp1_l')),
        stat(t('sp2_n'), t('sp2_l')),
        stat(t('sp3_n'), t('sp3_l')),
        stat(t('sp4_n'), t('sp4_l')))),

    // ---- WHY (value props) ----
    el('section', { class: 'container', style: 'padding:20px 20px 20px' },
      el('div', { class: 'grid g3' },
        why('🎯', t('why1_t'), t('why1_d')),
        why('🌐', t('why2_t'), t('why2_d')),
        why('🔁', t('why3_t'), t('why3_d')))),

    // ---- HOW IT WORKS ----
    el('section', { class: 'container', style: 'padding:40px 20px 20px' },
      el('h2', { class: 'center', style: 'font-size:26px' }, t('how_title')),
      el('div', { class: 'grid g3', style: 'margin-top:20px' },
        why('📝', t('how1_t'), t('how1_d')),
        why('⚡', t('how2_t'), t('how2_d')),
        why('🚀', t('how3_t'), t('how3_d')))),

    // ---- TESTIMONIALS ----
    el('section', { class: 'container', style: 'padding:40px 20px 20px' },
      el('h2', { class: 'center', style: 'font-size:26px' }, t('testi_title')),
      el('div', { class: 'grid g3', style: 'margin-top:20px' },
        testimonial(t('testi1'), t('testi1_by')),
        testimonial(t('testi2'), t('testi2_by')),
        testimonial(t('testi3'), t('testi3_by')))),

    // ---- FAQ ----
    el('section', { class: 'container', style: 'padding:40px 20px 20px' },
      el('h2', { class: 'center', style: 'font-size:26px' }, t('faq_title')),
      el('div', { class: 'grid g2', style: 'margin-top:20px' },
        faqItem(t('faq1_q'), t('faq1_a')),
        faqItem(t('faq2_q'), t('faq2_a')),
        faqItem(t('faq3_q'), t('faq3_a')),
        faqItem(t('faq4_q'), t('faq4_a')))),

    // ---- FINAL CTA + viral share ----
    el('section', { class: 'container', style: 'padding:40px 20px 70px' },
      el('div', { class: 'cta-final' },
        el('h2', { style: 'font-size:28px;margin:0 0 8px' }, t('final_cta_title')),
        el('p', { class: 'muted', style: 'margin:0 0 20px' }, t('final_cta_sub')),
        el('div', { class: 'row center', style: 'justify-content:center' },
          el('a', { class: 'btn lg', href: '#/studio' }, t('final_cta_btn')),
          el('button', { class: 'btn ghost lg', onclick: shareSite }, '🔗 ' + t('share'))))),
  );
}
const stat = (n, l) => el('div', { class: 'center' }, el('div', { class: 'n' }, n), el('div', { class: 'muted' }, l));
const why = (icon, tt, dd) => el('div', { class: 'card' }, el('div', { style: 'font-size:28px' }, icon), el('h2', {}, tt), el('p', { class: 'muted' }, dd));
const testimonial = (quote, by) => el('div', { class: 'card' }, el('p', { style: 'font-size:15px;line-height:1.6' }, quote), el('div', { class: 'muted', style: 'margin-top:10px;font-size:13px' }, by));
const faqItem = (q, a) => el('div', { class: 'card' }, el('b', {}, q), el('p', { class: 'muted', style: 'margin:8px 0 0' }, a));

async function shareSite() {
  const url = location.origin + '/' + (S.user ? ('#/?ref=' + encodeURIComponent(S.user.email || '')) : '');
  const shareData = { title: 'Wanka 万卡 · AI 营销内容创作网络', text: t('invite_earn'), url };
  try {
    if (navigator.share) { await navigator.share(shareData); return; }
    await navigator.clipboard.writeText(url);
    toast(t('share_copied'));
  } catch (e) { try { await navigator.clipboard.writeText(url); toast(t('share_copied')); } catch { toast(url); } }
}

// ---- Studio: the single-player generation core ----
const studioState = { product: '', category: '3c', audience: '', selling: '', langs: ['zh', 'en'], kinds: ['ad_copy', 'video_script', 'image_brief', 'listing'], assets: [] };

function studioScreen() {
  if (!S.user) return authGate();
  const kindsAvail = S.config?.kinds || ['ad_copy', 'video_script', 'image_brief', 'listing'];
  const langsAvail = (S.config?.langs || ['zh', 'en', 'ja', 'es']).slice(0, 9);

  const toggle = (arr, v) => arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  const form = el('div', { class: 'card' },
    el('h2', {}, t('studio_title')),
    el('p', { class: 'muted' }, t('studio_sub')),
    el('label', {}, t('f_product')),
    el('input', { id: 'f_product', value: studioState.product, placeholder: t('f_product_ph') }),
    el('div', { class: 'grid g2' },
      el('div', {}, el('label', {}, t('f_category')),
        selectEl('f_category', [['3c', '3C'], ['home', t('cat_home')], ['beauty', t('cat_beauty')], ['apparel', t('cat_apparel')], ['other', t('cat_other')]], studioState.category)),
      el('div', {}, el('label', {}, t('f_audience')),
        el('input', { id: 'f_audience', value: studioState.audience, placeholder: t('f_audience_ph') }))),
    el('label', {}, t('f_selling')),
    el('textarea', { id: 'f_selling', placeholder: t('f_selling_ph') }, studioState.selling),
    el('label', {}, t('f_langs')),
    el('div', { class: 'row wrap' }, ...langsAvail.map((l) => pill(l.toUpperCase(), studioState.langs.includes(l), () => { studioState.langs = toggle(studioState.langs, l); render(); }))),
    el('label', {}, t('f_kinds')),
    el('div', { class: 'row wrap' }, ...kindsAvail.map((k) => pill(t('kind_' + k), studioState.kinds.includes(k), () => { studioState.kinds = toggle(studioState.kinds, k); render(); }))),
    el('div', { class: 'hr' }),
    el('div', { class: 'row spread wrap' },
      el('div', { class: 'muted' }, t('cost_note').replace('{n}', String(studioState.langs.length * studioState.kinds.length))),
      el('button', { class: 'btn', id: 'genbtn', onclick: doGenerate }, t('generate_btn'))),
  );

  const results = el('div', { class: 'grid', style: 'margin-top:16px' }, ...studioState.assets.map(renderAsset));
  return el('div', { class: 'container', style: 'padding:24px 20px 60px' }, el('div', { class: 'grid', style: 'gap:16px' }, form, results));
}

function pill(label, on, onclick) { return el('button', { class: 'pill' + (on ? ' on' : ''), onclick }, label); }
function selectEl(id, opts, cur) {
  const s = el('select', { id });
  for (const [v, l] of opts) s.append(el('option', { value: v, selected: v === cur }, l));
  return s;
}

async function doGenerate() {
  studioState.product = $('#f_product').value.trim();
  studioState.category = $('#f_category').value;
  studioState.audience = $('#f_audience').value.trim();
  studioState.selling = $('#f_selling').value.trim();
  if (!studioState.product) return toast(t('need_product'));
  if (!studioState.kinds.length || !studioState.langs.length) return toast(t('need_kind_lang'));
  const btn = $('#genbtn'); btn.disabled = true; btn.textContent = t('generating');
  try {
    const r = await api('/generate', { method: 'POST', body: {
      product: studioState.product, title: studioState.product, category: studioState.category,
      audience: studioState.audience, selling_pts: studioState.selling,
      kinds: studioState.kinds, langs: studioState.langs,
    } });
    studioState.assets = r.assets;
    if (S.user) S.user.credits = r.credits;
    toast(t('done'));
    render();
  } catch (e) {
    if (e.status === 402) { toast(t('no_credit')); go('/pricing'); }
    else toast(e.message);
  } finally { btn.disabled = false; btn.textContent = t('generate_btn'); }
}

function renderAsset(a) {
  const head = el('div', { class: 'row spread' },
    el('div', { class: 'row' }, el('span', { class: 'tag' }, t('kind_' + a.kind)), el('span', { class: 'tag' }, a.lang.toUpperCase())),
    a._fallback ? el('span', { class: 'tag', title: a._fallback }, 'mock') : el('span', { class: 'badge' }, 'AI'));
  let body;
  if (a.kind === 'ad_copy') body = el('div', { class: 'asset' }, el('h2', {}, a.headline), el('div', {}, a.body), el('div', { class: 'muted', style: 'margin-top:6px' }, a.cta));
  else if (a.kind === 'video_script') body = el('div', {}, ...(a.beats || []).map((b) => el('div', { class: 'beat' }, el('b', {}, b.t), el('span', { class: 'muted' }, b.label), el('span', {}, b.line))));
  else if (a.kind === 'image_brief') body = el('div', { class: 'asset' }, el('div', { class: 'kv' }, el('b', {}, t('layout') + ':'), a.layout), el('div', { class: 'mono card2', style: 'margin-top:8px' }, a.prompt), (a.badges || []).length ? el('div', { class: 'row wrap', style: 'margin-top:8px' }, ...a.badges.map((x) => el('span', { class: 'pill' }, x))) : null);
  else if (a.kind === 'listing') body = el('div', { class: 'asset' }, el('b', {}, a.title), el('ul', {}, ...(a.bullets || []).map((x) => el('li', {}, x))), el('div', { class: 'muted' }, (a.keywords || []).join(' · ')));
  else body = el('pre', { class: 'mono' }, JSON.stringify(a, null, 2));
  return el('div', { class: 'card' }, head, el('div', { style: 'margin-top:10px' }, body));
}

// ---- Templates: the network layer ----
const tplState = { list: [], kind: '' };
async function templatesScreen() {
  loadTemplates();
  const filterBar = el('div', { class: 'row wrap', style: 'margin-bottom:14px' },
    ...['', 'ad_copy', 'video_script', 'image_brief', 'listing'].map((k) => pill(k ? t('kind_' + k) : t('all'), tplState.kind === k, () => { tplState.kind = k; loadTemplates(); })));
  const grid = el('div', { class: 'grid g2', id: 'tplgrid' }, ...(tplState.list.map(renderTpl)));
  return el('div', { class: 'container', style: 'padding:24px 20px 60px' },
    el('h2', {}, t('nav_templates')), el('p', { class: 'muted' }, t('templates_sub')), filterBar, grid);
}
async function loadTemplates() {
  try {
    const q = tplState.kind ? `?kind=${tplState.kind}` : '';
    const r = await api('/templates' + q);
    tplState.list = r.templates;
    const g = $('#tplgrid'); if (g) { g.innerHTML = ''; tplState.list.map(renderTpl).forEach((n) => g.append(n)); }
  } catch (e) { /* ignore */ }
}
function renderTpl(tp) {
  return el('div', { class: 'card' },
    el('div', { class: 'row spread' }, el('b', {}, tp.title), el('span', { class: 'tag' }, t('kind_' + tp.kind))),
    el('p', { class: 'muted' }, tp.preview || ''),
    el('div', { class: 'row spread', style: 'margin-top:8px' },
      el('span', { class: 'muted' }, `🔥 ${tp.uses} · 🏆 ${tp.wins}`),
      el('button', { class: 'btn sm', onclick: () => useTemplate(tp) }, t('use_template'))));
}
async function useTemplate(tp) {
  if (!S.user) return go('/auth');
  const product = prompt(t('prompt_product'));
  if (!product) return;
  try {
    const r = await api(`/templates/${tp.id}/use`, { method: 'POST', body: { product, title: product, lang: getLang() } });
    studioState.assets = [r.asset];
    toast(t('done')); go('/studio'); render();
  } catch (e) { if (e.status === 402) { toast(t('no_credit')); go('/pricing'); } else toast(e.message); }
}

// ---- Creator dashboard ----
async function creatorScreen() {
  if (!S.user) return authGate();
  let data = { total_cents: 0, count: 0, templates: [] };
  try { data = await api('/creator/earnings'); } catch (e) {}
  return el('div', { class: 'container', style: 'padding:24px 20px 60px' },
    el('h2', {}, t('nav_creator')),
    el('div', { class: 'grid g3' },
      stat('¥' + (data.total_cents / 100).toFixed(2), t('creator_earnings')),
      stat(String(data.templates.length), t('creator_templates')),
      stat(String(data.templates.reduce((s, x) => s + x.wins, 0)), t('creator_wins'))),
    el('div', { class: 'hr' }),
    el('p', { class: 'muted' }, t('creator_hint')),
    el('div', { class: 'grid g2' }, ...data.templates.map((tp) => el('div', { class: 'card' }, el('b', {}, tp.title), el('div', { class: 'muted' }, `🔥 ${tp.uses} · 🏆 ${tp.wins}`)))));
}

// ---- Metrics (North-Star) ----
async function metricsScreen() {
  let m = {};
  try { m = await api('/metrics'); } catch (e) {}
  return el('div', { class: 'container', style: 'padding:24px 20px 60px' },
    el('h2', {}, t('metrics_title')), el('p', { class: 'muted' }, t('metrics_sub')),
    el('div', { class: 'grid g3' },
      stat(String(m.north_star_published_assets ?? 0), t('m_northstar')),
      stat(String(m.generations ?? 0), t('m_gen')),
      stat(String(m.users ?? 0), t('m_users')),
      stat(String(m.templates ?? 0), t('m_templates')),
      stat(String(m.reported_wins ?? 0), t('m_wins'))));
}

// ---- Pricing ----
function pricingScreen() {
  const plan = (id, price, credits, feats) => el('div', { class: 'card' },
    el('h2', {}, t('plan_' + id)), el('div', { class: 'n', style: 'font-size:28px' }, price),
    el('p', { class: 'muted' }, `⚡ ${credits} ${t('credits_mo')}`),
    el('ul', {}, ...feats.map((f) => el('li', {}, f))),
    el('button', { class: 'btn', onclick: () => checkout(id) }, t('choose')));
  return el('div', { class: 'container', style: 'padding:24px 20px 60px' },
    el('h2', {}, t('pricing_title')),
    el('div', { class: 'grid g3' },
      plan('starter', '¥39/mo', 300, [t('feat_watermark'), t('feat_alltpl'), '3 ' + t('langs')]),
      plan('pro', '¥99/mo', 1500, [t('feat_batch'), '8 ' + t('langs'), t('feat_adhook')]),
      plan('team', '¥299/mo', 5000, [t('feat_seats'), t('feat_api'), t('feat_brand')])));
}
async function checkout(plan) {
  if (!S.user) return go('/auth');
  try { const r = await api('/billing/checkout', { method: 'POST', body: { plan } }); S.user.plan = r.plan; S.user.credits = r.credits; toast(t('upgraded')); go('/studio'); }
  catch (e) { toast(e.message); }
}

// ---- Auth ----
const authState = { mode: 'register', role: 'merchant' };
function authScreen() {
  const submit = async () => {
    const email = $('#a_email').value.trim(); const pw = $('#a_pw').value;
    if (!email || !pw) return toast(t('need_email_pw'));
    try {
      const r = await api(`/auth/${authState.mode}`, { method: 'POST', body: { email, password: pw, role: authState.role, lang: getLang() } });
      saveToken(r.token); S.user = r.user; toast(t('welcome')); go('/studio');
    } catch (e) { toast(t('auth_' + e.message) || e.message); }
  };
  return el('div', { class: 'container', style: 'max-width:440px;padding:40px 20px' },
    el('div', { class: 'card' },
      el('div', { class: 'row' },
        pill(t('register'), authState.mode === 'register', () => { authState.mode = 'register'; render(); }),
        pill(t('login'), authState.mode === 'login', () => { authState.mode = 'login'; render(); })),
      authState.mode === 'register' ? el('div', { class: 'row', style: 'margin-top:10px' },
        pill(t('role_merchant'), authState.role === 'merchant', () => { authState.role = 'merchant'; render(); }),
        pill(t('role_creator'), authState.role === 'creator', () => { authState.role = 'creator'; render(); })) : null,
      el('label', {}, 'Email'), el('input', { id: 'a_email', type: 'email', placeholder: 'you@shop.com' }),
      el('label', {}, t('password')), el('input', { id: 'a_pw', type: 'password', placeholder: '••••••••' }),
      el('button', { class: 'btn', style: 'margin-top:14px;width:100%', onclick: submit }, authState.mode === 'register' ? t('register') : t('login'))));
}
function authGate() { return el('div', { class: 'container', style: 'padding:60px 20px', }, el('div', { class: 'card center' }, el('h2', {}, t('need_login')), el('a', { class: 'btn', href: '#/auth' }, t('login')))); }

// ---------- router ----------
const ROUTES = {
  '/': homeScreen, '/studio': studioScreen, '/templates': templatesScreen,
  '/creator': creatorScreen, '/metrics': metricsScreen, '/pricing': pricingScreen, '/auth': authScreen,
};

async function render() {
  const app = $('#app'); if (!app) return;
  app.innerHTML = '';
  app.append(nav());
  const view = ROUTES[S.route] || homeScreen;
  const node = await view();
  app.append(node);
  document.documentElement.dir = ['ar'].includes(getLang()) ? 'rtl' : 'ltr';
}

async function boot() {
  try { S.config = await api('/config'); } catch (e) { S.config = { brand: 'Wanka' }; }
  if (S.token) { try { const r = await api('/me'); S.user = r.user; } catch { saveToken(null); } }
  window.addEventListener('hashchange', () => { S.route = location.hash.slice(1) || '/'; render(); });
  render();
}
boot();
