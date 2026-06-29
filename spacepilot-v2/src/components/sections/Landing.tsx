'use client';
import Link from 'next/link';
import {
  ArrowRight, ShieldCheck, ScanLine, Stethoscope, Receipt, Truck,
  IdCard, Network, Boxes, BadgeCheck, Camera, LineChart, ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/primitives';
import { SectionHead } from '@/components/ui/shared';
import { Scanner } from './Scanner';
import { useT, useMoney } from '@/store/prefs';
import { DEMO_CASES } from '@/lib/seed';
import { cn } from '@/lib/cn';

export function Landing() {
  return (
    <>
      <Hero />
      <DemoCases />
      <HowItWorks />
      <Moat />
      <FinalCta />
    </>
  );
}

/* ----------------------------- HERO ----------------------------- */
function Hero() {
  const t = useT();
  return (
    <section className="relative overflow-hidden">
      <div className="paper-grain pointer-events-none absolute inset-0 opacity-70" />
      <div className="container relative grid items-center gap-12 py-14 lg:grid-cols-[1.05fr_1fr] lg:py-20">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" /> {t('hero.badge')}
          </span>
          <h1 className="font-display mt-5 text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.4rem]">
            {t('hero.title')}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">{t('hero.subtitle')}</p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href="/audit"><Button size="lg" className="w-full sm:w-auto">{t('hero.ctaPrimary')} <ScanLine className="h-4 w-4" /></Button></Link>
            <Link href="/proposal/demo"><Button size="lg" variant="outline" className="w-full sm:w-auto">{t('hero.ctaSecondary')}</Button></Link>
          </div>

          <p className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" /> {t('hero.note')}
          </p>

          <div className="mt-8 grid max-w-lg grid-cols-3 gap-4 border-t border-border pt-6">
            <Stat big="15 min" small={t('hero.statLoop')} />
            <Stat big="5" small={t('hero.statLangs')} />
            <Stat big="10–15%" small={t('hero.statFee')} />
          </div>
        </div>

        <div className="animate-scale-in lg:pl-4">
          <Scanner />
        </div>
      </div>
    </section>
  );
}

function Stat({ big, small }: { big: string; small: string }) {
  return (
    <div>
      <div className="font-display text-2xl font-semibold">{big}</div>
      <div className="mt-0.5 text-xs leading-snug text-muted-foreground">{small}</div>
    </div>
  );
}

/* ----------------------------- DEMO CASES ----------------------------- */
function DemoCases() {
  const t = useT();
  const money = useMoney();
  return (
    <section id="cases" className="border-t border-border bg-muted/20 py-16 sm:py-20">
      <div className="container">
        <SectionHead eyebrow={t('cases.eyebrow')} title={t('cases.title')} subtitle={t('cases.subtitle')} />
        <div className="mt-9 grid gap-5 md:grid-cols-3">
          {DEMO_CASES.map((c) => (
            <Card key={c.id} className="flex flex-col p-6">
              <div className="flex items-center justify-between">
                <span className="text-2xl">{c.flag}</span>
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">{c.city}</span>
              </div>
              <h3 className="font-display mt-3 text-xl font-semibold">{c.title}</h3>
              <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{t('cases.symptoms')}</p>
              <ul className="mt-1.5 space-y-1 text-sm text-muted-foreground">
                {c.symptoms.map((s) => <li key={s} className="flex gap-2"><span className="text-accent">•</span>{s}</li>)}
              </ul>
              <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
                <Kv label={t('cases.kit')} value={c.kit} />
                <Kv label={t('cases.range')} value={c.range} />
                <Kv label={t('cases.payback')} value={c.payback} revenue />
              </div>
              <Link href={`/audit?case=${c.id}`} className="mt-5">
                <Button variant="outline" className="w-full">{t('cases.open')} <ArrowRight className="h-4 w-4" /></Button>
              </Link>
            </Card>
          ))}
        </div>
        <p className="mt-5 text-center text-xs text-muted-foreground">{t('compliance.integrity')}</p>
      </div>
    </section>
  );
}

function Kv({ label, value, revenue }: { label: string; value: string; revenue?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={cn('text-right text-sm font-bold', revenue && 'revenue-text')}>{value}</span>
    </div>
  );
}

/* ----------------------------- HOW IT WORKS ----------------------------- */
function HowItWorks() {
  const t = useT();
  const steps = [
    { icon: ScanLine, n: '1' }, { icon: Stethoscope, n: '2' }, { icon: Receipt, n: '3' }, { icon: Truck, n: '4' },
  ];
  return (
    <section id="how" className="py-16 sm:py-20">
      <div className="container">
        <SectionHead eyebrow={t('how.eyebrow')} title={t('how.title')} center />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, idx) => (
            <Card key={s.n} className="relative p-6">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-accent/10 text-accent"><s.icon className="h-5 w-5" /></div>
              <div className="mt-4 text-[11px] font-bold uppercase tracking-wider text-accent">Step {s.n}</div>
              <h3 className="font-display mt-1 text-lg font-semibold">{t(`how.${idx + 1}.title`)}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{t(`how.${idx + 1}.desc`)}</p>
              {idx < 3 && <ChevronRight className="absolute -right-2 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-border lg:block" />}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- MOAT ----------------------------- */
function Moat() {
  const t = useT();
  const items = [
    { icon: IdCard }, { icon: Network }, { icon: Boxes },
    { icon: BadgeCheck }, { icon: Camera }, { icon: LineChart },
  ];
  return (
    <section id="moat" className="border-t border-border bg-foreground py-16 text-background sm:py-20">
      <div className="container">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-accent">{t('moat.eyebrow')}</span>
          <h2 className="font-display mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-[2.6rem] sm:leading-[1.08]">{t('moat.title')}</h2>
          <p className="mt-3.5 text-lg leading-relaxed text-background/60">{t('moat.subtitle')}</p>
        </div>
        <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-background/15 bg-background/15 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it, idx) => (
            <div key={idx} className="bg-foreground p-6">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent/20 text-accent"><it.icon className="h-5 w-5" /></div>
              <h3 className="font-display mt-4 text-lg font-semibold">{t(`moat.${idx + 1}.title`)}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-background/60">{t(`moat.${idx + 1}.body`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- FINAL CTA ----------------------------- */
function FinalCta() {
  const t = useT();
  return (
    <section className="py-16 sm:py-24">
      <div className="container">
        <Card className="relative overflow-hidden p-8 text-center shadow-raised sm:p-14">
          <div className="paper-grain pointer-events-none absolute inset-0 opacity-60" />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="font-display text-balance text-3xl font-semibold tracking-tight sm:text-4xl">{t('cta.title')}</h2>
            <p className="mt-3 text-lg text-muted-foreground">{t('cta.subtitle')}</p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/audit"><Button size="lg" className="w-full sm:w-auto">{t('hero.ctaPrimary')} <ArrowRight className="h-4 w-4" /></Button></Link>
              <Link href="/proposal/demo"><Button size="lg" variant="outline" className="w-full sm:w-auto">{t('hero.ctaSecondary')}</Button></Link>
            </div>
            <p className="mt-5 text-xs text-muted-foreground">{t('compliance.short')} {t('compliance.integrity')}</p>
          </div>
        </Card>
      </div>
    </section>
  );
}
