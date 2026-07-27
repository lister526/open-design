// payments.js — PaymentProvider abstraction. [IMPLEMENTED_WITH_MOCK_PROVIDER]
//
// SECURITY INVARIANT (fixes CRIT-1 demo-upgrade backdoor):
//   Entitlements are NEVER granted by a raw client request.
//   They are granted ONLY when a payment event is verified:
//     - real providers: by cryptographic webhook signature verification
//     - mock provider: only when env.PAYMENTS_MOCK === 'enabled' (must be OFF in prod)
//
// Money is stored as INTEGER minor units (cents / 分). Never floats.

export const PLANS = {
  core_monthly: { code: 'core_monthly', name: 'Core 月度', amount: 5900, currency: 'CNY', period: 'month', kind: 'subscription' },
  core_yearly:  { code: 'core_yearly',  name: 'Core 年度', amount: 59900, currency: 'CNY', period: 'year',  kind: 'subscription' },
  pack_single:  { code: 'pack_single',  name: 'Decision Pack 单次', amount: 19900, currency: 'CNY', period: null, kind: 'one_time' },
};

// Entitlements per plan (server-authoritative; never trust client).
export function entitlementFor(planCode) {
  switch (planCode) {
    case 'core_monthly':
    case 'core_yearly':
      // Fair-use monthly AI quota (NOT "unlimited" — CRIT-6 fix).
      return { plan: 'core', monthlyAiQuota: 300, activeDecisionLimit: 20 };
    case 'pack_single':
      return { plan: 'free', packCredits: 1 }; // one deep decision pack
    default:
      return { plan: 'free', monthlyAiQuota: 0, activeDecisionLimit: 1 };
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
