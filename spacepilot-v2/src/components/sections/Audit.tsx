'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, ArrowLeft, Check, Lock, ShieldCheck, Sparkles, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, Input, Label, Select, Progress } from '@/components/ui/primitives';
import { ScoreRing, TierBadge } from '@/components/ui/shared';
import { Logo } from '@/components/layout/Logo';
import { useMoney, useT } from '@/store/prefs';
import { useData, newLeadId, newReferral } from '@/store/data';
import { diagnose } from '@/lib/engine';
import { USER_TYPES, ROOM_TYPES, GOALS, BANDS, TIMELINES, COUNTRIES } from '@/lib/options';
import type { AuditInput, Lead, Goal } from '@/lib/types';
import { cn } from '@/lib/cn';

const STEPS = ['Profile', 'Your unit', 'Goals & budget', 'Contact'];

const DEFAULT: AuditInput = {
  userType: 'str_landlord', country: '', city: '', roomType: 'studio', sizeSqm: 32,
  nightlyRateUsd: 160, occupancyPct: 68, goals: [], band: 'standard', timeline: '1_3m',
  hasPhotos: false, hasFloorPlan: false, email: '', contact: '',
};

type Phase = 'form' | 'paywall' | 'result';

export function Audit() {
  const t = useT();
  const money = useMoney();
  const router = useRouter();
  const { addLead, markPaidAudit } = useData();
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<Phase>('form');
  const [input, setInput] = useState<AuditInput>(DEFAULT);
  const [lead, setLead] = useState<Lead | null>(null);
  const [paying, setPaying] = useState(false);

  const set = (p: Partial<AuditInput>) => setInput((s) => ({ ...s, ...p }));
  const toggleGoal = (g: Goal) => set({ goals: input.goals.includes(g) ? input.goals.filter((x) => x !== g) : [...input.goals, g] });

  const canNext = useMemo(() => {
    if (step === 0) return !!input.userType && !!input.country;
    if (step === 1) return !!input.roomType && input.sizeSqm > 0;
    if (step === 2) return input.goals.length > 0;
    if (step === 3) return /\S+@\S+\.\S+/.test(input.email);
    return true;
  }, [step, input]);

  const isOperator = ['str_landlord', 'operator', 'bnb_host', 'agent'].includes(input.userType);

  function submit() {
    const diagnosis = diagnose(input);
    const newLead: Lead = { id: newLeadId(), createdAt: Date.now(), status: 'audited', paidAudit: false, input, diagnosis, referral: newReferral() };
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
    }, 1400);
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
              {step === 0 && <StepProfile input={input} set={set} t={t} />}
              {step === 1 && <StepUnit input={input} set={set} money={money} isOperator={isOperator} t={t} />}
              {step === 2 && <StepGoals input={input} set={set} toggleGoal={toggleGoal} t={t} />}
              {step === 3 && <StepContact input={input} set={set} money={money} t={t} />}

              <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
                <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}><ArrowLeft className="h-4 w-4" /> {t('common.back')}</Button>
                {step < STEPS.length - 1 ? (
                  <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext}>{t('common.next')} <ArrowRight className="h-4 w-4" /></Button>
                ) : (
                  <Button onClick={submit} disabled={!canNext}>Run my audit <Sparkles className="h-4 w-4" /></Button>
                )}
              </div>
            </Card>
          </>
        )}

        {phase === 'paywall' && lead && <Paywall lead={lead} money={money} paying={paying} onPay={pay} t={t} />}
        {phase === 'result' && lead && <Result lead={lead} money={money} onProposal={() => router.push(`/proposal/${lead.id}`)} t={t} />}

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Logo mark /> Your data stays in your browser in this MVP.
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- STEPS ----------------------------- */
function StepHead({ title, sub }: { title: string; sub: string }) {
  return <div className="mb-6"><h1 className="text-2xl font-extrabold tracking-tight">{title}</h1><p className="mt-1 text-sm text-muted-foreground">{sub}</p></div>;
}

function StepProfile({ input, set, t }: any) {
  return (
    <div className="animate-fade-in">
      <StepHead title="Who are you?" sub="This routes your audit, pricing and ROI framing." />
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {USER_TYPES.map((u: any) => (
          <button key={u.value} onClick={() => set({ userType: u.value })}
            className={cn('rounded-xl border p-3.5 text-left transition', input.userType === u.value ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-primary/50')}>
            <div className="text-sm font-bold">{u.label}</div>
            <div className="text-xs text-muted-foreground">{u.sub}</div>
          </button>
        ))}
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div><Label>Country</Label><Select value={input.country} onChange={(e: any) => set({ country: e.target.value })}><option value="">Select country</option>{COUNTRIES.map((c: string) => <option key={c}>{c}</option>)}</Select></div>
        <div><Label>City</Label><Input value={input.city} onChange={(e: any) => set({ city: e.target.value })} placeholder="e.g. Osaka" /></div>
      </div>
    </div>
  );
}

function StepUnit({ input, set, money, isOperator, t }: any) {
  return (
    <div className="animate-fade-in">
      <StepHead title="Tell us about your unit" sub="Rough numbers are fine — we refine at survey." />
      <Label>Unit / room type</Label>
      <div className="grid grid-cols-3 gap-2.5 lg:grid-cols-4">
        {ROOM_TYPES.map((r: any) => (
          <button key={r.value} onClick={() => set({ roomType: r.value })}
            className={cn('rounded-xl border p-3 text-center transition', input.roomType === r.value ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-primary/50')}>
            <div className="text-xl">{r.icon}</div><div className="mt-1 text-xs font-medium">{r.label}</div>
          </button>
        ))}
      </div>
      <div className="mt-6">
        <Label>Approx. size · {input.sizeSqm} m²</Label>
        <input type="range" min={10} max={140} value={input.sizeSqm} onChange={(e) => set({ sizeSqm: Number(e.target.value) })} className="h-2 w-full cursor-pointer rounded-full bg-muted accent-primary" />
      </div>
      {isOperator && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div><Label>Current nightly rate · {money(input.nightlyRateUsd)}</Label><input type="range" min={30} max={700} step={5} value={input.nightlyRateUsd} onChange={(e) => set({ nightlyRateUsd: Number(e.target.value) })} className="h-2 w-full cursor-pointer rounded-full bg-muted accent-primary" /></div>
          <div><Label>Occupancy · {input.occupancyPct}%</Label><input type="range" min={20} max={95} value={input.occupancyPct} onChange={(e) => set({ occupancyPct: Number(e.target.value) })} className="h-2 w-full cursor-pointer rounded-full bg-muted accent-primary" /></div>
        </div>
      )}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Upload label="Room photo" active={input.hasPhotos} onClick={() => set({ hasPhotos: !input.hasPhotos })} />
        <Upload label="Floor plan" active={input.hasFloorPlan} onClick={() => set({ hasFloorPlan: !input.hasFloorPlan })} />
      </div>
    </div>
  );
}

function StepGoals({ input, set, toggleGoal, t }: any) {
  return (
    <div className="animate-fade-in">
      <StepHead title="What's the goal?" sub="Pick what matters most — and your budget appetite." />
      <Label>Goals (select all that apply)</Label>
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-3">
        {GOALS.map((g: any) => (
          <button key={g.value} onClick={() => toggleGoal(g.value)}
            className={cn('rounded-xl border px-3.5 py-3 text-sm font-medium transition', input.goals.includes(g.value) ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary' : 'border-border hover:border-primary/50')}>{g.label}</button>
        ))}
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div><Label>Timeline</Label><Select value={input.timeline} onChange={(e: any) => set({ timeline: e.target.value })}>{TIMELINES.map((x: any) => <option key={x.value} value={x.value}>{x.label}</option>)}</Select></div>
        <div><Label>Budget band</Label><Select value={input.band} onChange={(e: any) => set({ band: e.target.value })}>{BANDS.map((b: any) => <option key={b.value} value={b.value}>{b.label} — {b.hint}</option>)}</Select></div>
      </div>
    </div>
  );
}

function StepContact({ input, set, money, t }: any) {
  return (
    <div className="animate-fade-in">
      <StepHead title="Where do we send your diagnosis?" sub="We'll generate it instantly after a quick unlock." />
      <div className="grid gap-4 sm:grid-cols-2">
        <div><Label>Email</Label><Input type="email" value={input.email} onChange={(e: any) => set({ email: e.target.value })} placeholder="you@company.com" /></div>
        <div><Label>Messaging <span className="font-normal text-muted-foreground">(WhatsApp / Line / WeChat — {t('common.optional')})</span></Label><Input value={input.contact} onChange={(e: any) => set({ contact: e.target.value })} placeholder="@handle or +number" /></div>
      </div>
      <div className="mt-5 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
        <p className="font-semibold text-primary">After unlock you get instantly:</p>
        <ul className="mt-1.5 space-y-1 text-muted-foreground">
          <li>• Opportunity score & AI diagnosis</li>
          <li>• Scenario-based revenue projections</li>
          <li>• Estimated project range & recommended package</li>
        </ul>
      </div>
    </div>
  );
}

function Upload({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={cn('flex items-center gap-3 rounded-xl border-2 border-dashed p-4 text-left transition', active ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50')}>
      <span className="grid h-10 w-10 place-items-center rounded-lg bg-muted">{active ? <Check className="h-4 w-4 text-accent" /> : <Paperclip className="h-4 w-4 text-muted-foreground" />}</span>
      <div><div className="text-sm font-bold">{active ? `${label} added` : `Add ${label.toLowerCase()}`}</div><div className="text-xs text-muted-foreground">placeholder upload</div></div>
    </button>
  );
}

/* ----------------------------- PAYWALL ----------------------------- */
function Paywall({ lead, money, paying, onPay, t }: any) {
  const d = lead.diagnosis;
  return (
    <Card className="animate-scale-in overflow-hidden p-0">
      <div className="border-b border-border bg-muted/40 p-6 text-center">
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-primary/10"><Lock className="h-5 w-5 text-primary" /></div>
        <h1 className="text-2xl font-extrabold tracking-tight">Your audit is ready</h1>
        <p className="mt-1 text-sm text-muted-foreground">Unlock the full diagnosis, revenue scenarios and executable brief.</p>
      </div>
      <div className="grid gap-6 p-6 sm:grid-cols-[1fr_1fr] sm:p-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Preview</p>
          <div className="mt-3 flex items-center gap-4">
            <ScoreRing score={d.score} size={92} />
            <div><TierBadge tier={d.tier} /><p className="mt-2 text-sm text-muted-foreground">Estimated project<br /><span className="font-bold text-foreground">{money(d.projectLowUsd)} – {money(d.projectHighUsd)}</span></p></div>
          </div>
          <div className="mt-4 space-y-2">
            {['Full AI diagnosis summary', 'Scenario revenue projections', 'Recommended modules & quote', 'Supplier & installer shortlist'].map((x) => (
              <div key={x} className="flex items-center gap-2 text-sm text-muted-foreground"><div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" /><span className="blur-[3px] select-none">{x}</span></div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-muted/30 p-6">
          <div className="flex items-baseline gap-1.5"><span className="text-4xl font-extrabold">{money(149)}</span><span className="text-sm text-muted-foreground">one-time</span></div>
          <p className="mt-2 text-sm text-muted-foreground">Unlock full diagnosis & executable brief. Credited toward your Pro Redesign Brief if you proceed.</p>
          <Button className="mt-5 w-full" size="lg" onClick={onPay} disabled={paying}>{paying ? 'Processing…' : `Unlock for ${money(149)}`}</Button>
          <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5 text-accent" /> Money-back guarantee · Simulated Stripe checkout</div>
        </div>
      </div>
    </Card>
  );
}

/* ----------------------------- RESULT ----------------------------- */
function Result({ lead, money, onProposal, t }: any) {
  const d = lead.diagnosis;
  const isOperator = ['str_landlord', 'operator', 'bnb_host', 'agent'].includes(lead.input.userType);
  return (
    <Card className="animate-fade-up p-6 sm:p-8">
      <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        <ScoreRing score={d.score} />
        <div>
          <div className="flex items-center gap-2"><TierBadge tier={d.tier} /><span className="rounded-full bg-accent/15 px-2.5 py-1 text-xs font-semibold text-accent">✓ Unlocked</span></div>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight">Your full diagnosis</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">{d.summary}</p>
        </div>
      </div>

      {isOperator && (
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Metric label="Est. monthly revenue uplift" value={money(d.roi.monthlyUpliftUsd)} accent />
          <Metric label="Est. annualized" value={money(d.roi.annualUpliftUsd)} />
          <Metric label="Indicative payback" value={`${d.roi.paybackMonths} mo`} />
        </div>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Metric label="Estimated project range" value={`${money(d.projectLowUsd)}–${money(d.projectHighUsd)}`} />
        <Metric label="Recommended package" value={d.recommendedPackage} />
        <Metric label="Modules" value={`${d.modules.length} suggested`} />
      </div>

      <div className="mt-6 rounded-xl border border-border bg-muted/30 p-4">
        <p className="text-sm font-bold">Risk & compliance notes</p>
        <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">{d.risks.map((r: string) => <li key={r} className="flex gap-2"><span className="text-warning">⚠</span>{r}</li>)}</ul>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button className="flex-1" size="lg" onClick={onProposal}>View executable proposal & quote <ArrowRight className="h-4 w-4" /></Button>
        <a href={`mailto:${lead.input.email}?subject=SpacePilot diagnosis ${lead.id}`} className="flex-1"><Button variant="outline" size="lg" className="w-full">Email me this</Button></a>
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">Ref {lead.id} · Referral {lead.referral}</p>
    </Card>
  );
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={cn('rounded-xl border p-4', accent ? 'border-primary/20 bg-primary/5' : 'border-border bg-muted/30')}>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn('mt-1 text-lg font-extrabold', accent && 'text-primary')}>{value}</div>
    </div>
  );
}
