'use client';
import { useEffect, useRef, useState } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { usePrefs } from '@/store/prefs';
import { LOCALES, CURRENCIES, type CurrencyCode } from '@/i18n/config';
import { cn } from '@/lib/cn';

export function LocaleSwitcher() {
  const { locale, setLocale, currency, setCurrency } = usePrefs();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const cur = LOCALES.find((l) => l.code === locale);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-2.5 text-sm font-semibold text-foreground transition hover:bg-muted"
        aria-label="Language and currency"
      >
        <Globe className="h-4 w-4 text-muted-foreground" />
        <span>{cur?.flag}</span>
        <span className="hidden text-xs text-muted-foreground sm:inline">{currency}</span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute end-0 z-50 mt-2 w-64 animate-scale-in rounded-xl border border-border bg-card p-3 shadow-glow">
          <p className="px-1 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Language</p>
          <div className="space-y-0.5">
            {LOCALES.map((l) => (
              <button key={l.code} onClick={() => { setLocale(l.code); }}
                className={cn('flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm font-medium transition hover:bg-muted', locale === l.code && 'bg-muted')}>
                <span>{l.flag} {l.label}</span>
                {locale === l.code && <Check className="h-4 w-4 text-primary" />}
              </button>
            ))}
          </div>
          <p className="px-1 pb-1.5 pt-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Currency</p>
          <div className="grid grid-cols-4 gap-1">
            {(Object.keys(CURRENCIES) as CurrencyCode[]).map((c) => (
              <button key={c} onClick={() => setCurrency(c)}
                className={cn('rounded-lg px-2 py-1.5 text-xs font-bold transition hover:bg-muted', currency === c ? 'bg-primary/10 text-primary' : 'text-muted-foreground')}>
                {c}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
