'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  LayoutDashboard, Users, Package, Handshake, TrendingUp, DollarSign,
  Target, Percent, ArrowRight, Search, RotateCcw, Sliders, Truck, Camera,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, Select } from '@/components/ui/primitives';
import { StatusBadge, GradeBadge, STATUS_LABEL } from '@/components/ui/shared';
import { Logo } from '@/components/layout/Logo';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { LocaleSwitcher } from '@/components/layout/LocaleSwitcher';
import { useMoney } from '@/store/prefs';
import { useData } from '@/store/data';
import { buildQuote, recommendUpgradeKit } from '@/lib/engine';
import { SUPPLIERS, PARTNERS } from '@/lib/seed';
import { BANDS, labelOf, USER_TYPES } from '@/lib/options';
import type { Band, Lead, LeadStatus } from '@/lib/types';
import { cn } from '@/lib/cn';

type Tab = 'overview' | 'pipeline' | 'leads' | 'suppliers' | 'partners' | 'margin';
const PIPELINE: LeadStatus[] = ['scanned', 'audited', 'paid_audit', 'proposal_sent', 'deposit_paid', 'in_delivery', 'completed'];

function quoteOf(lead: Lead) {
  const kit = recommendUpgradeKit(lead.input, lead.passport.leak, lead.input.band);
  return buildQuote(kit, lead.input.band);
}
const projectValue = (l: Lead) => quoteOf(l).customerTotalUsd;
const feeValue = (l: Lead) => quoteOf(l).platformFeeUsd;

export function Console() {
  const params = useSearchParams();
  const detail = params.get('demo') === '1' || params.get('admin') === '1';
  const money = useMoney();
  const { leads, partnerApps, waitlist, setStatus, reset } = useData();
  const [tab, setTab] = useState<Tab>('overview');

  const stats = useMemo(() => {
    const weighted: Record<LeadStatus, number> = {
      new: 0.04, scanned: 0.06, audited: 0.12, paid_audit: 0.3, proposal_sent: 0.5, deposit_paid: 0.85, in_delivery: 0.95, completed: 1,
    };
    let weightedProject = 0, weightedMargin = 0;
    for (const l of leads) { const q = quoteOf(l); weightedProject += q.customerTotalUsd * weighted[l.status]; weightedMargin += q.marginUsd * weighted[l.status]; }
    const scans = leads.length;
    const paidAudits = leads.filter((l) => l.paidAudit).length;
    const proposals = leads.filter((l) => ['proposal_sent', 'deposit_paid', 'in_delivery', 'completed'].includes(l.status)).length;
    const deposits = leads.filter((l) => ['deposit_paid', 'in_delivery', 'completed'].includes(l.status)).length;
    const completed = leads.filter((l) => l.status === 'completed');
    const avgProject = leads.length ? Math.round(leads.reduce((a, l) => a + projectValue(l), 0) / leads.length) : 0;
    const marginPct = leads.length ? Math.round(leads.reduce((a, l) => a + quoteOf(l).marginPct, 0) / leads.length) : 0;
    const slaScore = Math.round(PARTNERS.reduce((a, p) => a + p.ledger.trustScore, 0) / PARTNERS.length);
    const baTrack = leads.length ? Math.round((completed.length / leads.length) * 100) : 0;
    return {
      scans, paidAudits, proposals, deposits, avgProject, marginPct, slaScore, baTrack,
      weightedProject: Math.round(weightedProject), weightedMargin: Math.round(weightedMargin),
      proposalConv: paidAudits ? Math.round((proposals / paidAudits) * 100) : 0,
      depositConv: proposals ? Math.round((deposits / proposals) * 100) : 0,
    };
  }, [leads]);

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/"><Logo /></Link>
            <span className="hidden rounded-full bg-accent/15 px-2.5 py-1 text-xs font-bold text-accent sm:inline">Demo founder console</span>
          </div>
          <div className="flex items-center gap-2">
            {detail && <Button variant="ghost" size="sm" onClick={() => { if (confirm('Reset all demo data?')) reset(); }}><RotateCcw className="h-4 w-4" /> Reset</Button>}
            <ThemeToggle /><LocaleSwitcher />
          </div>
        </div>
      </header>

      <div className="container py-8">
        {!detail && (
          <Card className="mb-6 flex flex-col items-start gap-3 border-accent/30 bg-accent/5 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-bold">Demo / admin console</p>
              <p className="text-sm text-muted-foreground">This is an internal demo view. Append <code className="rounded bg-muted px-1.5 py-0.5 text-xs">?demo=1</code> (or <code className="rounded bg-muted px-1.5 py-0.5 text-xs">?admin=1</code>) to unlock full pipeline detail.</p>
            </div>
            <Link href="/console?demo=1"><Button variant="accent" size="sm">Open demo detail <ArrowRight className="h-4 w-4" /></Button></Link>
          </Card>
        )}

        {/* KPIs always visible */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi icon={<Search className="h-4 w-4" />} label="Free scans" value={String(stats.scans)} sub="Top-of-funnel" />
          <Kpi icon={<DollarSign className="h-4 w-4" />} label="Paid audits" value={String(stats.paidAudits)} sub="$149 each" />
          <Kpi icon={<Target className="h-4 w-4" />} label="Proposal conversion" value={`${stats.proposalConv}%`} sub="Audit → proposal" />
          <Kpi icon={<Percent className="h-4 w-4" />} label="Deposit conversion" value={`${stats.depositConv}%`} sub="Proposal → deposit" accent />
          <Kpi icon={<TrendingUp className="h-4 w-4" />} label="Avg project value" value={money(stats.avgProject)} sub="All leads" />
          <Kpi icon={<Sliders className="h-4 w-4" />} label="Weighted project margin" value={money(stats.weightedMargin)} sub={`~${stats.marginPct}% blended`} />
          <Kpi icon={<Truck className="h-4 w-4" />} label="Supplier SLA score" value={`${stats.slaScore}/100`} sub="Trust-weighted" />
          <Kpi icon={<Camera className="h-4 w-4" />} label="Before/after coverage" value={`${stats.baTrack}%`} sub="Completed & logged" />
        </div>

        {detail && (
          <>
            <div className="scrollbar-none my-6 flex gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1">
              {([
                ['overview', 'Overview', LayoutDashboard], ['pipeline', 'Pipeline', Target], ['leads', 'Leads', Users],
                ['suppliers', 'SKU library', Package], ['partners', 'Partners', Handshake], ['margin', 'Margin lab', Sliders],
              ] as [Tab, string, any][]).map(([key, label, Icon]) => (
                <button key={key} onClick={() => setTab(key)}
                  className={cn('flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition', tab === key ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground')}>
                  <Icon className="h-4 w-4" />{label}
                </button>
              ))}
            </div>

            {tab === 'overview' && <Overview stats={stats} money={money} leads={leads} waitlist={waitlist} />}
            {tab === 'pipeline' && <Pipeline leads={leads} money={money} setStatus={setStatus} />}
            {tab === 'leads' && <Leads leads={leads} money={money} setStatus={setStatus} />}
            {tab === 'suppliers' && <Suppliers money={money} />}
            {tab === 'partners' && <PartnersTab apps={partnerApps} />}
            {tab === 'margin' && <MarginLab money={money} />}
          </>
        )}
      </div>
    </div>
  );
}

function Kpi({ icon, label, value, sub, accent }: any) {
  return (
    <Card className={cn('p-5', accent && 'border-accent/20 bg-accent/5')}>
      <div className={cn('flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider', accent ? 'text-accent' : 'text-muted-foreground')}>{icon}{label}</div>
      <div className={cn('font-display mt-2 text-2xl font-semibold', accent && 'text-accent')}>{value}</div>
      <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>
    </Card>
  );
}

/* ----------------------------- OVERVIEW ----------------------------- */
function Overview({ stats, money, leads, waitlist }: any) {
  const top = [...leads].sort((a: Lead, b: Lead) => projectValue(b) - projectValue(a)).slice(0, 5);
  return (
    <div className="space-y-6">
      {waitlist && waitlist.length > 0 && (
        <Card className="flex items-center justify-between gap-3 border-accent/20 bg-accent/5 p-5">
          <div>
            <h2 className="text-lg font-bold">City launch waitlist <span className="text-accent">({waitlist.length})</span></h2>
            <p className="text-sm text-muted-foreground">Inbound demand by market — prioritize launch cities by signup density.</p>
          </div>
          <div className="hidden flex-wrap justify-end gap-1.5 sm:flex">
            {waitlist.slice(0, 6).map((w: any) => (
              <span key={w.id} className="rounded-full bg-card px-2.5 py-1 text-xs font-semibold text-muted-foreground">{w.meta || w.email}</span>
            ))}
          </div>
        </Card>
      )}
      <Card className="p-6">
        <h2 className="text-lg font-bold">Conversion funnel</h2>
        <div className="mt-5 space-y-3">
          {[
            ['Free scans', stats.scans, 'bg-muted-foreground/40'],
            ['Paid audits ($149)', stats.paidAudits, 'bg-primary'],
            ['Proposals sent', stats.proposals, 'bg-violet-500'],
            ['Deposits locked', stats.deposits, 'bg-accent'],
          ].map(([label, n, color]: any) => (
            <div key={label} className="flex items-center gap-3">
              <span className="w-40 shrink-0 text-sm font-medium">{label}</span>
              <div className="h-7 flex-1 overflow-hidden rounded-lg bg-muted">
                <div className={cn('flex h-full items-center justify-end rounded-lg px-2 text-xs font-bold text-white transition-all', color)} style={{ width: `${Math.max(8, (n / Math.max(1, stats.scans)) * 100)}%` }}>{n}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="border-b border-border p-5"><h2 className="text-lg font-bold">Top leads by project value</h2></div>
        <div className="divide-y divide-border">
          {top.map((l: Lead) => (
            <Link key={l.id} href={`/proposal/${l.id}`} className="flex items-center justify-between gap-3 px-5 py-3.5 transition hover:bg-muted/40">
              <div className="min-w-0">
                <div className="flex items-center gap-2"><span className="truncate text-sm font-bold">{l.input.city || l.input.country}</span><GradeBadge grade={l.passport.leak.grade} /></div>
                <div className="truncate text-xs text-muted-foreground">{labelOf(USER_TYPES as any, l.input.userType)} · {l.input.email}</div>
              </div>
              <div className="flex items-center gap-3 text-right">
                <div><div className="text-sm font-extrabold">{money(projectValue(l))}</div><div className="text-xs text-accent">fee {money(feeValue(l))}</div></div>
                <StatusBadge status={l.status} />
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ----------------------------- PIPELINE (kanban) ----------------------------- */
function Pipeline({ leads, money, setStatus }: any) {
  return (
    <div className="scrollbar-none flex gap-4 overflow-x-auto pb-4">
      {PIPELINE.map((status) => {
        const col = leads.filter((l: Lead) => l.status === status);
        const colValue = col.reduce((a: number, l: Lead) => a + projectValue(l), 0);
        return (
          <div key={status} className="w-72 shrink-0">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-bold">{STATUS_LABEL[status]}</span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">{col.length} · {money(colValue)}</span>
            </div>
            <div className="space-y-2.5">
              {col.map((l: Lead) => {
                const idx = PIPELINE.indexOf(l.status);
                return (
                  <Card key={l.id} className="p-3.5">
                    <div className="flex items-center justify-between gap-2"><span className="truncate text-sm font-bold">{l.input.city || l.input.country}</span><span className="shrink-0 text-xs font-bold tabular-nums text-muted-foreground">{l.passport.leak.score}</span></div>
                    <div className="mt-1 truncate text-xs text-muted-foreground">{labelOf(USER_TYPES as any, l.input.userType)}</div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm font-extrabold">{money(projectValue(l))}</span>
                      <span className="text-xs font-semibold text-accent">fee {money(feeValue(l))}</span>
                    </div>
                    <div className="mt-3 flex items-center gap-1.5">
                      <Button variant="outline" size="sm" className="h-7 px-2 text-xs" disabled={idx <= 0} onClick={() => setStatus(l.id, PIPELINE[idx - 1])}>←</Button>
                      <Link href={`/proposal/${l.id}`} className="flex-1"><Button variant="ghost" size="sm" className="h-7 w-full px-2 text-xs">Open</Button></Link>
                      <Button size="sm" className="h-7 px-2 text-xs" disabled={idx >= PIPELINE.length - 1} onClick={() => setStatus(l.id, PIPELINE[idx + 1])}>→</Button>
                    </div>
                  </Card>
                );
              })}
              {col.length === 0 && <div className="rounded-xl border border-dashed border-border py-6 text-center text-xs text-muted-foreground">Empty</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ----------------------------- LEADS table ----------------------------- */
function Leads({ leads, money, setStatus }: any) {
  const [q, setQ] = useState('');
  const filtered = leads.filter((l: Lead) => `${l.input.city} ${l.input.country} ${l.input.email} ${l.id}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center gap-3 border-b border-border p-4">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search leads by city, email, ID…" className="w-full bg-transparent text-sm outline-none" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            <th className="px-4 py-2.5">Lead</th><th className="px-4 py-2.5">Type</th><th className="px-4 py-2.5">Leak</th>
            <th className="px-4 py-2.5 text-right">Project</th><th className="px-4 py-2.5 text-right">Fee</th><th className="px-4 py-2.5">Status</th><th className="px-4 py-2.5"></th>
          </tr></thead>
          <tbody className="divide-y divide-border">
            {filtered.map((l: Lead) => (
              <tr key={l.id} className="transition hover:bg-muted/30">
                <td className="px-4 py-3"><div className="font-bold">{l.input.city || l.input.country}</div><div className="text-xs text-muted-foreground">{l.input.email}</div></td>
                <td className="px-4 py-3 text-muted-foreground">{labelOf(USER_TYPES as any, l.input.userType)}</td>
                <td className="px-4 py-3"><span className="font-bold tabular-nums">{l.passport.leak.score}</span></td>
                <td className="px-4 py-3 text-right font-extrabold">{money(projectValue(l))}</td>
                <td className="px-4 py-3 text-right font-semibold text-accent">{money(feeValue(l))}</td>
                <td className="px-4 py-3">
                  <Select value={l.status} onChange={(e) => setStatus(l.id, e.target.value as LeadStatus)} className="h-8 w-36 text-xs">
                    {PIPELINE.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                  </Select>
                </td>
                <td className="px-4 py-3 text-right"><Link href={`/proposal/${l.id}`} className="text-accent hover:underline">Open</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/* ----------------------------- SKU LIBRARY ----------------------------- */
function Suppliers({ money }: any) {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const cats = ['all', ...Array.from(new Set(SUPPLIERS.map((s) => s.category)))];
  const list = SUPPLIERS.filter((s) => (cat === 'all' || s.category === cat) && `${s.name} ${s.useCase}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-input bg-background px-3"><Search className="h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search components…" className="h-11 w-full bg-transparent text-sm outline-none" /></div>
        <Select value={cat} onChange={(e) => setCat(e.target.value)} className="sm:w-48">{cats.map((c) => <option key={c} value={c}>{c === 'all' ? 'All categories' : c}</option>)}</Select>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {list.map((s) => {
          const margin = s.retailUsd - s.costUsd;
          return (
            <Card key={s.id} className="p-5">
              <div className="flex items-start justify-between"><div className="text-2xl">{s.emoji}</div><span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">{s.category}</span></div>
              <h3 className="mt-3 font-bold leading-snug">{s.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.useCase}</p>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <Stat label="Cost" value={money(s.costUsd)} /><Stat label="Retail" value={money(s.retailUsd)} /><Stat label="Margin" value={money(margin)} accent />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground"><span>{s.leadTimeDays}d · {s.install} install</span><span>{s.markets.join(' ')}</span></div>
              <p className="mt-2 text-[11px] text-muted-foreground">⚠ {s.compliance}</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
function Stat({ label, value, accent }: any) {
  return <div className={cn('rounded-lg border p-2', accent ? 'border-accent/20 bg-accent/5' : 'border-border bg-muted/30')}>
    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div><div className={cn('text-sm font-extrabold', accent && 'text-accent')}>{value}</div></div>;
}

/* ----------------------------- PARTNERS ----------------------------- */
function PartnersTab({ apps }: any) {
  return (
    <div className="space-y-6">
      {apps.length > 0 && (
        <Card className="p-5">
          <h2 className="text-lg font-bold">New partner applications <span className="text-accent">({apps.length})</span></h2>
          <div className="mt-3 divide-y divide-border">
            {apps.map((a: any) => (
              <div key={a.id} className="flex items-center justify-between py-3">
                <div><div className="font-bold">{a.name} <span className="text-xs font-normal text-muted-foreground">· {a.type}</span></div><div className="text-xs text-muted-foreground">{a.area} · {a.skills} · {a.email}</div></div>
                <span className="rounded-full bg-warning/15 px-2.5 py-1 text-xs font-semibold text-warning">Review</span>
              </div>
            ))}
          </div>
        </Card>
      )}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {PARTNERS.map((p) => (
          <Card key={p.id} className="p-5">
            <div className="flex items-start justify-between">
              <div><h3 className="font-bold">{p.name}</h3><div className="text-xs capitalize text-muted-foreground">{p.type} · {p.area}</div></div>
              <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold capitalize', p.status === 'verified' ? 'bg-revenue/15 revenue-text' : 'bg-muted text-muted-foreground')}>{p.status}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">{p.skills.map((s) => <span key={s} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{s}</span>)}</div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
              <div><div className="font-extrabold">{p.ledger.trustScore}</div><div className="text-[10px] uppercase text-muted-foreground">Trust</div></div>
              <div><div className="font-extrabold">{p.ledger.onTimeRatePct}%</div><div className="text-[10px] uppercase text-muted-foreground">On-time</div></div>
              <div><div className="font-extrabold text-accent">{p.commissionPct}%</div><div className="text-[10px] uppercase text-muted-foreground">Comm.</div></div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------- MARGIN LAB ----------------------------- */
function MarginLab({ money }: any) {
  const [band, setBand] = useState<Band>('standard');
  const [volume, setVolume] = useState(20);
  const kit = recommendUpgradeKit({ city: '', country: '', propertyType: 'one_bed', adrUsd: 160, occupancyPct: 68, sizeSqm: 40, photoQuality: 'average', goal: 'higher_adr' }, { score: 58, grade: 'leaking', leaks: [], topLeaks: [] } as any, band);
  const quote = buildQuote(kit, band);
  const perProjectMargin = quote.marginUsd;
  const monthlyMargin = perProjectMargin * volume;
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <Card className="p-6">
        <div className="flex items-center gap-2"><Sliders className="h-4 w-4 text-accent" /><h2 className="text-lg font-bold">Margin simulator</h2></div>
        <p className="mt-1 text-sm text-muted-foreground">Model unit economics across volume and budget bands.</p>
        <div className="mt-6 space-y-5">
          <div><label className="mb-1.5 block text-sm font-semibold">Budget band</label><Select value={band} onChange={(e) => setBand(e.target.value as Band)}>{BANDS.map((b) => <option key={b.value} value={b.value}>{b.label} — {b.hint}</option>)}</Select></div>
          <div><label className="mb-1.5 block text-sm font-semibold">Projects / month · {volume}</label><input type="range" min={1} max={120} value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="h-2 w-full cursor-pointer rounded-full bg-muted accent-accent" /></div>
        </div>
      </Card>
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Kpi icon={<DollarSign className="h-4 w-4" />} label="Avg project price" value={money(quote.customerTotalUsd)} sub={`${kit.name}`} accent />
          <Kpi icon={<Percent className="h-4 w-4" />} label="Margin per project" value={`${money(perProjectMargin)} · ${quote.marginPct}%`} sub="After cost & fee" />
          <Kpi icon={<TrendingUp className="h-4 w-4" />} label="Monthly gross margin" value={money(monthlyMargin)} sub={`${volume} projects`} />
          <Kpi icon={<Target className="h-4 w-4" />} label="Annualized" value={money(monthlyMargin * 12)} sub="At steady state" />
        </div>
        <Card className="p-6">
          <h3 className="font-bold">Coordination fee contribution</h3>
          <p className="mt-1 text-sm text-muted-foreground">Platform fee alone: <span className="font-extrabold text-accent">{money(quote.platformFeeUsd * volume)}</span>/mo across {volume} projects.</p>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-accent" style={{ width: `${Math.min(100, (quote.platformFeeUsd / quote.marginUsd) * 100)}%` }} /></div>
          <p className="mt-2 text-xs text-muted-foreground">{Math.round((quote.platformFeeUsd / quote.marginUsd) * 100)}% of margin comes from the coordination fee — the scalable, asset-light layer.</p>
        </Card>
      </div>
    </div>
  );
}
