// payments.js — PaymentProvider abstraction. [IMPLEMENTED_WITH_MOCK_PROVIDER]
//
// SECURITY INVARIANT (fixes CRIT-1 demo-upgrade backdoor):
//   Entitlements are NEVER granted by a raw client request.
//   They are granted ONLY when a payment event is verified:
//     - real providers: by cryptographic webhook signature verification
//     - mock provider: only when env.PAYMENTS_MOCK === 'enabled' (must be OFF in prod)
//
// Money is stored as INTEGER minor units (cents / 分). Never floats.

// 子午·合盘 变现阶梯。金额为整数最小单位（分）。
export const PLANS = {
  // 微支付：解锁单份完整合盘报告（冲动价）
  report_lite:   { code: 'report_lite',   name: '缘分完整报告', amount: 1900,  currency: 'CNY', period: null,   kind: 'one_time', reportCredits: 1 },
  report_deep:   { code: 'report_deep',   name: '深度合盘报告', amount: 3900,  currency: 'CNY', period: null,   kind: 'one_time', reportCredits: 3 },
  // 深度层：复合择时 / 合婚（高客单一次性）
  report_marriage:{ code: 'report_marriage', name: '合婚 · 深度定制', amount: 39900, currency: 'CNY', period: null, kind: 'one_time', reportCredits: 5 },
  // 订阅：关系持续追踪（一键可取消，无暗坑）
  sync_monthly:  { code: 'sync_monthly',  name: '子午会员 · 月', amount: 3900,  currency: 'CNY', period: 'month', kind: 'subscription' },
  sync_yearly:   { code: 'sync_yearly',   name: '子午会员 · 年', amount: 29900, currency: 'CNY', period: 'year',  kind: 'subscription' },
};

// Entitlements per plan (server-authoritative; never trust client).
export function entitlementFor(planCode) {
  switch (planCode) {
    case 'sync_monthly':
    case 'sync_yearly':
      // 会员：公平使用额度（非"无限"），含每月新报告额度 + AI 追问额度
      return { plan: 'member', monthlyAiQuota: 300, reportCredits: 6 };
    case 'report_deep':
      return { plan: 'free', reportCredits: 3 };
    case 'report_marriage':
      return { plan: 'free', reportCredits: 5 };
    case 'report_lite':
      return { plan: 'free', reportCredits: 1 };
    default:
      return { plan: 'free', monthlyAiQuota: 0, reportCredits: 0 };
  }
}

// Provider registry.
export function getProvider(env, name) {
  if (name === 'mock') return new MockProvider(env);
  // Real providers are scaffolded but require external credentials.
  // [REQUIRES_EXTERNAL_CREDENTIALS] wechat / alipay / stripe / apple_iap / google_play
  return null;
}

// MockProvider — for local dev & tests ONLY. Refuses to run unless explicitly enabled.
class MockProvider {
  constructor(env) { this.env = env; }
  get enabled() { return this.env.PAYMENTS_MOCK === 'enabled'; }

  // Create a checkout intent (order stays 'pending' until webhook confirms).
  async createCheckout({ plan }) {
    if (!this.enabled) throw new Error('mock_provider_disabled');
    const p = PLANS[plan];
    if (!p) throw new Error('invalid_plan');
    // In a real provider this returns a redirect/QR. Mock returns a signed "receipt"
    // the test harness can POST back to the webhook to simulate a paid callback.
    return { provider: 'mock', plan: p.code, amount: p.amount, currency: p.currency };
  }

  // Verify an incoming webhook. Real providers verify HMAC/RSA signatures here.
  // Mock verifies a shared-secret HMAC so even the mock path can't be forged by a
  // plain client request — the test harness must know MOCK_WEBHOOK_SECRET.
  async verifyWebhook(rawBody, signature) {
    if (!this.enabled) throw new Error('mock_provider_disabled');
    const secret = this.env.MOCK_WEBHOOK_SECRET;
    if (!secret) throw new Error('mock_webhook_secret_missing');
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const sig = await crypto.subtle.sign('HMAC', key, enc.encode(rawBody));
    const hex = [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
    if (!signature || signature !== hex) return null; // signature mismatch → reject
    try { return JSON.parse(rawBody); } catch { return null; }
  }
}
