'use client';
import { useState } from 'react';
import { Check, ArrowRight, TrendingUp, MapPin, Clock, Wallet, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, Input, Select, Label } from '@/components/ui/primitives';
import { SectionHead } from '@/components/ui/shared';
import { Eyebrow } from '@/components/ui/primitives';
import { useMoney } from '@/store/prefs';
import { useData } from '@/store/data';
import { SUPPLIERS, PARTNERS } from '@/lib/seed';
import { cn } from '@/lib/cn';

const PARTNER_TYPES = ['Interior designer', 'Contractor', 'Installer', 'Supplier / brand'];

export function Partners() {
  const money = useMoney();
  const { addPartnerApp } = useData();
  const [form, setForm] = useState({ name: '', type: 'Interior designer', area: '', skills: '', email: '' });
  const [sent, setSent] = useState(false);
  const set = (p: Partial<typeof form>) => setForm((s) => ({ ...s, ...p }));
  const valid = form.name && form.area && /\S+@\S+\.\S+/.test(form.email);

  function submit() {
    if (!valid) return;
    addPartnerApp(form);
    setSent(true);
  }

  return (
    <>
      {/* hero */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-primary/5 to-transparent">
        <div className="grid-noise absolute inset-0 opacity-50" />
        <div className="container relative py-20 sm:py-28">
          <div className="max-w-2xl">
            <Eyebrow>Pro & Supplier Partner Program</Eyebrow>
            <h1 className="mt-3 text-balance text-4xl font-extrabold tracking-tight sm:text-5xl">
              Get matched to <span className="gradient-text">qualified, paid</span> room projects in your city.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              We do the lead filtering, paid audits and proposals. You receive ready-to-execute briefs with a confirmed
              budget and a deposit already collected — and earn coordination revenue on every closed project.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#apply"><Button size="lg">Apply to join <ArrowRight className="h-4 w-4" /></Button></a>
              <a href="#catalog"><Button size="lg" variant="outline">Browse component catalog</Button></a>
            </div>
          </div>
        </div>
      </section>

      {/* value props */}
      <section className="container py-16 sm:py-20">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: <Wallet className="h-5 w-5" />, title: 'Pre-qualified, deposit-backed', body: 'Every brief comes from a paid $149 audit and a locked deposit — no tire-kickers.' },
            { icon: <TrendingUp className="h-5 w-5" />, title: 'Recurring coordination revenue', body: 'Earn 10–15% commission per project, plus repeat work from operators with portfolios.' },
            { icon: <Sparkles className="h-5 w-5" />, title: 'Executable briefs, not RFPs', body: 'Scope, components, budget band and compliance notes — ready to deliver locally.' },
          ].map((v) => (
            <Card key={v.title} className="p-6">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">{v.icon}</div>
              <h3 className="mt-4 text-lg font-bold">{v.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{v.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* how partner earns */}
      <section className="border-y border-border bg-muted/20 py-16 sm:py-20">
        <div className="container">
          <SectionHead eyebrow="Revenue model" title="How you get paid" subtitle="A transparent split that scales with project value and your delivery quality." />
          <div className="mt-10 grid gap-4 md:grid-cols-4">
            {[
              ['1', 'We send a paid brief', 'Confirmed budget + 20% deposit collected.'],
              ['2', 'You confirm capacity', 'Accept the slot and lock your install window.'],
              ['3', 'Deliver locally', 'Source, build and install against the scope.'],
              ['4', 'Get paid + commission', 'Balance released on completion, commission auto-tracked.'],
            ].map(([n, t, b]) => (
              <Card key={n} className="p-5">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-foreground text-sm font-bold text-background">{n}</div>
                <h4 className="mt-3 font-bold">{t}</h4>
                <p className="mt-1 text-sm text-muted-foreground">{b}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* active partners preview */}
      <section className="container py-16 sm:py-20">
        <SectionHead eyebrow="Network" title="Partners already on the platform" subtitle="A growing roster of designers, contractors and suppliers across launch cities." />
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {PARTNERS.map((p) => (
            <Card key={p.id} className="p-5">
              <div className="flex items-start justify-between">
                <div><h3 className="font-bold">{p.name}</h3><div className="flex items-center gap-1 text-xs capitalize text-muted-foreground"><MapPin className="h-3 w-3" />{p.area}</div></div>
                <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', p.status === 'active' ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning')}>{p.status}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">{p.skills.map((s) => <span key={s} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{s}</span>)}</div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="font-bold">{p.rating}★ · {p.projects} projects</span>
                <span className="font-semibold text-accent">{p.commissionPct}% comm.</span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* catalog preview */}
      <section id="catalog" className="border-t border-border bg-muted/20 py-16 sm:py-20">
        <div className="container">
          <SectionHead eyebrow="Modular catalog" title="Standardized components you’ll deliver" subtitle="Pre-vetted, costed modular components with retail price, margin and lead times — the building blocks of every proposal." />
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {SUPPLIERS.slice(0, 6).map((s) => (
              <Card key={s.id} className="p-5">
                <div className="flex items-start justify-between"><div className="text-2xl">{s.emoji}</div><span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">{s.category}</span></div>
                <h3 className="mt-3 font-bold leading-snug">{s.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.useCase}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm"><span className="text-muted-foreground">From </span><span className="font-extrabold">{money(s.retailUsd)}</span></span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" />{s.leadTimeDays}d</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* apply form */}
      <section id="apply" className="container py-16 sm:py-24">
        <div className="mx-auto max-w-2xl">
          <SectionHead center eyebrow="Apply" title="Join the partner network" subtitle="Tell us your trade and coverage area. We onboard partners city by city as demand unlocks." />
          <Card className="mt-8 p-6 sm:p-8">
            {sent ? (
              <div className="py-8 text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent/15"><Check className="h-7 w-7 text-accent" /></div>
                <h3 className="mt-4 text-2xl font-extrabold">Application received</h3>
                <p className="mt-2 text-muted-foreground">Thanks, {form.name}. We’ll reach out at {form.email} as we open {form.area}.</p>
                <Button className="mt-6" variant="outline" onClick={() => { setSent(false); setForm({ name: '', type: 'Interior designer', area: '', skills: '', email: '' }); }}>Submit another</Button>
              </div>
            ) : (
              <div className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><Label>Business / name</Label><Input value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="Studio or company" /></div>
                  <div><Label>Partner type</Label><Select value={form.type} onChange={(e) => set({ type: e.target.value })}>{PARTNER_TYPES.map((t) => <option key={t}>{t}</option>)}</Select></div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><Label>Coverage area</Label><Input value={form.area} onChange={(e) => set({ area: e.target.value })} placeholder="e.g. Osaka, Japan" /></div>
                  <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => set({ email: e.target.value })} placeholder="you@studio.com" /></div>
                </div>
                <div><Label>Specialties</Label><Input value={form.skills} onChange={(e) => set({ skills: e.target.value })} placeholder="Small-space, lighting, photo-ready staging…" /></div>
                <Button size="lg" className="mt-2" onClick={submit} disabled={!valid}>Submit application <ArrowRight className="h-4 w-4" /></Button>
                <p className="text-center text-xs text-muted-foreground">No fees to apply. Commission is only charged on closed, delivered projects.</p>
              </div>
            )}
          </Card>
        </div>
      </section>
    </>
  );
}
