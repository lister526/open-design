'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight, Check, ShieldCheck, Lock, Eye, EyeOff, Share2, Copy,
  TrendingUp, Clock, Sparkles, FileText, Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, Label } from '@/components/ui/primitives';
import { ScoreRing, TierBadge } from '@/components/ui/shared';
import { Logo } from '@/components/layout/Logo';
import { useMoney, useT } from '@/store/prefs';
import { useData } from '@/store/data';
import { buildQuote } from '@/lib/engine';
import { BANDS, labelOf, USER_TYPES, ROOM_TYPES } from '@/lib/options';
import type { Band, Lead } from '@/lib/types';
import { cn } from '@/lib/cn';

const BAND_IDX: Band[] = ['lean', 'standard', 'premium'];

export function Proposal({ id }: { id: string }) {
  const t = useT();
  const money = useMoney();
  const router = useRouter();
  const { getLead, setStatus } = useData();
  const hydrated = useData((s) => s.leads); // subscribe so we re-render after rehydrate

  const [lead, setLead] = useState<Lead | null>(null);
  const [band, setBand] = useState<Band>('standard');
  const [adminView, setAdminView] = useState(false);
  const [phase, setPhase] = useState<'view' | 'deposit' | 'locked'>('view');
  const [paying, setPaying] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const l = getLead(id);
    if (l) {
      setLead(l);
      setBand(l.input.band);
      if (l.status === 'deposit_paid' || l.status === 'in_delivery' || l.status === 'completed') setPhase('locked');
    }
  }, [id, getLead, hydrated]);

  const quote = useMemo(() => (lead ? buildQuote(lead.input, band) : null), [lead, band]);

  if (!lead || !quote) {
    return (
      <div className="grid min-h-screen place-items-center bg-muted/20 px-6 text-center">
        <div>
          <Logo />
          <h1 className="mt-6 text-2xl font-extrabold">Proposal not found</h1>
          <p className="mt-2 text-muted-foreground">This proposal isn’t in your browser yet. Run an audit to generate one.</p>
          <Link href="/audit"><Button className="mt-6">Start an audit <ArrowRight className="h-4 w-4" /></Button></Link>
        </div>
      </div>
    );
  }

  const d = lead.diagnosis;
  const deposit = Math.round((quote.customerTotalUsd * 0.2) / 5) * 5;
  const isOperator = ['str_landlord', 'operator', 'bnb_host', 'agent'].includes(lead.input.userType);

  function payDeposit() {
    setPaying(true);
    setTimeout(() => {
      setStatus(lead!.id, 'deposit_paid');
      setPaying(false);
      setPhase('locked');
    }, 1500);
  }

  function share() {
    const url = `${window.location.origin}/proposal/${lead!.id}?ref=${lead!.referral}`;
    navigator.clipboard?.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); });
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between gap-3">
          <Link href="/"><Logo /></Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAdminView((v) => !v)}
              className={cn('hidden items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition sm:flex',
                adminView ? 'border-accent bg-accent/10 text-accent' : 'border-border text-muted-foreground hover:text-foreground')}>
              {adminView ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />} Founder margin view
            </button>
            <Button variant="outline" size="sm" onClick={share}>{copied ? <><Check className="h-4 w-4" /> Copied</> : <><Share2 className="h-4 w-4" /> Share</>}</Button>
          </div>
        </div>
      </header>

      <div className="container max-w-5xl py-8 sm:py-12">
        {/* heading */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-primary">Executable proposal</span>
              <TierBadge tier={d.tier} />
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">{d.recommendedPackage}</h1>
            <p className="mt-2 max-w-xl text-muted-foreground">
              {labelOf(USER_TYPES as any, lead.input.userType)} · {labelOf(ROOM_TYPES as any, lead.input.roomType)} · {lead.input.sizeSqm} m² · {lead.input.city || lead.input.country || 'Your market'}
            </p>
          </div>
          <ScoreRing score={d.score} size={108} />
        </div>

        {/* outcome strip */}
        {isOperator && (
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Outcome icon={<TrendingUp className="h-4 w-4" />} label="Projected monthly uplift" value={money(d.roi.monthlyUpliftUsd)} sub={`~${Math.round(d.roi.adrUpliftPct * 100)}% ADR scenario`} accent />
            <Outcome icon={<Sparkles className="h-4 w-4" />} label="Projected annualized" value={money(d.roi.annualUpliftUsd)} sub="Scenario-based estimate" />
            <Outcome icon={<Clock className="h-4 w-4" />} label="Indicative payback" value={`${d.roi.paybackMonths} mo`} sub="At mid project cost" />
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          {/* left: scope + quote */}
          <div className="space-y-6">
            {/* band slider */}
            <Card className="p-6">
              <div className="flex items-center gap-2"><Layers className="h-4 w-4 text-primary" /><h2 className="text-lg font-bold">Choose your budget band</h2></div>
              <p className="mt-1 text-sm text-muted-foreground">Slide to rebalance scope and price in real time. Everything stays executable.</p>
              <div className="mt-5">
                <input
                  type="range" min={0} max={2} step={1} value={BAND_IDX.indexOf(band)}
                  onChange={(e) => setBand(BAND_IDX[Number(e.target.value)])}
                  className="h-2 w-full cursor-pointer rounded-full bg-muted accent-primary" />
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {BANDS.map((b) => (
                    <button key={b.value} onClick={() => setBand(b.value)}
                      className={cn('rounded-xl border p-3 text-left transition', band === b.value ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-primary/50')}>
                      <div className="text-sm font-bold">{b.label}</div>
                      <div className="text-xs text-muted-foreground">{b.hint}</div>
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* line items */}
            <Card className="overflow-hidden p-0">
              <div className="flex items-center justify-between border-b border-border p-5">
                <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /><h2 className="text-lg font-bold">Scope & line items</h2></div>
                {adminView && <span className="rounded-full bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent">Cost & margin visible</span>}
              </div>
              <div className="divide-y divide-border">
                <div className={cn('grid items-center gap-2 px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground', adminView ? 'grid-cols-[1fr_auto_auto_auto]' : 'grid-cols-[1fr_auto]')}>
                  <span>Item</span>
                  {adminView && <span className="text-right">Cost</span>}
                  {adminView && <span className="text-right">Margin</span>}
                  <span className="text-right">Price</span>
                </div>
                {quote.lines.map((l) => {
                  const m = l.customerUsd - l.costUsd;
                  return (
                    <div key={l.key} className={cn('grid items-center gap-2 px-5 py-3.5 text-sm', adminView ? 'grid-cols-[1fr_auto_auto_auto]' : 'grid-cols-[1fr_auto]', l.key === 'fee' && 'bg-accent/5')}>
                      <span className={cn('font-medium', l.key === 'fee' && 'text-accent')}>{l.label}</span>
                      {adminView && <span className="text-right text-muted-foreground">{l.costUsd ? money(l.costUsd) : '—'}</span>}
                      {adminView && <span className="text-right font-semibold text-accent">{m > 0 ? money(m) : '—'}</span>}
                      <span className="text-right font-bold">{money(l.customerUsd)}</span>
                    </div>
                  );
                })}
                <div className={cn('grid items-center gap-2 bg-muted/40 px-5 py-4 text-sm', adminView ? 'grid-cols-[1fr_auto_auto_auto]' : 'grid-cols-[1fr_auto]')}>
                  <span className="font-extrabold">Total (all-in)</span>
                  {adminView && <span className="text-right text-muted-foreground">{money(quote.costTotalUsd)}</span>}
                  {adminView && <span className="text-right font-extrabold text-accent">{money(quote.marginUsd)} · {quote.marginPct}%</span>}
                  <span className="text-right text-lg font-extrabold">{money(quote.customerTotalUsd)}</span>
                </div>
              </div>
            </Card>

            {/* modules / what you get */}
            <Card className="p-6">
              <h2 className="text-lg font-bold">What’s included</h2>
              <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {d.modules.map((m) => (
                  <div key={m.name} className="flex items-start gap-2.5 rounded-xl border border-border bg-muted/20 p-3.5">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent/15 text-accent"><Check className="h-3 w-3" /></span>
                    <span className="text-sm font-medium leading-snug">{m.name}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-xl border border-border bg-muted/30 p-4">
                <p className="text-sm font-bold">Compliance & estimate notes</p>
                <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                  {d.risks.map((r) => <li key={r} className="flex gap-2"><span className="text-warning">⚠</span>{r}</li>)}
                </ul>
              </div>
            </Card>
          </div>

          {/* right: sticky checkout */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            {phase !== 'locked' ? (
              <Card className="p-6">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Lock this project</p>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-4xl font-extrabold">{money(deposit)}</span>
                  <span className="text-sm text-muted-foreground">deposit (20%)</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Pay the deposit to reserve supplier capacity and installer slots. Balance of {money(quote.customerTotalUsd - deposit)} due on delivery.
                </p>
                <div className="mt-4 space-y-2 text-sm">
                  <Row label="Project total" value={money(quote.customerTotalUsd)} />
                  <Row label="Deposit today" value={money(deposit)} strong />
                  <Row label="Balance on delivery" value={money(quote.customerTotalUsd - deposit)} muted />
                </div>
                <Button className="mt-5 w-full" size="lg" onClick={payDeposit} disabled={paying}>
                  {paying ? 'Processing…' : <><Lock className="h-4 w-4" /> Pay deposit to lock suppliers</>}
                </Button>
                <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-accent" /> Simulated Stripe · {money(149)} audit credited
                </div>
              </Card>
            ) : (
              <Card className="border-accent/30 bg-accent/5 p-6">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-accent/15"><Check className="h-6 w-6 text-accent" /></div>
                <h2 className="mt-3 text-xl font-extrabold">Suppliers locked</h2>
                <p className="mt-1.5 text-sm text-muted-foreground">Deposit received. Your coordinator is matching suppliers & installers in {lead.input.city || lead.input.country || 'your market'}.</p>
                <div className="mt-4 space-y-2.5">
                  {['Local supplier sourcing', 'Installer scheduling', 'Delivery coordination'].map((s) => (
                    <div key={s} className="flex items-center gap-2 text-sm"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />{s}</div>
                  ))}
                </div>
                <Link href="/console"><Button variant="outline" className="mt-5 w-full">Open founder console <ArrowRight className="h-4 w-4" /></Button></Link>
              </Card>
            )}

            <button onClick={share} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-sm font-semibold text-muted-foreground transition hover:text-foreground">
              <Copy className="h-4 w-4" /> {copied ? 'Link copied — referral attached' : 'Share proposal (earn referral)'}
            </button>
            <p className="mt-3 text-center text-xs text-muted-foreground">Ref {lead.id} · Referral {lead.referral}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Outcome({ icon, label, value, sub, accent }: { icon: React.ReactNode; label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <div className={cn('rounded-2xl border p-4', accent ? 'border-primary/20 bg-primary/5' : 'border-border bg-card')}>
      <div className={cn('flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider', accent ? 'text-primary' : 'text-muted-foreground')}>{icon}{label}</div>
      <div className={cn('mt-1.5 text-2xl font-extrabold', accent && 'text-primary')}>{value}</div>
      <div className="text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}

function Row({ label, value, strong, muted }: { label: string; value: string; strong?: boolean; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={cn('text-muted-foreground', strong && 'font-semibold text-foreground')}>{label}</span>
      <span className={cn(strong ? 'font-extrabold' : 'font-semibold', muted && 'text-muted-foreground')}>{value}</span>
    </div>
  );
}
