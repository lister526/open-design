import { useState, useRef, useEffect } from 'react';
import { useLocale, LANGUAGES, CURRENCIES } from '../context/LocaleContext';
import type { CurrencyCode } from '../lib/locale';

export function LocaleSwitcher({ compact = false }: { compact?: boolean }) {
  const { lang, setLang, currency, setCurrency, unit, setUnit } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const current = LANGUAGES.find((l) => l.code === lang);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-semibold text-ink-800 ring-1 ring-ink-900/10 hover:bg-ink-900/[.03] transition"
      >
        <span>{current?.flag}</span>
        {!compact && <span className="hidden sm:inline">{currency}</span>}
        <svg width="12" height="12" viewBox="0 0 24 24" className="opacity-50"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" fill="none" /></svg>
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-72 rounded-2xl bg-white p-3 shadow-glow ring-1 ring-ink-900/10">
          <p className="px-1 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-700/50">Language</p>
          <div className="grid grid-cols-3 gap-1">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`rounded-lg px-2 py-1.5 text-xs font-semibold transition ${lang === l.code ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-300' : 'hover:bg-ink-900/[.04]'}`}
              >
                {l.flag} {l.label}
              </button>
            ))}
          </div>
          <p className="px-1 pt-3 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-700/50">Currency</p>
          <div className="grid grid-cols-4 gap-1">
            {(Object.keys(CURRENCIES) as CurrencyCode[]).map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`rounded-lg px-2 py-1.5 text-xs font-semibold transition ${currency === c ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-300' : 'hover:bg-ink-900/[.04]'}`}
              >
                {c}
              </button>
            ))}
          </div>
          <p className="px-1 pt-3 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-700/50">Units</p>
          <div className="grid grid-cols-2 gap-1">
            {(['metric', 'imperial'] as const).map((u) => (
              <button
                key={u}
                onClick={() => setUnit(u)}
                className={`rounded-lg px-2 py-1.5 text-xs font-semibold capitalize transition ${unit === u ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-300' : 'hover:bg-ink-900/[.04]'}`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
