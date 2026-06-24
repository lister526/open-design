'use client';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, Camera, DollarSign, Sparkles, Truck, Link2, ClipboardCheck, Check, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, Badge, Input } from '@/components/ui/primitives';
import { SectionHead } from '@/components/ui/shared';
import { RoiCalculator } from './RoiCalculator';
import { useMoney, useT } from '@/store/prefs';
import { useData } from '@/store/data';

export function Landing() {
  const t = useT();
  return (
    <>
      <Hero t={t} />
      <Marquee />
      <Pains t={t} />
      <Workflow t={t} />
      <UseCases t={t} />
      <Pricing t={t} />
      <Trust t={t} />
      <FinalCta t={t} />
    </>
  );
}

/* ----------------------------- HERO ----------------------------- */
function Hero({ t }: { t: (k: string) => string }) {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grid-noise opacity-60" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-primary/20 blur-[130px]" />
      <div className="container relative grid items-center gap-12 py-16 lg:grid-cols-[1.02fr_.98fr] lg:py-24">
        <div className="animate-fade-up">
          <Badge className="border border-border bg-card text-muted-foreground"><Sparkles className="h-3.5 w-3.5 text-primary" /> {t('hero.badge')}</Badge>
          <h1 className="mt-5 text-balance text-4xl font-extrabold leading-[1.06] tracking-tight sm:text-5xl lg:text-[3.3rem]">{t('hero.title')}</h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">{t('hero.subtitle')}</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href="/audit"><Button size="lg">{t('hero.ctaPrimary')} <ArrowRight className="h-4 w-4" /></Button></Link>
            <a href="#how"><Button size="lg" variant="outline">{t('hero.ctaSecondary')}</Button></a>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">{t('hero.note')}</p>
          <div className="mt-8 grid max-w-md grid-cols-3 gap-4 border-t border-border pt-6">
            <HeroStat value="< 15 min" label={t('hero.statAudit')} />
            <HeroStat value="5 / 7" label={t('hero.statLangs')} />
            <HeroStat value="12%" label={t('hero.statFee')} />
          </div>
        </div>
        <div className="animate-fade-up [animation-delay:120ms]"><RoiCalculator /></div>
      </div>
    </section>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-xl font-extrabold text-primary">{value}</div>
      <div className="mt-0.5 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

/* ----------------------------- MARQUEE ----------------------------- */
function Marquee() {
  const items = ['Airbnb hosts', 'Serviced apartments', 'Boutique B&Bs', 'Property managers', 'Interior designers', 'Fit-out contractors', 'Real estate agents'];
  const row = [...items, ...items];
  return (
    <div className="border-y border-border bg-muted/30 py-5">
      <div className="mask-fade-r overflow-hidden">
        <div className="flex w-max animate-marquee gap-10 px-6">
          {row.map((x, i) => <span key={i} className="whitespace-nowrap text-sm font-semibold text-muted-foreground">{x}</span>)}
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- PAINS ----------------------------- */
function Pains({ t }: { t: (k: string) => string }) {
  const pains = [
    { icon: DollarSign, who: t('pain.1.who'), pain: t('pain.1.pain'), fix: t('pain.1.fix') },
    { icon: Camera, who: t('pain.2.who'), pain: t('pain.2.pain'), fix: t('pain.2.fix') },
    { icon: ClipboardCheck, who: t('pain.3.who'), pain: t('pain.3.pain'), fix: t('pain.3.fix') },
    { icon: Truck, who: t('pain.4.who'), pain: t('pain.4.pain'), fix: t('pain.4.fix') },
  ];
  return (
    <section id="product" className="container py-20">
      <SectionHead eyebrow={t('pain.eyebrow')} title={t('pain.title')} subtitle={t('pain.subtitle')} />
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {pains.map((p) => (
          <Card key={p.who} className="p-6">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary"><p.icon className="h-5 w-5" /></span>
              <h3 className="text-lg font-bold">{p.who}</h3>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground"><span className="font-semibold text-danger">{t('common.pain')} · </span>{p.pain}</p>
            <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground"><span className="font-semibold text-accent">{t('common.solution')} · </span>{p.fix}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}

/* ----------------------------- WORKFLOW ----------------------------- */
function Workflow({ t }: { t: (k: string) => string }) {
  const steps = [
    { n: '01', icon: ClipboardCheck, title: t('wf.1.title'), desc: t('wf.1.desc') },
    { n: '02', icon: Sparkles, title: t('wf.2.title'), desc: t('wf.2.desc') },
    { n: '03', icon: DollarSign, title: t('wf.3.title'), desc: t('wf.3.desc') },
    { n: '04', icon: Link2, title: t('wf.4.title'), desc: t('wf.4.desc') },
    { n: '05', icon: Truck, title: t('wf.5.title'), desc: t('wf.5.desc') },
  ];
  return (
    <section id="how" className="border-y border-border bg-muted/30 py-20">
      <div className="container">
        <SectionHead eyebrow={t('workflow.eyebrow')} title={t('workflow.title')} center />
        <div className="mt-12 grid gap-4 lg:grid-cols-5">
          {steps.map((s) => (
            <Card key={s.n} className="p-5">
              <div className="flex items-center justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><s.icon className="h-5 w-5" /></span>
                <span className="text-xs font-bold text-muted-foreground/50">{s.n}</span>
              </div>
              <h3 className="mt-4 text-base font-bold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- USE CASES ----------------------------- */
function UseCases({ t }: { t: (k: string) => string }) {
  const cases = [
    { tag: 'ADR', title: t('uc.1.title'), body: t('uc.1.body'), metric: t('uc.1.metric') },
    { tag: 'Photos', title: t('uc.2.title'), body: t('uc.2.body'), metric: t('uc.2.metric') },
    { tag: 'Occupancy', title: t('uc.3.title'), body: t('uc.3.body'), metric: t('uc.3.metric') },
    { tag: 'Turnover', title: t('uc.4.title'), body: t('uc.4.body'), metric: t('uc.4.metric') },
    { tag: 'Premium', title: t('uc.5.title'), body: t('uc.5.body'), metric: t('uc.5.metric') },
  ];
  return (
    <section id="use-cases" className="container py-20">
      <SectionHead eyebrow={t('cases.eyebrow')} title={t('cases.title')} />
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cases.map((c) => (
          <Card key={c.title} className="group p-6 transition hover:-translate-y-1 hover:shadow-glow">
            <Badge className="bg-primary/10 text-primary">{c.tag}</Badge>
            <h3 className="mt-4 text-lg font-bold">{c.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-accent"><Star className="h-3.5 w-3.5" /> {c.metric}</div>
          </Card>
        ))}
      </div>
    </section>
  );
}

/* ----------------------------- PRICING ----------------------------- */
function Pricing({ t }: { t: (k: string) => string }) {
  const money = useMoney();
  const tiers = [
    { name: t('price.t1.name'), price: money(149), unit: t('common.perRoom'), cta: t('pricing.cta'), href: '/audit', features: [t('price.t1.f1'), t('price.t1.f2'), t('price.t1.f3'), t('price.t1.f4')] },
    { name: t('price.t2.name'), price: `${money(799)}–${money(1299)}`, unit: t('common.perRoom'), highlight: true, cta: t('pricing.cta'), href: '/audit', features: [t('price.t2.f1'), t('price.t2.f2'), t('price.t2.f3'), t('price.t2.f4')] },
    { name: t('price.t3.name'), price: '10–15%', unit: t('price.t3.unit'), cta: t('price.t3.cta'), href: '/partners', features: [t('price.t3.f1'), t('price.t3.f2'), t('price.t3.f3'), t('price.t3.f4')] },
  ];
  return (
    <section id="pricing" className="border-y border-border bg-muted/30 py-20">
      <div className="container">
        <SectionHead eyebrow={t('pricing.eyebrow')} title={t('pricing.title')} subtitle={t('pricing.subtitle')} center />
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {tiers.map((tier) => (
            <Card key={tier.name} className={tier.highlight ? 'relative border-primary p-7 shadow-glow ring-1 ring-primary' : 'p-7'}>
              {tier.highlight && <span className="absolute -top-3 left-7 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">{t('pricing.recommended')}</span>}
              <h3 className="text-base font-bold">{tier.name}</h3>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold">{tier.price}</span>
                <span className="text-xs text-muted-foreground">{tier.unit}</span>
              </div>
              <ul className="mt-5 space-y-2.5 text-sm text-muted-foreground">
                {tier.features.map((f) => <li key={f} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-accent" />{f}</li>)}
              </ul>
              <Link href={tier.href} className="mt-6 block"><Button variant={tier.highlight ? 'primary' : 'outline'} className="w-full">{tier.cta}</Button></Link>
            </Card>
          ))}
        </div>
        <p className="mx-auto mt-7 max-w-2xl rounded-xl border border-accent/30 bg-accent/8 px-5 py-3 text-center text-sm font-medium text-accent">{t('pricing.guarantee')}</p>
        <p className="mt-4 text-center text-sm text-muted-foreground">{t('price.portfolio').replace('{x}', money(3000))} <Link href="/partners" className="font-semibold text-primary hover:underline">{t('price.contact')}</Link></p>
      </div>
    </section>
  );
}

/* ----------------------------- TRUST ----------------------------- */
function Trust({ t }: { t: (k: string) => string }) {
  const points = [
    { t: t('trust.1.title'), d: t('trust.1.body') },
    { t: t('trust.2.title'), d: t('trust.2.body') },
    { t: t('trust.3.title'), d: t('trust.3.body') },
    { t: t('trust.4.title'), d: t('trust.4.body') },
  ];
  return (
    <section className="container py-20">
      <Card className="bg-foreground p-8 text-background sm:p-12">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-background/60">{t('trust.eyebrow')}</span>
        <h2 className="mt-2.5 max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">{t('trust.title')}</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {points.map((p) => (
            <div key={p.t}>
              <div className="mb-3 h-1 w-10 rounded-full bg-gradient-to-r from-primary to-accent" />
              <h3 className="text-base font-bold">{p.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-background/65">{p.d}</p>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}

/* ----------------------------- FINAL CTA ----------------------------- */
function FinalCta({ t }: { t: (k: string) => string }) {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const addWaitlist = useData((s) => s.addWaitlist);
  return (
    <section className="container pb-24">
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary to-[hsl(224_80%_42%)] p-8 text-white sm:p-14">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_.9fr]">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t('cta.title')}</h2>
            <p className="mt-3 max-w-md text-lg text-white/80">{t('cta.subtitle')}</p>
            <Link href="/audit" className="mt-7 inline-block"><Button size="lg" className="bg-white text-primary shadow-none hover:bg-white/90">{t('hero.ctaPrimary')} <ArrowRight className="h-4 w-4" /></Button></Link>
          </div>
          <div className="rounded-2xl bg-white/10 p-6 ring-1 ring-white/15 backdrop-blur">
            {done ? (
              <div className="py-6 text-center"><div className="text-3xl">✅</div><p className="mt-3 font-semibold">{t('cta.joined')}</p></div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); if (!email) return; addWaitlist({ email, kind: 'city' }); setDone(true); }} className="space-y-3">
                <p className="text-sm font-semibold">{t('cta.waitlist')}</p>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="Work email" className="border-white/20 bg-white/15 text-white placeholder:text-white/50" />
                <Button type="submit" className="w-full bg-white text-primary shadow-none hover:bg-white/90">Join waitlist</Button>
              </form>
            )}
          </div>
        </div>
      </Card>
    </section>
  );
}
