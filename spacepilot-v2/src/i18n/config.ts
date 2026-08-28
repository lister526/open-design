import en from './en.json';
import zh from './zh.json';
import ja from './ja.json';
import es from './es.json';
import ar from './ar.json';

export type Locale = 'en' | 'zh' | 'ja' | 'es' | 'ar';

export const DICTS: Record<Locale, Record<string, string>> = { en, zh, ja, es, ar };

export const LOCALES: { code: Locale; label: string; flag: string; dir: 'ltr' | 'rtl' }[] = [
  { code: 'en', label: 'English', flag: '🇺🇸', dir: 'ltr' },
  { code: 'zh', label: '中文', flag: '🇨🇳', dir: 'ltr' },
  { code: 'ja', label: '日本語', flag: '🇯🇵', dir: 'ltr' },
  { code: 'es', label: 'Español', flag: '🇪🇸', dir: 'ltr' },
  { code: 'ar', label: 'العربية', flag: '🇦🇪', dir: 'rtl' },
];

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AED' | 'SGD' | 'CNY';

export const CURRENCIES: Record<CurrencyCode, { symbol: string; perUSD: number }> = {
  USD: { symbol: '$', perUSD: 1 },
  EUR: { symbol: '€', perUSD: 0.92 },
  GBP: { symbol: '£', perUSD: 0.79 },
  JPY: { symbol: '¥', perUSD: 157 },
  AED: { symbol: 'AED ', perUSD: 3.67 },
  SGD: { symbol: 'S$', perUSD: 1.35 },
  CNY: { symbol: '¥', perUSD: 7.2 },
};

export const DEFAULT_CURRENCY_BY_LOCALE: Record<Locale, CurrencyCode> = {
  en: 'USD', zh: 'CNY', ja: 'JPY', es: 'EUR', ar: 'AED',
};
