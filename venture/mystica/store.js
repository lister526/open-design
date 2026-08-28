/* Mystica 持久化存储层 (零依赖, 跨平台)
 * ------------------------------------------------------------------
 * 目标: 让订单/用户/线索在服务器重启后不丢失 —— 内存 Map 一旦重启就丢单,
 *       会直接导致"已付款却拿不到报告"的退款/拒付灾难. 现金紧张阶段绝不能出这种事.
 *
 * 设计:
 *   - 默认用本地 JSON 文件 (data/*.json), 无需任何外部数据库, 任何 Node 主机开箱即用.
 *   - 若配置了 DATABASE_URL (Postgres) 或运行在支持 KV 的环境, 可在此扩展替换.
 *   - 写操作同步落盘 (订单量级不大, 简单可靠优先); 高并发时可换 append-only + 定期快照.
 *
 * 数据表:
 *   orders  : { token, product, meta, paid, createdAt, paidAt, amount, currency, email, referredBy }
 *   users   : { id, email, lang, createdAt, chart, credits, referralCode }
 *   leads   : append (server.js 已有 leads.jsonl, 这里统一进 leads 表)
 *   referrals: { code, ownerEmail, uses, rewarded, createdAt }
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DATA_DIR = process.env.MYSTICA_DATA_DIR || path.join(__dirname, "data");
try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch (_) {}

function file(name) { return path.join(DATA_DIR, name + ".json"); }

function load(name, fallback) {
  try {
    const p = file(name);
    if (!fs.existsSync(p)) return fallback;
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch (_) { return fallback; }
}
function save(name, obj) {
  const p = file(name);
  const tmp = p + ".tmp";
  try {
    fs.writeFileSync(tmp, JSON.stringify(obj));
    fs.renameSync(tmp, p); // 原子替换, 防止半写损坏
  } catch (e) { console.error("store save error:", name, e.message); }
}

// ---- 内存缓存 + 落盘 ----
const db = {
  orders:    load("orders", {}),     // token -> order
  users:     load("users", {}),      // email -> user
  referrals: load("referrals", {}),  // code -> referral
};

/* ============ ORDERS ============ */
function createOrder(product, meta) {
  const token = crypto.randomBytes(16).toString("hex");
  const local = meta && meta.pricing;
  db.orders[token] = {
    token, product, meta,
    paid: false, createdAt: Date.now(),
    amount: local ? local.amount : null,
    currency: local ? local.currency : null,
    market: local ? local.market : (meta && meta.market) || null,
    email: (meta && meta.email) || null,
    referredBy: (meta && meta.ref) || null,
  };
  save("orders", db.orders);
  return token;
}
function markOrderPaid(token) {
  const o = db.orders[token];
  if (o && !o.paid) {
    o.paid = true; o.paidAt = Date.now();
    save("orders", db.orders);
    // 若来自推荐, 记一次有效转化
    if (o.referredBy) countReferralConversion(o.referredBy);
    // 若有邮箱, 落成用户
    if (o.email) upsertUser(o.email, { lang: o.meta && o.meta.lang });
  }
  return o;
}
function getOrder(token) { return db.orders[token] || null; }
function allOrders() { return Object.values(db.orders); }
function revenueSummary() {
  const paid = allOrders().filter(o => o.paid);
  const byCurrency = {};
  for (const o of paid) {
    if (o.amount && o.currency) byCurrency[o.currency] = (byCurrency[o.currency] || 0) + o.amount;
  }
  return { orders: allOrders().length, paidOrders: paid.length, byCurrency };
}

/* ============ USERS ============ */
function upsertUser(email, patch) {
  if (!email) return null;
  const key = email.toLowerCase();
  let u = db.users[key];
  if (!u) {
    u = { id: crypto.randomBytes(8).toString("hex"), email: key, createdAt: Date.now(),
      credits: 0, referralCode: makeReferralCode(key), chart: null, lang: "en" };
    db.users[key] = u;
    // 建立该用户的推荐码
    db.referrals[u.referralCode] = { code: u.referralCode, ownerEmail: key, uses: 0, conversions: 0, rewarded: 0, createdAt: Date.now() };
    save("referrals", db.referrals);
  }
  if (patch) Object.assign(u, patch);
  save("users", db.users);
  return u;
}
function getUser(email) { return email ? (db.users[email.toLowerCase()] || null) : null; }

/* ============ REFERRALS (病毒式增长引擎) ============ */
function makeReferralCode(seed) {
  return crypto.createHash("sha1").update(seed + Date.now()).digest("hex").slice(0, 8).toUpperCase();
}
function getReferral(code) { return code ? (db.referrals[code.toUpperCase()] || null) : null; }
function countReferralClick(code) {
  const r = getReferral(code); if (!r) return null;
  r.uses += 1; save("referrals", db.referrals); return r;
}
function countReferralConversion(code) {
  const r = getReferral(code); if (!r) return null;
  r.conversions += 1;
  // 给推荐人加 1 次免费额度 (每成功推荐一单)
  const owner = db.users[r.ownerEmail];
  if (owner) { owner.credits = (owner.credits || 0) + 1; save("users", db.users); }
  r.rewarded += 1; save("referrals", db.referrals);
  return r;
}
function referralStats(code) {
  const r = getReferral(code);
  if (!r) return null;
  return { code: r.code, uses: r.uses, conversions: r.conversions, credits_earned: r.rewarded };
}

module.exports = {
  DATA_DIR,
  createOrder, markOrderPaid, getOrder, allOrders, revenueSummary,
  upsertUser, getUser,
  makeReferralCode, getReferral, countReferralClick, countReferralConversion, referralStats,
  _db: db,
};
