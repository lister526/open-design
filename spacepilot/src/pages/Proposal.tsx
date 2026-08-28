import { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLocale } from '../context/LocaleContext';
import { getLead, saveLead, updateLeadStatus } from '../lib/store';
import { buildQuote } from '../lib/engine';
import type { BudgetBand } from '../lib/types';
import { BUDGET_BANDS, ROOM_TYPES, STYLES, labelFor } from '../lib/options';
import { TierBadge } from '../components/ui';
import { SUPPLIER_COMPONENTS } from '../data/seed';

export function Proposal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { money, range, area } = useLocale();
  const lead = id ? getLead(id) : undefined;
  const [band, setBand] = useState<BudgetBand>(lead?.input.budgetBand ?? 'standard');
  const [paid, setPaid] = useState(lead?.status === 'deposit_paid' || lead?.status === 'in_delivery' || lead?.status === 'completed');

  const quote = useMemo(() => (lead ? buildQuote(lead.input, band) : null), [lead, band]);

  if (!lead || !quote) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="text-2xl font-bold">Proposal not found</h1>
        <p className="mt-2 text-ink-700/70">Run an audit to generate a proposal.</p>
        <Link to="/audit" className="btn-primary mt-6 inline-flex">Start AI Room Audit</Link>
      </div>
    );
  }

  const d = lead.diagnosis;
  const i = lead.input;
  const styleSwatch = STYLES.find((s) => s.value === i.style)?.swatch ?? 'from-stone-200 to-stone-100';
  const deposit = Math.round(quote.customerTotalUsd * 0.2);
  // suggest a few components relevant by install country hint
  const recommended = SUPPLIER_COMPONENTS.slice(0, 4);

  function payDeposit() {
    updateLeadStatus(lead!.id, 'deposit_paid');
    const updated = { ...lead!, status: 'deposit_paid' as const, quote: quote! };
    saveLead(updated);
    setPaid(true);
  }

  return (
    <div className="bg-gradient-to-b from-brand-50/30 to-white">
      <div className="container-page max-w-5xl py-10 sm:py-14">
        {/* header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="section-eyebrow">Smart proposal</p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-ink-900">
              {labelFor(ROOM_TYPES, i.roomType)} transformation
            </h1>
            <p className="mt-1 text-sm text-ink-700/70">{i.city ? `${i.city}, ` : ''}{i.country || 'Location TBD'} · {area(i.roomSizeSqm)} · {labelFor(STYLES, i.style)} · Ref {lead.id}</p>
          </div>
          <TierBadge tier={d.intentTier} />
        </div>

        {/* before / after concept */}
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <div className="card p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-ink-700/50">Before — the problem</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-700/80">{d.summary}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {i.pains.map((p) => <span key={p} className="chip bg-rose-500/10 text-rose-600">{p.replace(/_/g, ' ')}</span>)}
            </div>
          </div>
          <div className="card overflow-hidden p-0">
            <div className={`h-28 w-full bg-gradient-to-br ${styleSwatch}`} />
            <div className="p-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-ink-700/50">After — proposed transformation</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-700/80">
                A {labelFor(STYLES, i.style).toLowerCase()} transformation engineered for <span className="font-semibold text-ink-900">{i.outcome.replace(/_/g, ' ')}</span> — combining the modules below into one buildable, coordinated scope.
              </p>
            </div>
          </div>
        </div>

        {/* recommended modules */}
        <div className="mt-8 card p-6">
          <h2 className="text-lg font-bold text-ink-900">Recommended modules</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {d.modules.map((m) => (
              <div key={m} className="rounded-xl bg-ink-900/[.02] p-4 ring-1 ring-ink-900/[.06]">
                <div className="text-sm font-semibold text-ink-900">{m}</div>
              </div>
            ))}
          </div>
        </div>

        {/* QUOTE ENGINE */}
        <div className="mt-8 card p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-ink-900">Smart quote</h2>
            <div className="flex gap-1.5 rounded-xl bg-ink-900/[.04] p-1">
              {BUDGET_BANDS.map((b) => (
                <button key={b.value} onClick={() => setBand(b.value)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${band === b.value ? 'bg-white text-brand-700 shadow-sm' : 'text-ink-700/60'}`}>
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-xl ring-1 ring-ink-900/[.07]">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-ink-900/[.06]">
                {quote.lines.map((l) => (
                  <tr key={l.key} className="bg-white">
                    <td className="px-4 py-3 text-ink-700/80">{l.label}</td>
                    <td className="px-4 py-3 text-right font-semibold text-ink-900">{money(l.customerUsd)}</td>
                  </tr>
                ))}
                <tr className="bg-ink-950 text-white">
                  <td className="px-4 py-4 font-bold">Customer total <span className="font-normal text-white/50">({band})</span></td>
                  <td className="px-4 py-4 text-right text-lg font-extrabold">{money(quote.customerTotalUsd)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Band label="Lean" v={range(buildQuote(i, 'lean').customerTotalUsd * .98, buildQuote(i, 'lean').customerTotalUsd * 1.02)} active={band === 'lean'} />
            <Band label="Standard" v={range(buildQuote(i, 'standard').customerTotalUsd * .98, buildQuote(i, 'standard').customerTotalUsd * 1.02)} active={band === 'standard'} />
            <Band label="Premium" v={range(buildQuote(i, 'premium').customerTotalUsd * .98, buildQuote(i, 'premium').customerTotalUsd * 1.02)} active={band === 'premium'} />
          </div>

          <p className="mt-4 text-xs text-ink-700/50">
            Prices are estimates for planning, shown in your selected currency. Final pricing is confirmed after a site survey and subject to local material availability, taxes and installer capacity.
          </p>
        </div>

        {/* timeline + value + risk */}
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          <InfoCard title="Timeline" body={`Indicative ${band === 'premium' ? '5–8' : band === 'standard' ? '3–6' : '2–4'} weeks from deposit to install, subject to survey and lead times.`} />
          <InfoCard title="Expected value" body={d.roiAngle ?? 'A coordinated transformation targeting your stated outcome, delivered to a fixed, agreed scope.'} />
          <InfoCard title="Risk notes" body={d.riskNotes[0]} />
        </div>

        {/* supplier shortlist */}
        <div className="mt-8 card p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink-900">Matched components</h2>
            <Link to="/partners#catalog" className="text-sm font-semibold text-brand-600 hover:underline">Full catalog →</Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {recommended.map((c) => (
              <div key={c.id} className="rounded-xl bg-ink-900/[.02] p-4 ring-1 ring-ink-900/[.06]">
                <div className="text-2xl">{c.image}</div>
                <div className="mt-2 text-sm font-bold text-ink-900">{c.name}</div>
                <div className="text-xs text-ink-700/60">{c.category} · {c.leadTimeDays}d lead</div>
                <div className="mt-1.5 text-sm font-semibold text-brand-700">{money(c.retailUsd)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA / payment */}
        <div className="mt-8 overflow-hidden rounded-3xl bg-ink-950 p-8 text-white">
          {paid ? (
            <div className="text-center">
              <div className="text-4xl">🎉</div>
              <h2 className="mt-3 text-2xl font-extrabold">Deposit secured — project initiated</h2>
              <p className="mt-2 text-white/70">We’re matching your local installer and confirming the survey. Track status in the operator console.</p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <Link to="/console/pipeline" className="btn-primary">Track project status</Link>
                <button onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/proposal/${lead.id}`)} className="btn bg-white/10 text-white ring-1 ring-white/15 hover:bg-white/15">Copy shareable proposal link</button>
              </div>
            </div>
          ) : (
            <div className="grid items-center gap-6 lg:grid-cols-[1.3fr_.7fr]">
              <div>
                <h2 className="text-2xl font-extrabold">Lock your scope with a refundable deposit</h2>
                <p className="mt-2 max-w-md text-white/70">Pay a 20% deposit to start surveying, supplier matching and scheduling. Fully credited toward your project.</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button onClick={payDeposit} className="btn-primary">Pay deposit · {money(deposit)}</button>
                  <Link to="/partners" className="btn bg-white/10 text-white ring-1 ring-white/15 hover:bg-white/15">Request sourcing quote</Link>
                  <Link to="/partners" className="btn bg-white/10 text-white ring-1 ring-white/15 hover:bg-white/15">Invite a designer</Link>
                </div>
                <p className="mt-3 text-xs text-white/40">Payment is simulated in this MVP. Stripe / local PSP integration is a drop-in next step.</p>
              </div>
              <div className="rounded-2xl bg-white/[.06] p-5 ring-1 ring-white/10">
                <div className="flex justify-between text-sm"><span className="text-white/60">Project total</span><span className="font-bold">{money(quote.customerTotalUsd)}</span></div>
                <div className="mt-2 flex justify-between text-sm"><span className="text-white/60">Deposit (20%)</span><span className="font-bold text-accent-400">{money(deposit)}</span></div>
                <div className="mt-2 flex justify-between text-sm"><span className="text-white/60">Balance on delivery</span><span className="font-bold">{money(quote.customerTotalUsd - deposit)}</span></div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <button onClick={() => navigate('/audit')} className="text-sm font-semibold text-brand-600 hover:underline">← Start another room audit</button>
        </div>
      </div>
    </div>
  );
}

function Band({ label, v, active }: { label: string; v: string; active: boolean }) {
  return (
    <div className={`rounded-xl p-4 ring-1 ring-inset ${active ? 'bg-brand-50 ring-brand-300' : 'bg-ink-900/[.02] ring-ink-900/[.06]'}`}>
      <div className="text-xs font-bold uppercase tracking-wider text-ink-700/50">{label}</div>
      <div className={`mt-1 text-sm font-extrabold ${active ? 'text-brand-700' : 'text-ink-900'}`}>{v}</div>
    </div>
  );
}

function InfoCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="card p-5">
      <h3 className="text-sm font-bold uppercase tracking-wider text-ink-700/50">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-700/80">{body}</p>
    </div>
  );
}
