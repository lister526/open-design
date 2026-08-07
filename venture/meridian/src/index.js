import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { buildChart } from './engine.js';
import { synastry } from './synastry.js';
import { hashPassword, verifyPassword, signToken, verifyToken, uuid, refCode } from './auth.js';
import { buildSystemPrompt, chat, extractMemories, advisorFallback } from './ai.js';
import { requireJwtSecret, llmConfig } from './config.js';
import { rateLimit, clientIp, MAX_MESSAGE_LEN, MAX_FIELD_LEN } from './ratelimit.js';
import { PLANS, entitlementFor, getProvider } from './payments.js';

const app = new Hono();
app.use('/api/*', cors());

const now = () => Date.now();
const json = (c, obj, status = 200) => c.json(obj, status);
const clamp = (s, n) => (typeof s === 'string' ? s.slice(0, n) : s);

// ---- auth helper: NO dev-secret fallback (CRIT-2) ----
async function auth(c) {
  const secret = requireJwtSecret(c.env); // throws if missing/weak in prod
  const h = c.req.header('Authorization') || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return null;
  const payload = await verifyToken(token, secret);
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
async function audit(env, actorId, role, action, target, meta) {
  try {
    await env.DB.prepare('INSERT INTO audit_logs (id,actor_id,actor_role,action,target,meta,created_at) VALUES (?,?,?,?,?,?,?)')
      .bind(uuid(), actorId || null, role || null, action, target || null, JSON.stringify(meta || {}), now()).run();
  } catch {}
}

// Global error guard so a thrown config error becomes a clean 500 (not a leak).
app.onError((err, c) => {
  const msg = err?.message || 'error';
  const safe = msg.startsWith('FATAL') || msg.includes('JWT_SECRET') ? 'server_misconfigured' : 'internal_error';
  return json(c, { error: safe }, 500);
});

// ---------- health ----------
app.get('/api/health', (c) => json(c, { ok: true, app: c.env.APP_NAME || 'Meridian', ts: now() }));

// ---------- auth ----------
app.post('/api/auth/register', async (c) => {
  const ip = clientIp(c);
  const rl = rateLimit(`reg:${ip}`, { limit: 5, windowMs: 60_000 });
  if (!rl.ok) return json(c, { error: 'rate_limited', retryAfter: rl.retryAfter }, 429);

  const secret = requireJwtSecret(c.env);
  let { email, password, name, referred_by } = await c.req.json().catch(() => ({}));
  email = clamp((email || '').trim().toLowerCase(), MAX_FIELD_LEN);
  name = clamp(name, MAX_FIELD_LEN);
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json(c, { error: 'invalid_email' }, 400);
  if (!password || password.length < 8 || password.length > 200) return json(c, { error: 'weak_password', message: '密码需 8-200 位' }, 400);

  const exists = await c.env.DB.prepare('SELECT id FROM users WHERE email=?').bind(email).first();
  if (exists) return json(c, { error: 'email_taken' }, 409);

  const id = uuid();
  const code = refCode();
  const bonus = referred_by ? 5 : 0;
  await c.env.DB.prepare(
    'INSERT INTO users (id,email,password_hash,name,locale,plan,credits,referral_code,referred_by,memory_opt_in,monthly_ai_quota,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)'
  ).bind(id, email, await hashPassword(password), name || email.split('@')[0], 'zh', 'free', 3 + bonus, code, referred_by || null, 0, 0, now(), now()).run();
  if (referred_by) {
    await c.env.DB.prepare('UPDATE users SET credits = credits + 3 WHERE referral_code=?').bind(referred_by).run();
  }
  await logEvent(c.env, id, 'signup', { referred: !!referred_by });
  const token = await signToken({ sub: id }, secret);
  return json(c, { token, user: { id, email, name: name || email.split('@')[0], plan: 'free', credits: 3 + bonus, referral_code: code } });
});

app.post('/api/auth/login', async (c) => {
  const ip = clientIp(c);
  const rl = rateLimit(`login:${ip}`, { limit: 10, windowMs: 60_000 });
  if (!rl.ok) return json(c, { error: 'rate_limited', retryAfter: rl.retryAfter }, 429);

  const secret = requireJwtSecret(c.env);
  let { email, password } = await c.req.json().catch(() => ({}));
  email = (email || '').trim().toLowerCase();
  const user = await c.env.DB.prepare('SELECT * FROM users WHERE email=?').bind(email).first();
  // constant-ish: still run a hash compare on a dummy to reduce user-enumeration timing
  const okPass = user ? await verifyPassword(password || '', user.password_hash) : await verifyPassword('x', 'pbkdf2$1$AA$AA').catch(() => false);
  if (!user || !okPass) {
    rateLimit(`loginfail:${ip}`, { limit: 5, windowMs: 300_000 });
    return json(c, { error: 'invalid_credentials' }, 401);
  }
  const token = await signToken({ sub: user.id }, secret);
  return json(c, { token, user: { id: user.id, email: user.email, name: user.name, plan: user.plan, credits: user.credits, referral_code: user.referral_code } });
});

app.get('/api/me', async (c) => {
  const u = await auth(c);
  if (!u) return json(c, { error: 'unauthorized' }, 401);
  return json(c, { user: { id: u.id, email: u.email, name: u.name, plan: u.plan, credits: u.credits, referral_code: u.referral_code, memory_opt_in: !!u.memory_opt_in } });
});

// ---------- privacy: memory control (MED-9) ----------
app.post('/api/me/memory-optin', async (c) => {
  const u = await auth(c);
  if (!u) return json(c, { error: 'unauthorized' }, 401);
  const { enabled } = await c.req.json().catch(() => ({}));
  await c.env.DB.prepare('UPDATE users SET memory_opt_in=?, updated_at=? WHERE id=?').bind(enabled ? 1 : 0, now(), u.id).run();
  await audit(c.env, u.id, 'user', 'memory_optin', u.id, { enabled: !!enabled });
  return json(c, { ok: true, memory_opt_in: !!enabled });
});
app.get('/api/me/memories', async (c) => {
  const u = await auth(c);
  if (!u) return json(c, { error: 'unauthorized' }, 401);
  const { results } = await c.env.DB.prepare('SELECT id,kind,content,created_at FROM memories WHERE user_id=? ORDER BY created_at DESC').bind(u.id).all();
  return json(c, { memories: results || [] });
});
app.delete('/api/me/memories/:id', async (c) => {
  const u = await auth(c);
  if (!u) return json(c, { error: 'unauthorized' }, 401);
  await c.env.DB.prepare('DELETE FROM memories WHERE id=? AND user_id=?').bind(c.req.param('id'), u.id).run();
  return json(c, { ok: true });
});
// Full data export (GDPR/PIPL-style)
app.get('/api/me/export', async (c) => {
  const u = await auth(c);
  if (!u) return json(c, { error: 'unauthorized' }, 401);
  const charts = (await c.env.DB.prepare('SELECT * FROM charts WHERE user_id=?').bind(u.id).all()).results || [];
  const convs = (await c.env.DB.prepare('SELECT * FROM conversations WHERE user_id=?').bind(u.id).all()).results || [];
  const mems = (await c.env.DB.prepare('SELECT * FROM memories WHERE user_id=?').bind(u.id).all()).results || [];
  const decisions = (await c.env.DB.prepare('SELECT * FROM decisions WHERE user_id=? AND deleted_at IS NULL').bind(u.id).all()).results || [];
  const safe = { id: u.id, email: u.email, name: u.name, plan: u.plan, created_at: u.created_at };
  return json(c, { user: safe, charts, conversations: convs, memories: mems, decisions });
});
// Account deletion
app.delete('/api/me', async (c) => {
  const u = await auth(c);
  if (!u) return json(c, { error: 'unauthorized' }, 401);
  for (const t of ['memories', 'messages', 'conversations', 'charts', 'decisions', 'subscriptions', 'orders']) {
    // messages are cleaned via conversation ids
    if (t === 'messages') {
      await c.env.DB.prepare('DELETE FROM messages WHERE conversation_id IN (SELECT id FROM conversations WHERE user_id=?)').bind(u.id).run().catch(() => {});
    } else {
      await c.env.DB.prepare(`DELETE FROM ${t} WHERE user_id=?`).bind(u.id).run().catch(() => {});
    }
  }
  await c.env.DB.prepare('DELETE FROM users WHERE id=?').bind(u.id).run();
  await audit(c.env, u.id, 'user', 'account_deleted', u.id, {});
  return json(c, { ok: true });
});

// ---------- chart: compute (public preview) ----------
app.post('/api/chart/compute', async (c) => {
  const rl = rateLimit(`chart:${clientIp(c)}`, { limit: 20, windowMs: 60_000 });
  if (!rl.ok) return json(c, { error: 'rate_limited', retryAfter: rl.retryAfter }, 429);
  const body = await c.req.json().catch(() => ({}));
  const { gender, date, time, place, longitude } = body;
  if (!gender || !date) return json(c, { error: 'missing_params' }, 400);
  try {
    const chart = buildChart({ gender, date, time: time || '12:00', place: clamp(place || '', MAX_FIELD_LEN), longitude: longitude != null ? Number(longitude) : 120 });
    return json(c, { chart });
  } catch (e) {
    return json(c, { error: 'compute_failed' }, 400);
  }
});

// ---------- chart: save (auth) ----------
app.post('/api/chart', async (c) => {
  const u = await auth(c);
  if (!u) return json(c, { error: 'unauthorized' }, 401);
  const body = await c.req.json().catch(() => ({}));
  const { gender, date, time, place, longitude, label } = body;
  if (!gender || !date) return json(c, { error: 'missing_params' }, 400);
  const chart = buildChart({ gender, date, time: time || '12:00', place: clamp(place || '', MAX_FIELD_LEN), longitude: longitude != null ? Number(longitude) : 120 });
  const id = uuid();
  await c.env.DB.prepare(
    'INSERT INTO charts (id,user_id,label,gender,birth_date,birth_time,birth_place,longitude,computed,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)'
  ).bind(id, u.id, clamp(label || 'self', MAX_FIELD_LEN), gender, date, time || '12:00', clamp(place || '', MAX_FIELD_LEN), longitude != null ? Number(longitude) : 120, JSON.stringify(chart), now()).run();
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
  if (!row) return json(c, { error: 'not_found' }, 404);
  return json(c, { id: row.id, chart: JSON.parse(row.computed) });
});

// ---------- DECISION-OS (P1 core) ----------
app.post('/api/decisions', async (c) => {
  const u = await auth(c);
  if (!u) return json(c, { error: 'unauthorized' }, 401);
  const b = await c.req.json().catch(() => ({}));
  if (!b.title || !b.title.trim()) return json(c, { error: 'title_required' }, 400);
  const id = uuid();
  await c.env.DB.prepare(
    `INSERT INTO decisions (id,user_id,title,statement,deadline_at,status,goals,values_rank,constraints,affordable_loss,reversibility,chart_id,created_at,updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  ).bind(id, u.id, clamp(b.title, 300), clamp(b.statement || '', MAX_MESSAGE_LEN), b.deadline_at || null, 'open',
    JSON.stringify(b.goals || []), JSON.stringify(b.values_rank || []), JSON.stringify(b.constraints || []),
    clamp(b.affordable_loss || '', MAX_FIELD_LEN), b.reversibility || null, b.chart_id || null, now(), now()).run();
  await logEvent(c.env, u.id, 'decision_created', { id });
  return json(c, { id });
});

app.get('/api/decisions', async (c) => {
  const u = await auth(c);
  if (!u) return json(c, { error: 'unauthorized' }, 401);
  const { results } = await c.env.DB.prepare('SELECT id,title,status,deadline_at,updated_at FROM decisions WHERE user_id=? AND deleted_at IS NULL ORDER BY updated_at DESC').bind(u.id).all();
  return json(c, { decisions: results || [] });
});

app.get('/api/decisions/:id', async (c) => {
  const u = await auth(c);
  if (!u) return json(c, { error: 'unauthorized' }, 401);
  const id = c.req.param('id');
  const d = await c.env.DB.prepare('SELECT * FROM decisions WHERE id=? AND user_id=? AND deleted_at IS NULL').bind(id, u.id).first();
  if (!d) return json(c, { error: 'not_found' }, 404);
  const options = (await c.env.DB.prepare('SELECT * FROM decision_options WHERE decision_id=? ORDER BY sort_order').bind(id).all()).results || [];
  const evidence = (await c.env.DB.prepare('SELECT * FROM decision_evidence WHERE decision_id=?').bind(id).all()).results || [];
  const actions = (await c.env.DB.prepare('SELECT * FROM decision_actions WHERE decision_id=?').bind(id).all()).results || [];
  const reviews = (await c.env.DB.prepare('SELECT * FROM decision_reviews WHERE decision_id=?').bind(id).all()).results || [];
  return json(c, { decision: d, options, evidence, actions, reviews });
});

app.post('/api/decisions/:id/options', async (c) => {
  const u = await auth(c);
  if (!u) return json(c, { error: 'unauthorized' }, 401);
  const id = c.req.param('id');
  const d = await c.env.DB.prepare('SELECT id FROM decisions WHERE id=? AND user_id=?').bind(id, u.id).first();
  if (!d) return json(c, { error: 'not_found' }, 404);
  const b = await c.req.json().catch(() => ({}));
  const oid = uuid();
  await c.env.DB.prepare('INSERT INTO decision_options (id,decision_id,label,upside,downside,subjective_prob,worst_case,stop_loss,sort_order,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)')
    .bind(oid, id, clamp(b.label || '选项', 300), clamp(b.upside || '', MAX_MESSAGE_LEN), clamp(b.downside || '', MAX_MESSAGE_LEN), b.subjective_prob ?? null, clamp(b.worst_case || '', MAX_FIELD_LEN), clamp(b.stop_loss || '', MAX_FIELD_LEN), b.sort_order || 0, now()).run();
  return json(c, { id: oid });
});

app.post('/api/decisions/:id/actions', async (c) => {
  const u = await auth(c);
  if (!u) return json(c, { error: 'unauthorized' }, 401);
  const id = c.req.param('id');
  const d = await c.env.DB.prepare('SELECT id FROM decisions WHERE id=? AND user_id=?').bind(id, u.id).first();
  if (!d) return json(c, { error: 'not_found' }, 404);
  const b = await c.req.json().catch(() => ({}));
  const aid = uuid();
  await c.env.DB.prepare('INSERT INTO decision_actions (id,decision_id,content,owner,due_at,status,created_at) VALUES (?,?,?,?,?,?,?)')
    .bind(aid, id, clamp(b.content || '', MAX_FIELD_LEN), clamp(b.owner || '', 100), b.due_at || null, 'todo', now()).run();
  return json(c, { id: aid });
});

app.post('/api/decisions/:id/reviews', async (c) => {
  const u = await auth(c);
  if (!u) return json(c, { error: 'unauthorized' }, 401);
  const id = c.req.param('id');
  const d = await c.env.DB.prepare('SELECT id FROM decisions WHERE id=? AND user_id=?').bind(id, u.id).first();
  if (!d) return json(c, { error: 'not_found' }, 404);
  const b = await c.req.json().catch(() => ({}));
  const rid = uuid();
  await c.env.DB.prepare('INSERT INTO decision_reviews (id,decision_id,review_at,outcome,satisfaction,advice_worked,notes,created_at) VALUES (?,?,?,?,?,?,?,?)')
    .bind(rid, id, b.review_at || now(), clamp(b.outcome || '', MAX_MESSAGE_LEN), b.satisfaction ?? null, b.advice_worked ? 1 : 0, clamp(b.notes || '', MAX_MESSAGE_LEN), now()).run();
  await c.env.DB.prepare('UPDATE decisions SET status=?, updated_at=? WHERE id=?').bind('reviewing', now(), id).run();
  await logEvent(c.env, u.id, 'review_completed', { id });
  return json(c, { id: rid });
});

// AI-assisted structured decision analysis (returns typed schema; falls back locally)
app.post('/api/decisions/:id/analyze', async (c) => {
  const u = await auth(c);
  if (!u) return json(c, { error: 'unauthorized' }, 401);
  const id = c.req.param('id');
  const d = await c.env.DB.prepare('SELECT * FROM decisions WHERE id=? AND user_id=?').bind(id, u.id).first();
  if (!d) return json(c, { error: 'not_found' }, 404);

  // quota gate (server-authoritative; atomic)
  const gate = await consumeAiQuota(c.env, u);
  if (!gate.ok) return json(c, { error: 'no_quota', message: '本期 AI 额度已用完', upgrade: true }, 402);

  let chart = null;
  if (d.chart_id) {
    const row = await c.env.DB.prepare('SELECT computed FROM charts WHERE id=? AND user_id=?').bind(d.chart_id, u.id).first();
    if (row) chart = JSON.parse(row.computed);
  }
  const cfg = llmConfig(c.env);
  const structured = {
    facts: [], user_stated_goals: safeJson(d.goals), constraints: safeJson(d.constraints),
    assumptions: [], missing_information: [], options: [], evidence: [], counter_evidence: [],
    risks: [], uncertainties: [], cultural_reflections: [], recommendations: [], actions: [],
    stop_loss_conditions: [], follow_up_date: null, safety_flags: [],
  };
  // Local structured advisor (always available). LLM enrichment is optional & opt-in.
  const local = advisorFallback({ chart, userMessage: `${d.title}\n${d.statement || ''}`, userName: u.name });
  structured.recommendations.push(local);
  structured.cultural_reflections.push(chart ? '以下解读为文化反思镜头，非现实因果保证，重大决策请结合真实信息与专业意见。' : '未绑定命盘，本次分析基于你提供的事实与目标。');
  structured.actions.push('把这个决策拆成 2-3 个可在 7 天内验证的小行动');
  structured.disclaimer = 'AI 与文化模块的输出用于辅助思考，不构成职业/投资/医疗/法律/婚姻的确定性建议。';
  structured.degraded = !cfg;
  await c.env.DB.prepare('UPDATE decisions SET status=?, updated_at=? WHERE id=?').bind('analyzing', now(), id).run();
  return json(c, { analysis: structured });
});

function safeJson(s) { try { return JSON.parse(s || '[]'); } catch { return []; } }

// ---------- conversations (retained from v1; hardened) ----------
app.post('/api/conversations', async (c) => {
  const u = await auth(c);
  if (!u) return json(c, { error: 'unauthorized' }, 401);
  const { chart_id, topic, title } = await c.req.json().catch(() => ({}));
  const id = uuid();
  await c.env.DB.prepare('INSERT INTO conversations (id,user_id,chart_id,title,topic,created_at,updated_at) VALUES (?,?,?,?,?,?,?)')
    .bind(id, u.id, chart_id || null, clamp(title || '新的咨询', 100), clamp(topic || 'general', 40), now(), now()).run();
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
  if (!conv) return json(c, { error: 'not_found' }, 404);
  const { results } = await c.env.DB.prepare('SELECT role,content,created_at FROM messages WHERE conversation_id=? ORDER BY created_at ASC').bind(conv.id).all();
  return json(c, { messages: results || [] });
});

// Atomic quota consumption for free credits AND paid monthly quota (fixes CRIT-3).
async function consumeAiQuota(env, u) {
  if (u.plan === 'free') {
    const r = await env.DB.prepare("UPDATE users SET credits=credits-1, updated_at=? WHERE id=? AND plan='free' AND credits>0")
      .bind(now(), u.id).run();
    if ((r.meta?.changes || 0) > 0) return { ok: true, credits: Math.max(0, u.credits - 1) };
    return { ok: false };
  }
  // paid: atomic increment of usage under quota
  const r = await env.DB.prepare('UPDATE users SET ai_used_this_period=ai_used_this_period+1, updated_at=? WHERE id=? AND ai_used_this_period < monthly_ai_quota')
    .bind(now(), u.id).run();
  if ((r.meta?.changes || 0) > 0) return { ok: true };
  return { ok: false };
}

app.post('/api/conversations/:id/chat', async (c) => {
  const u = await auth(c);
  if (!u) return json(c, { error: 'unauthorized' }, 401);
  const rl = rateLimit(`chat:${u.id}`, { limit: 20, windowMs: 60_000 });
  if (!rl.ok) return json(c, { error: 'rate_limited', retryAfter: rl.retryAfter }, 429);

  const convId = c.req.param('id');
  const conv = await c.env.DB.prepare('SELECT * FROM conversations WHERE id=? AND user_id=?').bind(convId, u.id).first();
  if (!conv) return json(c, { error: 'not_found' }, 404);
  let { content } = await c.req.json().catch(() => ({}));
  if (!content || !content.trim()) return json(c, { error: 'empty_message' }, 400);
  content = clamp(content, MAX_MESSAGE_LEN); // input length cap (HIGH-5)

  // atomic quota gate BEFORE spending money on LLM
  const gate = await consumeAiQuota(c.env, u);
  if (!gate.ok) return json(c, { error: 'no_quota', message: '额度已用完，升级 Core 获取每月公平使用额度', upgrade: true }, 402);

  let chart = null;
  if (conv.chart_id) {
    const row = await c.env.DB.prepare('SELECT computed FROM charts WHERE id=? AND user_id=?').bind(conv.chart_id, u.id).first();
    if (row) chart = JSON.parse(row.computed);
  }
  // memories only loaded if user opted in (MED-9)
  const mem = u.memory_opt_in
    ? ((await c.env.DB.prepare('SELECT kind,content FROM memories WHERE user_id=? ORDER BY weight DESC, created_at DESC LIMIT 12').bind(u.id).all()).results || [])
    : [];
  const hist = (await c.env.DB.prepare('SELECT role,content FROM messages WHERE conversation_id=? ORDER BY created_at ASC').bind(convId).all()).results || [];

  const sys = buildSystemPrompt({ chart, memories: mem, userName: u.name, topic: conv.topic });
  const messages = [{ role: 'system', content: sys }, ...hist.slice(-16).map((m) => ({ role: m.role, content: m.content })), { role: 'user', content }];

  const cfg = llmConfig(c.env); // null unless explicitly configured + allowlisted (CRIT-4)
  let reply, usedFallback = false;
  try {
    if (!cfg) throw new Error('no_provider');
    reply = await chat({ ...cfg, messages });
    if (!reply || !reply.trim()) throw new Error('empty');
  } catch {
    usedFallback = true;
    reply = advisorFallback({ chart, userMessage: content, userName: u.name });
  }

  const t = now();
  await c.env.DB.prepare('INSERT INTO messages (id,conversation_id,role,content,created_at) VALUES (?,?,?,?,?)').bind(uuid(), convId, 'user', content, t).run();
  await c.env.DB.prepare('INSERT INTO messages (id,conversation_id,role,content,created_at) VALUES (?,?,?,?,?)').bind(uuid(), convId, 'assistant', reply, t + 1).run();
  await c.env.DB.prepare('UPDATE conversations SET updated_at=?, title=CASE WHEN title=? THEN ? ELSE title END WHERE id=?')
    .bind(t, '新的咨询', content.slice(0, 18), convId).run();
  await logEvent(c.env, u.id, 'message_sent', { convId });

  // memory extraction ONLY if user opted in AND provider available (MED-9 + CRIT-4)
  if (u.memory_opt_in && !usedFallback && cfg) {
    c.executionCtx?.waitUntil?.((async () => {
      const facts = await extractMemories({ ...cfg, userMessage: content, assistantMessage: reply });
      for (const f of facts) {
        await c.env.DB.prepare('INSERT INTO memories (id,user_id,kind,content,weight,created_at) VALUES (?,?,?,?,?,?)')
          .bind(uuid(), u.id, f.kind || 'preference', f.content, 1.0, now()).run().catch(() => {});
      }
    })());
  }

  // reflect remaining credits for free users
  const fresh = await c.env.DB.prepare('SELECT credits FROM users WHERE id=?').bind(u.id).first();
  return json(c, { reply, credits: fresh?.credits, degraded: usedFallback });
});

// ---------- billing (NO backdoor; provider + webhook only) ----------
app.get('/api/plans', (c) => json(c, { plans: PLANS }));

// Create a checkout intent → order stays 'pending'. Entitlement NOT granted here.
app.post('/api/billing/checkout', async (c) => {
  const u = await auth(c);
  if (!u) return json(c, { error: 'unauthorized' }, 401);
  const { plan, provider } = await c.req.json().catch(() => ({}));
  const p = PLANS[plan];
  if (!p) return json(c, { error: 'invalid_plan' }, 400);
  const prov = getProvider(c.env, provider || 'mock');
  if (!prov) return json(c, { error: 'provider_unavailable', message: '该支付渠道需接入真实商户凭证' }, 400);
  let intent;
  try { intent = await prov.createCheckout({ plan }); }
  catch (e) { return json(c, { error: 'checkout_failed', reason: e.message }, 400); }

  const orderId = uuid();
  await c.env.DB.prepare('INSERT INTO orders (id,user_id,product,amount,currency,status,provider,amount_minor,plan_code,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)')
    .bind(orderId, u.id, p.name, p.amount / 100, p.currency, 'pending', intent.provider, p.amount, p.code, now()).run();
  await logEvent(c.env, u.id, 'checkout_created', { orderId, plan });
  return json(c, { order_id: orderId, ...intent, note: 'Order is PENDING. Entitlement is granted only after a verified payment webhook.' });
});

// Payment webhook — the ONLY path that grants entitlement. Signature-verified + idempotent.
app.post('/api/billing/webhook/:provider', async (c) => {
  const providerName = c.req.param('provider');
  const prov = getProvider(c.env, providerName);
  if (!prov) return json(c, { error: 'provider_unavailable' }, 400);
  const raw = await c.req.text();
  const signature = c.req.header('x-signature') || c.req.header('x-webhook-signature') || '';
  let payload;
  try { payload = await prov.verifyWebhook(raw, signature); }
  catch (e) { return json(c, { error: 'verify_failed', reason: e.message }, 400); }
  if (!payload) return json(c, { error: 'invalid_signature' }, 401);

  const { order_id, event_id } = payload;
  if (!order_id) return json(c, { error: 'missing_order' }, 400);

  // idempotency: process each event once
  const idemKey = `pay:${providerName}:${event_id || order_id}`;
  const dup = await c.env.DB.prepare('SELECT key FROM idempotency_keys WHERE key=?').bind(idemKey).first();
  if (dup) return json(c, { ok: true, deduped: true });
  await c.env.DB.prepare('INSERT INTO idempotency_keys (key,scope,created_at) VALUES (?,?,?)').bind(idemKey, 'payment', now()).run();

  const order = await c.env.DB.prepare('SELECT * FROM orders WHERE id=?').bind(order_id).first();
  if (!order) return json(c, { error: 'order_not_found' }, 404);
  // amount/currency cross-check (defense against tampering)
  const plan = PLANS[order.plan_code];
  if (!plan || payload.amount !== plan.amount || payload.currency !== plan.currency) {
    return json(c, { error: 'amount_mismatch' }, 400);
  }
  if (order.status === 'paid') return json(c, { ok: true, already_paid: true });

  await c.env.DB.prepare('UPDATE orders SET status=? WHERE id=?').bind('paid', order_id).run();
  await c.env.DB.prepare('INSERT INTO payment_events (id,order_id,provider,event_type,amount,currency,raw,created_at) VALUES (?,?,?,?,?,?,?,?)')
    .bind(uuid(), order_id, providerName, 'paid', plan.amount, plan.currency, JSON.stringify({ order_id, event_id }), now()).run();

  // grant entitlement (server-authoritative)
  const ent = entitlementFor(order.plan_code);
  const periodEnd = now() + (plan.period === 'year' ? 365 : 30) * 86400000;
  if (plan.kind === 'subscription') {
    await c.env.DB.prepare('INSERT INTO subscriptions (id,user_id,plan,status,provider,current_period_end,created_at) VALUES (?,?,?,?,?,?,?)')
      .bind(uuid(), order.user_id, order.plan_code, 'active', providerName, periodEnd, now()).run();
    await c.env.DB.prepare('UPDATE users SET plan=?, monthly_ai_quota=?, ai_used_this_period=0, period_reset_at=?, updated_at=? WHERE id=?')
      .bind(ent.plan, ent.monthlyAiQuota, periodEnd, now(), order.user_id).run();
  } else {
    // one-time report pack: add report credits (stored in users.credits)
    await c.env.DB.prepare('UPDATE users SET credits=credits+?, updated_at=? WHERE id=?').bind(ent.reportCredits || ent.packCredits || 1, now(), order.user_id).run();
  }
  await audit(c.env, order.user_id, 'system', 'entitlement_granted', order_id, { plan: order.plan_code });
  return json(c, { ok: true });
});

// ======================================================================
// 子午·合盘 (Meridian Sync) — 关系/缘分 API
// ======================================================================
const REL_TYPES = ['romance', 'crush', 'reunion', 'marriage', 'friendship'];
function slug8() { return uuid().replace(/-/g, '').slice(0, 10); }

// 公开预览：两个人的出生信息 → 免费 hook（总分/关键词/命中钩子/维度分），完整内容锁定。
// 无需登录即可体验「命中感」，这是转化的第一击。
app.post('/api/sync/preview', async (c) => {
  const rl = rateLimit(`syncprev:${clientIp(c)}`, { limit: 30, windowMs: 60_000 });
  if (!rl.ok) return json(c, { error: 'rate_limited', retryAfter: rl.retryAfter }, 429);
  const b = await c.req.json().catch(() => ({}));
  const { a, b: bb, rel_type } = b;
  if (!a?.date || !bb?.date) return json(c, { error: 'missing_params', message: '需要双方的出生日期' }, 400);
  const relType = REL_TYPES.includes(rel_type) ? rel_type : 'romance';
  try {
    const chartA = buildChart({ gender: a.gender || 'female', date: a.date, time: a.time || '12:00', place: clamp(a.place || '', MAX_FIELD_LEN), longitude: a.lon != null ? Number(a.lon) : 120 });
    const chartB = buildChart({ gender: bb.gender || 'male', date: bb.date, time: bb.time || '12:00', place: clamp(bb.place || '', MAX_FIELD_LEN), longitude: bb.lon != null ? Number(bb.lon) : 120 });
    const r = synastry(chartA, chartB, { nameA: clamp(a.name || '你', 20), nameB: clamp(bb.name || 'TA', 20), relType });
    // 免费只给钩子：总分、关键词、headline、维度分、1 条 hook、strengths/frictions 的数量（悬念）
    return json(c, {
      preview: {
        overall: r.overall, keyword: r.keyword, headline: r.headline, dims: r.dims,
        hook: r.hook,
        locked_counts: { strengths: r.strengths.length, frictions: r.frictions.length, advice: r.advice.length, timing: r.timing.length },
        rel_type: relType, name_a: r.meta.nameA, name_b: r.meta.nameB,
        disclaimer: r.disclaimer,
      },
    });
  } catch (e) {
    return json(c, { error: 'compute_failed', message: '出生信息有误，请检查日期格式 (YYYY-MM-DD)' }, 400);
  }
});

// 创建一段关系并生成报告（需登录，落库）。返回 hook；完整内容 locked=1，需解锁。
app.post('/api/sync/relationships', async (c) => {
  const u = await auth(c);
  if (!u) return json(c, { error: 'unauthorized' }, 401);
  const b = await c.req.json().catch(() => ({}));
  const { a, b: bb, rel_type } = b;
  if (!a?.date || !bb?.date) return json(c, { error: 'missing_params' }, 400);
  const relType = REL_TYPES.includes(rel_type) ? rel_type : 'romance';
  let chartA, chartB, r;
  try {
    chartA = buildChart({ gender: a.gender || 'female', date: a.date, time: a.time || '12:00', place: clamp(a.place || '', MAX_FIELD_LEN), longitude: a.lon != null ? Number(a.lon) : 120 });
    chartB = buildChart({ gender: bb.gender || 'male', date: bb.date, time: bb.time || '12:00', place: clamp(bb.place || '', MAX_FIELD_LEN), longitude: bb.lon != null ? Number(bb.lon) : 120 });
    r = synastry(chartA, chartB, { nameA: clamp(a.name || '你', 20), nameB: clamp(bb.name || 'TA', 20), relType });
  } catch { return json(c, { error: 'compute_failed' }, 400); }

  const relId = uuid();
  await c.env.DB.prepare(
    `INSERT INTO relationships (id,user_id,rel_type,name_a,name_b,a_gender,a_date,a_time,a_place,a_lon,b_gender,b_date,b_time,b_place,b_lon,status,paid,created_at,updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  ).bind(relId, u.id, relType, clamp(a.name || '你', 20), clamp(bb.name || 'TA', 20),
    a.gender || 'female', a.date, a.time || '12:00', clamp(a.place || '', MAX_FIELD_LEN), a.lon != null ? Number(a.lon) : 120,
    bb.gender || 'male', bb.date, bb.time || '12:00', clamp(bb.place || '', MAX_FIELD_LEN), bb.lon != null ? Number(bb.lon) : 120,
    'active', 0, now(), now()).run();

  const reportId = uuid();
  await c.env.DB.prepare(
    'INSERT INTO sync_reports (id,relationship_id,user_id,kind,overall,keyword,payload,locked,created_at) VALUES (?,?,?,?,?,?,?,?,?)'
  ).bind(reportId, relId, u.id, relType === 'marriage' ? 'marriage' : relType === 'reunion' ? 'reunion' : 'compat', r.overall, r.keyword, JSON.stringify(r), 1, now()).run();
  await logEvent(c.env, u.id, 'relationship_created', { relId, relType, overall: r.overall });

  return json(c, {
    relationship_id: relId, report_id: reportId,
    preview: { overall: r.overall, keyword: r.keyword, headline: r.headline, dims: r.dims, hook: r.hook,
      locked_counts: { strengths: r.strengths.length, frictions: r.frictions.length, advice: r.advice.length, timing: r.timing.length },
      rel_type: relType, name_a: r.meta.nameA, name_b: r.meta.nameB, disclaimer: r.disclaimer },
  });
});

app.get('/api/sync/relationships', async (c) => {
  const u = await auth(c);
  if (!u) return json(c, { error: 'unauthorized' }, 401);
  const { results } = await c.env.DB.prepare(
    `SELECT r.id,r.rel_type,r.name_a,r.name_b,r.paid,r.updated_at,
            (SELECT overall FROM sync_reports sr WHERE sr.relationship_id=r.id ORDER BY created_at DESC LIMIT 1) as overall,
            (SELECT keyword FROM sync_reports sr WHERE sr.relationship_id=r.id ORDER BY created_at DESC LIMIT 1) as keyword,
            (SELECT id FROM sync_reports sr WHERE sr.relationship_id=r.id ORDER BY created_at DESC LIMIT 1) as report_id
     FROM relationships r WHERE r.user_id=? AND r.deleted_at IS NULL ORDER BY r.updated_at DESC`
  ).bind(u.id).all();
  return json(c, { relationships: results || [] });
});

// 获取报告：locked=1 只返回 hook；locked=0 返回完整内容。
app.get('/api/sync/reports/:id', async (c) => {
  const u = await auth(c);
  if (!u) return json(c, { error: 'unauthorized' }, 401);
  const rep = await c.env.DB.prepare('SELECT * FROM sync_reports WHERE id=? AND user_id=?').bind(c.req.param('id'), u.id).first();
  if (!rep) return json(c, { error: 'not_found' }, 404);
  const full = JSON.parse(rep.payload);
  if (rep.locked) {
    return json(c, { locked: true, report_id: rep.id, relationship_id: rep.relationship_id,
      preview: { overall: full.overall, keyword: full.keyword, headline: full.headline, dims: full.dims, hook: full.hook,
        locked_counts: { strengths: full.strengths.length, frictions: full.frictions.length, advice: full.advice.length, timing: full.timing.length },
        rel_type: full.meta.relType, name_a: full.meta.nameA, name_b: full.meta.nameB, disclaimer: full.disclaimer } });
  }
  return json(c, { locked: false, report_id: rep.id, relationship_id: rep.relationship_id, report: full });
});

// 解锁完整报告：优先扣 report credit；无 credit 则提示去支付。
app.post('/api/sync/reports/:id/unlock', async (c) => {
  const u = await auth(c);
  if (!u) return json(c, { error: 'unauthorized' }, 401);
  const rep = await c.env.DB.prepare('SELECT * FROM sync_reports WHERE id=? AND user_id=?').bind(c.req.param('id'), u.id).first();
  if (!rep) return json(c, { error: 'not_found' }, 404);
  if (!rep.locked) return json(c, { ok: true, already: true });
  // member 无需扣 credit（会员权益）；否则原子扣一个 report credit
  if (u.plan === 'member') {
    await c.env.DB.prepare('UPDATE sync_reports SET locked=0 WHERE id=?').bind(rep.id).run();
  } else {
    const r = await c.env.DB.prepare("UPDATE users SET credits=credits-1, updated_at=? WHERE id=? AND credits>0").bind(now(), u.id).run();
    if ((r.meta?.changes || 0) === 0) return json(c, { error: 'no_credit', message: '需要购买报告或成为会员来解锁', upgrade: true }, 402);
    await c.env.DB.prepare('UPDATE sync_reports SET locked=0 WHERE id=?').bind(rep.id).run();
  }
  await c.env.DB.prepare('UPDATE relationships SET paid=1, updated_at=? WHERE id=?').bind(now(), rep.relationship_id).run();
  await logEvent(c.env, u.id, 'report_unlocked', { reportId: rep.id });
  const full = JSON.parse(rep.payload);
  return json(c, { ok: true, locked: false, report: full });
});

// 生成公开分享卡（不含出生隐私）。返回 slug。
app.post('/api/sync/share', async (c) => {
  const u = await auth(c);
  if (!u) return json(c, { error: 'unauthorized' }, 401);
  const b = await c.req.json().catch(() => ({}));
  const rep = await c.env.DB.prepare('SELECT * FROM sync_reports WHERE id=? AND user_id=?').bind(b.report_id || '', u.id).first();
  if (!rep) return json(c, { error: 'not_found' }, 404);
  const full = JSON.parse(rep.payload);
  const slug = slug8();
  await c.env.DB.prepare('INSERT INTO share_cards (slug,user_id,relationship_id,title,keyword,overall,dims,rel_type,views,converts,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
    .bind(slug, u.id, rep.relationship_id, clamp(full.headline || '', 200), full.keyword, full.overall, JSON.stringify(full.dims), full.meta.relType, 0, 0, now()).run();
  await logEvent(c.env, u.id, 'share_created', { slug });
  return json(c, { slug, url: `/c/${slug}` });
});

// 公开读取分享卡（无需登录）。累加浏览量。
app.get('/api/sync/card/:slug', async (c) => {
  const card = await c.env.DB.prepare('SELECT slug,title,keyword,overall,dims,rel_type,views FROM share_cards WHERE slug=?').bind(c.req.param('slug')).first();
  if (!card) return json(c, { error: 'not_found' }, 404);
  await c.env.DB.prepare('UPDATE share_cards SET views=views+1 WHERE slug=?').bind(card.slug).run().catch(() => {});
  return json(c, { card: { ...card, dims: JSON.parse(card.dims || '{}') } });
});

// 真实反馈（校准命中感 + 数据飞轮）。
app.post('/api/sync/feedback', async (c) => {
  const u = await auth(c);
  if (!u) return json(c, { error: 'unauthorized' }, 401);
  const b = await c.req.json().catch(() => ({}));
  const acc = ['accurate', 'partly', 'inaccurate'].includes(b.accuracy) ? b.accuracy : 'partly';
  await c.env.DB.prepare('INSERT INTO sync_feedback (id,user_id,relationship_id,report_id,accuracy,outcome,created_at) VALUES (?,?,?,?,?,?,?)')
    .bind(uuid(), u.id, b.relationship_id || null, b.report_id || null, acc, clamp(b.outcome || '', MAX_MESSAGE_LEN), now()).run();
  await logEvent(c.env, u.id, 'feedback_given', { accuracy: acc });
  return json(c, { ok: true });
});

// ---- 简易管理后台数据（受 ADMIN_TOKEN 保护；无 token 不可访问）----
app.get('/api/admin/stats', async (c) => {
  const token = c.req.header('x-admin-token') || '';
  if (!c.env.ADMIN_TOKEN || token !== c.env.ADMIN_TOKEN) return json(c, { error: 'forbidden' }, 403);
  const one = async (q) => (await c.env.DB.prepare(q).first())?.n || 0;
  const stats = {
    users: await one('SELECT COUNT(*) n FROM users'),
    members: await one("SELECT COUNT(*) n FROM users WHERE plan='member'"),
    relationships: await one('SELECT COUNT(*) n FROM relationships'),
    reports: await one('SELECT COUNT(*) n FROM sync_reports'),
    reports_unlocked: await one('SELECT COUNT(*) n FROM sync_reports WHERE locked=0'),
    paid_orders: await one("SELECT COUNT(*) n FROM orders WHERE status='paid'"),
    revenue_minor: (await c.env.DB.prepare("SELECT COALESCE(SUM(amount_minor),0) n FROM orders WHERE status='paid'").first())?.n || 0,
    shares: await one('SELECT COUNT(*) n FROM share_cards'),
    share_views: (await c.env.DB.prepare('SELECT COALESCE(SUM(views),0) n FROM share_cards').first())?.n || 0,
    feedback_accurate: await one("SELECT COUNT(*) n FROM sync_feedback WHERE accuracy='accurate'"),
    feedback_total: await one('SELECT COUNT(*) n FROM sync_feedback'),
  };
  return json(c, { stats });
});

// SPA fallback
app.get('*', async (c) => {
  if (c.env.ASSETS) return c.env.ASSETS.fetch(c.req.raw);
  return c.text('Meridian API', 200);
});

export default app;
