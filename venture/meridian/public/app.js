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
    ? [el('a', { href: '#app' }, '对话'), el('a', { href: '#pricing' }, '会员'),
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
    { k: 'free', name: '体验', price: '¥0', per: '', feats: ['精确排盘（八字+紫微）', '基础命盘解读', '3 次军师对话', '记住你的基本信息'], cta: '免费开始', act: () => state.user ? go('app') : openAuth('register'), feat: false },
    { k: 'plus', name: 'Plus', price: '¥29', per: '/月', feats: ['无限军师对话', '完整大运流年推演', '长期记忆·越聊越懂', '事业/财富/关系/时机专题', '优先响应'], cta: '升级 Plus', act: () => upgrade('plus'), feat: true },
    { k: 'pro', name: 'Pro', price: '¥99', per: '/月', feats: ['Plus 全部权益', '多张命盘（家人/伙伴/合盘）', '年度运势深度报告', '关键决策一对一深聊', '新功能抢先体验'], cta: '升级 Pro', act: () => upgrade('pro'), feat: false },
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
    await API.call('/billing/upgrade', { method: 'POST', body: { plan } });
    const { user } = await API.call('/me'); state.user = user;
    toast(`已升级到 ${plan === 'plus' ? 'Plus' : 'Pro'}，现在可无限畅聊`);
    render();
  } catch (e) { toast(e.message); }
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
  const name = (location.hash || '#home').slice(1).split('?')[0] || 'home';
  if ((name === 'app') && !state.user) { go('home'); return; }
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
    el('div', { class: 'credits' }, state.user.plan === 'free' ? `剩余 ${state.user.credits} 次免费对话` : `${state.user.plan === 'plus' ? 'Plus' : 'Pro'} · 无限畅聊`));
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
        document.createTextNode('你的免费对话额度已用完。升级 Plus（¥29/月）即可无限畅聊，并解锁完整大运流年与长期记忆。'));
      if (msgs) msgs.append(up);
      setTimeout(() => go('pricing'), 400);
    } else {
      toast(e.message || '发送失败');
    }
  } finally { state.sending = false; }
}

// ---- launch ----
boot();
