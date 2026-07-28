// Meridian SPA — vanilla JS, no build step. Talks to the Hono/D1 backend.
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

const state = { user: null, chart: null, chartId: null, conversations: [], convId: null, messages: [], sending: false };

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
  setTimeout(() => t.remove(), 2600);
}

function esc(s) { return String(s).replace(/[&<>]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m])); }

// simple hash router
const routes = {};
function route(name, fn) { routes[name] = fn; }
function go(name) { location.hash = name; }
window.addEventListener('hashchange', render);

// ---- backdrop ----
function ensureBackdrop() { if (!$('.stars')) document.body.prepend(el('div', { class: 'stars' })); }

// ---- nav ----
function navBar() {
  const links = state.user
    ? [el('a', { href: '#decisions' }, '决策台'), el('a', { href: '#app' }, '对话'),
       el('a', { href: '#account' }, '隐私与数据'), el('a', { href: '#pricing' }, '会员'),
       el('a', { class: 'btn btn-ghost', onclick: logout }, '退出')]
    : [el('a', { href: '#features' }, '能力'), el('a', { href: '#how' }, '原理'), el('a', { href: '#pricing' }, '会员'),
       el('a', { class: 'btn btn-ghost', onclick: () => openAuth('login') }, '登录'),
       el('a', { class: 'btn btn-gold', onclick: () => openAuth('register') }, '免费开始')];
  return el('nav', {}, el('div', { class: 'wrap' },
    el('a', { class: 'brand', href: state.user ? '#app' : '#home' },
      el('span', { class: 'mark' }, '子'),
      el('span', {}, '子午', el('br'), el('small', {}, 'MERIDIAN'))),
    el('div', { class: 'nav-links' }, ...links)));
}

async function logout() { API.setToken(null); state.user = null; state.chart = null; state.convId = null; go('home'); }

// bootstrap session
async function boot() {
  ensureBackdrop();
  if (API.token) {
    try { const { user } = await API.call('/me'); state.user = user; } catch { API.setToken(null); }
  }
  if (!location.hash) location.hash = state.user ? 'app' : 'home';
  render();
}

// ---- natal wheel SVG (decorative 12-palace ring) ----
function natalWheel() {
  const branches = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  const R = 190, r = 120, cx = 200, cy = 200;
  let paths = '', labels = '';
  for (let i = 0; i < 12; i++) {
    const a0 = (i * 30 - 90) * Math.PI / 180, a1 = ((i + 1) * 30 - 90) * Math.PI / 180;
    const x0o = cx + R * Math.cos(a0), y0o = cy + R * Math.sin(a0);
    const x1o = cx + R * Math.cos(a1), y1o = cy + R * Math.sin(a1);
    const x0i = cx + r * Math.cos(a0), y0i = cy + r * Math.sin(a0);
    const x1i = cx + r * Math.cos(a1), y1i = cy + r * Math.sin(a1);
    paths += `<path d="M${x0o},${y0o} A${R},${R} 0 0 1 ${x1o},${y1o} L${x1i},${y1i} A${r},${r} 0 0 0 ${x0i},${y0i} Z" fill="${i%2?'rgba(200,161,90,.06)':'rgba(200,161,90,.11)'}" stroke="rgba(200,161,90,.28)" stroke-width="1"/>`;
    const am = (i * 30 + 15 - 90) * Math.PI / 180, rm = (R + r) / 2;
    labels += `<text x="${cx + rm*Math.cos(am)}" y="${cy + rm*Math.sin(am)+6}" text-anchor="middle" fill="#e6c98a" font-size="17" font-family="Songti SC,serif">${branches[i]}</text>`;
  }
  return `<svg viewBox="0 0 400 400">
    <circle cx="200" cy="200" r="190" fill="none" stroke="rgba(200,161,90,.35)" stroke-width="1.5"/>
    <circle cx="200" cy="200" r="120" fill="none" stroke="rgba(200,161,90,.25)" stroke-width="1"/>
    <circle cx="200" cy="200" r="70" fill="none" stroke="rgba(200,161,90,.18)" stroke-width="1"/>
    ${paths}${labels}
  </svg>`;
}

route('home', () => {
  const hero = el('section', { class: 'hero' }, el('div', { class: 'wrap' },
    el('div', { class: 'hero-grid' },
      el('div', {},
        el('span', { class: 'eyebrow' }, '东方命理 × AI 决策科学'),
        el('h1', { html: '看清你的<span class="hl">天赋结构</span>与<span class="hl">时机节奏</span>，<br>把每一步走在运势的顺风口' }),
        el('p', { class: 'lead' }, '子午不是算命。它以你的八字、紫微斗数、大运流年为底层，像一位既懂命理、又懂商业与心理的私人军师，陪你做人生每一个重要决定。'),
        el('p', { class: 'sub' }, '真太阳时精确排盘 · 记得你的目标与烦恼 · 越聊越懂你'),
        el('div', { class: 'hero-cta' },
          el('a', { class: 'btn btn-gold', onclick: () => openAuth('register') }, '免费排盘，开始对话 →'),
          el('a', { class: 'btn btn-ghost', href: '#how' }, '看它如何运作')),
        el('div', { class: 'trust' },
          el('div', {}, el('b', {}, '真太阳时'), '经度+均时差校正'),
          el('div', {}, el('b', {}, '14 主星'), '紫微十二宫全排'),
          el('div', {}, el('b', {}, '60 年'), '大运流年推演'))),
      el('div', {}, el('div', { class: 'wheel' },
        el('div', { html: natalWheel() }),
        el('div', { class: 'center' },
          el('div', { class: 'zh' }, '命 盘'),
          el('div', { class: 'small' }, '你的专属星图')))))));

  const features = el('section', { class: 'blk', id: 'features' }, el('div', { class: 'wrap' },
    el('div', { class: 'sec-head' },
      el('div', { class: 'k' }, 'CAPABILITIES'),
      el('h2', {}, '不止一份报告，而是一位长期陪伴的军师'),
      el('p', {}, '市面上的星座 App 给你一次性、放之四海皆准的报告。子午记得你是谁、你要什么，然后针对你的盘给出可执行的建议。')),
    el('div', { class: 'cards' },
      ...[['🧭','天赋定位','从日主旺衰、十神结构、命身主星，看清你真正擅长与该扬弃的方向——不是标签，是结构。'],
          ['⏳','时机窗口','大运十年、流年当值：哪一年宜进取、哪一年宜蛰伏、哪个窗口适合创业/换赛道/重大投入。'],
          ['💬','越聊越懂你','它会记住你的目标、职业、关系与烦恼，下一次对话直接接上，像认识多年的顾问。'],
          ['🎯','落地建议','拒绝正确的废话。给具体动作、时间点、风险提示，帮你把命理转成可执行的决策。'],
          ['🔒','严谨排盘','真太阳时（经度+均时差）、立春分年、五虎遁月、五鼠遁时，与专业排盘软件一致。'],
          ['🌏','中西皆可','中文母语对话，未来支持出海多语言；东方命理是别人抄不走的护城河。']]
        .map(([i,t,d]) => el('div', { class: 'card' }, el('div', { class: 'ic' }, i), el('h3', {}, t), el('p', {}, d))))));

  const how = el('section', { class: 'blk', id: 'how' }, el('div', { class: 'wrap' },
    el('div', { class: 'sec-head' },
      el('div', { class: 'k' }, 'HOW IT WORKS' ),
      el('h2', {}, '三步，把命盘变成决策力'),
      el('p', {}, '')),
    el('div', { class: 'cards' },
      ...[['① 精确排盘','输入出生时间与地点，系统按真太阳时排出八字与紫微斗数十二宫，误差控制到分钟级。'],
          ['② 结构解读','引擎计算五行旺衰、喜用神、十神、大运流年，形成你专属的"能量地图"。'],
          ['③ 对话决策','就当下的具体问题开聊——事业、财富、关系、时机——得到贴合你盘的军师级建议。']]
        .map(([t,d]) => el('div', { class: 'card' }, el('h3', {}, t), el('p', {}, d))))));

  app().append(navBar(), hero, features, how, pricingSection(), footer());
});

// ---- pricing ----
function pricingSection() {
  const plans = [
    { k: 'free', name: '体验', price: '¥0', per: '', feats: ['排盘（八字+紫微，附置信度与免责）', '1 个决策工作区', '3 次 AI 决策分析', '文化反思镜头（可选开关）'], cta: '免费开始', act: () => state.user ? go('app') : openAuth('register'), feat: false },
    { k: 'core_monthly', name: 'Core 月度', price: '¥59', per: '/月', feats: ['每月 300 次 AI 分析（公平使用）', '最多 20 个活跃决策', '选项对比 / 证据矩阵 / 风险矩阵', '行动计划 + 复盘提醒', '用户可控的长期记忆', '报告导出'], cta: '订阅 Core', act: () => upgrade('core_monthly'), feat: true },
    { k: 'pack_single', name: 'Decision Pack', price: '¥199', per: '/次', feats: ['针对单个重大决策', '结构化深度报告', '完整行动方案', '30/90 天复盘机制'], cta: '购买单次', act: () => upgrade('pack_single'), feat: false },
  ];
  return el('section', { class: 'blk', id: 'pricing' }, el('div', { class: 'wrap' },
    el('div', { class: 'sec-head' },
      el('div', { class: 'k' }, 'MEMBERSHIP'),
      el('h2', {}, '先免费体验，认可价值再升级'),
      el('p', {}, '定价透明，随时取消，绝无诱导续费的暗坑。')),
    el('div', { class: 'plans' },
      ...plans.map((p) => el('div', { class: 'plan' + (p.feat ? ' featured' : '') },
        p.feat ? el('div', { class: 'tag' }, '最受欢迎') : null,
        el('h3', {}, p.name),
        el('div', { class: 'price' }, p.price, el('small', {}, p.per)),
        el('ul', {}, ...p.feats.map((f) => el('li', {}, f))),
        el('button', { class: 'btn ' + (p.feat ? 'btn-gold' : 'btn-ghost'), onclick: p.act }, p.cta))))));
}

function footer() {
  return el('footer', {}, el('div', { class: 'wrap' },
    el('div', { class: 'brand' }, el('span', { class: 'mark' }, '子'), el('span', {}, '子午 Meridian')),
    el('div', {}, '东方命理 × AI 决策科学 · 命是底牌，运是打法，选择权在你'),
    el('div', { style: 'margin-top:10px;opacity:.6' }, '© 2026 Meridian. 本产品提供的内容仅供自我认知与决策参考，不构成医疗、法律或投资建议。')));
}

async function upgrade(plan) {
  if (!state.user) { openAuth('register'); return; }
  try {
    // Creates a PENDING order via a payment provider. Entitlement is granted only
    // after a verified payment webhook (no client-side upgrade). See SECURITY.md.
    await API.call('/billing/checkout', { method: 'POST', body: { plan, provider: 'mock' } });
    toast('已创建订单（待支付）。真实支付渠道需接入商户凭证；权益仅在支付回调验证后开通。');
  } catch (e) { toast(e.message || '暂不可用'); }
}

// ---- auth modal ----
function openAuth(mode) {
  const overlay = el('div', { class: 'overlay', onclick: (e) => { if (e.target === overlay) overlay.remove(); } });
  const errBox = el('div', { class: 'err', style: 'display:none' });
  const emailI = el('input', { type: 'email', placeholder: 'you@example.com', autocomplete: 'email' });
  const passI = el('input', { type: 'password', placeholder: '至少 6 位', autocomplete: 'current-password' });
  const nameI = el('input', { type: 'text', placeholder: '如何称呼你' });

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
      overlay.remove(); go('app');
    } catch (e) { errBox.textContent = e.message; errBox.style.display = 'block'; }
  };

  const modal = el('div', { class: 'modal', style: 'position:relative' },
    el('span', { class: 'close', onclick: () => overlay.remove() }, '×'),
    el('h3', {}, mode === 'register' ? '开始你的命盘之旅' : '欢迎回来'),
    el('div', { class: 'muted' }, mode === 'register' ? '注册后立即免费排盘并开始对话' : '登录继续你的对话'),
    errBox,
    mode === 'register' ? el('div', { class: 'field' }, el('label', {}, '昵称'), nameI) : null,
    el('div', { class: 'field' }, el('label', {}, '邮箱'), emailI),
    el('div', { class: 'field' }, el('label', {}, '密码'), passI),
    el('button', { class: 'btn btn-gold', style: 'width:100%;margin-top:6px', onclick: submit },
      mode === 'register' ? '创建账户' : '登录'),
    el('div', { class: 'switch' }, mode === 'register' ? '已有账户？' : '还没有账户？',
      el('a', { onclick: () => { overlay.remove(); openAuth(mode === 'register' ? 'login' : 'register'); } },
        mode === 'register' ? ' 去登录' : ' 免费注册')));
  passI.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
  overlay.append(modal); document.body.append(overlay);
  setTimeout(() => (mode === 'register' ? nameI : emailI).focus(), 50);
}

// ---- render ----
function render() {
  ensureBackdrop();
  app().innerHTML = '';
  const name = (location.hash || '#home').slice(1).split('?')[0].split('/')[0] || 'home';
  if (['app', 'decisions', 'account'].includes(name) && !state.user) { go('home'); return; }
  const fn = routes[name] || routes['home'];
  // anchor sections live on home; for #features etc. render home then scroll
  if (['features', 'how', 'pricing'].includes(name)) {
    routes['home']();
    setTimeout(() => document.getElementById(name)?.scrollIntoView({ behavior: 'smooth' }), 60);
    return;
  }
  fn();
}

// ---- APP (authenticated) ----
route('app', async () => {
  app().append(navBar());
  const container = el('div', { class: 'appview' });
  app().append(container);
  container.append(el('div', { class: 'side' }), el('div', { class: 'chat' },
    el('div', { class: 'msgs', style: 'align-items:center;justify-content:center' },
      el('div', { class: 'typing' }, '排盘与载入中', el('span', {}, '.'), el('span', {}, '.'), el('span', {}, '.')))));
  try {
    const [{ charts }, { conversations }] = await Promise.all([API.call('/charts'), API.call('/conversations')]);
    state.conversations = conversations || [];
    if (charts && charts.length) {
      const { chart } = await API.call('/chart/' + charts[0].id);
      state.chart = chart; state.chartId = charts[0].id;
      renderApp(container);
    } else {
      renderChartForm(container);
    }
  } catch (e) { toast(e.message); renderChartForm(container); }
});

function renderChartForm(container) {
  container.innerHTML = '';
  container.style.display = 'block';
  const wrap = el('div', { style: 'max-width:520px;margin:6vh auto;padding:0 20px' });
  const err = el('div', { class: 'err', style: 'display:none' });
  const gender = el('select', {}, el('option', { value: 'male' }, '男'), el('option', { value: 'female' }, '女'));
  const date = el('input', { type: 'date' });
  const time = el('input', { type: 'time', value: '12:00' });
  const place = el('input', { type: 'text', placeholder: '如：江苏徐州' });
  const lon = el('input', { type: 'number', step: '0.01', placeholder: '经度（可选，如 117.95）' });

  const submit = async () => {
    err.style.display = 'none';
    if (!date.value) { err.textContent = '请填写出生日期'; err.style.display = 'block'; return; }
    const btn = wrap.querySelector('.btn-gold');
    btn.disabled = true; btn.innerHTML = '<span class="spin"></span> 排盘中…';
    try {
      const body = { gender: gender.value, date: date.value, time: time.value || '12:00', place: place.value, longitude: lon.value ? Number(lon.value) : undefined, label: 'self' };
      const { id, chart } = await API.call('/chart', { method: 'POST', body });
      state.chart = chart; state.chartId = id;
      toast('排盘完成');
      renderApp(document.querySelector('.appview') || container);
    } catch (e) { err.textContent = e.message; err.style.display = 'block'; btn.disabled = false; btn.textContent = '排盘并开始对话 →'; }
  };

  wrap.append(
    el('div', { class: 'sec-head', style: 'margin-bottom:26px' },
      el('div', { class: 'k' }, 'STEP 1'),
      el('h2', { style: 'font-size:28px' }, '先排出你的命盘'),
      el('p', {}, '按真太阳时精确排盘。出生时间越准，解读越贴合你。')),
    el('div', { class: 'modal', style: 'position:static;max-width:none' },
      err,
      el('div', { class: 'row2' },
        el('div', { class: 'field' }, el('label', {}, '性别'), gender),
        el('div', { class: 'field' }, el('label', {}, '出生日期（阳历）'), date)),
      el('div', { class: 'row2' },
        el('div', { class: 'field' }, el('label', {}, '出生时间'), time),
        el('div', { class: 'field' }, el('label', {}, '出生经度（可选）'), lon)),
      el('div', { class: 'field' }, el('label', {}, '出生地'), place),
      el('button', { class: 'btn btn-gold', style: 'width:100%;margin-top:8px', onclick: submit }, '排盘并开始对话 →')));
  container.append(wrap);
}

function chartPanel() {
  const c = state.chart; if (!c) return el('div');
  const p = c.bazi.pillars;
  return el('div', {},
    el('div', { class: 'chartcard' },
      el('div', { class: 'pillars' },
        ...[['年', p.year], ['月', p.month], ['日', p.day], ['时', p.hour]].map(([l, gz]) =>
          el('div', { class: 'pill' }, el('div', { class: 'lab' }, l), el('div', { class: 'gz' }, gz)))),
      el('div', { class: 'r' }, el('span', {}, '日主'), el('b', {}, `${c.bazi.dayMaster}${c.bazi.dayMasterElement} · ${c.strength.level}`)),
      el('div', { class: 'r' }, el('span', {}, '喜用五行'), el('b', {}, c.strength.favorable.join('、'))),
      el('div', { class: 'r' }, el('span', {}, '命宫/身宫'), el('b', {}, `${c.ziwei.ming.ganZhi} / ${c.ziwei.shen.branch}`)),
      el('div', { class: 'r' }, el('span', {}, '五行局'), el('b', {}, c.ziwei.ju.name)),
      el('div', { class: 'r' }, el('span', {}, '命主/身主'), el('b', {}, `${c.ziwei.mingZhu}/${c.ziwei.shenZhu}`)),
      el('div', { class: 'r' }, el('span', {}, '当前大运'), el('b', {}, c.currentLuck ? `${c.currentLuck.ganZhi}（${c.currentLuck.tenGod}）` : '未起运')),
      el('div', { class: 'r' }, el('span', {}, '今年流年'), el('b', {}, c.annual.ganZhi))));
}

function renderApp(container) {
  container.style.display = '';
  container.innerHTML = '';
  const side = el('div', { class: 'side' });
  side.append(
    el('button', { class: 'btn btn-gold new', onclick: () => startConversation() }, '＋ 新对话'),
    el('button', { class: 'btn btn-ghost new', style: 'margin-bottom:16px', onclick: () => go('decisions') }, '🧭 决策台'),
    chartPanel(),
    el('h4', {}, '历史对话'),
    ...(state.conversations.length ? state.conversations.map((cv) =>
      el('div', { class: 'conv-item' + (cv.id === state.convId ? ' active' : ''), 'data-id': cv.id, onclick: () => openConversation(cv.id) }, cv.title || '未命名'))
      : [el('div', { style: 'font-size:12.5px;color:var(--muted)' }, '还没有对话，点上方开始')]));
  const chat = el('div', { class: 'chat', id: 'chatarea' });
  container.append(side, chat);
  if (state.convId) { openConversation(state.convId); }
  else { chat.append(emptyChatInner()); }
}

function emptyChatInner() {
  const c = state.chart;
  return el('div', { class: 'msgs', style: 'align-items:center;justify-content:center;text-align:center' },
    el('div', { style: 'max-width:480px' },
      el('div', { style: 'font-family:var(--serif);font-size:26px;color:var(--gold-2);margin-bottom:12px' }, `${state.user.name}，你的军师已就位`),
      el('p', { style: 'color:#b9b4a5;margin-bottom:24px' }, `已按真太阳时排出你的命盘（${c ? `${c.bazi.pillars.year} ${c.bazi.pillars.month} ${c.bazi.pillars.day} ${c.bazi.pillars.hour}` : ''}）。选一个话题开始，或直接提问。`),
      el('div', { class: 'suggest', style: 'justify-content:center' },
        ...['我今年的事业机会在哪？', '我适合创业还是打工？', '未来哪几年是我的上升期？', '我的天赋结构适合什么方向？']
          .map((q) => el('div', { class: 'chip', onclick: () => startConversation('general', q) }, q)))));
}

async function startConversation(topic = 'general', firstMsg) {
  try {
    const { id } = await API.call('/conversations', { method: 'POST', body: { chart_id: state.chartId, topic } });
    const { conversations } = await API.call('/conversations');
    state.conversations = conversations || [];
    state.convId = id; state.messages = [];
    renderApp(document.querySelector('.appview'));
    if (firstMsg) setTimeout(() => sendMessage(firstMsg), 100);
  } catch (e) { toast(e.message); }
}

async function openConversation(id) {
  state.convId = id;
  document.querySelectorAll('.conv-item').forEach((n) => n.classList.toggle('active', n.getAttribute('data-id') === id));
  try {
    const { messages } = await API.call(`/conversations/${id}/messages`);
    state.messages = messages || [];
  } catch { state.messages = []; }
  renderChat();
}

function msgBubble(m) {
  if (m.role === 'assistant') {
    return el('div', { class: 'msg assistant' }, el('div', { class: 'who' }, '子午 · 军师'), document.createTextNode(m.content));
  }
  return el('div', { class: 'msg user' }, m.content);
}

function renderChat() {
  const chat = document.getElementById('chatarea');
  if (!chat) return;
  chat.innerHTML = '';
  const msgs = el('div', { class: 'msgs', id: 'msgs' });
  if (!state.messages.length) {
    msgs.append(el('div', { class: 'typing', style: 'align-self:center' }, '就当下的具体问题开聊吧～'));
  } else {
    state.messages.forEach((m) => msgs.append(msgBubble(m)));
  }
  // composer
  const ta = el('textarea', { rows: '1', placeholder: '问问你的军师…（Enter 发送，Shift+Enter 换行）' });
  const sendBtn = el('button', { class: 'send', type: 'submit' }, '发送');
  const form = el('form', { onsubmit: (e) => { e.preventDefault(); const v = ta.value.trim(); if (v) { ta.value = ''; ta.style.height = 'auto'; sendMessage(v); } } }, ta, sendBtn);
  ta.addEventListener('input', () => { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 140) + 'px'; });
  ta.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); } });
  const suggest = el('div', { class: 'suggest' },
    ...['事业', '财富', '感情', '今年运势', '关键决策时机'].map((t) =>
      el('div', { class: 'chip', onclick: () => sendMessage(`请就我的「${t}」，结合我的命盘给我具体分析和建议。`) }, t)));
  const composer = el('div', { class: 'composer' }, state.messages.length ? null : suggest, form);
  const head = el('div', { class: 'chat-head' },
    el('div', { class: 't' }, state.conversations.find((c) => c.id === state.convId)?.title || '新的咨询'),
    el('div', { class: 'credits' }, state.user.plan === 'free' ? `剩余 ${state.user.credits} 次免费分析` : `Core · 每月公平使用额度`));
  chat.append(head, msgs, composer);
  msgs.scrollTop = msgs.scrollHeight;
  setTimeout(() => ta.focus(), 50);
}

async function sendMessage(content) {
  if (state.sending) return;
  state.sending = true;
  const msgs = document.getElementById('msgs');
  // clear placeholder
  if (msgs && msgs.querySelector('.typing') && !state.messages.length) msgs.innerHTML = '';
  state.messages.push({ role: 'user', content });
  if (msgs) { msgs.append(msgBubble({ role: 'user', content })); msgs.scrollTop = msgs.scrollHeight; }
  const typing = el('div', { class: 'typing' }, '军师思考中', el('span', {}, '.'), el('span', {}, '.'), el('span', {}, '.'));
  if (msgs) { msgs.append(typing); msgs.scrollTop = msgs.scrollHeight; }
  try {
    const { reply, credits } = await API.call(`/conversations/${state.convId}/chat`, { method: 'POST', body: { content } });
    if (typeof credits === 'number') state.user.credits = credits;
    typing.remove();
    state.messages.push({ role: 'assistant', content: reply });
    if (msgs) { msgs.append(msgBubble({ role: 'assistant', content: reply })); msgs.scrollTop = msgs.scrollHeight; }
    // update credit label + conv title
    const cr = document.querySelector('.chat-head .credits');
    if (cr && state.user.plan === 'free') cr.textContent = `剩余 ${state.user.credits} 次免费对话`;
    if (state.messages.length === 2) { // refresh sidebar titles
      const { conversations } = await API.call('/conversations');
      state.conversations = conversations || [];
      const item = document.querySelector(`.conv-item[data-id="${state.convId}"]`);
      const t = state.conversations.find((c) => c.id === state.convId);
      if (item && t) item.textContent = t.title;
      const ht = document.querySelector('.chat-head .t');
      if (ht && t) ht.textContent = t.title;
    }
  } catch (e) {
    typing.remove();
    if (e.status === 402) {
      const up = el('div', { class: 'msg assistant' }, el('div', { class: 'who' }, '子午'),
        document.createTextNode('你的免费额度已用完。订阅 Core（¥59/月）获得每月公平使用额度，并解锁多个活跃决策与报告导出。'));
      if (msgs) msgs.append(up);
      setTimeout(() => go('pricing'), 400);
    } else {
      toast(e.message || '发送失败');
    }
  } finally { state.sending = false; }
}

// ============================================================
//  DECISION-OS  — the P1 decision closed-loop frontend
//  create → goals/constraints → options → evidence/risk matrix
//  → AI structured analysis → action plan → review
//  Backend contract: /api/decisions* (see src/index.js)
// ============================================================

const decState = { list: [], current: null, options: [], evidence: [], actions: [], reviews: [], analysis: null, busy: false };

function decHash() {
  // supports #decisions  and  #decisions/<id>
  const raw = (location.hash || '').slice(1);
  const parts = raw.split('/');
  return parts.length > 1 ? decodeURIComponent(parts.slice(1).join('/')) : null;
}

// ---- LIST + CREATE ----
route('decisions', async () => {
  app().append(navBar());
  const id = decHash();
  const container = el('div', { class: 'decwrap' });
  app().append(container);
  if (id) { await renderDecisionDetail(container, id); return; }
  await renderDecisionList(container);
});

async function renderDecisionList(container) {
  container.innerHTML = '';
  container.append(el('div', { class: 'typing', style: 'margin:40px auto' }, '载入决策台…'));
  let decisions = [];
  try { const r = await API.call('/decisions'); decisions = r.decisions || []; }
  catch (e) { toast(e.message); }
  decState.list = decisions;
  container.innerHTML = '';

  const head = el('div', { class: 'dec-head' },
    el('div', {},
      el('div', { class: 'k' }, 'DECISION OS'),
      el('h2', {}, '你的重大决策工作台'),
      el('p', { class: 'dec-sub' }, '把一个让你反复纠结的重大选择，拆成事实、假设、选项与风险，想清楚再落地。命理只是可选的文化反思镜头，不替你做决定。')),
    el('button', { class: 'btn btn-gold', onclick: openNewDecision }, '＋ 新建决策'));

  const grid = el('div', { class: 'dec-grid' });
  if (!decisions.length) {
    grid.append(el('div', { class: 'dec-empty' },
      el('div', { style: 'font-size:40px;margin-bottom:10px' }, '🧭'),
      el('h3', {}, '还没有决策'),
      el('p', {}, '例如：「要不要从大厂裸辞去做独立开发？」「offer A 稳定 vs offer B 高成长，怎么选？」「今年要不要从一线城市搬回老家？」'),
      el('button', { class: 'btn btn-gold', style: 'margin-top:14px', onclick: openNewDecision }, '创建第一个决策 →')));
  } else {
    decisions.forEach((d) => grid.append(decisionCard(d)));
  }
  container.append(head, grid);
}

const STATUS_LABEL = { open: '待梳理', analyzing: '分析中', deciding: '待决定', executing: '执行中', reviewing: '复盘中', closed: '已完成' };
function decisionCard(d) {
  return el('div', { class: 'dec-card', onclick: () => go('decisions/' + d.id) },
    el('div', { class: 'dec-card-top' },
      el('span', { class: 'dec-status s-' + (d.status || 'open') }, STATUS_LABEL[d.status] || d.status),
      d.deadline_at ? el('span', { class: 'dec-deadline' }, '截止 ' + fmtDate(d.deadline_at)) : null),
    el('h3', {}, d.title),
    el('div', { class: 'dec-card-foot' }, '更新于 ' + fmtDate(d.updated_at)));
}

function fmtDate(v) {
  if (!v) return '';
  const n = typeof v === 'number' ? v : Number(v);
  const d = new Date(isNaN(n) ? v : n);
  if (isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function openNewDecision() {
  const overlay = el('div', { class: 'overlay', onclick: (e) => { if (e.target === overlay) overlay.remove(); } });
  const err = el('div', { class: 'err', style: 'display:none' });
  const titleI = el('input', { type: 'text', placeholder: '例如：要不要接受 B 公司的 offer？' });
  const stmtI = el('textarea', { rows: '3', placeholder: '用一两句话把你真正纠结的问题说清楚（可留空，之后再补）' });
  const deadI = el('input', { type: 'date' });
  const goalsI = el('input', { type: 'text', placeholder: '你想达成的目标，逗号分隔（如：收入增长, 学到东西, 生活平衡）' });
  const consI = el('input', { type: 'text', placeholder: '硬约束，逗号分隔（如：不能离开现城市, 家庭开支不能断）' });
  const lossI = el('input', { type: 'text', placeholder: '你能承受的最大损失（如：3 个月生活费 + 一段时间焦虑）' });
  const revSel = el('select', {},
    el('option', { value: '' }, '这个决定可逆吗？'),
    el('option', { value: 'reversible' }, '基本可逆（走错还能回头）'),
    el('option', { value: 'partially' }, '部分可逆（代价不小）'),
    el('option', { value: 'irreversible' }, '几乎不可逆（一步定局）'));

  const submit = async () => {
    err.style.display = 'none';
    if (!titleI.value.trim()) { err.textContent = '请先写下你要做的决策'; err.style.display = 'block'; return; }
    const btn = overlay.querySelector('.btn-gold');
    btn.disabled = true; btn.innerHTML = '<span class="spin"></span> 创建中…';
    try {
      const body = {
        title: titleI.value.trim(),
        statement: stmtI.value.trim(),
        deadline_at: deadI.value ? new Date(deadI.value).getTime() : undefined,
        goals: splitList(goalsI.value),
        constraints: splitList(consI.value),
        affordable_loss: lossI.value.trim(),
        reversibility: revSel.value || undefined,
        chart_id: state.chartId || undefined,
      };
      const { id } = await API.call('/decisions', { method: 'POST', body });
      overlay.remove();
      go('decisions/' + id);
    } catch (e) { err.textContent = e.message; err.style.display = 'block'; btn.disabled = false; btn.textContent = '创建决策 →'; }
  };

  const modal = el('div', { class: 'modal', style: 'position:relative;max-width:520px' },
    el('span', { class: 'close', onclick: () => overlay.remove() }, '×'),
    el('h3', {}, '新建一个重大决策'),
    el('div', { class: 'muted' }, '好的决策，从把问题问清楚开始。'),
    err,
    el('div', { class: 'field' }, el('label', {}, '决策标题 *'), titleI),
    el('div', { class: 'field' }, el('label', {}, '问题陈述'), stmtI),
    el('div', { class: 'row2' },
      el('div', { class: 'field' }, el('label', {}, '决策截止日'), deadI),
      el('div', { class: 'field' }, el('label', {}, '可逆性'), revSel)),
    el('div', { class: 'field' }, el('label', {}, '目标'), goalsI),
    el('div', { class: 'field' }, el('label', {}, '硬约束'), consI),
    el('div', { class: 'field' }, el('label', {}, '可承受的最大损失'), lossI),
    el('button', { class: 'btn btn-gold', style: 'width:100%;margin-top:6px', onclick: submit }, '创建决策 →'));
  overlay.append(modal); document.body.append(overlay);
  setTimeout(() => titleI.focus(), 50);
}

function splitList(s) { return String(s || '').split(/[,，、;；\n]/).map((x) => x.trim()).filter(Boolean); }

// ---- DETAIL ----
async function renderDecisionDetail(container, id) {
  container.innerHTML = '';
  container.append(el('div', { class: 'typing', style: 'margin:40px auto' }, '载入决策…'));
  let data;
  try { data = await API.call('/decisions/' + id); }
  catch (e) { container.innerHTML = ''; container.append(el('div', { class: 'dec-empty' }, el('h3', {}, '找不到这个决策'), el('button', { class: 'btn btn-ghost', style: 'margin-top:12px', onclick: () => go('decisions') }, '← 返回决策台'))); return; }
  const d = data.decision;
  decState.current = d;
  decState.options = data.options || [];
  decState.evidence = data.evidence || [];
  decState.actions = data.actions || [];
  decState.reviews = data.reviews || [];
  decState.analysis = null;

  container.innerHTML = '';
  const back = el('a', { class: 'dec-back', onclick: () => go('decisions') }, '← 决策台');

  const goals = safeArr(d.goals), cons = safeArr(d.constraints), vals = safeArr(d.values_rank);
  const header = el('div', { class: 'dec-detail-head' },
    el('span', { class: 'dec-status s-' + (d.status || 'open') }, STATUS_LABEL[d.status] || d.status),
    el('h1', {}, d.title),
    d.statement ? el('p', { class: 'dec-stmt' }, d.statement) : null,
    el('div', { class: 'dec-meta' },
      d.deadline_at ? el('span', {}, '⏳ 截止 ' + fmtDate(d.deadline_at)) : null,
      d.reversibility ? el('span', {}, '🔁 ' + revLabel(d.reversibility)) : null,
      d.affordable_loss ? el('span', {}, '🛡 可承受损失：' + d.affordable_loss) : null),
    goals.length ? tagRow('目标', goals) : null,
    cons.length ? tagRow('硬约束', cons) : null,
    vals.length ? tagRow('价值排序', vals) : null);

  container.append(back, header,
    optionsSection(id),
    evidenceSection(id),
    analyzeSection(id),
    actionsSection(id),
    reviewSection(id));
}

function revLabel(v) { return { reversible: '基本可逆', partially: '部分可逆', irreversible: '几乎不可逆' }[v] || v; }
function safeArr(s) { try { const v = typeof s === 'string' ? JSON.parse(s) : s; return Array.isArray(v) ? v : []; } catch { return []; } }
function tagRow(label, items) {
  return el('div', { class: 'dec-tagrow' }, el('span', { class: 'dec-tag-lab' }, label),
    ...items.map((t) => el('span', { class: 'dec-tag' }, t)));
}

function decSection(title, sub, ...body) {
  return el('section', { class: 'dec-section' },
    el('div', { class: 'dec-section-head' }, el('h2', {}, title), sub ? el('p', {}, sub) : null),
    ...body);
}

// ---- OPTIONS + RISK MATRIX ----
function optionsSection(decId) {
  const wrap = el('div', { class: 'opt-list' });
  const renderOpts = () => {
    wrap.innerHTML = '';
    if (!decState.options.length) { wrap.append(el('div', { class: 'dec-hint' }, '还没有备选项。至少加入 2 个选项（含「维持现状」），对比才有意义。')); }
    decState.options.forEach((o) => wrap.append(optionCard(o)));
    wrap.append(el('button', { class: 'btn btn-ghost dec-add', onclick: () => openOptionModal(decId, renderOpts) }, '＋ 添加选项'));
  };
  renderOpts();
  return decSection('① 备选项与风险矩阵', '每个选项都写清上行空间、下行风险、你主观估计的成功概率、最坏情况与止损线——这是决策质量的核心。', wrap);
}

function optionCard(o) {
  const prob = (o.subjective_prob != null && o.subjective_prob !== '') ? Math.round(Number(o.subjective_prob) * 100) + '%' : '—';
  return el('div', { class: 'opt-card' },
    el('div', { class: 'opt-card-h' }, el('h4', {}, o.label), el('span', { class: 'opt-prob', title: '你主观估计的成功概率' }, '成功概率 ' + prob)),
    el('div', { class: 'opt-matrix' },
      matrixCell('↗ 上行空间', o.upside, 'up'),
      matrixCell('↘ 下行风险', o.downside, 'down'),
      matrixCell('⚠ 最坏情况', o.worst_case, 'worst'),
      matrixCell('🛑 止损线', o.stop_loss, 'stop')));
}
function matrixCell(label, val, kind) {
  return el('div', { class: 'mx-cell mx-' + kind },
    el('div', { class: 'mx-lab' }, label),
    el('div', { class: 'mx-val' }, val && String(val).trim() ? val : el('span', { class: 'mx-empty' }, '未填写')));
}

function openOptionModal(decId, onDone) {
  const overlay = el('div', { class: 'overlay', onclick: (e) => { if (e.target === overlay) overlay.remove(); } });
  const err = el('div', { class: 'err', style: 'display:none' });
  const labelI = el('input', { type: 'text', placeholder: '如：接受 offer / 维持现状 / 再等三个月' });
  const upI = el('textarea', { rows: '2', placeholder: '如果顺利，最好能得到什么？' });
  const downI = el('textarea', { rows: '2', placeholder: '如果不顺利，会失去/付出什么？' });
  const probI = el('input', { type: 'number', min: '0', max: '100', step: '1', placeholder: '你主观估计的成功概率 %（如 60）' });
  const worstI = el('input', { type: 'text', placeholder: '最坏情况具体是什么？' });
  const stopI = el('input', { type: 'text', placeholder: '出现什么信号就必须止损/退出？' });

  const submit = async () => {
    err.style.display = 'none';
    if (!labelI.value.trim()) { err.textContent = '请填写选项名称'; err.style.display = 'block'; return; }
    const btn = overlay.querySelector('.btn-gold'); btn.disabled = true; btn.innerHTML = '<span class="spin"></span> 保存中…';
    try {
      let prob = probI.value.trim() === '' ? undefined : Number(probI.value) / 100;
      if (prob != null && (prob < 0 || prob > 1)) prob = Math.max(0, Math.min(1, prob));
      const { id } = await API.call(`/decisions/${decId}/options`, { method: 'POST', body: {
        label: labelI.value.trim(), upside: upI.value.trim(), downside: downI.value.trim(),
        subjective_prob: prob, worst_case: worstI.value.trim(), stop_loss: stopI.value.trim(),
        sort_order: decState.options.length,
      } });
      decState.options.push({ id, label: labelI.value.trim(), upside: upI.value.trim(), downside: downI.value.trim(), subjective_prob: prob, worst_case: worstI.value.trim(), stop_loss: stopI.value.trim() });
      overlay.remove(); onDone();
    } catch (e) { err.textContent = e.message; err.style.display = 'block'; btn.disabled = false; btn.textContent = '保存选项'; }
  };

  const modal = el('div', { class: 'modal', style: 'position:relative;max-width:520px' },
    el('span', { class: 'close', onclick: () => overlay.remove() }, '×'),
    el('h3', {}, '添加一个选项'),
    err,
    el('div', { class: 'field' }, el('label', {}, '选项名称 *'), labelI),
    el('div', { class: 'row2' },
      el('div', { class: 'field' }, el('label', {}, '上行空间'), upI),
      el('div', { class: 'field' }, el('label', {}, '下行风险'), downI)),
    el('div', { class: 'field' }, el('label', {}, '主观成功概率（%）'), probI),
    el('div', { class: 'field' }, el('label', {}, '最坏情况'), worstI),
    el('div', { class: 'field' }, el('label', {}, '止损线'), stopI),
    el('button', { class: 'btn btn-gold', style: 'width:100%;margin-top:6px', onclick: submit }, '保存选项'));
  overlay.append(modal); document.body.append(overlay);
  setTimeout(() => labelI.focus(), 50);
}

// ---- EVIDENCE ----
function evidenceSection(decId) {
  const wrap = el('div', { class: 'ev-list' });
  const renderEv = () => {
    wrap.innerHTML = '';
    if (!decState.evidence.length) wrap.append(el('div', { class: 'dec-hint' }, '把「支持」与「反对」的证据分开记录，避免只看对自己有利的信息。'));
    decState.evidence.forEach((e) => wrap.append(
      el('div', { class: 'ev-item ev-' + (e.stance || 'neutral') },
        el('span', { class: 'ev-badge' }, e.stance === 'support' ? '支持' : e.stance === 'against' ? '反对' : '中性'),
        el('span', { class: 'ev-txt' }, e.content))));
    wrap.append(el('button', { class: 'btn btn-ghost dec-add', onclick: () => openEvidenceModal(decId, renderEv) }, '＋ 添加证据'));
  };
  renderEv();
  return decSection('② 证据（区分支持 / 反对）', '决策质量取决于是否认真找过反面证据。', wrap);
}

function openEvidenceModal(decId, onDone) {
  // Evidence uses the /options endpoint? No — evidence is read-only from GET; there is no POST evidence route.
  // Provide a lightweight local-only note that we persist via a decision "note" — but backend has no evidence POST.
  // So we keep evidence editing client-side and fold it into analyze input is not possible; inform honestly.
  const overlay = el('div', { class: 'overlay', onclick: (e) => { if (e.target === overlay) overlay.remove(); } });
  const err = el('div', { class: 'err', style: 'display:none' });
  const stance = el('select', {}, el('option', { value: 'support' }, '支持'), el('option', { value: 'against' }, '反对'), el('option', { value: 'neutral' }, '中性'));
  const txt = el('textarea', { rows: '3', placeholder: '一条具体、可验证的证据或事实' });
  const submit = async () => {
    err.style.display = 'none';
    if (!txt.value.trim()) { err.textContent = '请填写证据内容'; err.style.display = 'block'; return; }
    // Persist locally in decState (no server evidence-write endpoint yet — tracked in PROGRESS.md).
    decState.evidence.push({ id: 'local-' + Date.now(), stance: stance.value, content: txt.value.trim(), _local: true });
    overlay.remove(); onDone();
  };
  const modal = el('div', { class: 'modal', style: 'position:relative;max-width:480px' },
    el('span', { class: 'close', onclick: () => overlay.remove() }, '×'),
    el('h3', {}, '添加一条证据'),
    el('div', { class: 'muted' }, '当前证据在本次会话内使用（服务端持久化端点在开发中，见 PROGRESS.md）。'),
    err,
    el('div', { class: 'field' }, el('label', {}, '立场'), stance),
    el('div', { class: 'field' }, el('label', {}, '证据内容'), txt),
    el('button', { class: 'btn btn-gold', style: 'width:100%;margin-top:6px', onclick: submit }, '添加'));
  overlay.append(modal); document.body.append(overlay);
  setTimeout(() => txt.focus(), 50);
}

// ---- AI STRUCTURED ANALYSIS ----
function analyzeSection(decId) {
  const box = el('div', { class: 'analyze-box' });
  const runBtn = el('button', { class: 'btn btn-gold', onclick: () => runAnalyze(decId, box, runBtn) }, '🧠 生成结构化分析');
  const credits = state.user && state.user.plan === 'free' ? el('span', { class: 'analyze-quota' }, `将消耗 1 次分析额度（剩余 ${state.user.credits}）`) : el('span', { class: 'analyze-quota' }, 'Core 会员：每月公平使用额度');
  box.append(el('div', { class: 'analyze-cta' }, runBtn, credits));
  return decSection('③ AI 结构化分析', 'AI 帮你把「事实 / 假设 / 文化反思 / 风险」分开，绝不替你拍板，也不会把命理当成现实因果。', box);
}

async function runAnalyze(decId, box, btn) {
  if (decState.busy) return; decState.busy = true;
  btn.disabled = true; btn.innerHTML = '<span class="spin"></span> 分析中…';
  try {
    const { analysis } = await API.call(`/decisions/${decId}/analyze`, { method: 'POST', body: { evidence: decState.evidence } });
    decState.analysis = analysis;
    if (state.user && state.user.plan === 'free' && typeof state.user.credits === 'number') state.user.credits = Math.max(0, state.user.credits - 1);
    box.innerHTML = '';
    box.append(renderAnalysis(analysis, decId, box, btn));
  } catch (e) {
    btn.disabled = false; btn.innerHTML = '🧠 生成结构化分析';
    if (e.status === 402) { toast('本期 AI 额度已用完，升级 Core 获得更多分析'); setTimeout(() => go('pricing'), 500); }
    else toast(e.message || '分析失败');
  } finally { decState.busy = false; }
}

function renderAnalysis(a, decId, box, btn) {
  const frag = el('div', { class: 'analysis' });
  // Degraded / mode banner
  frag.append(el('div', { class: 'analysis-mode' + (a.degraded ? ' degraded' : '') },
    a.degraded ? '⚙ 本次为本地结构化分析（未配置外部 AI 模型，数据不出站）。' : '✓ 已启用增强分析。'));

  const block = (title, items, cls, note) => {
    const list = (items || []).filter((x) => x != null && String(x).trim() !== '');
    if (!list.length && !note) return null;
    return el('div', { class: 'an-block ' + cls },
      el('h4', {}, title), note ? el('p', { class: 'an-note' }, note) : null,
      list.length ? el('ul', {}, ...list.map((x) => el('li', {}, typeof x === 'string' ? x : JSON.stringify(x)))) : el('p', { class: 'an-empty' }, '（无）'));
  };

  frag.append(
    block('✅ 你陈述的目标', a.user_stated_goals, 'an-facts'),
    block('📌 硬约束', a.constraints, 'an-facts'),
    block('🔎 已知事实', a.facts, 'an-facts', a.facts && a.facts.length ? null : 'AI 未从你提供的信息中提取到确凿事实——补充更多客观信息会让分析更可靠。'),
    block('❓ 关键假设（需你验证）', a.assumptions, 'an-assume', '以下是推断而非事实，做决定前请尽量核实。'),
    block('🕳 信息缺口', a.missing_information, 'an-assume'),
    block('🧭 军师建议（仅供参考）', a.recommendations, 'an-advice', 'AI 推断，非确定性结论。'),
    block('🀄 文化反思镜头', a.cultural_reflections, 'an-culture', '命理/传统视角仅用于自我反思，不构成现实因果或决策依据。'),
    block('⚠ 风险', a.risks, 'an-risk'),
    block('🌫 不确定性', a.uncertainties, 'an-risk'),
    block('🛑 止损条件', a.stop_loss_conditions, 'an-risk'),
    block('🚦 安全提示', a.safety_flags, 'an-safety'),
    block('👉 建议的下一步行动', a.actions, 'an-actions'));

  // disclaimer — always shown
  frag.append(el('div', { class: 'an-disclaimer' }, '⚖ ' + (a.disclaimer || 'AI 与文化模块的输出用于辅助思考，不构成职业/投资/医疗/法律/婚姻的确定性建议。最终决定与责任在你自己。')));
  frag.append(el('button', { class: 'btn btn-ghost', style: 'margin-top:8px', onclick: () => { box.innerHTML = ''; box.append(el('div', { class: 'analyze-cta' }, btn)); btn.disabled = false; btn.innerHTML = '🧠 重新生成分析'; } }, '重新分析'));
  return frag;
}

// ---- ACTIONS ----
function actionsSection(decId) {
  const wrap = el('div', { class: 'act-list' });
  const renderActs = () => {
    wrap.innerHTML = '';
    if (!decState.actions.length) wrap.append(el('div', { class: 'dec-hint' }, '把决定拆成 7 天内可验证的具体动作，才不会停留在想。'));
    decState.actions.forEach((a) => wrap.append(
      el('div', { class: 'act-item' },
        el('span', { class: 'act-check act-' + (a.status || 'todo') }, a.status === 'done' ? '✓' : '○'),
        el('div', { class: 'act-body' }, el('div', { class: 'act-txt' }, a.content),
          el('div', { class: 'act-meta' }, [a.owner ? '负责人 ' + a.owner : null, a.due_at ? '截止 ' + fmtDate(a.due_at) : null].filter(Boolean).join(' · '))))));
    wrap.append(el('button', { class: 'btn btn-ghost dec-add', onclick: () => openActionModal(decId, renderActs) }, '＋ 添加行动'));
  };
  renderActs();
  return decSection('④ 行动计划', '决策的价值在执行。给每个动作一个负责人和截止日。', wrap);
}

function openActionModal(decId, onDone) {
  const overlay = el('div', { class: 'overlay', onclick: (e) => { if (e.target === overlay) overlay.remove(); } });
  const err = el('div', { class: 'err', style: 'display:none' });
  const contentI = el('input', { type: 'text', placeholder: '如：本周约两位业内前辈聊 offer B 的真实情况' });
  const ownerI = el('input', { type: 'text', placeholder: '负责人（默认自己）' });
  const dueI = el('input', { type: 'date' });
  const submit = async () => {
    err.style.display = 'none';
    if (!contentI.value.trim()) { err.textContent = '请填写行动内容'; err.style.display = 'block'; return; }
    const btn = overlay.querySelector('.btn-gold'); btn.disabled = true; btn.innerHTML = '<span class="spin"></span> 保存中…';
    try {
      const { id } = await API.call(`/decisions/${decId}/actions`, { method: 'POST', body: {
        content: contentI.value.trim(), owner: ownerI.value.trim(), due_at: dueI.value ? new Date(dueI.value).getTime() : undefined } });
      decState.actions.push({ id, content: contentI.value.trim(), owner: ownerI.value.trim(), due_at: dueI.value ? new Date(dueI.value).getTime() : null, status: 'todo' });
      overlay.remove(); onDone();
    } catch (e) { err.textContent = e.message; err.style.display = 'block'; btn.disabled = false; btn.textContent = '保存行动'; }
  };
  const modal = el('div', { class: 'modal', style: 'position:relative;max-width:480px' },
    el('span', { class: 'close', onclick: () => overlay.remove() }, '×'),
    el('h3', {}, '添加一个行动'),
    err,
    el('div', { class: 'field' }, el('label', {}, '行动 *'), contentI),
    el('div', { class: 'row2' },
      el('div', { class: 'field' }, el('label', {}, '负责人'), ownerI),
      el('div', { class: 'field' }, el('label', {}, '截止日'), dueI)),
    el('button', { class: 'btn btn-gold', style: 'width:100%;margin-top:6px', onclick: submit }, '保存行动'));
  overlay.append(modal); document.body.append(overlay);
  setTimeout(() => contentI.focus(), 50);
}

// ---- REVIEW ----
function reviewSection(decId) {
  const wrap = el('div', { class: 'rev-list' });
  const renderRev = () => {
    wrap.innerHTML = '';
    if (!decState.reviews.length) wrap.append(el('div', { class: 'dec-hint' }, '决定之后 30/90 天回来复盘：结果如何？当初的建议是否奏效？这样系统才能帮你校准判断。'));
    decState.reviews.forEach((r) => wrap.append(
      el('div', { class: 'rev-item' },
        el('div', { class: 'rev-h' }, el('span', {}, '复盘 · ' + fmtDate(r.review_at || r.created_at)),
          el('span', { class: 'rev-sat' }, r.satisfaction != null ? '满意度 ' + r.satisfaction + '/5' : ''),
          el('span', { class: 'rev-worked' }, r.advice_worked ? '建议奏效 ✓' : '建议未奏效')),
        r.outcome ? el('p', { class: 'rev-outcome' }, r.outcome) : null,
        r.notes ? el('p', { class: 'rev-notes' }, r.notes) : null)));
    wrap.append(el('button', { class: 'btn btn-ghost dec-add', onclick: () => openReviewModal(decId, renderRev) }, '＋ 记录一次复盘'));
  };
  renderRev();
  return decSection('⑤ 复盘与校准', '记录真实结果，才知道当初的判断是否可靠。', wrap);
}

function openReviewModal(decId, onDone) {
  const overlay = el('div', { class: 'overlay', onclick: (e) => { if (e.target === overlay) overlay.remove(); } });
  const err = el('div', { class: 'err', style: 'display:none' });
  const outcomeI = el('textarea', { rows: '3', placeholder: '实际发生了什么？结果如何？' });
  const satSel = el('select', {}, el('option', { value: '' }, '你对结果的满意度'),
    ...[1, 2, 3, 4, 5].map((n) => el('option', { value: String(n) }, n + ' / 5')));
  const workedSel = el('select', {}, el('option', { value: '' }, '当初的分析/建议是否奏效？'),
    el('option', { value: '1' }, '奏效'), el('option', { value: '0' }, '未奏效'));
  const notesI = el('textarea', { rows: '2', placeholder: '你学到了什么？下次会怎么做？' });
  const submit = async () => {
    err.style.display = 'none';
    if (!outcomeI.value.trim()) { err.textContent = '请填写实际结果'; err.style.display = 'block'; return; }
    const btn = overlay.querySelector('.btn-gold'); btn.disabled = true; btn.innerHTML = '<span class="spin"></span> 保存中…';
    try {
      const { id } = await API.call(`/decisions/${decId}/reviews`, { method: 'POST', body: {
        outcome: outcomeI.value.trim(), satisfaction: satSel.value ? Number(satSel.value) : undefined,
        advice_worked: workedSel.value === '1', notes: notesI.value.trim() } });
      decState.reviews.push({ id, review_at: Date.now(), outcome: outcomeI.value.trim(), satisfaction: satSel.value ? Number(satSel.value) : null, advice_worked: workedSel.value === '1' ? 1 : 0, notes: notesI.value.trim() });
      overlay.remove(); onDone();
    } catch (e) { err.textContent = e.message; err.style.display = 'block'; btn.disabled = false; btn.textContent = '保存复盘'; }
  };
  const modal = el('div', { class: 'modal', style: 'position:relative;max-width:480px' },
    el('span', { class: 'close', onclick: () => overlay.remove() }, '×'),
    el('h3', {}, '记录一次复盘'),
    err,
    el('div', { class: 'field' }, el('label', {}, '实际结果 *'), outcomeI),
    el('div', { class: 'row2' },
      el('div', { class: 'field' }, el('label', {}, '满意度'), satSel),
      el('div', { class: 'field' }, el('label', {}, '建议是否奏效'), workedSel)),
    el('div', { class: 'field' }, el('label', {}, '经验记录'), notesI),
    el('button', { class: 'btn btn-gold', style: 'width:100%;margin-top:6px', onclick: submit }, '保存复盘'));
  overlay.append(modal); document.body.append(overlay);
  setTimeout(() => outcomeI.focus(), 50);
}

// ============================================================
//  ACCOUNT — privacy & data control (MED-9): opt-in memory,
//  view/delete memories, export, account deletion
// ============================================================
route('account', async () => {
  app().append(navBar());
  const container = el('div', { class: 'decwrap' });
  app().append(container);
  container.append(el('div', { class: 'typing', style: 'margin:40px auto' }, '载入账户…'));
  let me, mems = [];
  try {
    me = (await API.call('/me')).user;
    mems = (await API.call('/me/memories')).memories || [];
  } catch (e) { toast(e.message); }
  state.user = me || state.user;
  container.innerHTML = '';

  const head = el('div', { class: 'dec-head' },
    el('div', {}, el('div', { class: 'k' }, 'PRIVACY & DATA'), el('h2', {}, '隐私与数据控制'),
      el('p', { class: 'dec-sub' }, '你的数据由你掌控。长期记忆默认关闭，只有你主动开启后，系统才会记住你的偏好；你随时可以查看、删除、导出或彻底注销。')));

  // memory opt-in toggle
  const optState = { on: !!(state.user && state.user.memory_opt_in) };
  const toggle = el('button', { class: 'dec-toggle' + (optState.on ? ' on' : '') });
  const setToggle = () => { toggle.className = 'dec-toggle' + (optState.on ? ' on' : ''); toggle.textContent = optState.on ? '已开启' : '已关闭'; };
  setToggle();
  toggle.addEventListener('click', async () => {
    try {
      const r = await API.call('/me/memory-optin', { method: 'POST', body: { enabled: !optState.on } });
      optState.on = !!r.memory_opt_in; if (state.user) state.user.memory_opt_in = optState.on; setToggle();
      toast(optState.on ? '已开启长期记忆' : '已关闭长期记忆');
    } catch (e) { toast(e.message); }
  });

  const memWrap = el('div', { class: 'mem-list' });
  const renderMems = () => {
    memWrap.innerHTML = '';
    if (!mems.length) { memWrap.append(el('div', { class: 'dec-hint' }, '暂无长期记忆记录。')); return; }
    mems.forEach((m) => memWrap.append(
      el('div', { class: 'mem-item' },
        el('div', { class: 'mem-txt' }, el('span', { class: 'mem-kind' }, m.kind || 'note'), m.content),
        el('button', { class: 'mem-del', onclick: async () => {
          try { await API.call('/me/memories/' + m.id, { method: 'DELETE' }); mems = mems.filter((x) => x.id !== m.id); renderMems(); toast('已删除'); }
          catch (e) { toast(e.message); } } }, '删除'))));
  };
  renderMems();

  const exportBtn = el('button', { class: 'btn btn-ghost', onclick: async () => {
    try {
      const data = await API.call('/me/export');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = el('a', { href: url, download: 'meridian-export.json' }); document.body.append(a); a.click(); a.remove(); URL.revokeObjectURL(url);
      toast('数据已导出');
    } catch (e) { toast(e.message); }
  } }, '导出我的全部数据 (JSON)');

  const delBtn = el('button', { class: 'btn btn-danger', onclick: async () => {
    if (!confirm('确定要永久注销账户吗？你的命盘、对话、决策、记忆将被彻底删除，且不可恢复。')) return;
    if (!confirm('再次确认：此操作不可撤销。')) return;
    try { await API.call('/me', { method: 'DELETE' }); API.setToken(null); state.user = null; toast('账户已注销'); go('home'); }
    catch (e) { toast(e.message); }
  } }, '永久注销账户');

  container.append(head,
    decSection('长期记忆', '默认关闭。开启后，系统会在对话中记住你的目标与偏好，让建议更贴合你。',
      el('div', { class: 'opt-toggle-row' }, el('span', {}, '允许记住我的长期偏好'), toggle)),
    decSection('记忆内容', '你可以随时删除任意一条。', memWrap),
    decSection('数据可携与注销', '你拥有完整的数据主权。',
      el('div', { class: 'acct-actions' }, exportBtn, delBtn)));
});

// ---- launch ----
boot();
