import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  CURRENCIES,
  LANGUAGES,
  type CurrencyCode,
  type LangCode,
  type UnitSystem,
  formatMoney as fmtMoney,
  formatRange as fmtRange,
  formatArea as fmtArea,
} from '../lib/locale';
import { translate } from '../lib/i18n';

interface LocaleState {
  lang: LangCode;
  currency: CurrencyCode;
  unit: UnitSystem;
  setLang: (l: LangCode) => void;
  setCurrency: (c: CurrencyCode) => void;
  setUnit: (u: UnitSystem) => void;
  t: (key: string) => string;
  money: (usd: number) => string;
  range: (low: number, high: number) => string;
  area: (sqm: number) => string;
  dir: 'ltr' | 'rtl';
}

const LocaleContext = createContext<LocaleState | null>(null);

const KEY = 'spacepilot.locale';

function load(): { lang: LangCode; currency: CurrencyCode; unit: UnitSystem } {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { lang: 'en', currency: 'USD', unit: 'metric' };
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const initial = load();
  const [lang, setLang] = useState<LangCode>(initial.lang);
  const [currency, setCurrency] = useState<CurrencyCode>(initial.currency);
  const [unit, setUnit] = useState<UnitSystem>(initial.unit);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify({ lang, currency, unit }));
    const meta = LANGUAGES.find((l) => l.code === lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = meta?.dir ?? 'ltr';
  }, [lang, currency, unit]);

  const value = useMemo<LocaleState>(() => {
    const meta = LANGUAGES.find((l) => l.code === lang);
    return {
      lang,
      currency,
      unit,
      setLang,
      setCurrency,
      setUnit,
      t: (key: string) => translate(lang, key),
      money: (usd: number) => fmtMoney(usd, currency),
      range: (low: number, high: number) => fmtRange(low, high, currency),
      area: (sqm: number) => fmtArea(sqm, unit),
      dir: meta?.dir ?? 'ltr',
    };
  }, [lang, currency, unit]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleState {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}

export { CURRENCIES, LANGUAGES };
