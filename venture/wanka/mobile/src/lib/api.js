// Wanka mobile API client (Expo / React Native). Mirrors web app.js + mini-program api.js.
// Token persisted in AsyncStorage. Base URL from expo-constants extra.apiBaseUrl.
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const TOKEN_KEY = 'wk_token';

export function resolveBaseUrl() {
  const extra = (Constants.expoConfig && Constants.expoConfig.extra) || (Constants.manifest && Constants.manifest.extra) || {};
  return extra.apiBaseUrl || 'http://localhost:8788';
}
export const API_BASE = resolveBaseUrl();

let _token = null;
export async function loadToken() { _token = await AsyncStorage.getItem(TOKEN_KEY); return _token; }
export async function setToken(t) { _token = t; if (t) await AsyncStorage.setItem(TOKEN_KEY, t); else await AsyncStorage.removeItem(TOKEN_KEY); }

async function req(path, { method = 'GET', body } = {}) {
  if (_token === null) await loadToken();
  const headers = { 'Content-Type': 'application/json' };
  if (_token) headers.Authorization = `Bearer ${_token}`;
  const res = await fetch(`${API_BASE}/api${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || `http_${res.status}`), { data, status: res.status });
  return data;
}

// --- auth ---
export const register = (b) => req('/auth/register', { method: 'POST', body: b });
export const login = (b) => req('/auth/login', { method: 'POST', body: b });
export const me = () => req('/me');
// --- config ---
export const getConfig = () => req('/config');
// --- projects / generation ---
export const generate = (b) => req('/generate', { method: 'POST', body: b });
export const listProjects = () => req('/projects');
export const createProject = (b) => req('/projects', { method: 'POST', body: b });
// --- templates ---
export const listTemplates = (kind) => req('/templates' + (kind ? `?kind=${kind}` : ''));
export const useTemplate = (id, b) => req(`/templates/${id}/use`, { method: 'POST', body: b });
export const createTemplate = (b) => req('/templates', { method: 'POST', body: b });
export const reportWin = (id) => req(`/templates/${id}/report-win`, { method: 'POST', body: {} });
// --- publish / share ---
export const publishAsset = (id) => req(`/assets/${id}/publish`, { method: 'POST', body: {} });
// --- creator / billing / metrics ---
export const creatorEarnings = () => req('/creator/earnings');
export const checkout = (plan) => req('/billing/checkout', { method: 'POST', body: { plan } });
export const metrics = () => req('/metrics');
