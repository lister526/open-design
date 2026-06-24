'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Logo } from './Logo';
import { LocaleSwitcher } from './LocaleSwitcher';
import { ThemeToggle } from './ThemeToggle';
import { Button } from '@/components/ui/button';
import { useT } from '@/store/prefs';
import { cn } from '@/lib/cn';

export function Navbar() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 8);
    h();
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  const links = [
    { href: '/#how', label: t('nav.howItWorks') },
    { href: '/#use-cases', label: t('nav.useCases') },
    { href: '/#pricing', label: t('nav.pricing') },
    { href: '/partners', label: t('nav.partners') },
  ];

  return (
    <header className={cn('sticky top-0 z-40 border-b transition-colors', scrolled ? 'border-border bg-background/85 backdrop-blur-xl' : 'border-transparent bg-background/0')}>
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/"><Logo /></Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground">{l.label}</a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/console" className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground sm:inline-flex">{t('nav.console')}</Link>
          <ThemeToggle />
          <LocaleSwitcher />
          <Link href="/audit" className="hidden sm:block"><Button size="sm">{t('nav.startAudit')}</Button></Link>
          <button onClick={() => setOpen((o) => !o)} className="grid h-9 w-9 place-items-center rounded-lg border border-border lg:hidden" aria-label="Menu">
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background px-6 py-3 lg:hidden">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-foreground hover:bg-muted">{l.label}</a>
          ))}
          <Link href="/console" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-foreground hover:bg-muted">{t('nav.console')}</Link>
          <Link href="/audit" onClick={() => setOpen(false)} className="mt-2 block"><Button className="w-full">{t('nav.startAudit')}</Button></Link>
        </div>
      )}
    </header>
  );
}
