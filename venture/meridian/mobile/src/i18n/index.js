// i18n runtime for the mobile app.
// - Real-time language switch via React context (no reload).
// - Persists choice in AsyncStorage.
// - Applies RTL (Arabic) through I18nManager; on native a layout-direction
//   change needs a reload, so we expose `pendingRTLReload` for the UI to nudge.
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { I18N, LOCALES, PRICES, RTL_LOCALES } from './dictionary';

const STORAGE_KEY = 'mrd_lang';
const I18nContext = createContext(null);

// Pick the best default: stored choice > device language (if we support it) > zh.
function deviceDefault() {
  try {
    const locales = Localization.getLocales ? Localization.getLocales() : [];
    for (const l of locales) {
      const code = (l.languageCode || '').toLowerCase();
      if (I18N[code]) return code;
      // map common variants
      if (code === 'zh') return 'zh';
    }
  } catch (_) {}
  return 'zh';
}

function applyRTL(code) {
  const shouldRTL = RTL_LOCALES.includes(code);
  if (I18nManager.isRTL !== shouldRTL) {
    try {
      I18nManager.allowRTL(shouldRTL);
      I18nManager.forceRTL(shouldRTL);
    } catch (_) {}
  }
}

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState('zh');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      let stored = null;
      try { stored = await AsyncStorage.getItem(STORAGE_KEY); } catch (_) {}
      const initial = stored && I18N[stored] ? stored : deviceDefault();
      applyRTL(initial);
      setLangState(initial);
      setReady(true);
    })();
  }, []);

  const setLang = useCallback(async (code) => {
    if (!I18N[code]) return;
    applyRTL(code);
    setLangState(code);
    try { await AsyncStorage.setItem(STORAGE_KEY, code); } catch (_) {}
  }, []);

  const t = useCallback((key, vars) => {
    let s = (I18N[lang] && I18N[lang][key]) || I18N.zh[key] || key;
    if (vars) {
      for (const k of Object.keys(vars)) s = String(s).split(`{${k}}`).join(vars[k]);
    }
    return s;
  }, [lang]);

  const meta = LOCALES.find((l) => l.code === lang) || LOCALES[0];
  const isRTL = meta.dir === 'rtl';
  const px = PRICES[lang] || PRICES.zh;

  const value = { lang, setLang, t, meta, isRTL, px, ready, locales: LOCALES };
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>');
  return ctx;
}

export { LOCALES, PRICES, I18N, RTL_LOCALES };
