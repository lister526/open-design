'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Logo } from './Logo';
import { Input } from '@/components/ui/primitives';
import { Button } from '@/components/ui/button';
import { useData } from '@/store/data';

export function Footer() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const addWaitlist = useData((s) => s.addWaitlist);

  return (
    <footer className="mt-24 border-t border-border bg-muted/30">
      <div className="container grid gap-10 py-14 md:grid-cols-[1.5fr_1fr_1fr_1.4fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">The operating system that turns room refresh into paid, profitable projects — localized, priced and delivered.</p>
          <p className="mt-4 text-xs text-muted-foreground/70">© {new Date().getFullYear()} SpacePilot AI. Estimates are scenario-based and subject to local verification.</p>
        </div>
        <FooterCol title="Product" links={[['/audit', 'AI Room Audit'], ['/#pricing', 'Pricing'], ['/#use-cases', 'Use cases'], ['/console', 'Console']]} />
        <FooterCol title="Partners" links={[['/partners', 'Designer / Contractor'], ['/partners#catalog', 'Supplier catalog'], ['/partners#apply', 'Apply']]} />
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">City launch updates</p>
          {done ? (
            <p className="rounded-lg bg-accent/10 px-4 py-3 text-sm font-semibold text-accent">You're on the list.</p>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); if (!email) return; addWaitlist({ email, kind: 'newsletter' }); setDone(true); setEmail(''); }} className="flex gap-2">
              <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="you@company.com" />
              <Button type="submit">Join</Button>
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
