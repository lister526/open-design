// 子午·合盘 (Meridian Sync) — vanilla JS SPA, no build step. Talks to the Hono/D1 backend.
// Product: 东方合盘 / 缘分洞察 — 看懂你俩的缘分。

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

// ---- i18n ----
const I18N = {
  zh: {
    nav_how: '如何运作', nav_stories: '真实故事', nav_pricing: '价格', nav_faq: '常见问题',
    nav_login: '登录', nav_start: '免费测缘分 →', nav_mine: '我的合盘', nav_new: '新建合盘',
    nav_account: '隐私与数据', nav_logout: '退出',
    brand_sub: 'MERIDIAN SYNC',
    hero_eyebrow: '东方合盘 · 缘分洞察',
    hero_title: '看懂你俩的缘分',
    hero_sub: '他到底怎么想？你们能走多远？下一步该怎么做？\n用东方合盘，把说不清的感觉，变成看得懂的答案。',
    hero_cta: '免费测一次缘分',
    hero_note: '30 秒出结果 · 无需下载 · 注册即送 3 次完整报告',
    try_h: '免费测你俩的缘分',
    try_sub: '填两个人的出生信息，先看免费速览。',
    rel_romance: '恋爱中', rel_crush: '暧昧 / 单恋', rel_reunion: '想复合', rel_marriage: '备婚 / 合婚', rel_friendship: '朋友 / 合作',
    label_you: '你', label_ta: 'TA',
    f_name: '称呼', f_gender: '性别', f_date: '出生日期', f_time: '出生时间', f_place: '出生城市',
    g_female: '女', g_male: '男',
    try_btn: '生成免费速览', try_loading: '正在合盘…',
    preview_score: '缘分总分', preview_locked: '完整报告已锁定',
    preview_unlock_hint: '解锁后可看：吸引力真相 · 你们的甜蜜与摩擦 · 未来 6 个月运势 · 下一步具体建议',
    preview_save: '保存并解锁完整报告',
    preview_login_first: '登录后即可保存并解锁（新用户送 3 次）',
    problem_h: '你是不是也这样',
    p1: '他忽冷忽热，我永远猜不透他在想什么。',
    p2: '我们很相爱，却总为同样的事吵架，不知道问题出在哪。',
    p3: '分手了，但我还放不下，到底还有没有可能？',
    p4: '要结婚了，长辈让我们合个八字，我想知道真的合不合。',
    how_h: '它到底怎么帮你',
    feat1_t: '把「感觉」变成「答案」',
    feat1_d: '用天干五合、地支六合、五行生克这些真实的东方合盘方法，算出你俩的吸引力、契合度、长久度——每一条结论都标明依据，不是玄乎的一句话。',
    feat2_t: '不只是分数，是「下一步」',
    feat2_d: '我们不只告诉你「合不合」，更告诉你「怎么办」：他为什么忽冷忽热、你们最容易在哪炸、未来 6 个月哪个月适合表白 / 谈事 / 冷处理。',
    feat3_t: '一张卡片，两个人看',
    feat3_d: '生成专属缘分卡片，发给 TA、发到闺蜜群。对方点开也想测测自己的——这就是它天然会传播的原因。',
    stories_h: '他们用它，说清了那句一直说不出口的话',
    story1: '「测完把卡片发给他，他主动问我要不要试试复合。憋了三个月的话，一张卡片替我说了。」', story1m: '— 小M，26，想复合',
    story2: '「一直以为是我不够好，报告说我们其实是五行互补，只是节奏不同。那天我们第一次没吵架。」', story2m: '— 阿哲，29，恋爱中',
    story3: '「备婚焦虑到失眠，合婚报告把双方家庭、性格、节奏都讲透了，我妈看完也放心了。」', story3m: '— Luna，31，备婚',
    stories_note: '以上为产品使用场景示例，非真实用户承诺；缘分洞察用于增进理解与自我觉察。',
    pricing_h: '价格',
    pricing_sub: '先免费测，觉得说到心里了，再决定要不要看完整报告。',
    plan_free_n: '免费速览', plan_free_p: '¥0', plan_free_d: '注册即送 3 次完整报告解锁',
    plan_lite_n: '缘分完整报告', plan_lite_p: '¥19', plan_lite_d: '单次 · 一段关系',
    plan_month_n: '子午会员', plan_month_p: '¥39/月', plan_month_d: '每月 6 份报告 + 无限速览',
    plan_marry_n: '合婚 · 深度定制', plan_marry_p: '¥399', plan_marry_d: '备婚级 · 双方家庭 + 择日建议',
    plan_cta_free: '免费开始', plan_cta: '选择', plan_pop: '最受欢迎',
    faq_h: '常见问题',
    faq_q1: '这是算命 / 迷信吗？', faq_a1: '它是东方文化视角下的关系洞察工具。所有结论基于八字合盘的传统方法（五合、六合、生克等）与心理反思，用于帮你理解关系、做出更清醒的选择——不预测「命中注定」，也不替你做决定。',
    faq_q2: '会不会像某些 App 那样偷偷扣费、自动续费坑人？', faq_a2: '不会。我们最讨厌这种套路。会员随时可取消，单次报告就是单次，绝不默认勾选自动续费、绝不隐藏扣费。这是我们的底线。',
    faq_q3: '需要对方配合吗？', faq_a3: '不需要。你只要知道对方的出生日期（时间/城市更准），就能生成合盘。当然，把卡片发给 TA 一起看，体验会更好。',
    faq_q4: '我的隐私安全吗？', faq_a4: '出生信息仅用于合盘计算。分享卡片上不含任何出生隐私。你可随时导出或永久删除全部数据。',
    faq_q5: '准不准？', faq_a5: '我们不吹「100% 准确」——那是骗人的。每份报告你都能反馈「说中了 / 部分 / 没说中」，我们用这些反馈持续校准。诚实，是我们唯一的护城河。',
    cta_h: '别再一个人猜了',
    cta_sub: '30 秒，先免费看看你俩的缘分速览。',
    cta_btn: '免费测一次',
    foot_tag: '东方合盘 · 缘分洞察',
    foot_disc: '子午·合盘提供东方文化视角下的关系洞察，用于增进理解与自我觉察，不构成婚恋、医疗、法律或投资建议。',
    mine_h: '我的合盘', mine_new: '+ 新建合盘',
    mine_empty_t: '还没有合盘记录', mine_empty_d: '测一次你俩的缘分，30 秒出结果。', mine_empty_btn: '开始第一次合盘',
    new_h: '新建合盘',
    unlock_h: '解锁完整报告', unlock_credits: '你还有 {n} 次免费解锁',
    unlock_btn_free: '用 1 次额度解锁（免费）', unlock_btn_pay: '解锁需要额度，去获取',
    unlock_member: '会员可无限解锁',
    rep_strengths: '你们的甜蜜 / 优势', rep_frictions: '容易踩的坑', rep_dynamic: '你俩的相处模式',
    rep_advice: '下一步该怎么做', rep_timing: '未来 6 个月运势',
    rep_share: '生成缘分卡片分享', rep_feedback_q: '这份报告说到你心里了吗？',
    fb_hit: '说中了', fb_part: '部分说中', fb_miss: '没说中', fb_thanks: '谢谢你的反馈，它让我们更准。',
    acct_h: '隐私与数据',
    lang_toggle: 'EN',
  },
  en: {
    nav_how: 'How it works', nav_stories: 'Stories', nav_pricing: 'Pricing', nav_faq: 'FAQ',
    nav_login: 'Log in', nav_start: 'Free reading →', nav_mine: 'My readings', nav_new: 'New reading',
    nav_account: 'Privacy & Data', nav_logout: 'Log out',
    brand_sub: 'MERIDIAN SYNC',
    hero_eyebrow: 'Eastern Synastry · Relationship Insight',
    hero_title: 'Understand what you two really are',
    hero_sub: 'What is he really thinking? How far can you go? What should you do next?\nEastern synastry turns a feeling you can\u2019t explain into an answer you can act on.',
    hero_cta: 'Get a free reading',
    hero_note: '30-second result · No download · 3 full reports free on sign-up',
    try_h: 'Free compatibility reading',
    try_sub: 'Enter both birth details for a free preview.',
    rel_romance: 'Dating', rel_crush: 'Crush / one-sided', rel_reunion: 'Want to reunite', rel_marriage: 'Marriage match', rel_friendship: 'Friends / partners',
    label_you: 'You', label_ta: 'Them',
    f_name: 'Name', f_gender: 'Gender', f_date: 'Birth date', f_time: 'Birth time', f_place: 'Birth city',
    g_female: 'Female', g_male: 'Male',
    try_btn: 'Generate free preview', try_loading: 'Syncing…',
    preview_score: 'Compatibility', preview_locked: 'Full report locked',
    preview_unlock_hint: 'Unlock to see: the truth of your attraction · sweetness & friction · next 6 months · what to do next',
    preview_save: 'Save & unlock full report',
    preview_login_first: 'Log in to save & unlock (3 free for new users)',
    problem_h: 'Sound familiar?',
    p1: 'He runs hot and cold — I can never tell what he\u2019s thinking.',
    p2: 'We love each other but fight over the same thing again and again.',
    p3: 'We broke up but I can\u2019t let go. Is there still a chance?',
    p4: 'We\u2019re getting married and the elders want a compatibility check.',
    how_h: 'How it actually helps you',
    feat1_t: 'Turn a feeling into an answer',
    feat1_d: 'Real Eastern synastry methods — stem combinations, branch harmonies, five-element cycles — compute your attraction, fit and longevity. Every conclusion cites its basis.',
    feat2_t: 'Not just a score — a next step',
    feat2_d: 'We don\u2019t just say whether you match. We tell you why he blows hot and cold, where you\u2019ll clash, and which of the next 6 months suits confessing / talking / stepping back.',
    feat3_t: 'One card, two people',
    feat3_d: 'Generate a shareable compatibility card. Send it to them or your group chat. They\u2019ll want to test their own — that\u2019s why it spreads.',
    stories_h: 'People used it to finally say the thing',
    story1: '“I sent him the card. He asked me himself if we should try again. Three months of words — one card said them.”', story1m: '— Mia, 26, reuniting',
    story2: '“I thought I wasn\u2019t good enough. The report said we complement each other, just at different tempos.”', story2m: '— Zhe, 29, dating',
    story3: '“Wedding anxiety kept me up. The marriage report walked through both families — even my mother relaxed.”', story3m: '— Luna, 31, engaged',
    stories_note: 'Illustrative usage scenarios, not user guarantees. Insights are for reflection and self-awareness.',
    pricing_h: 'Pricing',
    pricing_sub: 'Read free first. If it speaks to you, then unlock the full report.',
    plan_free_n: 'Free preview', plan_free_p: '$0', plan_free_d: '3 full-report unlocks on sign-up',
    plan_lite_n: 'Full report', plan_lite_p: '$3', plan_lite_d: 'One-time · one relationship',
    plan_month_n: 'Meridian Member', plan_month_p: '$6/mo', plan_month_d: '6 reports/mo + unlimited previews',
    plan_marry_n: 'Marriage · Deluxe', plan_marry_p: '$59', plan_marry_d: 'Both families + timing advice',
    plan_cta_free: 'Start free', plan_cta: 'Choose', plan_pop: 'Most popular',
    faq_h: 'FAQ',
    faq_q1: 'Is this fortune-telling / superstition?', faq_a1: 'It\u2019s a relationship-insight tool through an Eastern-culture lens. Conclusions are based on traditional synastry methods and psychological reflection — to help you understand a relationship and choose clearly. It does not predict destiny or decide for you.',
    faq_q2: 'Will it secretly auto-charge me like some apps?', faq_a2: 'No. We hate that. Cancel any time; one-time is one-time; no pre-checked auto-renew, no hidden charges. That\u2019s our line.',
    faq_q3: 'Do I need the other person?', faq_a3: 'No. Just their birth date (time/city improve accuracy). Sharing the card together is a nicer experience though.',
    faq_q4: 'Is my privacy safe?', faq_a4: 'Birth info is used only for the calculation. Share cards contain no birth privacy. Export or permanently delete all your data any time.',
    faq_q5: 'Is it accurate?', faq_a5: 'We won\u2019t claim 100% accuracy — that\u2019s a lie. You can rate each report hit / partial / miss, and we calibrate on it. Honesty is our only moat.',
    cta_h: 'Stop guessing alone',
    cta_sub: '30 seconds. See your free compatibility preview.',
    cta_btn: 'Get a free reading',
    foot_tag: 'Eastern Synastry · Relationship Insight',
    foot_disc: 'Meridian Sync offers relationship insight through an Eastern-culture lens for reflection and self-awareness. Not medical, legal, or investment advice.',
    mine_h: 'My readings', mine_new: '+ New reading',
    mine_empty_t: 'No readings yet', mine_empty_d: 'Read your compatibility — 30 seconds.', mine_empty_btn: 'Start your first reading',
    new_h: 'New reading',
    unlock_h: 'Unlock full report', unlock_credits: 'You have {n} free unlocks',
    unlock_btn_free: 'Unlock with 1 credit (free)', unlock_btn_pay: 'Get unlock credits',
    unlock_member: 'Members unlock unlimited',
    rep_strengths: 'Your strengths', rep_frictions: 'Where you\u2019ll clash', rep_dynamic: 'Your dynamic',
    rep_advice: 'What to do next', rep_timing: 'Next 6 months',
    rep_share: 'Create a share card', rep_feedback_q: 'Did this report speak to you?',
    fb_hit: 'Spot on', fb_part: 'Partly', fb_miss: 'Missed', fb_thanks: 'Thanks — this makes us more accurate.',
    acct_h: 'Privacy & Data',
    lang_toggle: '中文',
  },
};
function t(k, vars) {
  let s = (I18N[state.lang] && I18N[state.lang][k]) || (I18N.zh[k]) || k;
  if (vars) for (const [kk, vv] of Object.entries(vars)) s = s.replace(`{${kk}}`, vv);
  return s;
}
function setLang(l) { state.lang = l; localStorage.setItem('mrd_lang', l); render(); }

const REL_TYPES = ['romance', 'crush', 'reunion', 'marriage', 'friendship'];
const REL_LABELS = () => ({ romance: t('rel_romance'), crush: t('rel_crush'), reunion: t('rel_reunion'), marriage: t('rel_marriage'), friendship: t('rel_friendship') });

// ---- router ----
const routes = {};
function route(name, fn) { routes[name] = fn; }
function go(name) { location.hash = name; }
window.addEventListener('hashchange', render);

// ---- nav ----
function navBar() {
  const langBtn = el('button', { class: 'lang-btn', onclick: () => setLang(state.lang === 'zh' ? 'en' : 'zh') }, t('lang_toggle'));
  const links = state.user
    ? [el('a', { href: '#mine' }, t('nav_mine')), el('a', { href: '#new' }, t('nav_new')),
       el('a', { href: '#account' }, t('nav_account')), el('a', { href: '#pricing' }, t('nav_pricing')),
       langBtn, el('a', { class: 'btn btn-ghost', onclick: logout }, t('nav_logout'))]
    : [el('a', { href: '#how' }, t('nav_how')), el('a', { href: '#stories' }, t('nav_stories')),
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
    if (!a.date || !b.date) { toast(state.lang === 'zh' ? '请填两个人的出生日期' : 'Please enter both birth dates'); return; }
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
      el('span', {}, (lc.strengths || 0) + ' ' + (state.lang === 'zh' ? '条优势' : 'strengths')),
      el('span', {}, (lc.frictions || 0) + ' ' + (state.lang === 'zh' ? '个坑' : 'frictions')),
      el('span', {}, (lc.advice || 0) + ' ' + (state.lang === 'zh' ? '条建议' : 'advice')),
      el('span', {}, (lc.timing || 6) + ' ' + (state.lang === 'zh' ? '个月运势' : 'months'))),
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
    overall: 82, keyword: state.lang === 'zh' ? '互相成就的缘分' : 'A relationship that lifts you both',
    dims: { [state.lang === 'zh' ? '吸引力' : 'Attraction']: 88, [state.lang === 'zh' ? '契合度' : 'Fit']: 79, [state.lang === 'zh' ? '滋养度' : 'Nourish']: 84, [state.lang === 'zh' ? '共鸣度' : 'Resonance']: 76, [state.lang === 'zh' ? '长久度' : 'Longevity']: 81, [state.lang === 'zh' ? '稳定度' : 'Stability']: 80 },
    hook: state.lang === 'zh' ? 'TA的「水」润你的「木」——你在TA身边会慢慢舒展' : 'Their Water nourishes your Wood — you unfold beside them',
    meta: { nameA: state.lang === 'zh' ? '你' : 'You', nameB: 'TA' },
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
  const plans = [
    { code: 'free', n: 'plan_free_n', p: 'plan_free_p', d: 'plan_free_d', cta: 'plan_cta_free', action: () => openAuth('register') },
    { code: 'report_lite', n: 'plan_lite_n', p: 'plan_lite_p', d: 'plan_lite_d', cta: 'plan_cta', pop: true, action: () => upgrade('report_lite') },
    { code: 'sync_monthly', n: 'plan_month_n', p: 'plan_month_p', d: 'plan_month_d', cta: 'plan_cta', action: () => upgrade('sync_monthly') },
    { code: 'report_marriage', n: 'plan_marry_n', p: 'plan_marry_p', d: 'plan_marry_d', cta: 'plan_cta', action: () => upgrade('report_marriage') },
  ];
  return el('section', { class: 'section pricing', id: 'pricing' },
    el('div', { class: 'wrap' },
      el('h2', { class: 'section-title reveal' }, t('pricing_h')),
      el('p', { class: 'section-sub reveal' }, t('pricing_sub')),
      el('div', { class: 'plans' },
        ...plans.map((pl) => el('div', { class: 'plan reveal' + (pl.pop ? ' pop' : '') },
          pl.pop ? el('div', { class: 'plan-badge' }, t('plan_pop')) : null,
          el('div', { class: 'plan-name' }, t(pl.n)),
          el('div', { class: 'plan-price' }, t(pl.p)),
          el('div', { class: 'plan-desc' }, t(pl.d)),
          el('button', { class: 'btn ' + (pl.pop ? 'btn-gold' : 'btn-line'), style: 'width:100%;margin-top:14px', onclick: pl.action }, t(pl.cta)))))));
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

  app().append(hero, funnel, problem, how, storiesSection(), pricingSection(), faqSection(), ctaSection(), footer());
  setTimeout(observeReveals, 30);
});

function mockTiming() {
  const months = [['本月', 'high', '适合表白'], ['+1', 'steady', '平稳'], ['+2', 'caution', '需冷静'], ['+3', 'high', '关系升温'], ['+4', 'steady', '平稳'], ['+5', 'high', '谈重要事']];
  return el('div', { class: 'mock-timing' },
    el('div', { class: 'mt-title' }, state.lang === 'zh' ? '未来 6 个月运势' : 'Next 6 months'),
    el('div', { class: 'timing-grid' },
      ...months.map(([m, lv, note]) => el('div', { class: 'timing-cell ' + lv },
        el('div', { class: 'tc-m' }, m), el('div', { class: 'tc-dot' }), el('div', { class: 'tc-n' }, state.lang === 'zh' ? note : note)))));
}
function mockShare() {
  return el('div', { class: 'mock-share' },
    syncCard({ overall: 76, keyword: state.lang === 'zh' ? '细水长流的缘分' : 'A slow-burning bond',
      dims: null, hook: null, meta: { nameA: state.lang === 'zh' ? '你' : 'You', nameB: 'TA' } }, { variant: 'mini' }),
    el('div', { class: 'ms-actions' },
      el('span', { class: 'ms-chip' }, '💬 ' + (state.lang === 'zh' ? '发给 TA' : 'Send to them')),
      el('span', { class: 'ms-chip' }, '👭 ' + (state.lang === 'zh' ? '发闺蜜群' : 'Group chat'))));
}

// ============================================================
//  billing / auth
// ============================================================
async function upgrade(plan) {
  if (!state.user) { openAuth('register'); return; }
  try {
    await API.call('/billing/checkout', { method: 'POST', body: { plan, provider: 'mock' } });
    toast(state.lang === 'zh'
      ? '已创建订单（待支付）。真实支付需接入商户凭证；权益仅在支付回调验证后开通。'
      : 'Order created (pending). Real payment requires a merchant integration; access is granted only after a verified webhook.');
  } catch (e) { toast(e.message || (state.lang === 'zh' ? '暂不可用' : 'Unavailable')); }
}

function openAuth(mode) {
  const overlay = el('div', { class: 'overlay', onclick: (e) => { if (e.target === overlay) overlay.remove(); } });
  const errBox = el('div', { class: 'err', style: 'display:none' });
  const emailI = el('input', { type: 'email', placeholder: 'you@example.com', autocomplete: 'email' });
  const passI = el('input', { type: 'password', placeholder: state.lang === 'zh' ? '至少 6 位' : 'at least 6 chars', autocomplete: 'current-password' });
  const nameI = el('input', { type: 'text', placeholder: state.lang === 'zh' ? '如何称呼你' : 'Your name' });
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
    el('h3', {}, mode === 'register' ? (state.lang === 'zh' ? '注册 · 送 3 次完整报告' : 'Sign up · 3 free reports') : (state.lang === 'zh' ? '欢迎回来' : 'Welcome back')),
    el('div', { class: 'muted' }, mode === 'register' ? (state.lang === 'zh' ? '注册后立即解锁你的合盘报告' : 'Unlock your reading right after sign-up') : (state.lang === 'zh' ? '登录继续' : 'Log in to continue')),
    errBox,
    mode === 'register' ? el('div', { class: 'field' }, el('label', {}, state.lang === 'zh' ? '昵称' : 'Name'), nameI) : null,
    el('div', { class: 'field' }, el('label', {}, state.lang === 'zh' ? '邮箱' : 'Email'), emailI),
    el('div', { class: 'field' }, el('label', {}, state.lang === 'zh' ? '密码' : 'Password'), passI),
    el('button', { class: 'btn btn-gold', style: 'width:100%;margin-top:6px', onclick: submit },
      mode === 'register' ? (state.lang === 'zh' ? '创建账户' : 'Create account') : (state.lang === 'zh' ? '登录' : 'Log in')),
    el('div', { class: 'switch' }, mode === 'register' ? (state.lang === 'zh' ? '已有账户？' : 'Have an account?') : (state.lang === 'zh' ? '还没有账户？' : 'No account?'),
      el('a', { onclick: () => { overlay.remove(); openAuth(mode === 'register' ? 'login' : 'register'); } },
        mode === 'register' ? (state.lang === 'zh' ? ' 去登录' : ' Log in') : (state.lang === 'zh' ? ' 免费注册' : ' Sign up free'))));
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
        el('span', { class: 'rc-status ' + (r.locked ? 'locked' : 'open') }, r.locked ? (state.lang === 'zh' ? '未解锁' : 'Locked') : (state.lang === 'zh' ? '已解锁' : 'Unlocked')))),
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
  wrap.append(el('div', { class: 'loading' }, state.lang === 'zh' ? '载入报告中…' : 'Loading…'));
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
    if (e.status === 402) { toast(state.lang === 'zh' ? '免费额度已用完，去获取报告或成为会员' : 'Out of free unlocks — get a report or membership'); go('pricing'); }
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
    el('button', { class: 'btn btn-line', onclick: () => go('mine') }, state.lang === 'zh' ? '返回我的合盘' : 'Back to my readings'));
  return el('div', { class: 'report' }, card, ...blocks,
    rep.disclaimer ? el('p', { class: 'report-disc' }, rep.disclaimer) : null,
    actions, feedbackBox(id, data.relationship_id || rep.relationship_id));
}

async function shareReport(id, rep) {
  try {
    const { slug, url } = await API.call('/sync/share', { method: 'POST', body: { report_id: id } });
    const link = url || (location.origin + '/c/' + slug);
    try { await navigator.clipboard.writeText(link); toast(state.lang === 'zh' ? '缘分卡片链接已复制，去发给 TA 吧' : 'Card link copied — go share it'); }
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
          el('h3', {}, state.lang === 'zh' ? '也想看看你俩的缘分？' : 'Curious about your own?'),
          el('p', {}, state.lang === 'zh' ? '30 秒免费测一次，注册即送 3 次完整报告。' : '30-second free reading, 3 full reports on sign-up.'),
          el('button', { class: 'btn btn-gold btn-lg', onclick: () => go('home') }, state.lang === 'zh' ? '免费测我的缘分 →' : 'Get my free reading →'))));
  } catch (e) { wrap.innerHTML = ''; wrap.append(el('div', { class: 'err' }, state.lang === 'zh' ? '卡片不存在或已失效' : 'Card not found')); }
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
  } }, state.lang === 'zh' ? '导出我的全部数据 (JSON)' : 'Export all my data (JSON)');
  const delBtn = el('button', { class: 'btn btn-danger', onclick: async () => {
    if (!confirm(state.lang === 'zh' ? '确定永久注销账户？你的合盘、报告、卡片将被彻底删除，不可恢复。' : 'Permanently delete your account? All readings will be erased.')) return;
    if (!confirm(state.lang === 'zh' ? '再次确认：此操作不可撤销。' : 'Confirm again: this cannot be undone.')) return;
    try { await API.call('/me', { method: 'DELETE' }); API.setToken(null); state.user = null; toast(state.lang === 'zh' ? '账户已注销' : 'Account deleted'); go('home'); }
    catch (e) { toast(e.message); }
  } }, state.lang === 'zh' ? '永久注销账户' : 'Delete account');
  wrap.append(
    el('div', { class: 'acct-row' },
      el('h3', {}, state.lang === 'zh' ? '数据可携与注销' : 'Data portability & deletion'),
      el('p', { class: 'muted' }, state.lang === 'zh' ? '你拥有完整的数据主权。出生信息仅用于合盘，分享卡片不含隐私。' : 'You own your data fully. Birth info is used only for calculation; share cards contain no privacy.'),
      el('div', { class: 'acct-actions' }, exportBtn, delBtn)));
});

// ---- render ----
function render() {
  app().innerHTML = '';
  const raw = (location.hash || '#home').slice(1);
  const name = raw.split('?')[0].split('/')[0] || 'home';
  const authGated = ['mine', 'new', 'report', 'account'];
  if (authGated.includes(name) && !state.user) { openAuth('login'); go('home'); return; }
  if (['how', 'stories', 'pricing', 'faq'].includes(name)) {
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
