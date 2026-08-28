'use client';
import { useState } from 'react';
import { Check, ArrowRight, TrendingUp, MapPin, Clock, Wallet, Camera, BadgeCheck, Timer, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, Input, Select, Label, Eyebrow } from '@/components/ui/primitives';
import { SectionHead } from '@/components/ui/shared';
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

  function submit() { if (!valid) return; addPartnerApp(form); setSent(true); }

  return (
    <>
      {/* hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="paper-grain absolute inset-0 opacity-60" />
        <div className="container relative py-20 sm:py-28">
          <div className="max-w-2xl">
            <Eyebrow>Launch-city delivery partner network</Eyebrow>
            <h1 className="font-display mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              Become a <span className="text-accent">verified delivery partner</span> for revenue-driven listing upgrades.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              We diagnose listings, price the upgrade kit and collect the deposit. You receive ready-to-execute briefs with a
              confirmed budget — and build your local portfolio. No commission until a project closes.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#apply"><Button size="lg">Apply to become verified <ArrowRight className="h-4 w-4" /></Button></a>
              <a href="#trust"><Button size="lg" variant="outline">See trust scoring</Button></a>
            </div>
            <p className="mt-5 text-xs text-muted-foreground">Profiles below are sample / demo partner profiles — not claims of an existing customer base.</p>
          </div>
        </div>
      </section>

      {/* value props */}
      <section className="container py-16 sm:py-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: <Wallet className="h-5 w-5" />, title: 'No commission until closed', body: 'You only pay when a project is delivered and paid. Applying and matching is free.' },
            { icon: <BadgeCheck className="h-5 w-5" />, title: 'Verified local delivery', body: 'Verification + SLA scoring routes the best-fit work to proven local partners.' },
            { icon: <Camera className="h-5 w-5" />, title: 'Photo-ready handover', body: 'Every project ends with a styled, photographed, before/after-logged handover.' },
            { icon: <RefreshCw className="h-5 w-5" />, title: 'Repeat portfolio work', body: 'Operators with portfolios bring recurring, standardized upgrade projects.' },
          ].map((v) => (
            <Card key={v.title} className="p-6">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-accent/10 text-accent">{v.icon}</div>
              <h3 className="font-display mt-4 text-lg font-semibold">{v.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{v.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* trust scoring + sample profiles */}
      <section id="trust" className="border-y border-border bg-muted/20 py-16 sm:py-20">
        <div className="container">
          <SectionHead eyebrow="Supplier Trust Ledger" title="Trust scoring decides who delivers." subtitle="Each partner accrues a trust score from on-time rate, rework rate, photo-handover quality, average project value and response time. Higher scores win more work." />
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {PARTNERS.map((p) => (
              <Card key={p.id} className="p-5">
                <div className="flex items-start justify-between">
                  <div><h3 className="font-bold">{p.name}</h3><div className="flex items-center gap-1 text-xs capitalize text-muted-foreground"><MapPin className="h-3 w-3" />{p.type} · {p.area}</div></div>
                  <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold capitalize', p.status === 'verified' ? 'bg-revenue/15 revenue-text' : 'bg-muted text-muted-foreground')}>{p.status}</span>
                </div>
                <div className="mt-3 flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3">
                  <div className="font-display text-3xl font-semibold tabular-nums">{p.ledger.trustScore}</div>
                  <div className="text-xs text-muted-foreground">Trust score<br />/ 100</div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <Metric icon={<Timer className="h-3.5 w-3.5" />} label="On-time" value={`${p.ledger.onTimeRatePct}%`} />
                  <Metric icon={<RefreshCw className="h-3.5 w-3.5" />} label="Rework" value={`${p.ledger.reworkRatePct}%`} />
                  <Metric icon={<Camera className="h-3.5 w-3.5" />} label="Photo handover" value={`${p.ledger.photoHandoverScore}/5`} />
                  <Metric icon={<TrendingUp className="h-3.5 w-3.5" />} label="Avg project" value={money(p.ledger.avgProjectValueUsd)} />
                  <Metric icon={<Clock className="h-3.5 w-3.5" />} label="Response" value={`${p.ledger.responseTimeHours}h`} />
                  <Metric icon={<Check className="h-3.5 w-3.5" />} label="Projects" value={String(p.ledger.completedProjects)} />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* how partner earns */}
      <section className="container py-16 sm:py-20">
        <SectionHead eyebrow="Revenue model" title="How you get paid" subtitle="A transparent flow that scales with project value and your delivery quality." />
        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {[
            ['1', 'We send a paid brief', 'Confirmed budget + 20% deposit collected.'],
            ['2', 'You confirm capacity', 'Accept the slot and lock your install window.'],
            ['3', 'Deliver locally', 'Source, build and install against the scope.'],
            ['4', 'Get paid + commission', 'Balance released on completion, commission auto-tracked.'],
          ].map(([n, t, b]) => (
            <Card key={n} className="p-5">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-foreground text-sm font-bold text-background">{n}</div>
              <h4 className="font-display mt-3 font-semibold">{t}</h4>
              <p className="mt-1 text-sm text-muted-foreground">{b}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* catalog preview */}
      <section id="catalog" className="border-t border-border bg-muted/20 py-16 sm:py-20">
        <div className="container">
          <SectionHead eyebrow="SKU Kit Library" title="Standardized components you'll deliver" subtitle="Pre-vetted, costed components with retail price and lead times — the building blocks of every upgrade kit." />
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
          <SectionHead center eyebrow="Apply" title="Apply to become a verified delivery partner" subtitle="Tell us your trade and coverage area. We onboard and verify partners city by city as demand unlocks." />
          <Card className="mt-8 p-6 sm:p-8">
            {sent ? (
              <div className="py-8 text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-revenue/15"><Check className="h-7 w-7 revenue-text" /></div>
                <h3 className="font-display mt-4 text-2xl font-semibold">Application received</h3>
                <p className="mt-2 text-muted-foreground">Thanks, {form.name}. We'll reach out at {form.email} as we open {form.area}.</p>
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

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-2.5">
      <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{icon}{label}</div>
      <div className="mt-0.5 text-sm font-extrabold">{value}</div>
    </div>
  );
}
