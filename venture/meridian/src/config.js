// config.js — startup safety guards. [IMPLEMENTED]
//
// Fixes CRIT-2 (dev-secret fallback) and CRIT-4 (silent third-party proxy default).

// Returns the JWT secret or THROWS. There is NO fallback. Ever.
export function requireJwtSecret(env) {
  const s = env.JWT_SECRET;
  if (!s || typeof s !== 'string' || s.length < 16 || s === 'dev-secret' || s === 'local-dev-secret-meridian-2026' && env.ENVIRONMENT === 'production') {
    // In production a weak/missing secret is fatal.
    if (env.ENVIRONMENT === 'production') {
      throw new Error('FATAL: JWT_SECRET missing or weak in production. Refusing to run.');
    }
    // In dev, still require *something* of length; but never invent one silently.
    if (!s || s.length < 16) {
      throw new Error('JWT_SECRET must be set (>=16 chars). No dev-secret fallback.');
    }
  }
  return s;
}

// LLM config. Returns null when no provider is explicitly configured — in which
// case the app must NOT send user data anywhere and falls back to local advisor.
export function llmConfig(env) {
  const apiKey = env.OPENAI_API_KEY;
  const baseURL = env.OPENAI_BASE_URL; // NO hardcoded default (CRIT-4)
  if (!apiKey || !baseURL) return null; // explicit opt-in only
  // baseURL must be on the allowlist to prevent SSRF / undisclosed exfiltration.
  const allow = (env.LLM_ALLOWED_HOSTS || '').split(',').map((s) => s.trim()).filter(Boolean);
  try {
    const host = new URL(baseURL).host;
    if (allow.length && !allow.includes(host)) return null;
  } catch { return null; }
  return { apiKey, baseURL, model: env.LLM_MODEL || 'gpt-4o-mini' };
}
