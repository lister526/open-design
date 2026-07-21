// Auth utilities for Cloudflare Workers (WebCrypto-based, no node deps)
// PBKDF2 password hashing + HMAC-signed JWT-like session tokens.

const enc = new TextEncoder();
const dec = new TextDecoder();

function b64urlEncode(bytes) {
  let bin = '';
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  for (let i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64urlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  const bin = atob(str);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

// ---- Password hashing (PBKDF2-SHA256) ----
export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, key, 256
  );
  return `pbkdf2$100000$${b64urlEncode(salt)}$${b64urlEncode(bits)}`;
}
export async function verifyPassword(password, stored) {
  try {
    const [scheme, iterStr, saltB64, hashB64] = stored.split('$');
    if (scheme !== 'pbkdf2') return false;
    const salt = b64urlDecode(saltB64);
    const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt, iterations: Number(iterStr), hash: 'SHA-256' }, key, 256
    );
    return b64urlEncode(bits) === hashB64;
  } catch { return false; }
}

// ---- Session token (HMAC-SHA256 signed) ----
async function hmacKey(secret) {
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}
export async function signToken(payload, secret, ttlSeconds = 60 * 60 * 24 * 30) {
  const body = { ...payload, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + ttlSeconds };
  const b = b64urlEncode(enc.encode(JSON.stringify(body)));
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(b));
  return `${b}.${b64urlEncode(sig)}`;
}
export async function verifyToken(token, secret) {
  try {
    const [b, sigB64] = token.split('.');
    if (!b || !sigB64) return null;
    const key = await hmacKey(secret);
    const ok = await crypto.subtle.verify('HMAC', key, b64urlDecode(sigB64), enc.encode(b));
    if (!ok) return null;
    const body = JSON.parse(dec.decode(b64urlDecode(b)));
    if (body.exp && body.exp < Math.floor(Date.now() / 1000)) return null;
    return body;
  } catch { return null; }
}

export function uuid() { return crypto.randomUUID(); }
export function refCode() {
  const s = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  const r = crypto.getRandomValues(new Uint8Array(6));
  for (let i = 0; i < 6; i++) out += s[r[i] % s.length];
  return out;
}
