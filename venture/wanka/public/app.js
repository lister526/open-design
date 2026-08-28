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
      el('a', { class: 'brand', href: '#/' },
        el('span', { class: 'logo' }, 'W'),
        el('span', {}, S.config?.brand || 'Wanka')),
      el('div', { class: 'row grow nav-links', style: 'gap:22px' },
        link('/studio', 'nav_studio'),
        link('/templates', 'nav_templates'),
        S.user?.role === 'creator' ? link('/creator', 'nav_creator') : null,
        link('/pricing', 'nav_pricing'),
        link('/metrics', 'nav_metrics'),
      ),
      langSelect(),
      S.user
        ? el('div', { class: 'row nav-links' },
            el('span', { class: 'credits' }, `⚡ ${S.user.credits}`),
            el('button', { class: 'btn sm ghost', onclick: logout }, t('logout')))
        : el('a', { class: 'btn sm nav-links', href: '#/auth' }, t('cta_signup') || t('login')),
      el('button', { class: 'nav-burger', onclick: toggleMobileNav }, '☰'),
    ));
}

function toggleMobileNav() {
  // simple mobile drawer: reveal a stacked menu overlay
  let m = document.querySelector('.mnav');
  if (m) { m.remove(); return; }
  const link = (href, key) => el('a', { class: 'navlink', href: '#' + href, onclick: () => setTimeout(toggleMobileNav, 0) }, t(key));
  m = el('div', { class: 'mnav', style: 'position:fixed;inset:66px 0 auto 0;z-index:39;background:var(--bg-2);border-bottom:1px solid var(--line);padding:18px 24px;display:grid;gap:16px;box-shadow:var(--sh-lg)' },
    link('/studio', 'nav_studio'), link('/templates', 'nav_templates'),
    link('/pricing', 'nav_pricing'), link('/metrics', 'nav_metrics'),
    S.user ? el('button', { class: 'btn ghost', onclick: () => { toggleMobileNav(); logout(); } }, t('logout'))
           : el('a', { class: 'btn', href: '#/auth', onclick: () => setTimeout(toggleMobileNav, 0) }, t('cta_signup') || t('login')));
  document.body.append(m);
}

function langSelect() {
  const sel = el('select', { class: 'nav-select nav-links', onchange: (e) => { setLang(e.target.value); render(); } });
  for (const l of LANGS) sel.append(el('option', { value: l.code, selected: l.code === getLang() }, l.label));
  return sel;
}

function logout() { saveToken(null); S.user = null; go('/'); }
function go(r) { location.hash = r; }

// ---------- screens ----------
function homeScreen() {
  const view = el('div', {},
    // ---- HERO ----
    el('section', { class: 'hero container' },
      el('div', { class: 'hero-badge' }, el('span', { class: 'dot' }), t('hero_badge')),
      el('div', { class: 'eyebrow' }, t('hero_eyebrow')),
      el('h1', { html: t('hero_title') }),
      el('p', { class: 'sub' }, t('hero_sub')),
      el('div', { class: 'hero-cta' },
        el('a', { class: 'btn lg', href: '#/studio' }, t('hero_cta'), el('span', {}, '→')),
        el('a', { class: 'btn ghost lg', href: '#/templates' }, t('hero_cta2'))),
      el('div', { class: 'hero-note' }, t('hero_note')),
      heroPreview(),
      el('div', { class: 'stat' },
        statItem(t('stat1_n'), t('stat1_l')),
        statItem(t('stat2_n'), t('stat2_l')),
        statItem(t('stat3_n'), t('stat3_l'))),
    ),

    // ---- LOGO MARQUEE (social proof) ----
    el('section', { class: 'container', style: 'padding:30px 0' },
      el('div', { class: 'muted center', style: 'margin-bottom:20px;font-size:13px;letter-spacing:.14em;text-transform:uppercase' }, t('social_proof_title')),
      marquee(['TikTok Shop', 'Amazon', 'Shopify', 'Meta Ads', '独立站 DTC', 'Temu', '速卖通', 'Lazada', 'Shopee'])),

    // ---- SOCIAL PROOF stats ----
    el('section', { class: 'container', style: 'padding:20px 0 10px' },
      el('div', { class: 'grid g4 keep2 reveal' },
        proofStat(t('sp1_n'), t('sp1_l')),
        proofStat(t('sp2_n'), t('sp2_l')),
        proofStat(t('sp3_n'), t('sp3_l')),
        proofStat(t('sp4_n'), t('sp4_l')))),

    // ---- WHY (value props, bento) ----
    el('section', { class: 'section container' },
      sectionHead(t('why_title') || 'Why Wanka', t('why_sub') || ''),
      el('div', { class: 'grid g3 reveal' },
        feature('🎯', t('why1_t'), t('why1_d')),
        feature('🌐', t('why2_t'), t('why2_d')),
        feature('🔁', t('why3_t'), t('why3_d')))),

    // ---- HOW IT WORKS ----
    el('section', { class: 'section container' },
      sectionHead(t('how_title'), t('how_sub') || ''),
      el('div', { class: 'grid g3 steps reveal' },
        step(1, t('how1_t'), t('how1_d')),
        step(2, t('how2_t'), t('how2_d')),
        step(3, t('how3_t'), t('how3_d')))),

    // ---- TESTIMONIALS ----
    el('section', { class: 'section container' },
      sectionHead(t('testi_title'), t('testi_sub') || ''),
      el('div', { class: 'grid g3 reveal' },
        testimonial(t('testi1'), t('testi1_by')),
        testimonial(t('testi2'), t('testi2_by')),
        testimonial(t('testi3'), t('testi3_by')))),

    // ---- PRICING preview ----
    el('section', { class: 'section container' },
      sectionHead(t('pricing_title'), t('pricing_sub') || ''),
      pricingGrid()),

    // ---- FAQ ----
    el('section', { class: 'section container' },
      sectionHead(t('faq_title'), ''),
      el('div', { class: 'grid g2 reveal' },
        faqItem(t('faq1_q'), t('faq1_a')),
        faqItem(t('faq2_q'), t('faq2_a')),
        faqItem(t('faq3_q'), t('faq3_a')),
        faqItem(t('faq4_q'), t('faq4_a')))),

    // ---- FINAL CTA ----
    el('section', { class: 'container', style: 'padding:20px 0 70px' },
      el('div', { class: 'cta-final reveal' },
        el('h2', { style: 'font-size:clamp(28px,4vw,40px)' }, t('final_cta_title')),
        el('p', { class: 'muted', style: 'margin:0 auto 24px;max-width:520px;font-size:17px' }, t('final_cta_sub')),
        el('div', { class: 'hero-cta' },
          el('a', { class: 'btn lg', href: '#/studio' }, t('final_cta_btn'), el('span', {}, '→')),
          el('button', { class: 'btn ghost lg', onclick: shareSite }, '🔗 ' + t('share'))))),

    footer(),
  );
  queueMicrotask(setupReveal);
  return view;
}

// ---- home building blocks ----
const statItem = (n, l) => el('div', { class: 'item' }, el('div', { class: 'n' }, n), el('div', { class: 'l' }, l));
const proofStat = (n, l) => el('div', { class: 'card center' }, el('div', { class: 'n', style: 'font-size:clamp(24px,3vw,34px);font-weight:800;background:var(--grad-text);-webkit-background-clip:text;background-clip:text;color:transparent' }, n), el('div', { class: 'muted', style: 'margin-top:4px;font-size:14px' }, l));
const sectionHead = (title, sub) => el('div', { class: 'section-head' }, el('h2', {}, title), sub ? el('p', {}, sub) : null);
const feature = (icon, tt, dd) => el('div', { class: 'card feature glow' }, el('div', { class: 'card-icon' }, icon), el('h3', {}, tt), el('p', { class: 'muted', style: 'margin:0' }, dd));
const step = (n, tt, dd) => el('div', { class: 'card' }, el('div', { class: 'step-num' }, String(n)), el('h3', {}, tt), el('p', { class: 'muted', style: 'margin:0' }, dd));

function testimonial(quote, by) {
  const initial = (by || '·').replace(/^[—\-\s]+/, '').charAt(0).toUpperCase();
  return el('div', { class: 'card testi' },
    el('div', { class: 'stars' }, '★★★★★'),
    el('p', { class: 'quote' }, quote),
    el('div', { class: 'who' }, el('div', { class: 'avatar' }, initial), el('div', { class: 'muted', style: 'font-size:13px' }, by)));
}
const faqItem = (q, a) => el('div', { class: 'card faq-item' }, el('h3', {}, el('span', { class: 'q' }, 'Q'), q), el('p', { class: 'muted', style: 'margin:8px 0 0;padding-left:22px' }, a));

function marquee(items) {
  const track = el('div', { class: 'track' }, ...items.map((x) => el('span', {}, x)), ...items.map((x) => el('span', {}, x)));
  return el('div', { class: 'marquee' }, track);
}

function heroPreview() {
  const mock = (kind, glow) => el('div', { class: 'mock-asset' },
    el('div', { class: 'mh' }, el('span', { class: 'tag' }, kind), el('span', { class: 'badge' }, 'AI')),
    glow ? el('div', { class: 'glowbar' }) : null,
    el('div', { class: 'mock-line w90' }), el('div', { class: 'mock-line w70' }), el('div', { class: 'mock-line w50' }));
  return el('div', { class: 'hero-preview reveal' },
    el('div', { class: 'bar' }, el('i', {}), el('i', {}), el('i', {}), el('span', { class: 'muted', style: 'font-size:12px;margin-left:8px' }, 'wanka.app / studio')),
    el('div', { class: 'body' },
      mock(t('kind_ad_copy'), true), mock(t('kind_video_script'), false),
      mock(t('kind_image_brief'), false), mock(t('kind_listing'), true)));
}

function pricingGrid() {
  const plan = (id, price, per, credits, feats, popular) => el('div', { class: 'card price-card' + (popular ? ' popular' : '') },
    popular ? el('div', { class: 'ribbon' }, t('most_popular') || '最受欢迎') : null,
    el('h3', {}, t('plan_' + id)),
    el('div', { class: 'price' }, price, el('small', {}, per)),
    el('p', { class: 'muted', style: 'margin:0' }, `⚡ ${credits} ${t('credits_mo')}`),
    el('ul', {}, ...feats.map((f) => el('li', {}, f))),
    el('a', { class: 'btn' + (popular ? '' : ' ghost'), href: '#/pricing' }, t('choose')));
  return el('div', { class: 'grid g3 reveal' },
    plan('starter', '¥39', '/mo', 300, [t('feat_watermark'), t('feat_alltpl'), '3 ' + t('langs')], false),
    plan('pro', '¥99', '/mo', 1500, [t('feat_batch'), '9 ' + t('langs'), t('feat_adhook')], true),
    plan('team', '¥299', '/mo', 5000, [t('feat_seats'), t('feat_api'), t('feat_brand')], false));
}

function footer() {
  const col = (title, links) => el('div', {}, el('h4', {}, title), ...links.map(([l, h]) => el('a', { href: h || '#/' }, l)));
  return el('footer', { class: 'foot' },
    el('div', { class: 'container' },
      el('div', { class: 'cols' },
        el('div', {},
          el('a', { class: 'brand', href: '#/', style: 'margin-bottom:12px' }, el('span', { class: 'logo' }, 'W'), el('span', {}, S.config?.brand || 'Wanka')),
          el('p', { class: 'muted', style: 'max-width:280px;font-size:14px' }, t('footer_tagline') || t('hero_sub'))),
        col(t('footer_product') || '产品', [[t('nav_studio'), '#/studio'], [t('nav_templates'), '#/templates'], [t('pricing_title'), '#/pricing'], [t('metrics_title'), '#/metrics']]),
        col(t('footer_company') || '公司', [[t('footer_about') || '关于', '#/'], [t('footer_blog') || '博客', '#/'], [t('footer_contact') || '联系', '#/']]),
        col(t('footer_legal') || '法务', [[t('footer_privacy') || '隐私政策', '#/'], [t('footer_terms') || '服务条款', '#/']])),
      el('div', { class: 'fbottom' },
        el('span', {}, `© ${new Date().getFullYear()} ${S.config?.brand || 'Wanka'} · ${t('footer_rights') || 'All rights reserved.'}`),
        el('span', { class: 'faint' }, t('footer_made') || 'Made for global sellers'))));
}

// reveal-on-scroll
function setupReveal() {
  const els = document.querySelectorAll('.reveal:not(.in)');
  if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('in')); return; }
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
  }, { threshold: 0.12 });
  els.forEach((e) => io.observe(e));
}

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

function pageHead(eyebrow, title, sub) {
  return el('div', { class: 'page-head reveal' },
    eyebrow ? el('span', { class: 'eyebrow' }, eyebrow) : null,
    el('h1', {}, title),
    sub ? el('p', {}, sub) : null);
}
function stat(n, l) { return el('div', { class: 'statcard reveal' }, el('div', { class: 'sc-n' }, n), el('div', { class: 'sc-l' }, l)); }
function emptyState(ico, msg) { return el('div', { class: 'empty' }, el('div', { class: 'ico' }, ico), el('div', {}, msg)); }

function studioScreen() {
  if (!S.user) return authGate();
  const kindsAvail = S.config?.kinds || ['ad_copy', 'video_script', 'image_brief', 'listing'];
  const langsAvail = (S.config?.langs || ['zh', 'en', 'ja', 'es']).slice(0, 9);

  const toggle = (arr, v) => arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
  const cost = studioState.langs.length * studioState.kinds.length;

  const form = el('div', { class: 'card form-col' },
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
    el('div', { class: 'seg' }, ...langsAvail.map((l) => pill(l.toUpperCase(), studioState.langs.includes(l), () => { studioState.langs = toggle(studioState.langs, l); render(); }))),
    el('label', {}, t('f_kinds')),
    el('div', { class: 'seg' }, ...kindsAvail.map((k) => pill(t('kind_' + k), studioState.kinds.includes(k), () => { studioState.kinds = toggle(studioState.kinds, k); render(); }))),
    el('div', { class: 'hr' }),
    el('div', { class: 'row spread wrap', style: 'gap:12px' },
      el('span', { class: 'cost-chip' }, '⚡ ' + t('cost_note').replace('{n}', String(cost || 0))),
      el('button', { class: 'btn lg', id: 'genbtn', onclick: doGenerate }, t('generate_btn') + ' →')),
  );

  const results = studioState.assets.length
    ? el('div', { class: 'grid', style: 'gap:16px' }, ...studioState.assets.map(renderAsset))
    : el('div', { class: 'card' }, emptyState('✨', t('studio_empty') || t('studio_sub')));

  return el('div', { class: 'container page' },
    pageHead(t('nav_studio'), t('studio_title'), t('studio_sub')),
    el('div', { class: 'studio-grid' }, form, results));
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
    queueMicrotask(setupReveal);
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
  return el('div', { class: 'card reveal' }, head, el('div', { style: 'margin-top:12px' }, body));
}

// ---- Templates: the network layer ----
const tplState = { list: [], kind: '', loaded: false };
async function templatesScreen() {
  loadTemplates();
  const filterBar = el('div', { class: 'seg', style: 'margin-bottom:20px' },
    ...['', 'ad_copy', 'video_script', 'image_brief', 'listing'].map((k) => pill(k ? t('kind_' + k) : t('all'), tplState.kind === k, () => { tplState.kind = k; loadTemplates(); })));
  const grid = el('div', { class: 'grid g3', id: 'tplgrid' },
    ...(tplState.list.length ? tplState.list.map(renderTpl)
      : [el('div', { class: 'card' }, emptyState(tplState.loaded ? '🗂️' : '⏳', tplState.loaded ? (t('templates_empty') || '—') : t('loading') || '…'))]));
  return el('div', { class: 'container page' },
    pageHead(t('nav_templates'), t('nav_templates'), t('templates_sub')), filterBar, grid);
}
async function loadTemplates() {
  try {
    const q = tplState.kind ? `?kind=${tplState.kind}` : '';
    const r = await api('/templates' + q);
    tplState.list = r.templates; tplState.loaded = true;
    const g = $('#tplgrid');
    if (g) {
      g.innerHTML = '';
      const nodes = tplState.list.length ? tplState.list.map(renderTpl) : [el('div', { class: 'card' }, emptyState('🗂️', t('templates_empty') || '—'))];
      nodes.forEach((n) => g.append(n));
      queueMicrotask(setupReveal);
    }
  } catch (e) { /* ignore */ }
}
function renderTpl(tp) {
  return el('div', { class: 'card reveal glow' },
    el('div', { class: 'row spread', style: 'align-items:flex-start;gap:10px' },
      el('b', { style: 'font-size:16px;letter-spacing:-.01em' }, tp.title),
      el('span', { class: 'tag' }, t('kind_' + tp.kind))),
    el('p', { class: 'muted', style: 'margin:8px 0 14px;min-height:38px' }, tp.preview || ''),
    el('div', { class: 'row spread', style: 'align-items:center' },
      el('span', { class: 'tpl-stat' }, `🔥 ${tp.uses} · 🏆 ${tp.wins}`),
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
  const tpls = data.templates || [];
  const node = el('div', { class: 'container page' },
    pageHead(t('nav_creator'), t('nav_creator'), t('creator_hint')),
    el('div', { class: 'grid g3', style: 'margin-bottom:26px' },
      stat('¥' + ((data.total_cents || 0) / 100).toFixed(2), t('creator_earnings')),
      stat(String(tpls.length), t('creator_templates')),
      stat(String(tpls.reduce((s, x) => s + x.wins, 0)), t('creator_wins'))),
    tpls.length
      ? el('div', { class: 'grid g2' }, ...tpls.map((tp) => el('div', { class: 'card reveal' },
          el('div', { class: 'row spread' }, el('b', {}, tp.title), el('span', { class: 'tag' }, t('kind_' + tp.kind))),
          el('div', { class: 'tpl-stat', style: 'margin-top:8px' }, `🔥 ${tp.uses} · 🏆 ${tp.wins}`))))
      : el('div', { class: 'card' }, emptyState('🎨', t('creator_empty') || t('creator_hint'))));
  queueMicrotask(setupReveal);
  return node;
}

// ---- Metrics (North-Star) ----
async function metricsScreen() {
  let m = {};
  try { m = await api('/metrics'); } catch (e) {}
  const node = el('div', { class: 'container page' },
    pageHead(t('metrics_title'), t('metrics_title'), t('metrics_sub')),
    el('div', { class: 'grid g3' },
      stat(fmtNum(m.north_star_published_assets ?? 0), t('m_northstar')),
      stat(fmtNum(m.generations ?? 0), t('m_gen')),
      stat(fmtNum(m.users ?? 0), t('m_users')),
      stat(fmtNum(m.templates ?? 0), t('m_templates')),
      stat(fmtNum(m.reported_wins ?? 0), t('m_wins'))));
  queueMicrotask(setupReveal);
  return node;
}
function fmtNum(n) { return Number(n || 0).toLocaleString(); }

// ---- Pricing ----
function pricingScreen() {
  const plan = (id, price, per, credits, feats, popular) => el('div', { class: 'card reveal' + (popular ? ' glow' : ''), style: popular ? 'border-color:var(--brand)' : '' },
    popular ? el('span', { class: 'ribbon' }, t('most_popular')) : null,
    el('h2', { style: 'margin:0' }, t('plan_' + id)),
    el('div', { class: 'plan-price' }, price, el('span', { class: 'per' }, per)),
    el('p', { class: 'muted', style: 'margin:0' }, `⚡ ${credits} ${t('credits_mo')}`),
    el('ul', { class: 'plan-list' }, ...feats.map((f) => el('li', {}, f))),
    el('button', { class: 'btn' + (popular ? '' : ' ghost'), style: 'width:100%', onclick: () => checkout(id) }, t('choose')));
  const node = el('div', { class: 'container page' },
    pageHead(t('nav_pricing'), t('pricing_title'), t('pricing_sub')),
    el('div', { class: 'grid g3' },
      plan('starter', '¥39', '/mo', 300, [t('feat_watermark'), t('feat_alltpl'), '3 ' + t('langs')], false),
      plan('pro', '¥99', '/mo', 1500, [t('feat_batch'), '8 ' + t('langs'), t('feat_adhook')], true),
      plan('team', '¥299', '/mo', 5000, [t('feat_seats'), t('feat_api'), t('feat_brand')], false)));
  queueMicrotask(setupReveal);
  return node;
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
  const onEnter = (e) => { if (e.key === 'Enter') submit(); };
  return el('div', { class: 'auth-wrap' },
    el('div', { class: 'card' },
      el('div', { style: 'text-align:center;margin-bottom:18px' },
        el('div', { class: 'brand', style: 'justify-content:center;font-size:24px' }, el('span', { class: 'logo' }, 'W'), 'Wanka'),
        el('p', { class: 'muted', style: 'margin:8px 0 0' }, authState.mode === 'register' ? (t('auth_join') || t('cta_signup')) : t('login'))),
      el('div', { class: 'auth-toggle' },
        pill(t('register'), authState.mode === 'register', () => { authState.mode = 'register'; render(); }),
        pill(t('login'), authState.mode === 'login', () => { authState.mode = 'login'; render(); })),
      authState.mode === 'register' ? el('div', {}, el('label', {}, t('role_merchant') + ' / ' + t('role_creator')),
        el('div', { class: 'seg' },
          pill(t('role_merchant'), authState.role === 'merchant', () => { authState.role = 'merchant'; render(); }),
          pill(t('role_creator'), authState.role === 'creator', () => { authState.role = 'creator'; render(); }))) : null,
      el('label', {}, 'Email'), el('input', { id: 'a_email', type: 'email', placeholder: 'you@shop.com', onkeydown: onEnter }),
      el('label', {}, t('password')), el('input', { id: 'a_pw', type: 'password', placeholder: '••••••••', onkeydown: onEnter }),
      el('button', { class: 'btn lg', style: 'margin-top:18px;width:100%', onclick: submit }, authState.mode === 'register' ? t('register') : t('login')),
      el('p', { class: 'helper', style: 'text-align:center' }, t('hero_note'))));
}
function authGate() { return el('div', { class: 'container page' }, el('div', { class: 'card', style: 'max-width:440px;margin:40px auto' }, emptyState('🔒', t('need_login')), el('div', { style: 'text-align:center' }, el('a', { class: 'btn', href: '#/auth' }, t('login') + ' →')))); }

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
