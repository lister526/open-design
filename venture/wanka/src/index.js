// Wanka API — Cloudflare Workers + Hono + D1
// Encodes the product's three layers: single-player generation, template/remix network,
// and marketplace/outcome data. Plus growth analytics (North-Star) and ad-SDK config.

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { uid, now, hashPassword, verifyPassword, signToken, verifyToken } from './util.js';
import { generateSet, generateFromTemplate, supportedKinds } from './generator.js';
import { adConfig } from './ads.js';

const app = new Hono();

// CORS — allow the SPA, mini-program webview, and native apps to call the API.
app.use('/api/*', cors({
  origin: (origin) => origin || '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
}));

// Global error boundary — the API must NEVER return an unhandled 500 to a store reviewer.
app.onError((err, c) => {
  console.error('api_error', err?.message || err);
  return c.json({ error: 'server_error', message: 'Something went wrong. Please try again.' }, 500);
});
app.notFound((c) => {
  // Only API 404s return JSON; page 404s fall through to the SPA handler below.
  if (c.req.path.startsWith('/api/')) return c.json({ error: 'not_found' }, 404);
  return c.text('Not found', 404);
});

// ---------- helpers ----------
const j = (c, data, status = 200) => c.json(data, status);

async function currentUser(c) {
  const auth = c.req.header('Authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return null;
  const secret = c.env.JWT_SECRET || 'dev-insecure-secret';
  const payload = await verifyToken(token, secret);
  if (!payload?.sub) return null;
  const u = await c.env.DB.prepare('SELECT * FROM users WHERE id=?').bind(payload.sub).first();
  return u || null;
}

async function logEvent(env, userId, name, meta) {
  try {
    await env.DB.prepare('INSERT INTO events (id,user_id,name,meta,created_at) VALUES (?,?,?,?,?)')
      .bind(uid('ev'), userId || null, name, meta ? JSON.stringify(meta) : null, now()).run();
  } catch { /* analytics must never break the request */ }
}

const PLAN_CREDITS = { free: 20, starter: 300, pro: 1500, team: 5000 };

// ---------- health ----------
app.get('/api/health', async (c) => {
  // Deep health check: verifies the DB binding actually responds (for uptime monitors).
  let db = 'unknown';
  try { await c.env.DB.prepare('SELECT 1').first(); db = 'ok'; } catch { db = 'error'; }
  const healthy = db === 'ok';
  return c.json({ ok: healthy, service: 'wanka', env: c.env.APP_ENV || 'dev', db, ts: now() }, healthy ? 200 : 503);
});

// ---------- config (public): kinds, langs, ad SDK config, brand ----------
app.get('/api/config', (c) => j(c, {
  brand: c.env.BRAND_NAME || 'Wanka',
  kinds: supportedKinds(),
  langs: ['zh', 'en', 'ja', 'ko', 'es', 'pt', 'ar', 'hi', 'fr'],
  plans: PLAN_CREDITS,
  ads: adConfig(c.env),
  real_ai: String(c.env.ENABLE_REAL_AI || 'false') === 'true',
}));

// ---------- auth ----------
app.post('/api/auth/register', async (c) => {
  const b = await c.req.json().catch(() => ({}));
  const email = (b.email || '').trim().toLowerCase();
  if (!email || !b.password) return j(c, { error: 'email_password_required' }, 400);
  const exists = await c.env.DB.prepare('SELECT id FROM users WHERE email=?').bind(email).first();
  if (exists) return j(c, { error: 'email_taken' }, 409);
  const id = uid('usr');
  const ph = await hashPassword(b.password);
  const role = b.role === 'creator' ? 'creator' : 'merchant';
  const ts = now();
  await c.env.DB.prepare(
    'INSERT INTO users (id,email,password_hash,display_name,role,plan,credits,lang,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)',
  ).bind(id, email, ph, b.display_name || email.split('@')[0], role, 'free', PLAN_CREDITS.free, b.lang || 'zh', ts, ts).run();
  await logEvent(c.env, id, 'signup', { role });
  const token = await signToken({ sub: id }, c.env.JWT_SECRET || 'dev-insecure-secret');
  const user = await c.env.DB.prepare('SELECT id,email,display_name,role,plan,credits,lang FROM users WHERE id=?').bind(id).first();
  return j(c, { token, user });
});

app.post('/api/auth/login', async (c) => {
  const b = await c.req.json().catch(() => ({}));
  const email = (b.email || '').trim().toLowerCase();
  const u = await c.env.DB.prepare('SELECT * FROM users WHERE email=?').bind(email).first();
  if (!u || !(await verifyPassword(b.password || '', u.password_hash))) return j(c, { error: 'bad_credentials' }, 401);
  const token = await signToken({ sub: u.id }, c.env.JWT_SECRET || 'dev-insecure-secret');
  return j(c, { token, user: { id: u.id, email: u.email, display_name: u.display_name, role: u.role, plan: u.plan, credits: u.credits, lang: u.lang } });
});

app.get('/api/me', async (c) => {
  const u = await currentUser(c);
  if (!u) return j(c, { error: 'unauthorized' }, 401);
  return j(c, { user: { id: u.id, email: u.email, display_name: u.display_name, role: u.role, plan: u.plan, credits: u.credits, lang: u.lang } });
});

// WeChat Mini Program login: exchange wx.login `code` for a session (App Store / mini-program native auth).
// Requires WX_APPID + WX_SECRET env. Creates/loads a user keyed by the WeChat openid.
app.post('/api/auth/wx', async (c) => {
  const b = await c.req.json().catch(() => ({}));
  if (!b.code) return j(c, { error: 'code_required' }, 400);
  const appid = c.env.WX_APPID;
  const secret = c.env.WX_SECRET;
  if (!appid || !secret) return j(c, { error: 'wx_not_configured', hint: 'set WX_APPID and WX_SECRET secrets' }, 501);
  // Exchange code -> openid via WeChat API
  let openid;
  try {
    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${encodeURIComponent(b.code)}&grant_type=authorization_code`;
    const r = await fetch(url);
    const data = await r.json();
    if (!data.openid) return j(c, { error: 'wx_exchange_failed', detail: data.errmsg || null }, 400);
    openid = data.openid;
  } catch (e) { return j(c, { error: 'wx_upstream_error' }, 502); }
  // find or create user
  let u = await c.env.DB.prepare('SELECT * FROM users WHERE email=?').bind(`wx_${openid}@wechat.local`).first();
  if (!u) {
    const id = uid('usr');
    const ts = now();
    await c.env.DB.prepare(
      'INSERT INTO users (id,email,password_hash,display_name,role,plan,credits,lang,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)',
    ).bind(id, `wx_${openid}@wechat.local`, '', b.nickname || '微信用户', 'merchant', 'free', PLAN_CREDITS.free, 'zh', ts, ts).run();
    await logEvent(c.env, id, 'signup', { via: 'wechat' });
    u = await c.env.DB.prepare('SELECT * FROM users WHERE id=?').bind(id).first();
  }
  const token = await signToken({ sub: u.id }, c.env.JWT_SECRET || 'dev-insecure-secret');
  return j(c, { token, user: { id: u.id, email: u.email, display_name: u.display_name, role: u.role, plan: u.plan, credits: u.credits, lang: u.lang } });
});

// Data export (GDPR / Apple 5.1.1) — user downloads all their data.
app.get('/api/me/export', async (c) => {
  const u = await currentUser(c);
  if (!u) return j(c, { error: 'unauthorized' }, 401);
  const projects = await c.env.DB.prepare('SELECT * FROM projects WHERE user_id=?').bind(u.id).all();
  const assets = await c.env.DB.prepare('SELECT * FROM assets WHERE user_id=?').bind(u.id).all();
  return j(c, {
    user: { id: u.id, email: u.email, display_name: u.display_name, role: u.role, plan: u.plan, credits: u.credits, created_at: u.created_at },
    projects: projects.results || [],
    assets: assets.results || [],
    exported_at: now(),
  });
});

// Account deletion (Apple Guideline 5.1.1(v) — MANDATORY for apps with account creation).
// Permanently removes the user and all their data.
app.delete('/api/me', async (c) => {
  const u = await currentUser(c);
  if (!u) return j(c, { error: 'unauthorized' }, 401);
  const b = await c.req.json().catch(() => ({}));
  if (b.confirm !== true && b.confirm !== 'DELETE') return j(c, { error: 'confirm_required', hint: 'send {"confirm": true}' }, 400);
  await c.env.DB.batch([
    c.env.DB.prepare('DELETE FROM assets WHERE user_id=?').bind(u.id),
    c.env.DB.prepare('DELETE FROM projects WHERE user_id=?').bind(u.id),
    c.env.DB.prepare('DELETE FROM template_usage WHERE user_id=?').bind(u.id),
    c.env.DB.prepare('DELETE FROM users WHERE id=?').bind(u.id),
  ]);
  await logEvent(c.env, null, 'account_deleted', {});
  return j(c, { ok: true, deleted: true });
});

// ---------- projects ----------
app.post('/api/projects', async (c) => {
  const u = await currentUser(c);
  if (!u) return j(c, { error: 'unauthorized' }, 401);
  const b = await c.req.json().catch(() => ({}));
  if (!b.title && !b.product) return j(c, { error: 'title_or_product_required' }, 400);
  const id = uid('prj');
  await c.env.DB.prepare(
    'INSERT INTO projects (id,user_id,title,product,category,audience,selling_pts,tone,target_langs,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)',
  ).bind(id, u.id, b.title || b.product, b.product || b.title, b.category || 'other', b.audience || '', b.selling_pts || '', b.tone || 'energetic', (b.target_langs || 'zh,en'), now()).run();
  const p = await c.env.DB.prepare('SELECT * FROM projects WHERE id=?').bind(id).first();
  return j(c, { project: p });
});

app.get('/api/projects', async (c) => {
  const u = await currentUser(c);
  if (!u) return j(c, { error: 'unauthorized' }, 401);
  const { results } = await c.env.DB.prepare('SELECT * FROM projects WHERE user_id=? ORDER BY created_at DESC').bind(u.id).all();
  return j(c, { projects: results || [] });
});

// ---------- generation (single-player value; credit-gated) ----------
app.post('/api/generate', async (c) => {
  const u = await currentUser(c);
  if (!u) return j(c, { error: 'unauthorized' }, 401);
  const b = await c.req.json().catch(() => ({}));
  const project = b.project_id
    ? await c.env.DB.prepare('SELECT * FROM projects WHERE id=? AND user_id=?').bind(b.project_id, u.id).first()
    : { title: b.title, product: b.product, category: b.category, audience: b.audience, selling_pts: b.selling_pts, tone: b.tone, target_langs: (b.target_langs || 'zh,en') };
  if (!project) return j(c, { error: 'project_not_found' }, 404);

  const kinds = b.kinds && b.kinds.length ? b.kinds : supportedKinds();
  const langs = b.langs && b.langs.length ? b.langs : String(project.target_langs || 'zh,en').split(',');
  const cost = kinds.length * langs.length; // 1 credit per asset
  if (u.credits < cost) return j(c, { error: 'no_credit', need: cost, have: u.credits, upgrade: true }, 402);

  const assets = await generateSet(c.env, project, kinds, langs);

  // spend credits + persist assets if it's a saved project
  await c.env.DB.prepare('UPDATE users SET credits=credits-?, updated_at=? WHERE id=?').bind(cost, now(), u.id).run();
  if (b.project_id) {
    const stmts = assets.map((a) => c.env.DB.prepare(
      'INSERT INTO assets (id,project_id,user_id,kind,lang,content,template_id,published,created_at) VALUES (?,?,?,?,?,?,?,0,?)',
    ).bind(uid('ast'), b.project_id, u.id, a.kind, a.lang, JSON.stringify(a), a.template_id || null, now()));
    if (stmts.length) await c.env.DB.batch(stmts);
  }
  await logEvent(c.env, u.id, 'generate', { count: assets.length, kinds, langs });
  const fresh = await c.env.DB.prepare('SELECT credits FROM users WHERE id=?').bind(u.id).first();
  return j(c, { assets, credits: fresh?.credits ?? u.credits - cost });
});

// ---------- templates (the remix graph / network layer) ----------
app.get('/api/templates', async (c) => {
  const kind = c.req.query('kind');
  const cat = c.req.query('category');
  let sql = "SELECT id,author_id,title,kind,category,preview,price_cents,uses,wins FROM templates WHERE status='published'";
  const binds = [];
  if (kind) { sql += ' AND kind=?'; binds.push(kind); }
  if (cat) { sql += ' AND category=?'; binds.push(cat); }
  sql += ' ORDER BY uses DESC LIMIT 100';
  const { results } = await c.env.DB.prepare(sql).bind(...binds).all();
  return j(c, { templates: results || [] });
});

// use a template over a project -> generate + record interaction/outcome data
app.post('/api/templates/:id/use', async (c) => {
  const u = await currentUser(c);
  if (!u) return j(c, { error: 'unauthorized' }, 401);
  const tpl = await c.env.DB.prepare("SELECT * FROM templates WHERE id=? AND status='published'").bind(c.req.param('id')).first();
  if (!tpl) return j(c, { error: 'template_not_found' }, 404);
  const b = await c.req.json().catch(() => ({}));
  const project = b.project_id
    ? await c.env.DB.prepare('SELECT * FROM projects WHERE id=? AND user_id=?').bind(b.project_id, u.id).first()
    : { title: b.title || 'Untitled', product: b.product || b.title, category: tpl.category, audience: b.audience || '', selling_pts: b.selling_pts || '', tone: b.tone || 'energetic' };
  if (!project) return j(c, { error: 'project_not_found' }, 404);
  const lang = b.lang || 'zh';
  if (u.credits < 1) return j(c, { error: 'no_credit', upgrade: true }, 402);

  const asset = await generateFromTemplate(c.env, project, tpl, lang);
  await c.env.DB.prepare('UPDATE users SET credits=credits-1 WHERE id=?').bind(u.id).run();
  await c.env.DB.prepare('UPDATE templates SET uses=uses+1 WHERE id=?').bind(tpl.id).run();
  await c.env.DB.prepare('INSERT INTO template_usage (id,template_id,user_id,asset_id,outcome,created_at) VALUES (?,?,?,?,?,?)')
    .bind(uid('use'), tpl.id, u.id, null, 'used', now()).run();
  await logEvent(c.env, u.id, 'template_use', { template_id: tpl.id });
  return j(c, { asset });
});

// creator publishes a new template (supply side)
app.post('/api/templates', async (c) => {
  const u = await currentUser(c);
  if (!u) return j(c, { error: 'unauthorized' }, 401);
  const b = await c.req.json().catch(() => ({}));
  if (!b.title || !b.kind || !b.recipe) return j(c, { error: 'title_kind_recipe_required' }, 400);
  const id = uid('tpl');
  await c.env.DB.prepare(
    'INSERT INTO templates (id,author_id,title,kind,category,recipe,preview,price_cents,uses,wins,status,created_at) VALUES (?,?,?,?,?,?,?,?,0,0,?,?)',
  ).bind(id, u.id, b.title, b.kind, b.category || 'other', JSON.stringify(b.recipe), b.preview || '', b.price_cents || 0, 'published', now()).run();
  await logEvent(c.env, u.id, 'template_create', { template_id: id });
  return j(c, { template: { id, title: b.title, kind: b.kind } });
});

// ---------- publish (viral loop) + outcome reporting (conversion signal) ----------
app.post('/api/assets/:id/publish', async (c) => {
  const u = await currentUser(c);
  if (!u) return j(c, { error: 'unauthorized' }, 401);
  const a = await c.env.DB.prepare('SELECT * FROM assets WHERE id=? AND user_id=?').bind(c.req.param('id'), u.id).first();
  if (!a) return j(c, { error: 'asset_not_found' }, 404);
  await c.env.DB.prepare('UPDATE assets SET published=1 WHERE id=?').bind(a.id).run();
  await logEvent(c.env, u.id, 'publish', { asset_id: a.id, kind: a.kind });
  // every published asset carries a share URL with attribution (the viral loop)
  return j(c, { ok: true, share_url: `${new URL(c.req.url).origin}/s/${a.id}?ref=${u.id}` });
});

// merchant reports a template drove a sale -> outcome data (the un-copyable moat)
app.post('/api/templates/:id/report-win', async (c) => {
  const u = await currentUser(c);
  if (!u) return j(c, { error: 'unauthorized' }, 401);
  const tpl = await c.env.DB.prepare('SELECT * FROM templates WHERE id=?').bind(c.req.param('id')).first();
  if (!tpl) return j(c, { error: 'template_not_found' }, 404);
  await c.env.DB.prepare('UPDATE templates SET wins=wins+1 WHERE id=?').bind(tpl.id).run();
  await c.env.DB.prepare('INSERT INTO template_usage (id,template_id,user_id,asset_id,outcome,created_at) VALUES (?,?,?,?,?,?)')
    .bind(uid('use'), tpl.id, u.id, null, 'reported_win', now()).run();
  // pay the creator a small share (earnings ledger => switching cost / retention)
  if (tpl.author_id) {
    await c.env.DB.prepare('INSERT INTO earnings (id,creator_id,template_id,amount_cents,reason,created_at) VALUES (?,?,?,?,?,?)')
      .bind(uid('ern'), tpl.author_id, tpl.id, 100, 'outcome_bonus', now()).run();
  }
  await logEvent(c.env, u.id, 'report_win', { template_id: tpl.id });
  return j(c, { ok: true });
});

// ---------- billing (stub; real PSP wired at deploy) ----------
app.post('/api/billing/checkout', async (c) => {
  const u = await currentUser(c);
  if (!u) return j(c, { error: 'unauthorized' }, 401);
  const b = await c.req.json().catch(() => ({}));
  const plan = ['starter', 'pro', 'team'].includes(b.plan) ? b.plan : null;
  if (!plan) return j(c, { error: 'bad_plan' }, 400);
  // In production this returns a payment-provider redirect (WeChat Pay / Stripe).
  // Dev stub: instantly upgrade + grant credits so the funnel is testable end-to-end.
  await c.env.DB.prepare('UPDATE users SET plan=?, credits=credits+?, updated_at=? WHERE id=?')
    .bind(plan, PLAN_CREDITS[plan], now(), u.id).run();
  await logEvent(c.env, u.id, 'checkout', { plan });
  const fresh = await c.env.DB.prepare('SELECT plan,credits FROM users WHERE id=?').bind(u.id).first();
  return j(c, { ok: true, plan: fresh.plan, credits: fresh.credits, dev_stub: true });
});

// ---------- creator earnings ----------
app.get('/api/creator/earnings', async (c) => {
  const u = await currentUser(c);
  if (!u) return j(c, { error: 'unauthorized' }, 401);
  const row = await c.env.DB.prepare('SELECT COALESCE(SUM(amount_cents),0) AS total, COUNT(*) AS n FROM earnings WHERE creator_id=?').bind(u.id).first();
  const { results } = await c.env.DB.prepare('SELECT id,title,uses,wins,price_cents FROM templates WHERE author_id=? ORDER BY uses DESC').bind(u.id).all();
  return j(c, { total_cents: row?.total || 0, count: row?.n || 0, templates: results || [] });
});

// ---------- metrics (North-Star + funnel) ----------
app.get('/api/metrics', async (c) => {
  const published = await c.env.DB.prepare("SELECT COUNT(*) AS n FROM assets WHERE published=1").first();
  const gen = await c.env.DB.prepare("SELECT COUNT(*) AS n FROM events WHERE name='generate'").first();
  const users = await c.env.DB.prepare('SELECT COUNT(*) AS n FROM users').first();
  const tpls = await c.env.DB.prepare("SELECT COUNT(*) AS n FROM templates WHERE status='published'").first();
  const wins = await c.env.DB.prepare('SELECT COALESCE(SUM(wins),0) AS n FROM templates').first();
  return j(c, {
    north_star_published_assets: published?.n || 0,
    generations: gen?.n || 0,
    users: users?.n || 0,
    templates: tpls?.n || 0,
    reported_wins: wins?.n || 0,
  });
});

// ---------- SPA fallback: serve static assets ----------
app.get('*', async (c) => {
  if (c.env.ASSETS) {
    const res = await c.env.ASSETS.fetch(c.req.raw);
    if (res.status !== 404) return res;
    // client-side routing fallback to index.html
    const url = new URL(c.req.url);
    url.pathname = '/index.html';
    return c.env.ASSETS.fetch(new Request(url.toString(), c.req.raw));
  }
  return c.text('Wanka API. Static assets not bound.', 200);
});

export default app;
