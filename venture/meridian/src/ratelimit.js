// ratelimit.js — sliding-window limiter. [IMPLEMENTED_WITH_INMEMORY_LIMITER]
//
// NOTE (ADR-004): In-memory Map is per-isolate; on multi-instance Workers this is
// approximate, not globally exact. Production MUST replace with a Durable Object
// or Redis-backed counter. But "basic limiting" >> "no limiting" (fixes HIGH-5).

const buckets = new Map(); // key -> number[] (timestamps ms)

export function rateLimit(key, { limit, windowMs }) {
  const now = Date.now();
  const arr = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  if (arr.length >= limit) {
    const retryAfter = Math.ceil((windowMs - (now - arr[0])) / 1000);
    return { ok: false, retryAfter };
  }
  arr.push(now);
  buckets.set(key, arr);
  // opportunistic cleanup to bound memory
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) {
      const kept = v.filter((t) => now - t < windowMs);
      if (kept.length === 0) buckets.delete(k); else buckets.set(k, kept);
    }
  }
  return { ok: true };
}

export function clientIp(c) {
  return c.req.header('cf-connecting-ip')
    || c.req.header('x-forwarded-for')?.split(',')[0]?.trim()
    || 'unknown';
}

// Input length guard (fixes cost-bomb via oversized prompts).
export const MAX_MESSAGE_LEN = 4000;
export const MAX_FIELD_LEN = 500;
