'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight, Check, ShieldCheck, Lock, Eye, EyeOff, Share2, Copy, Download,
  TrendingUp, Clock, Sparkles, FileText, Layers, ClipboardCheck, MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/primitives';
import { ScoreRing, GradeBadge, LeakMap } from '@/components/ui/shared';
import { Logo } from '@/components/layout/Logo';
import { useMoney, useT } from '@/store/prefs';
import { useData } from '@/store/data';
import { buildQuote, buildScenarioProposal, LEAK_LABEL } from '@/lib/engine';
import { demoLead } from '@/lib/seed';
import { BANDS, labelOf, USER_TYPES, PROPERTY_TYPES } from '@/lib/options';
import type { Band, Lead } from '@/lib/types';
import { cn } from '@/lib/cn';

const BAND_IDX: Band[] = ['lean', 'standard', 'premium'];

export function Proposal({ id }: { id: string }) {
  const t = useT();
  const money = useMoney();
  const { getLead, setStatus } = useData();
  const leadsState = useData((s) => s.leads); // re-render after rehydrate

  const [lead, setLead] = useState<Lead | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [band, setBand] = useState<Band>('standard');
  const [adminView, setAdminView] = useState(false);
  const [phase, setPhase] = useState<'view' | 'locked'>('view');
  const [paying, setPaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exported, setExported] = useState(false);

  useEffect(() => {
    const stored = getLead(id);
    if (stored) {
      setLead(stored); setIsDemo(false); setBand(stored.input.band);
      if (['deposit_paid', 'in_delivery', 'completed'].includes(stored.status)) setPhase('locked');
    } else {
      // deterministic fallback — NEVER show "not found"
      const dl = demoLead(id);
      setLead(dl); setIsDemo(true); setBand(dl.input.band);
    }
  }, [id, getLead, leadsState]);

  const proposal = useMemo(() => (lead ? buildScenarioProposal(lead.passport, band, isDemo) : null), [lead, band, isDemo]);
  const quote = proposal?.quote ?? null;

  if (!lead || !quote || !proposal) {
    return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Loading proposal…</div>;
  }

  const p = lead.passport;

  function payDeposit() {
    setPaying(true);
    setTimeout(() => { if (!isDemo) setStatus(lead!.id, 'deposit_paid'); setPaying(false); setPhase('locked'); }, 1300);
  }
  function share() {
    const url = `${window.location.origin}/proposal/${lead!.id}`;
    navigator.clipboard?.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); });
  }
  function exportSummary() {
    const lines = [
      `SpacePilot — Scenario Upgrade Proposal (${lead!.id})`,
      `Market: ${p.market} · ${labelOf(PROPERTY_TYPES as any, p.propertyType)}`,
      `Revenue Leak Score: ${p.leak.score}/100 (${p.leak.grade})`,
      `Top leaks: ${p.leak.topLeaks.map((l) => `${LEAK_LABEL[l.category]}`).join(', ')}`,
      `Recommended kit: ${p.recommendedKit.name}`,
      `Scenario monthly upside: ${money(p.scenario.monthlyUpsideLowUsd)}–${money(p.scenario.monthlyUpsideHighUsd)}`,
      `Scenario payback: ${p.scenario.paybackMonthsLow}–${p.scenario.paybackMonthsHigh} months`,
      ``,
      `Quote (${band}):`,
      ...quote!.lines.map((l) => `  - ${l.label}: ${money(l.customerUsd)}`),
      `  Total: ${money(quote!.customerTotalUsd)} · Deposit: ${money(quote!.depositUsd)}`,
      ``,
      `Note: ${t('compliance.short')} ${t('compliance.integrity')}`,
    ].join('\n');
    navigator.clipboard?.writeText(lines).then(() => { setExported(true); setTimeout(() => setExported(false), 1800); });
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between gap-3">
          <Link href="/"><Logo /></Link>
          <div className="flex items-center gap-2">
            <button onClick={() => setAdminView((v) => !v)}
              className={cn('hidden items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition sm:flex',
                adminView ? 'border-accent bg-accent/10 text-accent' : 'border-border text-muted-foreground hover:text-foreground')}>
              {adminView ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />} Founder margin view
            </button>
            <Button variant="outline" size="sm" onClick={exportSummary}>{exported ? <><Check className="h-4 w-4" /> Copied</> : <><Download className="h-4 w-4" /> Export</>}</Button>
            <Button variant="outline" size="sm" onClick={share}>{copied ? <><Check className="h-4 w-4" /> Copied</> : <><Share2 className="h-4 w-4" /> Share</>}</Button>
          </div>
        </div>
      </header>

      <div className="container max-w-5xl py-8 sm:py-12">
        {isDemo && (
          <div className="mb-6 rounded-xl border border-accent/30 bg-accent/5 px-4 py-3 text-sm font-semibold text-accent">
            Demo / scenario proposal — illustrative numbers only, not a real customer. {t('compliance.short')}
          </div>
        )}

        {/* heading */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-accent/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-accent">Scenario upgrade proposal</span>
              <GradeBadge grade={p.leak.grade} />
            </div>
            <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{p.recommendedKit.name}</h1>
            <p className="mt-2 flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="h-4 w-4" /> {labelOf(PROPERTY_TYPES as any, p.propertyType)} · {p.market}
            </p>
          </div>
          <ScoreRing score={p.leak.score} size={108} />
        </div>

        {/* outcome strip */}
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <Outcome icon={<TrendingUp className="h-4 w-4" />} label="Scenario monthly upside" value={`${money(p.scenario.monthlyUpsideLowUsd)}–${money(p.scenario.monthlyUpsideHighUsd)}`} sub={`~${p.scenario.adrUpliftPct}% ADR scenario`} accent />
          <Outcome icon={<Sparkles className="h-4 w-4" />} label="Scenario annualized" value={`${money(p.scenario.annualUpsideLowUsd)}–${money(p.scenario.annualUpsideHighUsd)}`} sub="Subject to local verification" />
          <Outcome icon={<Clock className="h-4 w-4" />} label="Scenario payback" value={`${p.scenario.paybackMonthsLow}–${p.scenario.paybackMonthsHigh} mo`} sub="At mid project cost" />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          {/* left */}
          <div className="space-y-6">
            {/* diagnosis */}
            <Card className="p-6">
              <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-accent" /><h2 className="text-lg font-bold">Listing diagnosis</h2></div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.summary}</p>
              <div className="mt-4"><LeakMap leaks={p.leak.leaks} /></div>
            </Card>

            {/* band slider */}
            <Card className="p-6">
              <div className="flex items-center gap-2"><Layers className="h-4 w-4 text-accent" /><h2 className="text-lg font-bold">Choose your budget band</h2></div>
              <p className="mt-1 text-sm text-muted-foreground">Slide to rebalance scope and price in real time.</p>
              <div className="mt-5">
                <input type="range" min={0} max={2} step={1} value={BAND_IDX.indexOf(band)} onChange={(e) => setBand(BAND_IDX[Number(e.target.value)])} className="h-2 w-full cursor-pointer rounded-full bg-muted accent-accent" />
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {BANDS.map((b) => (
                    <button key={b.value} onClick={() => setBand(b.value)}
                      className={cn('rounded-xl border p-3 text-left transition', band === b.value ? 'border-accent bg-accent/5 ring-1 ring-accent' : 'border-border hover:border-accent/50')}>
                      <div className="text-sm font-bold">{b.label}</div><div className="text-xs text-muted-foreground">{b.hint}</div>
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* itemized quote */}
            <Card className="overflow-hidden p-0">
              <div className="flex items-center justify-between border-b border-border p-5">
                <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-accent" /><h2 className="text-lg font-bold">Itemized quote</h2></div>
                {adminView && <span className="rounded-full bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent">Cost & margin visible</span>}
              </div>
              <div className="divide-y divide-border">
                <div className={cn('grid items-center gap-2 px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground', adminView ? 'grid-cols-[1fr_auto_auto_auto]' : 'grid-cols-[1fr_auto]')}>
                  <span>Item</span>{adminView && <span className="text-right">Cost</span>}{adminView && <span className="text-right">Margin</span>}<span className="text-right">Price</span>
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

            {/* timeline */}
            <Card className="p-6">
              <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-accent" /><h2 className="text-lg font-bold">Delivery timeline</h2></div>
              <div className="mt-4 space-y-3">
                {proposal.timeline.map((ph) => (
                  <div key={ph.phase} className="flex gap-3">
                    <span className="mt-0.5 w-24 shrink-0 text-xs font-bold text-accent">{ph.days}</span>
                    <div><div className="text-sm font-bold">{ph.phase}</div><div className="text-xs text-muted-foreground">{ph.detail}</div></div>
                  </div>
                ))}
              </div>
            </Card>

            {/* handover checklist */}
            <Card className="p-6">
              <div className="flex items-center gap-2"><ClipboardCheck className="h-4 w-4 text-accent" /><h2 className="text-lg font-bold">Photo-ready handover checklist</h2></div>
              <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {proposal.handover.map((h) => (
                  <div key={h.label} className="flex items-start gap-2.5 rounded-xl border border-border bg-muted/20 p-3.5">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground"><Check className="h-3 w-3" /></span>
                    <span className="text-sm font-medium leading-snug">{h.label}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* before/after */}
            <Card className="p-6">
              <h2 className="text-lg font-bold">Before / after (scenario)</h2>
              <div className="mt-4 overflow-hidden rounded-xl border border-border">
                <div className="grid grid-cols-[1fr_1fr_1fr] bg-muted/40 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground"><span>Metric</span><span>Before</span><span>After (scenario)</span></div>
                {p.beforeAfter.map((b) => (
                  <div key={b.metric} className="grid grid-cols-[1fr_1fr_1fr] border-t border-border px-4 py-3 text-sm"><span className="font-semibold">{b.metric}</span><span className="text-muted-foreground">{b.before}</span><span className="revenue-text font-semibold">{b.afterScenario}</span></div>
                ))}
              </div>
              <div className="mt-4 rounded-xl border border-border bg-muted/30 p-4">
                <p className="text-sm font-bold">Compliance & estimate notes</p>
                <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">{p.compliance.map((c, idx) => <li key={idx} className="flex gap-2"><span className={c.level === 'caution' ? 'text-warning' : 'text-muted-foreground'}>{c.level === 'caution' ? '⚠' : 'ℹ'}</span>{c.text}</li>)}</ul>
              </div>
            </Card>
          </div>

          {/* right: sticky checkout */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            {phase !== 'locked' ? (
              <Card className="p-6">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Lock this project</p>
                <div className="mt-2 flex items-baseline gap-1.5"><span className="font-display text-4xl font-semibold">{money(quote.depositUsd)}</span><span className="text-sm text-muted-foreground">deposit (20%)</span></div>
                <p className="mt-2 text-sm text-muted-foreground">Pay the deposit to reserve supplier capacity and installer slots. Balance of {money(quote.customerTotalUsd - quote.depositUsd)} due on delivery.</p>
                <div className="mt-4 space-y-2 text-sm">
                  <Row label="Project total" value={money(quote.customerTotalUsd)} />
                  <Row label="Deposit today" value={money(quote.depositUsd)} strong />
                  <Row label="Balance on delivery" value={money(quote.customerTotalUsd - quote.depositUsd)} muted />
                </div>
                <Button variant="accent" className="mt-5 w-full" size="lg" onClick={payDeposit} disabled={paying}>{paying ? 'Processing…' : <><Lock className="h-4 w-4" /> Pay deposit to lock suppliers</>}</Button>
                <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5 text-accent" /> Simulated Stripe · {money(149)} audit credited</div>
              </Card>
            ) : (
              <Card className="border-revenue/30 bg-revenue/5 p-6">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-revenue/15"><Check className="h-6 w-6 revenue-text" /></div>
                <h2 className="font-display mt-3 text-xl font-semibold">Suppliers locked</h2>
                <p className="mt-1.5 text-sm text-muted-foreground">Deposit received. Your coordinator is matching verified partners in {p.market}.</p>
                <div className="mt-4 space-y-2.5">
                  {['Local supplier sourcing', 'Installer scheduling', 'Photo-ready handover'].map((s) => (
                    <div key={s} className="flex items-center gap-2 text-sm"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-revenue" />{s}</div>
                  ))}
                </div>
                <Link href="/console?demo=1"><Button variant="outline" className="mt-5 w-full">Open console <ArrowRight className="h-4 w-4" /></Button></Link>
              </Card>
            )}

            <button onClick={exportSummary} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-sm font-semibold text-muted-foreground transition hover:text-foreground">
              <Copy className="h-4 w-4" /> {exported ? 'Summary copied to clipboard' : 'Copy proposal summary'}
            </button>
            <p className="mt-3 text-center text-xs text-muted-foreground">Ref {lead.id} · {isDemo ? 'Demo scenario' : `Referral ${lead.referral}`}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Outcome({ icon, label, value, sub, accent }: { icon: React.ReactNode; label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <div className={cn('rounded-2xl border p-4', accent ? 'border-revenue/25 bg-revenue/5' : 'border-border bg-card')}>
      <div className={cn('flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider', accent ? 'revenue-text' : 'text-muted-foreground')}>{icon}{label}</div>
      <div className={cn('mt-1.5 text-xl font-extrabold', accent && 'revenue-text')}>{value}</div>
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
