'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DICTS, type Locale, type CurrencyCode, CURRENCIES, DEFAULT_CURRENCY_BY_LOCALE } from '@/i18n/config';

interface PrefsState {
  locale: Locale;
  currency: CurrencyCode;
  theme: 'light' | 'dark';
  hydrated: boolean;
  setLocale: (l: Locale) => void;
  setCurrency: (c: CurrencyCode) => void;
  toggleTheme: () => void;
  setHydrated: () => void;
}

export const usePrefs = create<PrefsState>()(
  persist(
    (set) => ({
      locale: 'en',
      currency: 'USD',
      theme: 'light',
      hydrated: false,
      setLocale: (locale) => set({ locale, currency: DEFAULT_CURRENCY_BY_LOCALE[locale] }),
      setCurrency: (currency) => set({ currency }),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: 'spacepilot.prefs',
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);

export function useT() {
  const locale = usePrefs((s) => s.locale);
  return (key: string) => DICTS[locale]?.[key] ?? DICTS.en[key] ?? key;
}

export function useMoney() {
  const currency = usePrefs((s) => s.currency);
  const c = CURRENCIES[currency];
  return (usd: number, opts?: { round?: number }) => {
    const v = usd * c.perUSD;
    const round = opts?.round ?? (v >= 1000 ? 10 : 1);
    const rounded = Math.round(v / round) * round;
    return `${c.symbol}${rounded.toLocaleString('en-US')}`;
  };
}
