// lib/api.js — Meridian Sync mobile API client
// Mirrors the Cloudflare Worker backend (src/index.js). All money is server-side.
// Token is stored in AsyncStorage; base URL comes from app.json -> expo.extra.apiBaseUrl.

import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const TOKEN_KEY = 'mrd_token';

// Resolve API base URL from Expo config (app.json extra.apiBaseUrl).
function resolveBaseUrl() {
  const extra =
    Constants?.expoConfig?.extra ||
    Constants?.manifest?.extra ||
    Constants?.manifest2?.extra ||
    {};
  let url = extra.apiBaseUrl || '';
  if (!url) {
    // Safe fallback for local dev; user MUST set the real Worker URL in app.json.
    url = 'http://localhost:8787';
  }
  return url.replace(/\/+$/, '');
}

export const API_BASE = resolveBaseUrl();

let _token = null;
let _tokenLoaded = false;

export async function loadToken() {
  if (_tokenLoaded) return _token;
  try {
    _token = await AsyncStorage.getItem(TOKEN_KEY);
  } catch {
    _token = null;
  }
  _tokenLoaded = true;
  return _token;
}

export async function setToken(tok) {
  _token = tok || null;
  _tokenLoaded = true;
  try {
    if (tok) await AsyncStorage.setItem(TOKEN_KEY, tok);
    else await AsyncStorage.removeItem(TOKEN_KEY);
  } catch {
    /* noop */
  }
}

export function getToken() {
  return _token;
}

export function isLoggedIn() {
  return !!_token;
}

// Core request helper. Throws an Error with .status and .data on non-2xx.
async function request(path, { method = 'GET', body, auth = false, timeout = 20000 } = {}) {
  if (!_tokenLoaded) await loadToken();
  const headers = { 'Content-Type': 'application/json' };
  if (auth && _token) headers['Authorization'] = `Bearer ${_token}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (e) {
    clearTimeout(timer);
    const err = new Error('network_error');
    err.status = 0;
    err.data = { error: 'network_error', message: String(e && e.message ? e.message : e) };
    throw err;
  }
  clearTimeout(timer);

  let data = null;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    const err = new Error((data && data.error) || `http_${res.status}`);
    err.status = res.status;
    err.data = data || {};
    throw err;
  }
  return data;
}

// ---------------- Auth ----------------
export async function register({ email, password, name, referred_by }) {
  const r = await request('/api/auth/register', {
    method: 'POST',
    body: { email, password, name, referred_by },
  });
  if (r?.token) await setToken(r.token);
  return r;
}

export async function login({ email, password }) {
  const r = await request('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  });
  if (r?.token) await setToken(r.token);
  return r;
}

export async function logout() {
  await setToken(null);
}

export async function me() {
  return request('/api/me', { auth: true });
}

export async function exportMe() {
  return request('/api/me/export', { auth: true });
}

export async function deleteMe() {
  return request('/api/me', { method: 'DELETE', auth: true });
}

// ---------------- Sync (compatibility) ----------------
// Free preview — no auth needed. a/b: {name,gender,date,time,place,lon}
export async function syncPreview({ a, b, rel_type }) {
  return request('/api/sync/preview', {
    method: 'POST',
    body: { a, b, rel_type },
  });
}

// Create relationship + report (auth). Returns {relationship_id, report_id, preview}.
export async function createRelationship({ a, b, rel_type }) {
  return request('/api/sync/relationships', {
    method: 'POST',
    body: { a, b, rel_type },
    auth: true,
  });
}

export async function listRelationships() {
  return request('/api/sync/relationships', { auth: true });
}

// Get report. locked=1 -> {locked:true, preview}; locked=0 -> {locked:false, report}
export async function getReport(id) {
  return request(`/api/sync/reports/${id}`, { auth: true });
}

// Unlock full report. 402 {error:'no_credit', upgrade:true} when out of credits.
export async function unlockReport(id) {
  return request(`/api/sync/reports/${id}/unlock`, { method: 'POST', auth: true });
}

export async function shareReport(report_id) {
  return request('/api/sync/share', { method: 'POST', body: { report_id }, auth: true });
}

export async function getCard(slug) {
  return request(`/api/sync/card/${slug}`);
}

export async function sendFeedback({ relationship_id, report_id, accuracy, outcome }) {
  return request('/api/sync/feedback', {
    method: 'POST',
    body: { relationship_id, report_id, accuracy, outcome },
    auth: true,
  });
}

// ---------------- Billing ----------------
// Returns a checkout intent; entitlement is only granted server-side via webhook.
export async function checkout({ plan, provider }) {
  return request('/api/billing/checkout', {
    method: 'POST',
    body: { plan, provider },
    auth: true,
  });
}

export async function plans() {
  return request('/api/plans');
}

export async function health() {
  return request('/api/health');
}

export default {
  API_BASE,
  loadToken,
  setToken,
  getToken,
  isLoggedIn,
  register,
  login,
  logout,
  me,
  exportMe,
  deleteMe,
  syncPreview,
  createRelationship,
  listRelationships,
  getReport,
  unlockReport,
  shareReport,
  getCard,
  sendFeedback,
  checkout,
  plans,
  health,
};
