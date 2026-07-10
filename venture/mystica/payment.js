/* Mystica 支付闭环 — Lemon Squeezy (推荐, Merchant of Record 自动全球代扣税)
 * 也兼容 Stripe. 通过环境变量切换, 无需改代码.
 *
 * 工作流:
 *   1) 前端点击购买 -> POST /api/checkout {product, chart} -> 返回托管支付页 URL
 *   2) 用户在 Lemon/Stripe 完成支付
 *   3) 平台回调 webhook -> POST /api/webhook -> 校验签名 -> 标记订单已支付
 *   4) 前端凭 order token 拉取已解锁的报告
 *
 * 环境变量 (在部署平台配置, 切勿写进代码):
 *   PAYMENT_PROVIDER = lemonsqueezy | stripe | demo(默认)
 *   LEMONSQUEEZY_API_KEY, LEMONSQUEEZY_STORE_ID, LEMONSQUEEZY_WEBHOOK_SECRET
 *   LEMONSQUEEZY_VARIANT_<PRODUCT> = variant id  (如 LEMONSQUEEZY_VARIANT_DEEP=123456)
 *   STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_<PRODUCT>
 */
const crypto = require("crypto");

const PROVIDER = process.env.PAYMENT_PROVIDER || "demo";

// 产品目录 (价格用于展示; 真实扣款以支付平台配置为准)
const PRODUCTS = {
  deep:    { name: "Deep Reading",            usd: 19 },
  compat:  { name: "Couple Compatibility",    usd: 29 },
  naming:  { name: "Five-Element Baby Name",  usd: 49 },
  dates:   { name: "Auspicious Date Picker",  usd: 15 },
  scroll:  { name: "Annual Fortune Scroll",   usd: 59 },
  amulet:  { name: "Custom Crystal Amulet",   usd: 79 },
  member:  { name: "Cosmic Membership",       usd: 9, recurring: true },
};

// 内存订单表 (生产用 D1 / Postgres / KV 替换)
const orders = new Map();
function newOrder(product, meta) {
  const token = crypto.randomBytes(16).toString("hex");
  orders.set(token, { token, product, meta, paid: false, createdAt: Date.now() });
  return token;
}
function markPaid(token) { const o = orders.get(token); if (o) { o.paid = true; o.paidAt = Date.now(); } return o; }
function getOrder(token) { return orders.get(token); }

async function createCheckout({ product, meta, successUrl, cancelUrl }) {
  const token = newOrder(product, meta);
  const prod = PRODUCTS[product];
  if (!prod) throw new Error("unknown product");

  if (PROVIDER === "lemonsqueezy") {
    const variant = process.env["LEMONSQUEEZY_VARIANT_" + product.toUpperCase()];
    const storeId = process.env.LEMONSQUEEZY_STORE_ID;
    const key = process.env.LEMONSQUEEZY_API_KEY;
    const r = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
      method: "POST",
      headers: { "Content-Type": "application/vnd.api+json", "Accept": "application/vnd.api+json", "Authorization": "Bearer " + key },
      body: JSON.stringify({
        data: { type: "checkouts",
          attributes: { checkout_data: { custom: { order_token: token } },
            product_options: { redirect_url: `${successUrl}?token=${token}` } },
          relationships: {
            store: { data: { type: "stores", id: String(storeId) } },
            variant: { data: { type: "variants", id: String(variant) } } } } }),
    });
    const j = await r.json();
    const url = j?.data?.attributes?.url;
    if (!url) throw new Error("lemonsqueezy checkout failed: " + JSON.stringify(j).slice(0, 200));
    return { token, url };
  }

  if (PROVIDER === "stripe") {
    const Stripe = require("stripe");
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const price = process.env["STRIPE_PRICE_" + product.toUpperCase()];
    const session = await stripe.checkout.sessions.create({
      mode: prod.recurring ? "subscription" : "payment",
      line_items: [{ price, quantity: 1 }],
      success_url: `${successUrl}?token=${token}`,
      cancel_url: cancelUrl,
      metadata: { order_token: token },
    });
    return { token, url: session.url };
  }

  // demo: 无真实支付, 直接标记已付并回跳 (方便本地/演示)
  markPaid(token);
  return { token, url: `${successUrl}?token=${token}&demo=1`, demo: true };
}

function verifyWebhook(provider, rawBody, headers) {
  if (provider === "lemonsqueezy") {
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
    const sig = headers["x-signature"];
    const digest = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    return sig && crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(sig));
  }
  if (provider === "stripe") {
    const Stripe = require("stripe");
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    try {
      stripe.webhooks.constructEvent(rawBody, headers["stripe-signature"], process.env.STRIPE_WEBHOOK_SECRET);
      return true;
    } catch { return false; }
  }
  return false;
}

module.exports = { PROVIDER, PRODUCTS, createCheckout, verifyWebhook, markPaid, getOrder, orders };
