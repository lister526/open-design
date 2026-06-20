import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocale } from '../context/LocaleContext';
import { useAudit } from '../context/AuditContext';
import {
  USER_TYPES, ROOM_TYPES, PAIN_POINTS, OUTCOMES, STYLES, TIMELINES, BUDGET_BANDS, COUNTRIES, labelFor,
} from '../lib/options';
import type { AuditInput, Lead } from '../lib/types';
import { diagnose, buildQuote } from '../lib/engine';
import { saveLead, genId, genReferral } from '../lib/store';
import { ScoreRing, TierBadge } from '../components/ui';
import { Logo } from '../components/Logo';

const STEP_TITLES = ['You', 'Your space', 'Goals & style', 'Contact', 'Result'];

const DEFAULT: AuditInput = {
  userType: 'landlord', country: '', city: '', roomType: 'living_room', roomSizeSqm: 20,
  pains: [], budgetBand: 'standard', style: 'warm_minimal', timeline: '1_3m', outcome: 'higher_rent',
  email: '', contactChannel: '', hasPhoto: false, hasFloorPlan: false,
};

export function Audit() {
  const { t, area } = useLocale();
  const navigate = useNavigate();
  const { setActiveLead } = useAudit();
  const [step, setStep] = useState(0);
  const [input, setInput] = useState<AuditInput>(DEFAULT);
  const [lead, setLead] = useState<Lead | null>(null);

  const set = (patch: Partial<AuditInput>) => setInput((p) => ({ ...p, ...patch }));
  const togglePain = (p: AuditInput['pains'][number]) =>
    set({ pains: input.pains.includes(p) ? input.pains.filter((x) => x !== p) : [...input.pains, p] });

  const canNext = useMemo(() => {
    if (step === 0) return !!input.userType;
    if (step === 1) return !!input.roomType && input.roomSizeSqm > 0;
    if (step === 2) return input.pains.length > 0 && !!input.outcome;
    if (step === 3) return /\S+@\S+\.\S+/.test(input.email);
    return true;
  }, [step, input]);

  function runAudit() {
    const diagnosis = diagnose(input);
    const quote = buildQuote(input, input.budgetBand);
    const newLead: Lead = {
      id: genId(), createdAt: Date.now(), status: 'audited', input, diagnosis, quote, referralCode: genReferral(),
    };
    saveLead(newLead);
    setActiveLead(newLead);
    setLead(newLead);
    setStep(4);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50/40 to-white">
      <div className="container-page max-w-4xl py-10 sm:py-14">
        {/* progress */}
        <div className="mb-8 flex items-center justify-between gap-2">
          {STEP_TITLES.map((s, i) => (
            <div key={s} className="flex flex-1 items-center gap-2">
              <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold transition ${i <= step ? 'bg-brand-600 text-white' : 'bg-ink-900/[.06] text-ink-700/50'}`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`hidden text-xs font-semibold sm:block ${i <= step ? 'text-ink-900' : 'text-ink-700/40'}`}>{s}</span>
              {i < STEP_TITLES.length - 1 && <div className={`h-px flex-1 ${i < step ? 'bg-brand-500' : 'bg-ink-900/10'}`} />}
            </div>
          ))}
        </div>

        <div className="card p-6 sm:p-8">
          {step === 0 && (
            <Step title="Who are you?" sub="This routes your audit, pricing and ROI framing.">
              <div className="grid gap-3 sm:grid-cols-3">
                {USER_TYPES.map((u) => (
                  <button key={u.value} onClick={() => set({ userType: u.value })}
                    className={`pill-option flex flex-col items-start text-left ${input.userType === u.value ? 'pill-option-active' : ''}`}>
                    <span className="font-bold">{u.label}</span>
                    <span className="text-xs text-ink-700/60">{u.sub}</span>
                  </button>
                ))}
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Country</label>
                  <select className="input" value={input.country} onChange={(e) => set({ country: e.target.value })}>
                    <option value="">Select country</option>
                    {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">City</label>
                  <input className="input" value={input.city} onChange={(e) => set({ city: e.target.value })} placeholder="e.g. Osaka" />
                </div>
              </div>
            </Step>
          )}

          {step === 1 && (
            <Step title="Tell us about your space" sub="Rough numbers are fine — we refine at survey.">
              <label className="label">Room type</label>
              <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
                {ROOM_TYPES.map((r) => (
                  <button key={r.value} onClick={() => set({ roomType: r.value })}
                    className={`pill-option ${input.roomType === r.value ? 'pill-option-active' : ''}`}>
                    <div className="text-xl">{r.icon}</div>
                    <div className="mt-1 text-xs">{r.label}</div>
                  </button>
                ))}
              </div>
              <div className="mt-6">
                <label className="label">Approx. room size — {area(input.roomSizeSqm)}</label>
                <input type="range" min={6} max={120} value={input.roomSizeSqm}
                  onChange={(e) => set({ roomSizeSqm: Number(e.target.value) })}
                  className="w-full accent-brand-600" />
                <div className="mt-1 flex justify-between text-xs text-ink-700/50"><span>6 m²</span><span>120 m²</span></div>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <UploadBox label="Room photo" hint="JPG / PNG — placeholder upload" active={input.hasPhoto} onClick={() => set({ hasPhoto: !input.hasPhoto })} />
                <UploadBox label="Floor plan" hint="PDF / image — placeholder upload" active={input.hasFloorPlan} onClick={() => set({ hasFloorPlan: !input.hasFloorPlan })} />
              </div>
            </Step>
          )}

          {step === 2 && (
            <Step title="What’s the goal?" sub="Pick the pain points, your target outcome and style.">
              <label className="label">Current pain points (select all)</label>
              <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
                {PAIN_POINTS.map((p) => (
                  <button key={p.value} onClick={() => togglePain(p.value)}
                    className={`pill-option text-xs ${input.pains.includes(p.value) ? 'pill-option-active' : ''}`}>{p.label}</button>
                ))}
              </div>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="label">Expected outcome</label>
                  <select className="input" value={input.outcome} onChange={(e) => set({ outcome: e.target.value as AuditInput['outcome'] })}>
                    {OUTCOMES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Timeline</label>
                  <select className="input" value={input.timeline} onChange={(e) => set({ timeline: e.target.value as AuditInput['timeline'] })}>
                    {TIMELINES.map((tl) => <option key={tl.value} value={tl.value}>{tl.label}</option>)}
                  </select>
                </div>
              </div>
              <label className="label mt-6">Desired style</label>
              <div className="grid grid-cols-3 gap-2.5 lg:grid-cols-6">
                {STYLES.map((s) => (
                  <button key={s.value} onClick={() => set({ style: s.value })}
                    className={`overflow-hidden rounded-xl ring-1 ring-inset transition ${input.style === s.value ? 'ring-2 ring-brand-500' : 'ring-ink-900/10 hover:ring-brand-300'}`}>
                    <div className={`h-12 w-full bg-gradient-to-br ${s.swatch}`} />
                    <div className="px-1 py-1.5 text-[11px] font-semibold">{s.label}</div>
                  </button>
                ))}
              </div>
              <label className="label mt-6">Budget band</label>
              <div className="grid grid-cols-3 gap-2.5">
                {BUDGET_BANDS.map((b) => (
                  <button key={b.value} onClick={() => set({ budgetBand: b.value })}
                    className={`pill-option flex flex-col ${input.budgetBand === b.value ? 'pill-option-active' : ''}`}>
                    <span className="font-bold">{b.label}</span>
                    <span className="text-[11px] text-ink-700/60">{b.hint}</span>
                  </button>
                ))}
              </div>
            </Step>
          )}

          {step === 3 && (
            <Step title="Where do we send your audit?" sub="We’ll generate your result instantly and email a copy.">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Email</label>
                  <input className="input" type="email" value={input.email} onChange={(e) => set({ email: e.target.value })} placeholder="you@company.com" />
                </div>
                <div>
                  <label className="label">Messaging handle <span className="font-normal text-ink-700/50">(WhatsApp / Line / WeChat — {t('common.optional')})</span></label>
                  <input className="input" value={input.contactChannel} onChange={(e) => set({ contactChannel: e.target.value })} placeholder="@handle or +country number" />
                </div>
              </div>
              <div className="mt-5 rounded-xl bg-brand-50 p-4 text-sm text-brand-900 ring-1 ring-brand-200">
                <p className="font-semibold">What you’ll get instantly:</p>
                <ul className="mt-1.5 space-y-1 text-brand-800/80">
                  <li>• AI diagnosis & opportunity score</li>
                  <li>• Estimated project range &amp; recommended package</li>
                  <li>• A buildable smart quote you can act on</li>
                </ul>
              </div>
              <p className="mt-4 text-xs text-ink-700/50">By continuing you agree estimates are scenario-based and subject to local conditions. No payment required to view your audit.</p>
            </Step>
          )}

          {step === 4 && lead && <Result lead={lead} onProposal={() => navigate(`/proposal/${lead.id}`)} />}

          {/* nav buttons */}
          {step < 4 && (
            <div className="mt-8 flex items-center justify-between border-t border-ink-900/[.06] pt-6">
              <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="btn-ghost">{t('common.back')}</button>
              {step < 3 ? (
                <button onClick={() => setStep((s) => s + 1)} disabled={!canNext} className="btn-primary">{t('common.next')} →</button>
              ) : (
                <button onClick={runAudit} disabled={!canNext} className="btn-primary">Run AI Room Audit ⚡</button>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-ink-700/40">
          <Logo mark /> SpacePilot AI · your data stays in your browser in this MVP
        </div>
      </div>
    </div>
  );
}

function Step({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="animate-fade-up">
      <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">{title}</h1>
      <p className="mt-1 text-sm text-ink-700/70">{sub}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function UploadBox({ label, hint, active, onClick }: { label: string; hint: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-3 rounded-xl border-2 border-dashed p-4 text-left transition ${active ? 'border-brand-500 bg-brand-50' : 'border-ink-900/15 hover:border-brand-400'}`}>
      <span className="grid h-10 w-10 place-items-center rounded-lg bg-ink-900/[.05] text-lg">{active ? '✅' : '📎'}</span>
      <div>
        <div className="text-sm font-bold text-ink-900">{active ? `${label} added` : `Add ${label.toLowerCase()}`}</div>
        <div className="text-xs text-ink-700/60">{hint}</div>
      </div>
    </button>
  );
}

/* ----------------------------- RESULT ----------------------------- */
function Result({ lead, onProposal }: { lead: Lead; onProposal: () => void }) {
  const { money, range } = useLocale();
  const d = lead.diagnosis;
  return (
    <div className="animate-fade-up">
      <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        <ScoreRing score={d.opportunityScore} />
        <div>
          <TierBadge tier={d.intentTier} />
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-ink-900">Your AI Room Audit is ready</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-700/80">{d.summary}</p>
        </div>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        <Metric label="Estimated project range" value={range(d.projectLowUsd, d.projectHighUsd)} />
        <Metric label="Recommended package" value={d.recommendedPackage} accent />
        <Metric label="Package price" value={money(d.recommendedPackagePriceUsd)} />
      </div>

      {d.roiAngle && (
        <div className="mt-5 rounded-xl bg-accent-500/10 p-4 text-sm leading-relaxed text-accent-700 ring-1 ring-accent-500/20">
          <span className="font-bold">ROI angle · </span>{d.roiAngle}
        </div>
      )}

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="text-sm font-bold text-ink-900">Suggested modules</h3>
          <ul className="mt-3 space-y-2 text-sm text-ink-700/80">
            {d.modules.map((m) => <li key={m} className="flex gap-2"><span className="text-brand-500">▣</span>{m}</li>)}
          </ul>
        </div>
        <div className="card p-5">
          <h3 className="text-sm font-bold text-ink-900">Risk & compliance notes</h3>
          <ul className="mt-3 space-y-2 text-sm text-ink-700/70">
            {d.riskNotes.map((r) => <li key={r} className="flex gap-2"><span className="text-amber-500">⚠</span>{r}</li>)}
          </ul>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button onClick={onProposal} className="btn-primary flex-1">View smart proposal & quote →</button>
        <a href={`mailto:${lead.input.email}?subject=Your SpacePilot Audit ${lead.id}`} className="btn-ghost flex-1 justify-center">Email me this audit</a>
      </div>
      <p className="mt-3 text-center text-xs text-ink-700/50">Audit reference {lead.id} · Referral code {lead.referralCode}</p>
    </div>
  );
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl p-4 ring-1 ring-inset ${accent ? 'bg-brand-50 ring-brand-200' : 'bg-ink-900/[.02] ring-ink-900/[.06]'}`}>
      <div className="text-xs font-semibold uppercase tracking-wider text-ink-700/50">{label}</div>
      <div className={`mt-1 text-lg font-extrabold ${accent ? 'text-brand-700' : 'text-ink-900'}`}>{value}</div>
    </div>
  );
}
