// util.js — ids, time, password hashing, and HMAC-signed JWT-ish tokens (Web Crypto).
// No external deps; runs on Cloudflare Workers.

export function now() { return Date.now(); }

export function uid(prefix = 'id') {
  const rnd = crypto.getRandomValues(new Uint8Array(9));
  const s = btoa(String.fromCharCode(...rnd)).replace(/[+/=]/g, '').slice(0, 12);
  return `${prefix}_${s}`;
}

function b64url(buf) {
  const bytes = buf instanceof ArrayBuffer ? new Uint8Array(buf) : buf;
  let str = '';
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64urlToBytes(s) {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

const enc = new TextEncoder();

export async function hashPassword(password, salt) {
  salt = salt || b64url(crypto.getRandomValues(new Uint8Array(16)));
  const material = enc.encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', material);
  return `${salt}$${b64url(digest)}`;
}

export async function verifyPassword(password, stored) {
  if (!stored || !stored.includes('$')) return false;
  const [salt] = stored.split('$');
  const rehash = await hashPassword(password, salt);
  return rehash === stored;
}

async function hmacKey(secret) {
  return crypto.subtle.importKey(
    'raw', enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify'],
  );
}

export async function signToken(payload, secret, ttlSec = 60 * 60 * 24 * 30) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const body = { ...payload, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + ttlSec };
  const p1 = b64url(enc.encode(JSON.stringify(header)));
  const p2 = b64url(enc.encode(JSON.stringify(body)));
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(`${p1}.${p2}`));
  return `${p1}.${p2}.${b64url(sig)}`;
}

export async function verifyToken(token, secret) {
  if (!token || token.split('.').length !== 3) return null;
  const [p1, p2, sig] = token.split('.');
  const key = await hmacKey(secret);
  const ok = await crypto.subtle.verify('HMAC', key, b64urlToBytes(sig), enc.encode(`${p1}.${p2}`));
  if (!ok) return null;
  try {
    const body = JSON.parse(new TextDecoder().decode(b64urlToBytes(p2)));
    if (body.exp && body.exp < Math.floor(Date.now() / 1000)) return null;
    return body;
  } catch { return null; }
}

export function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...extra },
  });
}
