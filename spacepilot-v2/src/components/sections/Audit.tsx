'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, ArrowLeft, Check, Lock, ShieldCheck, Sparkles, Paperclip, Link2, Gauge } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, Input, Label, Select, Progress } from '@/components/ui/primitives';
import { ScoreRing, GradeBadge, LeakMap } from '@/components/ui/shared';
import { Logo } from '@/components/layout/Logo';
import { useMoney, useT } from '@/store/prefs';
import { useData, newLeadId, newReferral } from '@/store/data';
import { buildListingPerformancePassport, LEAK_LABEL } from '@/lib/engine';
import {
  USER_TYPES, PROPERTY_TYPES, ROOM_TYPES, PHOTO_QUALITIES, GOALS, LEAK_OPTIONS,
  AMENITIES, BANDS, TIMELINES, COUNTRIES, labelOf,
} from '@/lib/options';
import { DEMO_CASES } from '@/lib/seed';
import type { AuditInput, Lead, Goal, LeakItem, ComplianceRiskFlag } from '@/lib/types';
import { cn } from '@/lib/cn';

const STEPS = ['Listing', 'Unit economics', 'Room evidence', 'Constraints', 'Goal'];

const DEFAULT: AuditInput = {
  userType: 'str_landlord', country: '', city: '', propertyType: 'one_bed', mode: 'manual',
  listingUrl: '', adrUsd: 120, occupancyPct: 68, sizeSqm: 32, photoQuality: 'average', goal: 'higher_adr',
  nightsAvailable: 28, cleaningFeeUsd: 45, minStay: 2, rating: 4.5,
  roomType: 'bedroom', biggestIssue: 'photo_pull', amenities: ['Fast Wi-Fi'],
  band: 'standard', timeline: '1_3m', canReplaceFurniture: true, needsLandlordApproval: false,
  hasPhotos: false, hasFloorPlan: false, goals: ['higher_adr'], email: '', contact: '',
};

type Phase = 'form' | 'paywall' | 'result';

export function Audit() {
  const t = useT();
  const money = useMoney();
  const router = useRouter();
  const params = useSearchParams();
  const { addLead, markPaidAudit } = useData();
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<Phase>('form');
  const [input, setInput] = useState<AuditInput>(DEFAULT);
  const [lead, setLead] = useState<Lead | null>(null);
  const [paying, setPaying] = useState(false);

  // Prefill from demo case
  useEffect(() => {
    const caseId = params.get('case');
    const c = DEMO_CASES.find((x) => x.id === caseId);
    if (c) setInput((s) => ({ ...s, ...c.seed, goal: c.seed.goal as Goal, goals: [c.seed.goal as Goal] }));
  }, [params]);

  const set = (p: Partial<AuditInput>) => setInput((s) => ({ ...s, ...p }));
  const toggleAmenity = (a: string) => set({ amenities: input.amenities.includes(a) ? input.amenities.filter((x) => x !== a) : [...input.amenities, a] });
  const toggleGoal = (g: Goal) => set({ goals: input.goals.includes(g) ? input.goals.filter((x) => x !== g) : [...input.goals, g] });

  const canNext = useMemo(() => {
    if (step === 0) return !!input.userType && !!input.propertyType && (input.mode !== 'listing' || /\S+/.test(input.listingUrl));
    if (step === 1) return input.adrUsd > 0 && input.occupancyPct > 0;
    if (step === 2) return !!input.roomType && !!input.photoQuality;
    if (step === 3) return !!input.band && !!input.country;
    if (step === 4) return input.goals.length > 0 && /\S+@\S+\.\S+/.test(input.email);
    return true;
  }, [step, input]);

  function submit() {
    const passport = buildListingPerformancePassport(input);
    const newLead: Lead = { id: newLeadId(), createdAt: Date.now(), status: 'audited', paidAudit: false, input, passport, referral: newReferral() };
    addLead(newLead);
    setLead(newLead);
    setPhase('paywall');
  }

  function pay() {
    if (!lead) return;
    setPaying(true);
    setTimeout(() => {
      markPaidAudit(lead.id);
      setLead({ ...lead, paidAudit: true, status: 'paid_audit' });
      setPaying(false);
      setPhase('result');
    }, 1300);
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/"><Logo /></Link>
          <Link href="/" className="text-sm font-semibold text-muted-foreground hover:text-foreground">Exit</Link>
        </div>
      </header>

      <div className="container max-w-3xl py-10 sm:py-14">
        {phase === 'form' && (
          <>
            <div className="mb-7">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-bold">{STEPS[step]}</span>
                <span className="text-muted-foreground">Step {step + 1} of {STEPS.length}</span>
              </div>
              <Progress value={((step + 1) / STEPS.length) * 100} />
            </div>

            <Card className="p-6 sm:p-8">
              {step === 0 && <Step1 input={input} set={set} />}
              {step === 1 && <Step2 input={input} set={set} money={money} />}
              {step === 2 && <Step3 input={input} set={set} toggleAmenity={toggleAmenity} />}
              {step === 3 && <Step4 input={input} set={set} />}
              {step === 4 && <Step5 input={input} set={set} toggleGoal={toggleGoal} t={t} />}

              <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
                <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}><ArrowLeft className="h-4 w-4" /> {t('common.back')}</Button>
                {step < STEPS.length - 1 ? (
                  <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext}>{t('common.next')} <ArrowRight className="h-4 w-4" /></Button>
                ) : (
                  <Button onClick={submit} disabled={!canNext}>Run diagnosis <Sparkles className="h-4 w-4" /></Button>
                )}
              </div>
            </Card>
          </>
        )}

        {phase === 'paywall' && lead && <Paywall lead={lead} money={money} paying={paying} onPay={pay} />}
        {phase === 'result' && lead && <Result lead={lead} money={money} onProposal={() => router.push(`/proposal?id=${lead.id}`)} t={t} />}

        <div className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-accent" /> {t('compliance.short')}
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- STEPS ----------------------------- */
function StepHead({ title, sub }: { title: string; sub: string }) {
  return <div className="mb-6"><h1 className="font-display text-2xl font-semibold tracking-tight">{title}</h1><p className="mt-1 text-sm text-muted-foreground">{sub}</p></div>;
}

const Tiles = ({ list, value, onPick }: { list: { value: string; label: string; icon?: string; sub?: string }[]; value: string; onPick: (v: string) => void }) => (
  <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
    {list.map((u) => (
      <button key={u.value} onClick={() => onPick(u.value)}
        className={cn('rounded-xl border p-3.5 text-left transition', value === u.value ? 'border-accent bg-accent/5 ring-1 ring-accent' : 'border-border hover:border-accent/50')}>
        <div className="flex items-center gap-2 text-sm font-bold">{u.icon && <span>{u.icon}</span>}{u.label}</div>
        {u.sub && <div className="text-xs text-muted-foreground">{u.sub}</div>}
      </button>
    ))}
  </div>
);

function Step1({ input, set }: any) {
  return (
    <div className="animate-fade-in">
      <StepHead title="Your listing" sub="Connect a listing, enter details manually, or use the photo placeholder." />
      <Label>I am a…</Label>
      <Tiles list={USER_TYPES as any} value={input.userType} onPick={(v) => set({ userType: v })} />
      <div className="mt-6"><Label>Property type</Label>
        <Tiles list={PROPERTY_TYPES as any} value={input.propertyType} onPick={(v) => set({ propertyType: v })} />
      </div>
      <div className="mt-6"><Label>How should we read your listing?</Label>
        <div className="grid gap-2.5 sm:grid-cols-3">
          {[['listing', 'Airbnb / Vrbo URL', '🔗'], ['manual', 'Enter manually', '✍️'], ['photos', 'Upload photos', '📷']].map(([v, label, icon]) => (
            <button key={v} onClick={() => set({ mode: v })}
              className={cn('rounded-xl border p-3.5 text-left transition', input.mode === v ? 'border-accent bg-accent/5 ring-1 ring-accent' : 'border-border hover:border-accent/50')}>
              <div className="text-lg">{icon}</div><div className="mt-1 text-sm font-bold">{label}</div>
            </button>
          ))}
        </div>
      </div>
      {input.mode === 'listing' && (
        <div className="mt-4"><Label>Listing URL</Label>
          <div className="relative"><Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" value={input.listingUrl} onChange={(e: any) => set({ listingUrl: e.target.value })} placeholder="https://airbnb.com/rooms/…" />
          </div>
        </div>
      )}
      {input.mode === 'photos' && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Upload label="Room photo" active={input.hasPhotos} onClick={() => set({ hasPhotos: !input.hasPhotos })} />
          <Upload label="Floor plan" active={input.hasFloorPlan} onClick={() => set({ hasFloorPlan: !input.hasFloorPlan })} />
        </div>
      )}
    </div>
  );
}

function Step2({ input, set, money }: any) {
  return (
    <div className="animate-fade-in">
      <StepHead title="Unit economics" sub="Rough numbers are fine — we refine at survey." />
      <div className="space-y-5">
        <Range label={`Current ADR · ${money(input.adrUsd)}`} min={30} max={700} step={5} value={input.adrUsd} onChange={(v: number) => set({ adrUsd: v })} />
        <Range label={`Occupancy · ${input.occupancyPct}%`} min={20} max={95} value={input.occupancyPct} onChange={(v: number) => set({ occupancyPct: v })} />
        <div className="grid gap-4 sm:grid-cols-3">
          <div><Label>Nights available / mo</Label><Input type="number" value={input.nightsAvailable} onChange={(e: any) => set({ nightsAvailable: Number(e.target.value) })} /></div>
          <div><Label>Cleaning fee</Label><Input type="number" value={input.cleaningFeeUsd} onChange={(e: any) => set({ cleaningFeeUsd: Number(e.target.value) })} /></div>
          <div><Label>Min stay (nights)</Label><Input type="number" value={input.minStay} onChange={(e: any) => set({ minStay: Number(e.target.value) })} /></div>
        </div>
        <Range label={`Listing rating · ${input.rating.toFixed(1)} ★`} min={30} max={50} value={Math.round(input.rating * 10)} onChange={(v: number) => set({ rating: v / 10 })} />
      </div>
    </div>
  );
}

function Step3({ input, set, toggleAmenity }: any) {
  return (
    <div className="animate-fade-in">
      <StepHead title="Room evidence" sub="The more evidence you give, the stronger your passport confidence." />
      <Label>Room type</Label>
      <Tiles list={ROOM_TYPES as any} value={input.roomType} onPick={(v) => set({ roomType: v })} />
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div><Label>Photo quality (self-rated)</Label><Select value={input.photoQuality} onChange={(e: any) => set({ photoQuality: e.target.value })}>{PHOTO_QUALITIES.map((p: any) => <option key={p.value} value={p.value}>{p.label}</option>)}</Select></div>
        <div><Label>Biggest visible issue</Label><Select value={input.biggestIssue} onChange={(e: any) => set({ biggestIssue: e.target.value })}>{LEAK_OPTIONS.map((l: any) => <option key={l.value} value={l.value}>{l.label}</option>)}</Select></div>
      </div>
      <div className="mt-6"><Label>Existing amenities</Label>
        <div className="flex flex-wrap gap-2">
          {AMENITIES.map((a) => (
            <button key={a} onClick={() => toggleAmenity(a)}
              className={cn('rounded-full border px-3 py-1.5 text-xs font-semibold transition', input.amenities.includes(a) ? 'border-accent bg-accent/10 text-accent' : 'border-border text-muted-foreground hover:border-accent/50')}>{a}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Step4({ input, set }: any) {
  return (
    <div className="animate-fade-in">
      <StepHead title="Upgrade constraints" sub="What's realistic for this unit?" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div><Label>Budget band</Label><Select value={input.band} onChange={(e: any) => set({ band: e.target.value })}>{BANDS.map((b: any) => <option key={b.value} value={b.value}>{b.label} — {b.hint}</option>)}</Select></div>
        <div><Label>Timeline</Label><Select value={input.timeline} onChange={(e: any) => set({ timeline: e.target.value })}>{TIMELINES.map((x: any) => <option key={x.value} value={x.value}>{x.label}</option>)}</Select></div>
        <div><Label>Market / country</Label><Select value={input.country} onChange={(e: any) => set({ country: e.target.value })}><option value="">Select country</option>{COUNTRIES.map((c: string) => <option key={c}>{c}</option>)}</Select></div>
        <div><Label>City</Label><Input value={input.city} onChange={(e: any) => set({ city: e.target.value })} placeholder="e.g. Osaka" /></div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Toggle label="Can replace furniture" active={input.canReplaceFurniture} onClick={() => set({ canReplaceFurniture: !input.canReplaceFurniture })} />
        <Toggle label="Needs landlord approval" active={input.needsLandlordApproval} onClick={() => set({ needsLandlordApproval: !input.needsLandlordApproval })} />
      </div>
    </div>
  );
}

function Step5({ input, set, toggleGoal, t }: any) {
  return (
    <div className="animate-fade-in">
      <StepHead title="Your goal & where to send it" sub="Pick what matters most. We generate your diagnosis instantly." />
      <Label>Goals (select all that apply)</Label>
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-3">
        {GOALS.map((g: any) => (
          <button key={g.value} onClick={() => toggleGoal(g.value)}
            className={cn('rounded-xl border px-3.5 py-3 text-sm font-medium transition', input.goals.includes(g.value) ? 'border-accent bg-accent/5 text-accent ring-1 ring-accent' : 'border-border hover:border-accent/50')}>{g.label}</button>
        ))}
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div><Label>Email</Label><Input type="email" value={input.email} onChange={(e: any) => set({ email: e.target.value })} placeholder="you@company.com" /></div>
        <div><Label>Messaging <span className="font-normal text-muted-foreground">({t('common.optional')})</span></Label><Input value={input.contact} onChange={(e: any) => set({ contact: e.target.value })} placeholder="@handle or +number" /></div>
      </div>
    </div>
  );
}

function Range({ label, min, max, step = 1, value, onChange }: any) {
  return <div><Label>{label}</Label><input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="h-2 w-full cursor-pointer rounded-full bg-muted accent-accent" /></div>;
}
function Toggle({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={cn('flex items-center justify-between rounded-xl border p-3.5 text-left text-sm font-bold transition', active ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50')}>
      {label}<span className={cn('grid h-5 w-9 place-items-center rounded-full transition', active ? 'bg-accent' : 'bg-muted')}><span className={cn('h-3.5 w-3.5 rounded-full bg-card transition', active ? 'translate-x-2' : '-translate-x-2')} /></span>
    </button>
  );
}
function Upload({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={cn('flex items-center gap-3 rounded-xl border-2 border-dashed p-4 text-left transition', active ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50')}>
      <span className="grid h-10 w-10 place-items-center rounded-lg bg-muted">{active ? <Check className="h-4 w-4 text-accent" /> : <Paperclip className="h-4 w-4 text-muted-foreground" />}</span>
      <div><div className="text-sm font-bold">{active ? `${label} added` : `Add ${label.toLowerCase()}`}</div><div className="text-xs text-muted-foreground">placeholder upload</div></div>
    </button>
  );
}

/* ----------------------------- PAYWALL ----------------------------- */
function Paywall({ lead, money, paying, onPay }: any) {
  const p = lead.passport;
  return (
    <Card className="animate-scale-in overflow-hidden p-0">
      <div className="border-b border-border bg-muted/40 p-6 text-center">
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-accent/10"><Lock className="h-5 w-5 text-accent" /></div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Your diagnosis is ready</h1>
        <p className="mt-1 text-sm text-muted-foreground">Unlock the full leak map, scenario upside and your upgrade kit.</p>
      </div>
      <div className="grid gap-6 p-6 sm:grid-cols-[1fr_1fr] sm:p-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Preview</p>
          <div className="mt-3 flex items-center gap-4">
            <ScoreRing score={p.leak.score} size={92} />
            <div><GradeBadge grade={p.leak.grade} /><p className="mt-2 text-sm text-muted-foreground">Recommended<br /><span className="font-bold text-foreground">{p.recommendedKit.name}</span></p></div>
          </div>
          <div className="mt-4 space-y-2">
            {['Full 7-category leak map', 'Top 3 fixes & SKU upgrade kit', 'Scenario ROI & payback', 'Compliance risk flags'].map((x) => (
              <div key={x} className="flex items-center gap-2 text-sm text-muted-foreground"><div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" /><span className="select-none blur-[3px]">{x}</span></div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-muted/30 p-6">
          <div className="flex items-baseline gap-1.5"><span className="font-display text-4xl font-semibold">{money(149)}</span><span className="text-sm text-muted-foreground">one-time</span></div>
          <p className="mt-2 text-sm text-muted-foreground">Unlock the full diagnosis. Credited toward your upgrade proposal if you proceed.</p>
          <Button variant="accent" className="mt-5 w-full" size="lg" onClick={onPay} disabled={paying}>{paying ? 'Processing…' : `Unlock for ${money(149)}`}</Button>
          <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5 text-accent" /> Simulated Stripe checkout</div>
        </div>
      </div>
    </Card>
  );
}

/* ----------------------------- RESULT ----------------------------- */
function Result({ lead, money, onProposal, t }: any) {
  const p = lead.passport;
  return (
    <Card className="animate-fade-up p-6 sm:p-8">
      <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        <ScoreRing score={p.leak.score} />
        <div>
          <div className="flex flex-wrap items-center gap-2"><GradeBadge grade={p.leak.grade} /><span className="rounded-full bg-revenue/15 px-2.5 py-1 text-xs font-semibold revenue-text">✓ Unlocked</span></div>
          <h1 className="font-display mt-3 text-2xl font-semibold tracking-tight">Revenue leak diagnosis</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">{p.summary}</p>
        </div>
      </div>

      <div className="mt-7 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <p className="mb-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground"><Gauge className="h-3.5 w-3.5" /> Leak map · 7 categories</p>
          <LeakMap leaks={p.leak.leaks} />
        </div>
        <div className="space-y-3">
          <Metric label="Est. monthly upside" value={`${money(p.scenario.monthlyUpsideLowUsd)}–${money(p.scenario.monthlyUpsideHighUsd)}`} accent />
          <Metric label="Scenario payback" value={`${p.scenario.paybackMonthsLow}–${p.scenario.paybackMonthsHigh} mo`} />
          <Metric label="Passport confidence" value={`${p.passportConfidence} · ${p.evidenceCompletenessPct}% evidence`} />
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-muted/30 p-4">
        <p className="text-sm font-bold">Top 3 fixes → {p.recommendedKit.name}</p>
        <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
          {p.leak.topLeaks.map((l: LeakItem) => <li key={l.category} className="flex gap-2"><span className="text-accent">→</span><span><b className="text-foreground">{LEAK_LABEL[l.category]}:</b> {l.note}</span></li>)}
        </ul>
      </div>

      <div className="mt-4 rounded-xl border border-border bg-muted/20 p-4">
        <p className="text-sm font-bold">Compliance & estimate notes</p>
        <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">{p.compliance.map((c: ComplianceRiskFlag, idx: number) => <li key={idx} className="flex gap-2"><span className={c.level === 'caution' ? 'text-warning' : 'text-muted-foreground'}>{c.level === 'caution' ? '⚠' : 'ℹ'}</span>{c.text}</li>)}</ul>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button variant="accent" className="flex-1" size="lg" onClick={onProposal}>Unlock executable proposal & quote <ArrowRight className="h-4 w-4" /></Button>
        <Link href="/?join=1" className="flex-1"><Button variant="outline" size="lg" className="w-full">Join my city launch list</Button></Link>
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">Ref {lead.id} · Referral {lead.referral}</p>
    </Card>
  );
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={cn('rounded-xl border p-4', accent ? 'border-revenue/25 bg-revenue/5' : 'border-border bg-muted/30')}>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn('mt-1 text-lg font-extrabold capitalize', accent && 'revenue-text')}>{value}</div>
    </div>
  );
}
