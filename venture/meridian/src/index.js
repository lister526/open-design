import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { buildChart } from './engine.js';
import { hashPassword, verifyPassword, signToken, verifyToken, uuid, refCode } from './auth.js';
import { buildSystemPrompt, chat, extractMemories, advisorFallback } from './ai.js';

const app = new Hono();
app.use('/api/*', cors());

// ---------- helpers ----------
const now = () => Date.now();
const json = (c, obj, status = 200) => c.json(obj, status);

function llmCfg(env) {
  return {
    apiKey: env.OPENAI_API_KEY,
    baseURL: env.OPENAI_BASE_URL || 'https://www.genspark.ai/api/llm_proxy/v1',
    model: env.LLM_MODEL || 'gpt-5-mini',
  };
}

async function auth(c) {
  const h = c.req.header('Authorization') || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return null;
  const payload = await verifyToken(token, c.env.JWT_SECRET || 'dev-secret');
  if (!payload) return null;
  const user = await c.env.DB.prepare('SELECT * FROM users WHERE id=?').bind(payload.sub).first();
  return user || null;
}

async function logEvent(env, userId, name, props) {
  try {
    await env.DB.prepare('INSERT INTO events (id,user_id,name,props,created_at) VALUES (?,?,?,?,?)')
      .bind(uuid(), userId, name, JSON.stringify(props || {}), now()).run();
  } catch {}
}

// ---------- health ----------
app.get('/api/health', (c) => json(c, { ok: true, app: c.env.APP_NAME || 'Meridian', ts: now() }));

// ---------- auth ----------
app.post('/api/auth/register', async (c) => {
  const { email, password, name, referred_by } = await c.req.json().catch(() => ({}));
  if (!email || !password || password.length < 6) return json(c, { error: '邮箱或密码不合法（密码≥6位）' }, 400);
  const exists = await c.env.DB.prepare('SELECT id FROM users WHERE email=?').bind(email).first();
  if (exists) return json(c, { error: '该邮箱已注册' }, 409);
  const id = uuid();
  const code = refCode();
  const bonus = referred_by ? 5 : 0;
  await c.env.DB.prepare(
    'INSERT INTO users (id,email,password_hash,name,locale,plan,credits,referral_code,referred_by,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)'
  ).bind(id, email, await hashPassword(password), name || email.split('@')[0], 'zh', 'free', 3 + bonus, code, referred_by || null, now(), now()).run();
  if (referred_by) {
    await c.env.DB.prepare('UPDATE users SET credits = credits + 3 WHERE referral_code=?').bind(referred_by).run();
  }
  await logEvent(c.env, id, 'signup', { referred: !!referred_by });
  const token = await signToken({ sub: id }, c.env.JWT_SECRET || 'dev-secret');
  return json(c, { token, user: { id, email, name: name || email.split('@')[0], plan: 'free', credits: 3 + bonus, referral_code: code } });
});

app.post('/api/auth/login', async (c) => {
  const { email, password } = await c.req.json().catch(() => ({}));
  const user = await c.env.DB.prepare('SELECT * FROM users WHERE email=?').bind(email).first();
  if (!user || !(await verifyPassword(password, user.password_hash))) return json(c, { error: '邮箱或密码错误' }, 401);
  const token = await signToken({ sub: user.id }, c.env.JWT_SECRET || 'dev-secret');
  return json(c, { token, user: { id: user.id, email: user.email, name: user.name, plan: user.plan, credits: user.credits, referral_code: user.referral_code } });
});

app.get('/api/me', async (c) => {
  const u = await auth(c);
  if (!u) return json(c, { error: 'unauthorized' }, 401);
  return json(c, { user: { id: u.id, email: u.email, name: u.name, plan: u.plan, credits: u.credits, referral_code: u.referral_code } });
});

// ---------- chart: compute (public preview) ----------
app.post('/api/chart/compute', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { gender, date, time, place, longitude } = body;
  if (!gender || !date) return json(c, { error: '缺少必要参数（性别、出生日期）' }, 400);
  try {
    const chart = buildChart({ gender, date, time: time || '12:00', place: place || '', longitude: longitude ? Number(longitude) : 120 });
    return json(c, { chart });
  } catch (e) {
    return json(c, { error: '排盘失败：' + e.message }, 500);
  }
});

// ---------- chart: save (auth) ----------
app.post('/api/chart', async (c) => {
  const u = await auth(c);
  if (!u) return json(c, { error: 'unauthorized' }, 401);
  const body = await c.req.json().catch(() => ({}));
  const { gender, date, time, place, longitude, label } = body;
  if (!gender || !date) return json(c, { error: '缺少必要参数' }, 400);
  const chart = buildChart({ gender, date, time: time || '12:00', place: place || '', longitude: longitude ? Number(longitude) : 120 });
  const id = uuid();
  await c.env.DB.prepare(
    'INSERT INTO charts (id,user_id,label,gender,birth_date,birth_time,birth_place,longitude,computed,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)'
  ).bind(id, u.id, label || 'self', gender, date, time || '12:00', place || '', longitude ? Number(longitude) : 120, JSON.stringify(chart), now()).run();
  await logEvent(c.env, u.id, 'chart_created', { chartId: id });
  return json(c, { id, chart });
});

app.get('/api/charts', async (c) => {
  const u = await auth(c);
  if (!u) return json(c, { error: 'unauthorized' }, 401);
  const { results } = await c.env.DB.prepare('SELECT id,label,gender,birth_date,birth_time,birth_place,created_at FROM charts WHERE user_id=? ORDER BY created_at DESC').bind(u.id).all();
  return json(c, { charts: results || [] });
});

app.get('/api/chart/:id', async (c) => {
  const u = await auth(c);
  if (!u) return json(c, { error: 'unauthorized' }, 401);
  const row = await c.env.DB.prepare('SELECT * FROM charts WHERE id=? AND user_id=?').bind(c.req.param('id'), u.id).first();
  if (!row) return json(c, { error: 'not found' }, 404);
  return json(c, { id: row.id, chart: JSON.parse(row.computed) });
});

// ---------- conversations ----------
app.post('/api/conversations', async (c) => {
  const u = await auth(c);
  if (!u) return json(c, { error: 'unauthorized' }, 401);
  const { chart_id, topic, title } = await c.req.json().catch(() => ({}));
  const id = uuid();
  await c.env.DB.prepare('INSERT INTO conversations (id,user_id,chart_id,title,topic,created_at,updated_at) VALUES (?,?,?,?,?,?,?)')
    .bind(id, u.id, chart_id || null, title || '新的咨询', topic || 'general', now(), now()).run();
  return json(c, { id });
});

app.get('/api/conversations', async (c) => {
  const u = await auth(c);
  if (!u) return json(c, { error: 'unauthorized' }, 401);
  const { results } = await c.env.DB.prepare('SELECT id,title,topic,chart_id,updated_at FROM conversations WHERE user_id=? ORDER BY updated_at DESC').bind(u.id).all();
  return json(c, { conversations: results || [] });
});

app.get('/api/conversations/:id/messages', async (c) => {
  const u = await auth(c);
  if (!u) return json(c, { error: 'unauthorized' }, 401);
  const conv = await c.env.DB.prepare('SELECT * FROM conversations WHERE id=? AND user_id=?').bind(c.req.param('id'), u.id).first();
  if (!conv) return json(c, { error: 'not found' }, 404);
  const { results } = await c.env.DB.prepare('SELECT role,content,created_at FROM messages WHERE conversation_id=? ORDER BY created_at ASC').bind(conv.id).all();
  return json(c, { messages: results || [] });
});

// ---------- the core: AI chat ----------
app.post('/api/conversations/:id/chat', async (c) => {
  const u = await auth(c);
  if (!u) return json(c, { error: 'unauthorized' }, 401);
  const convId = c.req.param('id');
  const conv = await c.env.DB.prepare('SELECT * FROM conversations WHERE id=? AND user_id=?').bind(convId, u.id).first();
  if (!conv) return json(c, { error: 'conversation not found' }, 404);
  const { content } = await c.req.json().catch(() => ({}));
  if (!content || !content.trim()) return json(c, { error: '消息不能为空' }, 400);

  // credit gate for free users
  if (u.plan === 'free' && u.credits <= 0) {
    return json(c, { error: 'no_credits', message: '免费额度已用完，升级 Plus 可无限畅聊' }, 402);
  }

  // load chart
  let chart = null;
  if (conv.chart_id) {
    const row = await c.env.DB.prepare('SELECT computed FROM charts WHERE id=? AND user_id=?').bind(conv.chart_id, u.id).first();
    if (row) chart = JSON.parse(row.computed);
  }
  // load memories + recent history
  const mem = (await c.env.DB.prepare('SELECT kind,content FROM memories WHERE user_id=? ORDER BY weight DESC, created_at DESC LIMIT 12').bind(u.id).all()).results || [];
  const hist = (await c.env.DB.prepare('SELECT role,content FROM messages WHERE conversation_id=? ORDER BY created_at ASC').bind(convId).all()).results || [];

  const sys = buildSystemPrompt({ chart, memories: mem, userName: u.name, topic: conv.topic });
  const messages = [{ role: 'system', content: sys }, ...hist.slice(-16).map((m) => ({ role: m.role, content: m.content })), { role: 'user', content }];

  const cfg = llmCfg(c.env);
  let reply;
  let usedFallback = false;
  try {
    if (!cfg.apiKey) throw new Error('no key');
    reply = await chat({ ...cfg, messages });
    if (!reply || !reply.trim()) throw new Error('empty');
  } catch (e) {
    // Graceful degradation: chart-driven deterministic advisor (still personalized).
    usedFallback = true;
    reply = advisorFallback({ chart, userMessage: content, userName: u.name });
  }

  // persist
  const t = now();
  await c.env.DB.prepare('INSERT INTO messages (id,conversation_id,role,content,created_at) VALUES (?,?,?,?,?)').bind(uuid(), convId, 'user', content, t).run();
  await c.env.DB.prepare('INSERT INTO messages (id,conversation_id,role,content,created_at) VALUES (?,?,?,?,?)').bind(uuid(), convId, 'assistant', reply, t + 1).run();
  await c.env.DB.prepare('UPDATE conversations SET updated_at=?, title=CASE WHEN title=? THEN ? ELSE title END WHERE id=?')
    .bind(t, '新的咨询', content.slice(0, 18), convId).run();

  // decrement credit for free plan
  let credits = u.credits;
  if (u.plan === 'free') {
    credits = Math.max(0, u.credits - 1);
    await c.env.DB.prepare('UPDATE users SET credits=? WHERE id=?').bind(credits, u.id).run();
  }
  await logEvent(c.env, u.id, 'message_sent', { convId });

  // async memory extraction (best-effort, non-blocking of response correctness)
  if (!usedFallback) c.executionCtx?.waitUntil?.((async () => {
    const facts = await extractMemories({ ...cfg, userMessage: content, assistantMessage: reply });
    for (const f of facts) {
      await c.env.DB.prepare('INSERT INTO memories (id,user_id,kind,content,weight,created_at) VALUES (?,?,?,?,?,?)')
        .bind(uuid(), u.id, f.kind || 'preference', f.content, 1.0, now()).run().catch(() => {});
    }
  })());

  return json(c, { reply, credits, degraded: usedFallback });
});

// ---------- billing (demo upgrade; wire Stripe later) ----------
const PLANS = { plus: { price: 29, name: 'Plus 月度' }, pro: { price: 99, name: 'Pro 月度' } };
app.post('/api/billing/upgrade', async (c) => {
  const u = await auth(c);
  if (!u) return json(c, { error: 'unauthorized' }, 401);
  const { plan } = await c.req.json().catch(() => ({}));
  if (!PLANS[plan]) return json(c, { error: 'invalid plan' }, 400);
  const end = now() + 30 * 86400000;
  await c.env.DB.prepare('INSERT INTO subscriptions (id,user_id,plan,status,provider,current_period_end,created_at) VALUES (?,?,?,?,?,?,?)')
    .bind(uuid(), u.id, plan, 'active', 'demo', end, now()).run();
  await c.env.DB.prepare('UPDATE users SET plan=?, credits=?, updated_at=? WHERE id=?').bind(plan, 9999, now(), u.id).run();
  await c.env.DB.prepare('INSERT INTO orders (id,user_id,product,amount,currency,status,provider,created_at) VALUES (?,?,?,?,?,?,?,?)')
    .bind(uuid(), u.id, plan, PLANS[plan].price, 'CNY', 'paid', 'demo', now()).run();
  await logEvent(c.env, u.id, 'upgrade', { plan });
  return json(c, { ok: true, plan });
});

app.get('/api/plans', (c) => json(c, { plans: PLANS }));

// SPA fallback: let static assets binding serve everything else
app.get('*', async (c) => {
  if (c.env.ASSETS) return c.env.ASSETS.fetch(c.req.raw);
  return c.text('Meridian API', 200);
});

export default app;
