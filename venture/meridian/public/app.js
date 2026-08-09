// 子午·合盘 (Meridian Sync) — vanilla JS SPA, no build step. Talks to the Hono/D1 backend.
// Product: 东方合盘 / 缘分洞察 — 看懂你俩的缘分。
// i18n: 8 locales, real-time switching, culturally adapted copy. See i18n.js.

import { I18N, LOCALES, PRICES } from './i18n.js';

const API = {
  token: localStorage.getItem('mrd_token') || null,
  async call(path, { method = 'GET', body } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) headers.Authorization = `Bearer ${this.token}`;
    const res = await fetch(`/api${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(data.message || data.error || '请求失败'), { status: res.status, data });
    return data;
  },
  setToken(t) { this.token = t; if (t) localStorage.setItem('mrd_token', t); else localStorage.removeItem('mrd_token'); },
};

const state = { user: null, lang: localStorage.getItem('mrd_lang') || 'zh', lastPreview: null, lastForm: null, reports: [], sending: false };

const el = (tag, attrs = {}, ...kids) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') n.className = v;
    else if (k === 'html') n.innerHTML = v;
    else if (k.startsWith('on')) n.addEventListener(k.slice(2).toLowerCase(), v);
    else if (v !== null && v !== undefined) n.setAttribute(k, v);
  }
  for (const kid of kids.flat()) { if (kid == null) continue; n.append(kid.nodeType ? kid : document.createTextNode(kid)); }
  return n;
};
const $ = (s) => document.querySelector(s);
const app = () => document.getElementById('app');

function toast(msg) {
  const t = el('div', { class: 'toast' }, msg);
  document.body.append(t);
  setTimeout(() => t.classList.add('in'), 10);
  setTimeout(() => { t.classList.remove('in'); setTimeout(() => t.remove(), 300); }, 3400);
}
function esc(s) { return String(s == null ? '' : s).replace(/[&<>]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m])); }

// ---- i18n (dictionaries live in ./i18n.js; 8 locales, real-time switch) ----
function t(k, vars) {
  let s = (I18N[state.lang] && I18N[state.lang][k]) || (I18N.zh[k]) || k;
  if (vars) for (const [kk, vv] of Object.entries(vars)) s = String(s).split(`{${kk}}`).join(vv);
  return s;
}
function localeMeta(code) { return LOCALES.find((l) => l.code === code) || LOCALES[0]; }
function prices() { return PRICES[state.lang] || PRICES.zh; }
function applyDir() {
  const m = localeMeta(state.lang);
  document.documentElement.lang = m.htmlLang;
  document.documentElement.dir = m.dir;
}
function setLang(l) {
  if (!I18N[l]) return;
  state.lang = l;
  localStorage.setItem('mrd_lang', l);
  applyDir();
  render();
}
// Sanitize a possibly-stale stored lang, then set <html lang/dir> on first paint.
if (!I18N[state.lang]) state.lang = 'zh';
applyDir();

const REL_TYPES = ['romance', 'crush', 'reunion', 'marriage', 'friendship'];
const REL_LABELS = () => ({ romance: t('rel_romance'), crush: t('rel_crush'), reunion: t('rel_reunion'), marriage: t('rel_marriage'), friendship: t('rel_friendship') });

// ---- router ----
const routes = {};
function route(name, fn) { routes[name] = fn; }
function go(name) { location.hash = name; }
window.addEventListener('hashchange', render);

// ---- nav ----
// 8-language switcher: a compact button that opens a dropdown of native names.
// Real-time — setLang() re-renders instantly and flips <html dir> for RTL locales.
function langSwitcher() {
  const cur = localeMeta(state.lang);
  const menu = el('div', { class: 'lang-menu' },
    ...LOCALES.map((lc) => el('button', {
      class: 'lang-opt' + (lc.code === state.lang ? ' on' : ''),
      onclick: (e) => { e.stopPropagation(); setLang(lc.code); },
    }, el('span', { class: 'lo-native' }, lc.native), lc.code === state.lang ? el('span', { class: 'lo-check' }, '✓') : null)));
  const wrap = el('div', { class: 'lang-switch' },
    el('button', {
      class: 'lang-btn', 'aria-label': t('lang_name'),
      onclick: (e) => { e.stopPropagation(); wrap.classList.toggle('open'); },
    },
      el('span', { class: 'lb-globe', html: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18"/></svg>' }),
      el('span', { class: 'lb-code' }, cur.native),
      el('span', { class: 'lb-caret' }, '▾')),
    menu);
  // close when clicking elsewhere
  setTimeout(() => {
    const close = () => wrap.classList.remove('open');
    document.addEventListener('click', close, { once: true, capture: false });
  }, 0);
  return wrap;
}

function navBar() {
  const langBtn = langSwitcher();
  const links = state.user
    ? [el('a', { href: '#mine' }, t('nav_mine')), el('a', { href: '#new' }, t('nav_new')),
       el('a', { href: '#account' }, t('nav_account')), el('a', { href: '#pricing' }, t('nav_pricing')),
       langBtn, el('a', { class: 'btn btn-ghost', onclick: logout }, t('nav_logout'))]
    : [el('a', { href: '#why' }, t('nav_why')), el('a', { href: '#how' }, t('nav_how')),
       el('a', { href: '#stories' }, t('nav_stories')),
       el('a', { href: '#pricing' }, t('nav_pricing')), el('a', { href: '#faq' }, t('nav_faq')),
       langBtn, el('a', { class: 'btn btn-ghost', onclick: () => openAuth('login') }, t('nav_login')),
       el('a', { class: 'btn btn-gold', onclick: () => openAuth('register') }, t('nav_start'))];
  const menu = el('div', { class: 'nav-links' }, ...links);
  const toggle = el('button', { class: 'nav-toggle', 'aria-label': 'menu', onclick: () => menu.classList.toggle('open') },
    el('span', { html: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>' }));
  menu.addEventListener('click', (e) => { if (e.target.tagName === 'A') menu.classList.remove('open'); });
  const nav = el('nav', {}, el('div', { class: 'wrap' },
    el('a', { class: 'brand', href: state.user ? '#mine' : '#home' },
      el('span', { class: 'mark' }, '合'),
      el('span', {}, '子午·合盘', el('small', {}, t('brand_sub')))),
    el('div', { style: 'display:flex;align-items:center;gap:10px' }, menu, toggle)));
  setTimeout(() => {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 8);
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
  }, 0);
  return nav;
}

let _io;
function observeReveals() {
  if (!('IntersectionObserver' in window)) { document.querySelectorAll('.reveal').forEach((n) => n.classList.add('in')); return; }
  _io && _io.disconnect();
  _io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); _io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((n) => _io.observe(n));
}

async function logout() { API.setToken(null); state.user = null; state.reports = []; go('home'); }

async function boot() {
  if (API.token) {
    try { const { user } = await API.call('/me'); state.user = user; } catch { API.setToken(null); }
  }
  if (!location.hash) location.hash = state.user ? 'mine' : 'home';
  render();
}

// ============================================================
//  visual building blocks
// ============================================================
function scoreTone(v) { return v >= 78 ? 'high' : v >= 55 ? 'steady' : 'caution'; }
function dimBar(label, val) {
  const tone = val >= 72 ? 'gold' : val >= 50 ? '' : 'warn';
  return el('div', { class: 'dim-row' },
    el('span', { class: 'dim-label' }, label),
    el('div', { class: 'dim-track' }, el('i', { class: 'dim-fill ' + tone, style: `width:${val}%` })),
    el('span', { class: 'dim-val' }, String(val)));
}

// the signature compatibility card (hero + share artifact)
function syncCard(data, opts = {}) {
  const { overall, keyword, dims, hook, meta } = data;
  const nameA = (meta && meta.nameA) || t('label_you');
  const nameB = (meta && meta.nameB) || t('label_ta');
  const ring = el('div', { class: 'sc-ring ' + scoreTone(overall), style: `--p:${overall}` },
    el('div', { class: 'sc-ring-inner' }, el('b', {}, String(overall)), el('small', {}, t('preview_score'))));
  const dimEls = dims ? Object.entries(dims).map(([k, v]) => dimBar(k, v)) : [];
  return el('div', { class: 'sync-card ' + (opts.variant || '') },
    el('div', { class: 'sc-head' },
      el('div', { class: 'sc-names' }, el('span', {}, nameA), el('i', { class: 'sc-amp' }, '❤'), el('span', {}, nameB)),
      el('div', { class: 'sc-brand' }, '子午·合盘')),
    el('div', { class: 'sc-top' }, ring,
      el('div', { class: 'sc-key' }, el('div', { class: 'sc-keyword' }, keyword || ''),
        hook ? el('div', { class: 'sc-hook' }, '「' + hook + '」') : null)),
    dimEls.length ? el('div', { class: 'sc-dims' }, ...dimEls) : null);
}

// ============================================================
//  free funnel (two-person form + preview)
// ============================================================
function personBlock(which) {
  const isA = which === 'a';
  const pref = isA ? t('label_you') : t('label_ta');
  const f = state.lastForm && state.lastForm[which] ? state.lastForm[which] : {};
  const nameI = el('input', { type: 'text', placeholder: pref, value: f.name || '' });
  const genderSel = el('select', {},
    el('option', { value: 'female' }, t('g_female')),
    el('option', { value: 'male' }, t('g_male')));
  genderSel.value = f.gender || (isA ? 'female' : 'male');
  const dateI = el('input', { type: 'date', value: f.date || '' });
  const timeI = el('input', { type: 'time', value: f.time || '' });
  const placeI = el('input', { type: 'text', placeholder: isA ? '如 上海' : '如 北京', value: f.place || '' });
  const block = el('div', { class: 'person-block ' + which },
    el('div', { class: 'pb-head' }, el('span', { class: 'pb-dot' }, isA ? 'A' : 'B'), el('b', {}, pref)),
    el('div', { class: 'pb-grid' },
      el('label', { class: 'pb-field' }, el('span', {}, t('f_name')), nameI),
      el('label', { class: 'pb-field' }, el('span', {}, t('f_gender')), genderSel),
      el('label', { class: 'pb-field' }, el('span', {}, t('f_date')), dateI),
      el('label', { class: 'pb-field' }, el('span', {}, t('f_time')), timeI),
      el('label', { class: 'pb-field pb-wide' }, el('span', {}, t('f_place')), placeI)));
  block._read = () => ({ name: nameI.value.trim(), gender: genderSel.value, date: dateI.value, time: timeI.value || '12:00', place: placeI.value.trim(), lon: 120 });
  return block;
}

function tryFunnel() {
  let relType = (state.lastForm && state.lastForm.relType) || 'crush';
  const chips = el('div', { class: 'rel-chips' });
  const labels = REL_LABELS();
  const rebuildChips = () => {
    chips.innerHTML = '';
    REL_TYPES.forEach((r) => chips.append(el('button', {
      class: 'rel-chip' + (r === relType ? ' on' : ''),
      onclick: () => { relType = r; rebuildChips(); },
    }, labels[r])));
  };
  rebuildChips();
  const blockA = personBlock('a');
  const blockB = personBlock('b');
  const out = el('div', { class: 'try-out' });
  const btn = el('button', { class: 'btn btn-gold btn-lg', style: 'width:100%' }, t('try_btn'));
  btn.addEventListener('click', async () => {
    const a = blockA._read(), b = blockB._read();
    if (!a.date || !b.date) { toast(t('err_need_dates')); return; }
    state.lastForm = { relType, a, b };
    btn.disabled = true; btn.textContent = t('try_loading');
    try {
      const { preview } = await API.call('/sync/preview', { method: 'POST', body: { rel_type: relType, a, b } });
      state.lastPreview = preview;
      out.innerHTML = '';
      out.append(previewCard(preview));
      out.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (e) { toast(e.message); }
    finally { btn.disabled = false; btn.textContent = t('try_btn'); }
  });
  return el('div', { class: 'try-box reveal', id: 'try' },
    el('div', { class: 'try-head' }, el('h3', {}, t('try_h')), el('p', {}, t('try_sub'))),
    el('div', { class: 'rel-chips-wrap' }, chips),
    el('div', { class: 'two-persons' }, blockA, blockB),
    btn, out);
}

function previewCard(preview) {
  const card = syncCard({
    overall: preview.overall, keyword: preview.keyword, dims: preview.dims, hook: preview.hook,
    meta: { nameA: preview.name_a, nameB: preview.name_b },
  }, { variant: 'preview' });
  const lc = preview.locked_counts || {};
  const teaser = el('div', { class: 'locked-teaser' },
    el('div', { class: 'lt-lock' }, '🔒 ' + t('preview_locked')),
    el('div', { class: 'lt-hint' }, t('preview_unlock_hint')),
    el('div', { class: 'lt-counts' },
      el('span', {}, (lc.strengths || 0) + t('lc_strengths')),
      el('span', {}, (lc.frictions || 0) + t('lc_frictions')),
      el('span', {}, (lc.advice || 0) + t('lc_advice')),
      el('span', {}, (lc.timing || 6) + t('lc_months'))),
    state.user
      ? el('button', { class: 'btn btn-gold', style: 'width:100%', onclick: saveAndOpen }, t('preview_save'))
      : el('div', {},
          el('button', { class: 'btn btn-gold', style: 'width:100%', onclick: () => openAuth('register') }, t('preview_save')),
          el('div', { class: 'lt-note' }, t('preview_login_first'))));
  return el('div', { class: 'preview-result' }, card, teaser);
}

async function saveAndOpen() {
  if (!state.user) { openAuth('register'); return; }
  const f = state.lastForm;
  if (!f) { toast('请先生成速览'); return; }
  try {
    const res = await API.call('/sync/relationships', {
      method: 'POST',
      body: { rel_type: f.relType, a: f.a, b: f.b },
    });
    go('report/' + res.report_id);
  } catch (e) { toast(e.message); }
}

// ============================================================
//  HOME (landing)
// ============================================================
function featureRow(idx, tKey, dKey, mock) {
  return el('div', { class: 'feature-row reveal ' + (idx % 2 ? 'rev' : '') },
    el('div', { class: 'fr-copy' },
      el('div', { class: 'fr-num' }, '0' + (idx + 1)),
      el('h3', {}, t(tKey)), el('p', {}, t(dKey))),
    el('div', { class: 'fr-visual' }, mock));
}

function mockCardHero() {
  return syncCard({
    overall: 82, keyword: t('mock_kw'),
    dims: { [t('dim_attraction')]: 88, [t('dim_fit')]: 79, [t('dim_nourish')]: 84, [t('dim_resonance')]: 76, [t('dim_longevity')]: 81, [t('dim_stability')]: 80 },
    hook: t('mock_hook'),
    meta: { nameA: t('label_you'), nameB: t('label_ta') },
  }, { variant: 'hero' });
}

function storiesSection() {
  const items = [['story1', 'story1m'], ['story2', 'story2m'], ['story3', 'story3m']];
  return el('section', { class: 'section stories', id: 'stories' },
    el('div', { class: 'wrap' },
      el('h2', { class: 'section-title reveal' }, t('stories_h')),
      el('div', { class: 'stories-grid' },
        ...items.map(([q, m]) => el('div', { class: 'story reveal' },
          el('div', { class: 'story-q' }, t(q)), el('div', { class: 'story-m' }, t(m))))),
      el('p', { class: 'stories-note reveal' }, t('stories_note'))));
}

function pricingSection() {
  const px = prices();
  const plans = [
    { code: 'free', n: 'plan_free_n', price: px.free, d: 'plan_free_d', cta: 'plan_cta_free', action: () => openAuth('register') },
    { code: 'report_lite', n: 'plan_lite_n', price: px.lite, d: 'plan_lite_d', cta: 'plan_cta', pop: true, action: () => upgrade('report_lite') },
    { code: 'sync_monthly', n: 'plan_month_n', price: px.month, d: 'plan_month_d', cta: 'plan_cta', action: () => upgrade('sync_monthly') },
    { code: 'report_marriage', n: 'plan_marry_n', price: px.marry, d: 'plan_marry_d', cta: 'plan_cta', action: () => upgrade('report_marriage') },
  ];
  return el('section', { class: 'section pricing', id: 'pricing' },
    el('div', { class: 'wrap' },
      el('h2', { class: 'section-title reveal' }, t('pricing_h')),
      el('p', { class: 'section-sub reveal' }, t('pricing_sub')),
      el('div', { class: 'plans' },
        ...plans.map((pl) => el('div', { class: 'plan reveal' + (pl.pop ? ' pop' : '') },
          pl.pop ? el('div', { class: 'plan-badge' }, t('plan_pop')) : null,
          el('div', { class: 'plan-name' }, t(pl.n)),
          el('div', { class: 'plan-price' }, pl.price),
          el('div', { class: 'plan-desc' }, t(pl.d)),
          el('button', { class: 'btn ' + (pl.pop ? 'btn-gold' : 'btn-line'), style: 'width:100%;margin-top:14px', onclick: pl.action }, t(pl.cta))))),
      el('p', { class: 'plan-guarantee reveal' }, '✓ ' + t('plan_guarantee'))));
}

function faqSection() {
  const qs = [['faq_q1', 'faq_a1'], ['faq_q2', 'faq_a2'], ['faq_q3', 'faq_a3'], ['faq_q4', 'faq_a4'], ['faq_q5', 'faq_a5']];
  return el('section', { class: 'section faq', id: 'faq' },
    el('div', { class: 'wrap narrow' },
      el('h2', { class: 'section-title reveal' }, t('faq_h')),
      el('div', { class: 'faq-list' },
        ...qs.map(([q, a]) => {
          const item = el('details', { class: 'faq-item reveal' },
            el('summary', {}, t(q)), el('div', { class: 'faq-a' }, t(a)));
          return item;
        }))));
}

function ctaSection() {
  return el('section', { class: 'section cta-band' },
    el('div', { class: 'wrap narrow center' },
      el('h2', { class: 'reveal' }, t('cta_h')),
      el('p', { class: 'reveal' }, t('cta_sub')),
      el('button', { class: 'btn btn-gold btn-lg reveal', onclick: () => { go('home'); setTimeout(() => document.getElementById('try')?.scrollIntoView({ behavior: 'smooth' }), 80); } }, t('cta_btn'))));
}

function footer() {
  return el('footer', { class: 'foot' },
    el('div', { class: 'wrap' },
      el('div', { class: 'foot-top' },
        el('div', { class: 'brand' }, el('span', { class: 'mark' }, '合'), el('span', {}, '子午·合盘', el('small', {}, t('brand_sub')))),
        el('div', { class: 'foot-tag' }, t('foot_tag'))),
      el('p', { class: 'foot-disc' }, t('foot_disc')),
      el('div', { class: 'foot-legal' }, '© ' + new Date().getFullYear() + ' Meridian Sync')));
}

// trust bar — the four promises, placed right under the hero for conversion.
function trustBar() {
  const items = [
    ['📜', 'trust_1'], ['🔍', 'trust_2'], ['🚫', 'trust_3'], ['🔒', 'trust_4'],
  ];
  return el('div', { class: 'trust-bar reveal' },
    el('div', { class: 'wrap trust-inner' },
      ...items.map(([ic, k]) => el('div', { class: 'trust-item' },
        el('span', { class: 'trust-ic' }, ic), el('span', {}, t(k))))));
}

// why-us differentiation grid — honesty as the moat.
function whySection() {
  const cards = [
    ['🎯', 'why1_t', 'why1_d'], ['🧭', 'why2_t', 'why2_d'],
    ['🕊️', 'why3_t', 'why3_d'], ['📈', 'why4_t', 'why4_d'],
  ];
  return el('section', { class: 'section why', id: 'why' },
    el('div', { class: 'wrap' },
      el('h2', { class: 'section-title reveal' }, t('why_h')),
      el('p', { class: 'section-sub reveal' }, t('why_sub')),
      el('div', { class: 'why-grid' },
        ...cards.map(([ic, tk, dk]) => el('div', { class: 'why-card reveal' },
          el('div', { class: 'why-ic' }, ic),
          el('h3', {}, t(tk)),
          el('p', {}, t(dk)))))));
}

route('home', () => {
  app().append(navBar());
  const hero = el('section', { class: 'hero' },
    el('div', { class: 'wrap hero-grid' },
      el('div', { class: 'hero-copy' },
        el('div', { class: 'eyebrow reveal in' }, t('hero_eyebrow')),
        el('h1', { class: 'reveal in' }, t('hero_title')),
        el('p', { class: 'hero-sub reveal in' }, t('hero_sub')),
        el('div', { class: 'hero-cta reveal in' },
          el('button', { class: 'btn btn-gold btn-lg', onclick: () => document.getElementById('try')?.scrollIntoView({ behavior: 'smooth' }) }, t('hero_cta'))),
        el('div', { class: 'hero-note reveal in' }, t('hero_note'))),
      el('div', { class: 'hero-visual reveal in' }, mockCardHero())));

  const problem = el('section', { class: 'section problem' },
    el('div', { class: 'wrap narrow' },
      el('h2', { class: 'section-title reveal' }, t('problem_h')),
      el('div', { class: 'problem-grid' },
        ...['p1', 'p2', 'p3', 'p4'].map((p) => el('div', { class: 'problem-q reveal' }, '“' + t(p) + '”')))));

  const how = el('section', { class: 'section how', id: 'how' },
    el('div', { class: 'wrap' },
      el('h2', { class: 'section-title reveal' }, t('how_h')),
      featureRow(0, 'feat1_t', 'feat1_d', mockCardHero()),
      featureRow(1, 'feat2_t', 'feat2_d', mockTiming()),
      featureRow(2, 'feat3_t', 'feat3_d', mockShare())));

  const funnel = el('section', { class: 'section funnel' }, el('div', { class: 'wrap narrow' }, tryFunnel()));

  app().append(hero, trustBar(), funnel, problem, whySection(), how, storiesSection(), pricingSection(), faqSection(), ctaSection(), footer());
  setTimeout(observeReveals, 30);
});

function mockTiming() {
  const months = [['mt_m0', 'high', 'mt_n0'], ['mt_m1', 'steady', 'mt_n1'], ['mt_m2', 'caution', 'mt_n2'], ['mt_m3', 'high', 'mt_n3'], ['mt_m4', 'steady', 'mt_n4'], ['mt_m5', 'high', 'mt_n5']];
  return el('div', { class: 'mock-timing' },
    el('div', { class: 'mt-title' }, t('rep_timing')),
    el('div', { class: 'timing-grid' },
      ...months.map(([mKey, lv, nKey]) => el('div', { class: 'timing-cell ' + lv },
        el('div', { class: 'tc-m' }, t(mKey)), el('div', { class: 'tc-dot' }), el('div', { class: 'tc-n' }, t(nKey))))));
}
function mockShare() {
  return el('div', { class: 'mock-share' },
    syncCard({ overall: 76, keyword: t('mock_kw2'),
      dims: null, hook: null, meta: { nameA: t('label_you'), nameB: t('label_ta') } }, { variant: 'mini' }),
    el('div', { class: 'ms-actions' },
      el('span', { class: 'ms-chip' }, '💬 ' + t('card_send_ta')),
      el('span', { class: 'ms-chip' }, '👭 ' + t('card_send_group'))));
}

// ============================================================
//  billing / auth
// ============================================================
async function upgrade(plan) {
  if (!state.user) { openAuth('register'); return; }
  try {
    await API.call('/billing/checkout', { method: 'POST', body: { plan, provider: 'mock' } });
    toast(t('checkout_pending'));
  } catch (e) { toast(e.message || t('common_unavailable')); }
}

function openAuth(mode) {
  const overlay = el('div', { class: 'overlay', onclick: (e) => { if (e.target === overlay) overlay.remove(); } });
  const errBox = el('div', { class: 'err', style: 'display:none' });
  const emailI = el('input', { type: 'email', placeholder: 'you@example.com', autocomplete: 'email' });
  const passI = el('input', { type: 'password', placeholder: t('auth_pass_ph'), autocomplete: 'current-password' });
  const nameI = el('input', { type: 'text', placeholder: t('auth_name_ph') });
  const submit = async () => {
    errBox.style.display = 'none';
    try {
      if (mode === 'register') {
        const r = await API.call('/auth/register', { method: 'POST', body: { email: emailI.value.trim(), password: passI.value, name: nameI.value.trim() } });
        API.setToken(r.token); state.user = r.user;
      } else {
        const r = await API.call('/auth/login', { method: 'POST', body: { email: emailI.value.trim(), password: passI.value } });
        API.setToken(r.token); state.user = r.user;
      }
      overlay.remove();
      if (state.lastForm) saveAndOpen(); else go('mine');
    } catch (e) { errBox.textContent = e.message; errBox.style.display = 'block'; }
  };
  const modal = el('div', { class: 'modal', style: 'position:relative' },
    el('span', { class: 'close', onclick: () => overlay.remove() }, '×'),
    el('h3', {}, mode === 'register' ? t('auth_reg_title') : t('auth_login_title')),
    el('div', { class: 'muted' }, mode === 'register' ? t('auth_reg_sub') : t('auth_login_sub')),
    errBox,
    mode === 'register' ? el('div', { class: 'field' }, el('label', {}, t('auth_name')), nameI) : null,
    el('div', { class: 'field' }, el('label', {}, t('auth_email')), emailI),
    el('div', { class: 'field' }, el('label', {}, t('auth_pass')), passI),
    el('button', { class: 'btn btn-gold', style: 'width:100%;margin-top:6px', onclick: submit },
      mode === 'register' ? t('auth_create') : t('auth_login')),
    el('div', { class: 'switch' }, mode === 'register' ? t('auth_have') : t('auth_no'),
      el('a', { onclick: () => { overlay.remove(); openAuth(mode === 'register' ? 'login' : 'register'); } },
        mode === 'register' ? t('auth_go_login') : t('auth_go_reg'))));
  passI.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
  overlay.append(modal); document.body.append(overlay);
  setTimeout(() => (mode === 'register' ? nameI : emailI).focus(), 50);
}

// ============================================================
//  MINE (authenticated dashboard)
// ============================================================
route('mine', async () => {
  app().append(navBar());
  const wrap = el('div', { class: 'wrap app-wrap' });
  app().append(wrap);
  wrap.append(el('div', { class: 'mine-head' },
    el('h2', {}, t('mine_h')),
    el('button', { class: 'btn btn-gold', onclick: () => go('new') }, t('mine_new'))));
  const list = el('div', { class: 'mine-list' }, el('div', { class: 'loading' }, '…'));
  wrap.append(list);
  try {
    const { relationships } = await API.call('/sync/relationships');
    list.innerHTML = '';
    if (!relationships || !relationships.length) {
      list.append(el('div', { class: 'empty-state' },
        el('div', { class: 'es-ic' }, '❤'),
        el('h3', {}, t('mine_empty_t')), el('p', {}, t('mine_empty_d')),
        el('button', { class: 'btn btn-gold', onclick: () => go('new') }, t('mine_empty_btn'))));
    } else {
      relationships.forEach((r) => list.append(relCard(r)));
    }
  } catch (e) { list.innerHTML = ''; list.append(el('div', { class: 'err' }, e.message)); }
});

function relCard(r) {
  const labels = REL_LABELS();
  const tone = scoreTone(r.overall || 0);
  return el('a', { class: 'rel-card', onclick: () => go('report/' + r.report_id) },
    el('div', { class: 'rc-score ' + tone }, String(r.overall != null ? r.overall : '—')),
    el('div', { class: 'rc-body' },
      el('div', { class: 'rc-names' }, (r.name_a || t('label_you')) + ' & ' + (r.name_b || t('label_ta'))),
      el('div', { class: 'rc-key' }, r.keyword || ''),
      el('div', { class: 'rc-meta' },
        el('span', { class: 'rc-tag' }, labels[r.rel_type] || r.rel_type),
        el('span', { class: 'rc-status ' + (r.locked ? 'locked' : 'open') }, r.locked ? t('rc_locked') : t('rc_open')))),
    el('div', { class: 'rc-arrow' }, '›'));
}

// ============================================================
//  NEW reading
// ============================================================
route('new', () => {
  app().append(navBar());
  const wrap = el('div', { class: 'wrap narrow app-wrap' });
  app().append(wrap);
  wrap.append(el('h2', { class: 'page-title' }, t('new_h')), tryFunnel());
  setTimeout(observeReveals, 30);
});

// ============================================================
//  REPORT (locked -> unlock -> full)
// ============================================================
route('report', async () => {
  app().append(navBar());
  const wrap = el('div', { class: 'wrap narrow app-wrap' });
  app().append(wrap);
  const id = (location.hash.split('/')[1] || '').split('?')[0];
  wrap.append(el('div', { class: 'loading' }, t('rep_loading')));
  try {
    const data = await API.call('/sync/reports/' + id);
    wrap.innerHTML = '';
    if (data.locked || (data.report && data.report.locked)) {
      wrap.append(lockedReportView(id, data));
    } else {
      wrap.append(fullReportView(id, data));
    }
  } catch (e) { wrap.innerHTML = ''; wrap.append(el('div', { class: 'err' }, e.message)); }
  window.scrollTo(0, 0);
});

function lockedReportView(id, data) {
  const p = data.preview || data;
  const card = syncCard({
    overall: p.overall, keyword: p.keyword, dims: p.dims, hook: p.hook,
    meta: { nameA: p.name_a, nameB: p.name_b },
  }, { variant: 'report' });
  const credits = (state.user && state.user.credits) || 0;
  const isMember = !!(state.user && state.user.plan === 'member');
  const box = el('div', { class: 'unlock-box' },
    el('h3', {}, '🔒 ' + t('unlock_h')),
    el('p', { class: 'lt-hint' }, t('preview_unlock_hint')),
    isMember ? el('div', { class: 'unlock-member' }, t('unlock_member')) : el('div', { class: 'unlock-credits' }, t('unlock_credits', { n: credits })),
    el('div', { class: 'unlock-actions' },
      (isMember || credits > 0)
        ? el('button', { class: 'btn btn-gold btn-lg', onclick: () => doUnlock(id) }, isMember ? t('unlock_member') : t('unlock_btn_free'))
        : el('button', { class: 'btn btn-gold btn-lg', onclick: () => go('pricing') }, t('unlock_btn_pay'))));
  return el('div', { class: 'report' }, card, box);
}

async function doUnlock(id) {
  try {
    await API.call('/sync/reports/' + id + '/unlock', { method: 'POST' });
    try { const { user } = await API.call('/me'); state.user = user; } catch {}
    render();
  } catch (e) {
    if (e.status === 402) { toast(t('unlock_out')); go('pricing'); }
    else toast(e.message);
  }
}

function reportBlock(title, body) {
  return el('div', { class: 'report-block' }, el('div', { class: 'rb-title' }, title), body);
}
function insightList(items) {
  return el('div', { class: 'insight-list' },
    ...(items || []).map((it) => el('div', { class: 'insight' },
      el('div', { class: 'insight-txt' }, typeof it === 'string' ? it : it.text),
      (it && it.source) ? el('div', { class: 'src' }, it.source) : null)));
}

function fullReportView(id, data) {
  const rep = data.report || data;
  const meta = rep.meta || {};
  const card = syncCard({
    overall: rep.overall, keyword: rep.keyword, dims: rep.dims, hook: rep.hook,
    meta: { nameA: meta.nameA || rep.name_a, nameB: meta.nameB || rep.name_b },
  }, { variant: 'report' });
  const blocks = [];
  if (rep.headline) blocks.push(el('div', { class: 'report-headline' }, rep.headline));
  if (rep.strengths && rep.strengths.length) blocks.push(reportBlock('💛 ' + t('rep_strengths'), insightList(rep.strengths)));
  if (rep.frictions && rep.frictions.length) blocks.push(reportBlock('⚠️ ' + t('rep_frictions'), insightList(rep.frictions)));
  if (rep.dynamic) blocks.push(reportBlock('🔄 ' + t('rep_dynamic'), el('p', { class: 'rep-p' }, rep.dynamic)));
  if (rep.advice && rep.advice.length) {
    blocks.push(reportBlock('🧭 ' + t('rep_advice'),
      el('div', { class: 'adv-list' }, ...rep.advice.map((a, i) => el('div', { class: 'adv-item' },
        el('span', { class: 'adv-ic' }, String(i + 1)), el('span', {}, typeof a === 'string' ? a : a.text))))));
  }
  if (rep.timing && rep.timing.length) {
    blocks.push(reportBlock('📅 ' + t('rep_timing'),
      el('div', { class: 'timing-grid' }, ...rep.timing.map((tm) => el('div', { class: 'timing-cell ' + (tm.level === '高能' ? 'high' : tm.level === '需谨慎' ? 'caution' : 'steady') },
        el('div', { class: 'tc-m' }, tm.month), el('div', { class: 'tc-dot' }), el('div', { class: 'tc-n' }, tm.note || tm.level))))));
  }
  const actions = el('div', { class: 'report-actions' },
    el('button', { class: 'btn btn-gold', onclick: () => shareReport(id, rep) }, '🔗 ' + t('rep_share')),
    el('button', { class: 'btn btn-line', onclick: () => go('mine') }, t('rep_back')));
  return el('div', { class: 'report' }, card, ...blocks,
    rep.disclaimer ? el('p', { class: 'report-disc' }, rep.disclaimer) : null,
    actions, feedbackBox(id, data.relationship_id || rep.relationship_id));
}

async function shareReport(id, rep) {
  try {
    const { slug, url } = await API.call('/sync/share', { method: 'POST', body: { report_id: id } });
    const link = url || (location.origin + '/c/' + slug);
    try { await navigator.clipboard.writeText(link); toast(t('card_copied')); }
    catch { toast(link); }
    window.open('/c/' + slug, '_blank');
  } catch (e) { toast(e.message); }
}

function feedbackBox(reportId, relId) {
  const box = el('div', { class: 'feedback-box' }, el('div', { class: 'fb-q' }, t('rep_feedback_q')));
  const btns = el('div', { class: 'fb-btns' });
  [['accurate', 'fb_hit', '😊'], ['partly', 'fb_part', '🙂'], ['inaccurate', 'fb_miss', '😐']].forEach(([acc, k, emo]) => {
    btns.append(el('button', { class: 'fb-btn', onclick: () => sendFeedback(reportId, relId, acc, box) }, emo + ' ' + t(k)));
  });
  box.append(btns);
  return box;
}
async function sendFeedback(reportId, relId, accuracy, box) {
  try {
    await API.call('/sync/feedback', { method: 'POST', body: { report_id: reportId, relationship_id: relId, accuracy } });
    box.innerHTML = ''; box.append(el('div', { class: 'fb-thanks' }, '🙏 ' + t('fb_thanks')));
  } catch (e) { toast(e.message); }
}

// ============================================================
//  PUBLIC SHARE CARD  /c/:slug
// ============================================================
route('c', async () => {
  const slug = (location.hash.split('/')[1] || '').split('?')[0];
  app().append(navBar());
  const wrap = el('div', { class: 'wrap narrow app-wrap center' });
  app().append(wrap);
  wrap.append(el('div', { class: 'loading' }, '…'));
  try {
    const { card } = await API.call('/sync/card/' + slug);
    wrap.innerHTML = '';
    wrap.append(
      el('div', { class: 'card-page' },
        syncCard({ overall: card.overall, keyword: card.keyword, dims: card.dims, hook: null,
          meta: { nameA: t('label_you'), nameB: t('label_ta') } }, { variant: 'share' }),
        el('div', { class: 'card-cta' },
          el('h3', {}, t('sv_curious_t')),
          el('p', {}, t('sv_curious_d')),
          el('button', { class: 'btn btn-gold btn-lg', onclick: () => go('home') }, t('sv_curious_btn')))));
  } catch (e) { wrap.innerHTML = ''; wrap.append(el('div', { class: 'err' }, t('sv_notfound'))); }
  window.scrollTo(0, 0);
});

// ============================================================
//  ACCOUNT (privacy console)
// ============================================================
route('account', async () => {
  app().append(navBar());
  const wrap = el('div', { class: 'wrap narrow app-wrap' });
  app().append(wrap);
  wrap.append(el('h2', { class: 'page-title' }, t('acct_h')));
  const exportBtn = el('button', { class: 'btn btn-line', onclick: async () => {
    try {
      const data = await API.call('/me/export');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const a = el('a', { href: URL.createObjectURL(blob), download: 'meridian-my-data.json' }); a.click();
    } catch (e) { toast(e.message); }
  } }, t('acct_export'));
  const delBtn = el('button', { class: 'btn btn-danger', onclick: async () => {
    if (!confirm(t('acct_confirm1'))) return;
    if (!confirm(t('acct_confirm2'))) return;
    try { await API.call('/me', { method: 'DELETE' }); API.setToken(null); state.user = null; toast(t('acct_deleted')); go('home'); }
    catch (e) { toast(e.message); }
  } }, t('acct_delete'));
  wrap.append(
    el('div', { class: 'acct-row' },
      el('h3', {}, t('acct_title')),
      el('p', { class: 'muted' }, t('acct_desc')),
      el('div', { class: 'acct-actions' }, exportBtn, delBtn)));
});

// ---- render ----
function render() {
  app().innerHTML = '';
  const raw = (location.hash || '#home').slice(1);
  const name = raw.split('?')[0].split('/')[0] || 'home';
  const authGated = ['mine', 'new', 'report', 'account'];
  if (authGated.includes(name) && !state.user) { openAuth('login'); go('home'); return; }
  if (['why', 'how', 'stories', 'pricing', 'faq'].includes(name)) {
    routes['home']();
    setTimeout(() => document.getElementById(name)?.scrollIntoView({ behavior: 'smooth' }), 60);
    return;
  }
  const fn = routes[name] || routes['home'];
  fn();
  if (name !== 'report' && name !== 'c') window.scrollTo(0, 0);
}

// ---- launch ----
boot();
