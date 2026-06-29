'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Logo } from './Logo';
import { Input } from '@/components/ui/primitives';
import { Button } from '@/components/ui/button';
import { useData } from '@/store/data';
import { useT } from '@/store/prefs';

export function Footer() {
  const t = useT();
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const addWaitlist = useData((s) => s.addWaitlist);

  return (
    <footer className="mt-24 border-t border-border bg-muted/30">
      <div className="container grid gap-10 py-14 md:grid-cols-[1.5fr_1fr_1fr_1.4fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">{t('footer.tagline')}</p>
          <p className="mt-4 text-xs text-muted-foreground/70">© {new Date().getFullYear()} SpacePilot AI. {t('compliance.short')}</p>
        </div>
        <FooterCol title={t('footer.product')} links={[['/audit', 'Listing leak scan'], ['/proposal/demo', 'Demo proposal'], ['/#how', 'How it works'], ['/console?demo=1', 'Console']]} />
        <FooterCol title={t('footer.partners')} links={[['/partners', 'Delivery partners'], ['/partners#trust', 'Trust scoring'], ['/partners#apply', 'Apply']]} />
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('footer.cityUpdates')}</p>
          {done ? (
            <p className="rounded-lg bg-accent/10 px-4 py-3 text-sm font-semibold text-accent">You're on the list.</p>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); if (!email) return; addWaitlist({ email, kind: 'newsletter' }); setDone(true); setEmail(''); }} className="flex gap-2">
              <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="you@company.com" />
              <Button type="submit">{t('common.start')}</Button>
            </form>
          )}
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</p>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {links.map(([href, label]) => (
          <li key={href}><Link href={href} className="transition hover:text-foreground">{label}</Link></li>
        ))}
      </ul>
    </div>
  );
}
