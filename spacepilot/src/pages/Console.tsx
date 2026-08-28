import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLocale } from '../context/LocaleContext';
import { Logo } from '../components/Logo';
import { LocaleSwitcher } from '../components/LocaleSwitcher';
import { StatusBadge, TierBadge, STATUS_LABEL } from '../components/ui';
import {
  getLeads, updateLeadStatus, getWaitlist, getPartnerApps, resetDemoData,
} from '../lib/store';
import { buildQuote } from '../lib/engine';
import { SUPPLIER_COMPONENTS, PARTNERS } from '../data/seed';
import type { Lead, LeadStatus, BudgetBand } from '../lib/types';
import { ROOM_TYPES, labelFor } from '../lib/options';

type Tab = 'overview' | 'leads' | 'pipeline' | 'quotes' | 'suppliers' | 'partners' | 'settings';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'leads', label: 'Leads', icon: '🎯' },
  { id: 'pipeline', label: 'Pipeline', icon: '🚚' },
  { id: 'quotes', label: 'Quotes & margin', icon: '🧾' },
  { id: 'suppliers', label: 'Suppliers', icon: '🏭' },
  { id: 'partners', label: 'Partners', icon: '🤝' },
  { id: 'settings', label: 'Localization', icon: '🌐' },
];

export function Console() {
  const initial = (window.location.pathname.split('/console/')[1] as Tab) || 'overview';
  const [tab, setTab] = useState<Tab>(TABS.some((t) => t.id === initial) ? initial : 'overview');
  const [tick, setTick] = useState(0);
  const leads = useMemo(() => getLeads(), [tick]);

  return (
    <div className="flex min-h-screen bg-ink-900/[.025]">
      {/* sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-ink-900/[.06] bg-white lg:flex">
        <div className="flex h-16 items-center border-b border-ink-900/[.06] px-5"><Link to="/"><Logo /></Link></div>
        <nav className="flex-1 space-y-1 p-3">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${tab === t.id ? 'bg-brand-50 text-brand-700' : 'text-ink-700/80 hover:bg-ink-900/[.04]'}`}>
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </nav>
        <div className="border-t border-ink-900/[.06] p-3">
          <Link to="/" className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-700/70 hover:bg-ink-900/[.04]">← Back to site</Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* topbar */}
        <header className="flex h-16 items-center justify-between gap-3 border-b border-ink-900/[.06] bg-white px-5">
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-ink-900">Operator console</h1>
            <p className="text-xs text-ink-700/50">Founder view · leads, revenue, pipeline & supply</p>
          </div>
          <div className="flex items-center gap-2">
            <LocaleSwitcher compact />
            <Link to="/audit" className="btn-primary !px-3 !py-2 text-xs">+ New audit</Link>
          </div>
        </header>

        {/* mobile tabs */}
        <div className="flex gap-1 overflow-x-auto border-b border-ink-900/[.06] bg-white px-3 py-2 lg:hidden scrollbar-none">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold ${tab === t.id ? 'bg-brand-50 text-brand-700' : 'text-ink-700/60'}`}>{t.label}</button>
          ))}
        </div>

        <div className="flex-1 overflow-auto p-5 sm:p-7">
          {tab === 'overview' && <Overview leads={leads} />}
          {tab === 'leads' && <Leads leads={leads} onChange={() => setTick((x) => x + 1)} />}
          {tab === 'pipeline' && <Pipeline leads={leads} onChange={() => setTick((x) => x + 1)} />}
          {tab === 'quotes' && <Quotes leads={leads} />}
          {tab === 'suppliers' && <Suppliers />}
          {tab === 'partners' && <PartnersAdmin />}
          {tab === 'settings' && <Settings onReset={() => setTick((x) => x + 1)} />}
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- OVERVIEW ----------------------------- */
function Overview({ leads }: { leads: Lead[] }) {
  const { money } = useLocale();
  const paidStatuses: LeadStatus[] = ['deposit_paid', 'in_delivery', 'completed', 'aftercare'];
  const revenue = leads.filter((l) => paidStatuses.includes(l.status)).reduce((a, l) => a + l.quote.customerTotalUsd, 0);
  const margin = leads.filter((l) => paidStatuses.includes(l.status)).reduce((a, l) => a + l.quote.grossMarginUsd, 0);
  const pipeline = leads.filter((l) => !paidStatuses.includes(l.status)).reduce((a, l) => a + l.quote.customerTotalUsd, 0);
  const hot = leads.filter((l) => l.diagnosis.intentTier === 'hot' || l.diagnosis.intentTier === 'priority');

  // funnel
  const funnel: { stage: string; count: number }[] = [
    { stage: 'Audited', count: leads.length },
    { stage: 'Proposal sent', count: leads.filter((l) => ['proposal_sent', ...paidStatuses].includes(l.status)).length },
    { stage: 'Deposit paid', count: leads.filter((l) => paidStatuses.includes(l.status)).length },
    { stage: 'Completed', count: leads.filter((l) => ['completed', 'aftercare'].includes(l.status)).length },
  ];
  const maxF = Math.max(...funnel.map((f) => f.count), 1);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPI label="Booked revenue" value={money(revenue)} sub="deposit paid +" accent />
        <KPI label="Gross margin (booked)" value={money(margin)} sub={`${revenue ? Math.round((margin / revenue) * 100) : 0}% blended`} />
        <KPI label="Open pipeline" value={money(pipeline)} sub="audited / proposal" />
        <KPI label="High-intent leads" value={`${hot.length}`} sub="hot + priority" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <div className="card p-6">
          <h3 className="text-sm font-bold text-ink-900">Conversion funnel</h3>
          <div className="mt-5 space-y-3">
            {funnel.map((f, i) => (
              <div key={f.stage}>
                <div className="flex justify-between text-sm"><span className="font-semibold text-ink-800">{f.stage}</span><span className="text-ink-700/60">{f.count}{i > 0 && funnel[0].count ? ` · ${Math.round((f.count / funnel[0].count) * 100)}%` : ''}</span></div>
                <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-ink-900/[.06]">
                  <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500" style={{ width: `${(f.count / maxF) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-sm font-bold text-ink-900">High-intent leads to call</h3>
          <div className="mt-4 space-y-3">
            {hot.slice(0, 5).map((l) => (
              <div key={l.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-ink-900">{l.input.email || l.id}</div>
                  <div className="truncate text-xs text-ink-700/60">{labelFor(ROOM_TYPES, l.input.roomType)} · {l.input.city || l.input.country}</div>
                </div>
                <div className="text-right">
                  <TierBadge tier={l.diagnosis.intentTier} />
                  <div className="mt-1 text-xs font-bold text-brand-700">{money(l.quote.customerTotalUsd)}</div>
                </div>
              </div>
            ))}
            {hot.length === 0 && <p className="text-sm text-ink-700/50">No high-intent leads yet. Run audits to populate.</p>}
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-sm font-bold text-ink-900">Revenue by country</h3>
        <RevenueByCountry leads={leads} />
      </div>
    </div>
  );
}

function RevenueByCountry({ leads }: { leads: Lead[] }) {
  const { money } = useLocale();
  const map = new Map<string, number>();
  leads.forEach((l) => {
    const c = l.input.country || 'Unknown';
    map.set(c, (map.get(c) || 0) + l.quote.customerTotalUsd);
  });
  const rows = Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  const max = Math.max(...rows.map((r) => r[1]), 1);
  return (
    <div className="mt-4 space-y-2.5">
      {rows.map(([c, v]) => (
        <div key={c} className="flex items-center gap-3">
          <span className="w-32 shrink-0 truncate text-sm text-ink-800">{c}</span>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-ink-900/[.06]"><div className="h-full rounded-full bg-brand-500" style={{ width: `${(v / max) * 100}%` }} /></div>
          <span className="w-24 shrink-0 text-right text-sm font-semibold text-ink-900">{money(v)}</span>
        </div>
      ))}
    </div>
  );
}

/* ----------------------------- LEADS ----------------------------- */
function Leads({ leads, onChange }: { leads: Lead[]; onChange: () => void }) {
  const { money } = useLocale();
  const [filter, setFilter] = useState<'all' | 'high'>('all');
  const rows = filter === 'high' ? leads.filter((l) => l.diagnosis.opportunityScore >= 65) : leads;
  const sorted = [...rows].sort((a, b) => b.diagnosis.opportunityScore - a.diagnosis.opportunityScore);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-ink-900">Leads board</h2>
        <div className="flex gap-1.5 rounded-xl bg-ink-900/[.04] p-1">
          {(['all', 'high'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize ${filter === f ? 'bg-white text-brand-700 shadow-sm' : 'text-ink-700/60'}`}>{f === 'high' ? 'High-intent' : 'All'}</button>
          ))}
        </div>
      </div>
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-ink-900/[.03] text-left text-xs font-bold uppercase tracking-wider text-ink-700/50">
            <tr>
              <th className="px-4 py-3">Score</th><th className="px-4 py-3">Lead</th><th className="hidden px-4 py-3 md:table-cell">Type</th>
              <th className="hidden px-4 py-3 lg:table-cell">Room</th><th className="px-4 py-3">Value</th><th className="px-4 py-3">Status</th><th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-900/[.06]">
            {sorted.map((l) => (
              <tr key={l.id} className="hover:bg-ink-900/[.02]">
                <td className="px-4 py-3"><span className={`grid h-9 w-9 place-items-center rounded-lg text-xs font-extrabold ${l.diagnosis.opportunityScore >= 80 ? 'bg-accent-500/15 text-accent-600' : l.diagnosis.opportunityScore >= 65 ? 'bg-brand-50 text-brand-700' : 'bg-ink-900/[.06] text-ink-700'}`}>{l.diagnosis.opportunityScore}</span></td>
                <td className="px-4 py-3"><div className="font-semibold text-ink-900">{l.input.email || l.id}</div><div className="text-xs text-ink-700/60">{l.input.city || ''}{l.input.country ? `, ${l.input.country}` : ''}{l.input.contactChannel ? ` · ${l.input.contactChannel}` : ''}</div></td>
                <td className="hidden px-4 py-3 capitalize text-ink-700/80 md:table-cell">{l.input.userType.replace(/_/g, ' ')}</td>
                <td className="hidden px-4 py-3 text-ink-700/80 lg:table-cell">{labelFor(ROOM_TYPES, l.input.roomType)}</td>
                <td className="px-4 py-3 font-semibold text-ink-900">{money(l.quote.customerTotalUsd)}</td>
                <td className="px-4 py-3">
                  <select value={l.status} onChange={(e) => { updateLeadStatus(l.id, e.target.value as LeadStatus); onChange(); }}
                    className="rounded-lg border-0 bg-ink-900/[.04] px-2 py-1.5 text-xs font-semibold ring-1 ring-inset ring-ink-900/10 outline-none focus:ring-brand-500">
                    {(Object.keys(STATUS_LABEL) as LeadStatus[]).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3 text-right"><Link to={`/proposal/${l.id}`} className="text-xs font-semibold text-brand-600 hover:underline">Open →</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ----------------------------- PIPELINE ----------------------------- */
const PIPE_STAGES: LeadStatus[] = ['new', 'audited', 'proposal_sent', 'deposit_paid', 'in_delivery', 'completed', 'aftercare'];

function Pipeline({ leads, onChange }: { leads: Lead[]; onChange: () => void }) {
  const { money } = useLocale();
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-ink-900">Project pipeline</h2>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {PIPE_STAGES.map((stage) => {
          const items = leads.filter((l) => l.status === stage);
          const total = items.reduce((a, l) => a + l.quote.customerTotalUsd, 0);
          return (
            <div key={stage} className="w-64 shrink-0">
              <div className="mb-2 flex items-center justify-between px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-ink-700/60">{STATUS_LABEL[stage]}</span>
                <span className="text-xs font-semibold text-ink-700/50">{items.length}</span>
              </div>
              <div className="space-y-2 rounded-2xl bg-ink-900/[.03] p-2" style={{ minHeight: 120 }}>
                {items.map((l) => (
                  <div key={l.id} className="card p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-ink-900">{labelFor(ROOM_TYPES, l.input.roomType)}</span>
                      <span className="text-xs font-bold text-brand-700">{money(l.quote.customerTotalUsd)}</span>
                    </div>
                    <div className="mt-0.5 truncate text-[11px] text-ink-700/60">{l.input.city || l.input.country} · {l.input.email}</div>
                    <div className="mt-2 flex gap-1">
                      {PIPE_STAGES.indexOf(stage) < PIPE_STAGES.length - 1 && (
                        <button onClick={() => { updateLeadStatus(l.id, PIPE_STAGES[PIPE_STAGES.indexOf(stage) + 1]); onChange(); }} className="rounded-md bg-brand-50 px-2 py-1 text-[10px] font-bold text-brand-700 hover:bg-brand-100">Advance →</button>
                      )}
                    </div>
                  </div>
                ))}
                {items.length > 0 && <div className="px-1 pt-1 text-right text-[11px] font-semibold text-ink-700/50">{money(total)}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ----------------------------- QUOTES & MARGIN ----------------------------- */
function Quotes({ leads }: { leads: Lead[] }) {
  const { money } = useLocale();
  const [band, setBand] = useState<BudgetBand>('standard');
  const [coordPct, setCoordPct] = useState(10);

  // margin simulator on a sample project
  const sample = leads[0];
  const simQuote = sample ? buildQuote(sample.input, band) : null;
  const adjustedTotal = simQuote ? simQuote.customerTotalUsd + Math.round((simQuote.customerTotalUsd * (coordPct - 10)) / 100) : 0;
  const adjustedMargin = simQuote ? simQuote.grossMarginUsd + (adjustedTotal - simQuote.customerTotalUsd) : 0;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-ink-900">Quote management & margin simulator</h2>

      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <div className="card p-6">
          <h3 className="text-sm font-bold text-ink-900">Margin simulator</h3>
          {simQuote ? (
            <>
              <p className="mt-1 text-xs text-ink-700/60">Sample: {sample.input.roomType.replace(/_/g, ' ')} · {sample.input.city || sample.input.country}</p>
              <div className="mt-4 flex gap-1.5 rounded-xl bg-ink-900/[.04] p-1">
                {(['lean', 'standard', 'premium'] as BudgetBand[]).map((b) => (
                  <button key={b} onClick={() => setBand(b)} className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-bold capitalize ${band === b ? 'bg-white text-brand-700 shadow-sm' : 'text-ink-700/60'}`}>{b}</button>
                ))}
              </div>
              <label className="label mt-4">Coordination fee · {coordPct}%</label>
              <input type="range" min={8} max={15} value={coordPct} onChange={(e) => setCoordPct(Number(e.target.value))} className="w-full accent-brand-600" />
              <div className="mt-4 space-y-2 text-sm">
                <Line label="Customer total" value={money(adjustedTotal)} />
                <Line label="Internal cost" value={money(simQuote.costTotalUsd)} muted />
                <Line label="Gross margin" value={money(adjustedMargin)} accent />
                <Line label="Margin %" value={`${Math.round((adjustedMargin / adjustedTotal) * 100)}%`} accent />
              </div>
            </>
          ) : <p className="mt-3 text-sm text-ink-700/50">No leads to simulate.</p>}
        </div>

        <div className="card overflow-hidden p-0">
          <div className="border-b border-ink-900/[.06] px-5 py-3"><h3 className="text-sm font-bold text-ink-900">All quotes (admin margin view)</h3></div>
          <div className="max-h-[420px] overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white text-left text-xs font-bold uppercase tracking-wider text-ink-700/50">
                <tr><th className="px-4 py-2.5">Lead</th><th className="px-4 py-2.5">Total</th><th className="px-4 py-2.5">Cost</th><th className="px-4 py-2.5">Margin</th></tr>
              </thead>
              <tbody className="divide-y divide-ink-900/[.06]">
                {leads.map((l) => (
                  <tr key={l.id}>
                    <td className="px-4 py-2.5"><div className="text-xs font-semibold text-ink-900">{l.id}</div><div className="text-[11px] text-ink-700/50">{l.input.roomType.replace(/_/g, ' ')}</div></td>
                    <td className="px-4 py-2.5 font-semibold text-ink-900">{money(l.quote.customerTotalUsd)}</td>
                    <td className="px-4 py-2.5 text-ink-700/60">{money(l.quote.costTotalUsd)}</td>
                    <td className="px-4 py-2.5"><span className="font-bold text-accent-600">{money(l.quote.grossMarginUsd)}</span> <span className="text-[11px] text-ink-700/50">({l.quote.grossMarginPct}%)</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function Line({ label, value, accent, muted }: { label: string; value: string; accent?: boolean; muted?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-ink-700/60">{label}</span>
      <span className={`font-bold ${accent ? 'text-accent-600' : muted ? 'text-ink-700/60' : 'text-ink-900'}`}>{value}</span>
    </div>
  );
}

/* ----------------------------- SUPPLIERS ----------------------------- */
function Suppliers() {
  const { money } = useLocale();
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-ink-900">Supplier catalog</h2>
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-ink-900/[.03] text-left text-xs font-bold uppercase tracking-wider text-ink-700/50">
            <tr><th className="px-4 py-3">Component</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Cost</th><th className="px-4 py-3">Retail</th><th className="px-4 py-3">Margin</th><th className="px-4 py-3">Lead</th><th className="hidden px-4 py-3 lg:table-cell">Markets</th></tr>
          </thead>
          <tbody className="divide-y divide-ink-900/[.06]">
            {SUPPLIER_COMPONENTS.map((c) => {
              const m = Math.round(((c.retailUsd - c.costUsd) / c.retailUsd) * 100);
              return (
                <tr key={c.id} className="hover:bg-ink-900/[.02]">
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><span className="text-lg">{c.image}</span><span className="font-semibold text-ink-900">{c.name}</span></div></td>
                  <td className="px-4 py-3 text-ink-700/80">{c.category}</td>
                  <td className="px-4 py-3 text-ink-700/60">{money(c.costUsd)}</td>
                  <td className="px-4 py-3 font-semibold text-ink-900">{money(c.retailUsd)}</td>
                  <td className="px-4 py-3"><span className="chip bg-accent-500/15 text-accent-600">{m}%</span></td>
                  <td className="px-4 py-3 text-ink-700/80">{c.leadTimeDays}d</td>
                  <td className="hidden px-4 py-3 text-ink-700/70 lg:table-cell">{c.countries.join(' · ')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ----------------------------- PARTNERS ADMIN ----------------------------- */
function PartnersAdmin() {
  const apps = getPartnerApps();
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-ink-900">Active partners & installers</h2>
        <div className="mt-3 card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-ink-900/[.03] text-left text-xs font-bold uppercase tracking-wider text-ink-700/50">
              <tr><th className="px-4 py-3">Partner</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Area</th><th className="px-4 py-3">Commission</th><th className="px-4 py-3">Projects</th><th className="px-4 py-3">Rating</th></tr>
            </thead>
            <tbody className="divide-y divide-ink-900/[.06]">
              {PARTNERS.map((p) => (
                <tr key={p.id} className="hover:bg-ink-900/[.02]">
                  <td className="px-4 py-3 font-semibold text-ink-900">{p.name}</td>
                  <td className="px-4 py-3 capitalize text-ink-700/80">{p.type}</td>
                  <td className="px-4 py-3 text-ink-700/80">{p.serviceArea}</td>
                  <td className="px-4 py-3 text-ink-700/80">{p.commissionPct}%</td>
                  <td className="px-4 py-3 text-ink-700/80">{p.projects}</td>
                  <td className="px-4 py-3 font-semibold text-ink-900">★ {p.rating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div>
        <h2 className="text-lg font-bold text-ink-900">Partner applications {apps.length > 0 && <span className="text-sm font-normal text-ink-700/50">({apps.length})</span>}</h2>
        {apps.length === 0 ? (
          <p className="mt-3 rounded-xl bg-ink-900/[.03] p-5 text-sm text-ink-700/60">No applications yet. Submit one from the Partners page to see it appear here (stored in your browser).</p>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {apps.map((a) => (
              <div key={a.id} className="card p-4">
                <div className="font-semibold text-ink-900">{a.name}</div>
                <div className="text-xs capitalize text-ink-700/60">{a.type} · {a.serviceArea}</div>
                <div className="mt-2 text-xs text-ink-700/70">{a.skills}</div>
                <div className="mt-2 text-xs text-brand-600">{a.email}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ----------------------------- SETTINGS ----------------------------- */
function Settings({ onReset }: { onReset: () => void }) {
  const waitlist = getWaitlist();
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-ink-900">Country & localization settings</h2>
      <div className="card p-6">
        <p className="text-sm text-ink-700/80">Use the locale switcher (top-right) to preview the console in any of the 9 supported languages and currencies. In production these settings drive per-market pricing, taxes, units and supplier availability.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[['Languages', '9'], ['Currencies', '8'], ['Unit systems', '2 (metric / imperial)']].map(([k, v]) => (
            <div key={k} className="rounded-xl bg-ink-900/[.03] p-4"><div className="text-xs uppercase tracking-wider text-ink-700/50">{k}</div><div className="text-xl font-extrabold text-ink-900">{v}</div></div>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-sm font-bold text-ink-900">Captured emails & waitlist {waitlist.length > 0 && <span className="font-normal text-ink-700/50">({waitlist.length})</span>}</h3>
        {waitlist.length === 0 ? (
          <p className="mt-2 text-sm text-ink-700/60">No captures yet. Email forms across the site write here.</p>
        ) : (
          <div className="mt-3 max-h-60 overflow-auto rounded-xl ring-1 ring-ink-900/[.06]">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-ink-900/[.06]">
                {waitlist.map((w) => (
                  <tr key={w.id}><td className="px-4 py-2.5 font-semibold text-ink-900">{w.email}</td><td className="px-4 py-2.5 text-xs capitalize text-ink-700/60">{w.kind}{w.meta ? ` · ${w.meta}` : ''}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card border border-rose-200 bg-rose-50/40 p-6">
        <h3 className="text-sm font-bold text-rose-700">Demo data</h3>
        <p className="mt-1 text-sm text-ink-700/70">Reset all local leads, waitlist and partner applications back to seed data.</p>
        <button onClick={() => { resetDemoData(); onReset(); }} className="btn mt-3 bg-rose-600 text-white hover:bg-rose-700">Reset demo data</button>
      </div>
    </div>
  );
}

/* ----------------------------- shared ----------------------------- */
function KPI({ label, value, sub, accent }: { label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <div className="card p-5">
      <div className="text-xs font-semibold uppercase tracking-wider text-ink-700/50">{label}</div>
      <div className={`mt-1.5 text-2xl font-extrabold ${accent ? 'text-brand-600' : 'text-ink-900'}`}>{value}</div>
      <div className="mt-0.5 text-xs text-ink-700/50">{sub}</div>
    </div>
  );
}
