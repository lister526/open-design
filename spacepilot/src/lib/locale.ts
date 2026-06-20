// Locale, currency & units system for SpacePilot AI

export type LangCode =
  | 'en' | 'zh' | 'ja' | 'es' | 'ko' | 'fr' | 'de' | 'ar' | 'pt';

export interface LangMeta {
  code: LangCode;
  label: string;
  flag: string;
  dir: 'ltr' | 'rtl';
}

export const LANGUAGES: LangMeta[] = [
  { code: 'en', label: 'English', flag: '🇺🇸', dir: 'ltr' },
  { code: 'zh', label: '中文', flag: '🇨🇳', dir: 'ltr' },
  { code: 'ja', label: '日本語', flag: '🇯🇵', dir: 'ltr' },
  { code: 'es', label: 'Español', flag: '🇪🇸', dir: 'ltr' },
  { code: 'ko', label: '한국어', flag: '🇰🇷', dir: 'ltr' },
  { code: 'fr', label: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
  { code: 'pt', label: 'Português', flag: '🇧🇷', dir: 'ltr' },
  { code: 'ar', label: 'العربية', flag: '🇦🇪', dir: 'rtl' },
];

export type CurrencyCode = 'USD' | 'JPY' | 'EUR' | 'AED' | 'SGD' | 'CNY' | 'GBP' | 'KRW';

export interface CurrencyMeta {
  code: CurrencyCode;
  symbol: string;
  // approximate static FX vs USD (mock — replace with live rates later)
  perUSD: number;
  decimals: number;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyMeta> = {
  USD: { code: 'USD', symbol: '$', perUSD: 1, decimals: 0 },
  EUR: { code: 'EUR', symbol: '€', perUSD: 0.92, decimals: 0 },
  GBP: { code: 'GBP', symbol: '£', perUSD: 0.79, decimals: 0 },
  JPY: { code: 'JPY', symbol: '¥', perUSD: 157, decimals: 0 },
  CNY: { code: 'CNY', symbol: '¥', perUSD: 7.2, decimals: 0 },
  SGD: { code: 'SGD', symbol: 'S$', perUSD: 1.35, decimals: 0 },
  AED: { code: 'AED', symbol: 'AED ', perUSD: 3.67, decimals: 0 },
  KRW: { code: 'KRW', symbol: '₩', perUSD: 1360, decimals: 0 },
};

export type UnitSystem = 'metric' | 'imperial';

export function formatMoney(usd: number, currency: CurrencyCode): string {
  const c = CURRENCIES[currency];
  const value = usd * c.perUSD;
  const rounded =
    value >= 1000
      ? Math.round(value / 10) * 10
      : Math.round(value);
  const formatted = rounded.toLocaleString('en-US', {
    maximumFractionDigits: c.decimals,
  });
  return `${c.symbol}${formatted}`;
}

export function formatRange(lowUsd: number, highUsd: number, currency: CurrencyCode): string {
  return `${formatMoney(lowUsd, currency)} – ${formatMoney(highUsd, currency)}`;
}

export function formatArea(sqm: number, unit: UnitSystem): string {
  if (unit === 'imperial') {
    return `${Math.round(sqm * 10.764)} ft²`;
  }
  return `${sqm} m²`;
}
