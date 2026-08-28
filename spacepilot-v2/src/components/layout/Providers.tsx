'use client';
import { useEffect } from 'react';
import { usePrefs } from '@/store/prefs';
import { LOCALES } from '@/i18n/config';

export function Providers({ children }: { children: React.ReactNode }) {
  const { locale, theme } = usePrefs();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.lang = locale;
    root.dir = LOCALES.find((l) => l.code === locale)?.dir ?? 'ltr';
  }, [locale, theme]);

  return <>{children}</>;
}
