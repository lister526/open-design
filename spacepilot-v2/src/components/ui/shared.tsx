'use client';
import { Eyebrow } from './primitives';
import type { LeadStatus, RevenueLeakScore, LeakItem } from '@/lib/types';
import { LEAK_LABEL } from '@/lib/engine';
import { cn } from '@/lib/cn';

export type LeadTier = 'cold' | 'warm' | 'hot' | 'priority';

export function SectionHead({ eyebrow, title, subtitle, center }: { eyebrow?: string; title: string; subtitle?: string; center?: boolean }) {
  return (
    <div className={cn('max-w-2xl', center && 'mx-auto text-center')}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="font-display mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-[2.6rem] sm:leading-[1.08]">{title}</h2>
      {subtitle && <p className="mt-3.5 text-lg leading-relaxed text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

/* Revenue leak score ring — higher score = more leakage = more amber.
 * (This is an opportunity gauge, not a quality grade.) */
export function ScoreRing({ score, size = 132, label = 'leak / 100' }: { score: number; size?: number; label?: string }) {
  const r = size / 2 - 9;
  const c = 2 * Math.PI * r;
  const dash = (score / 100) * c;
  const color = score >= 70 ? 'hsl(var(--danger))' : score >= 50 ? 'hsl(var(--accent))' : score >= 32 ? 'hsl(var(--warning))' : 'hsl(var(--revenue))';
  return (
    <div className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="hsl(var(--muted))" strokeWidth="9" fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth="9" fill="none" strokeLinecap="round" strokeDasharray={`${dash} ${c}`} className="transition-all duration-700" />
      </svg>
      <div className="absolute text-center">
        <div className="font-display text-4xl font-semibold tabular-nums">{score}</div>
        <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

const GRADE: Record<RevenueLeakScore['grade'], { cls: string; label: string }> = {
  critical: { cls: 'bg-danger/12 text-danger', label: 'Critical leakage' },
  leaking: { cls: 'bg-accent/15 text-accent', label: 'Leaking revenue' },
  tuning: { cls: 'bg-warning/15 text-warning', label: 'Needs tuning' },
  optimized: { cls: 'bg-revenue/15 text-revenue', label: 'Well optimized' },
};
export function GradeBadge({ grade }: { grade: RevenueLeakScore['grade'] }) {
  const g = GRADE[grade];
  return <span className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold', g.cls)}>{g.label}</span>;
}

const TIER: Record<LeadTier, string> = {
  priority: 'bg-accent/15 text-accent',
  hot: 'bg-danger/12 text-danger',
  warm: 'bg-warning/15 text-warning',
  cold: 'bg-muted text-muted-foreground',
};
export function TierBadge({ tier }: { tier: LeadTier }) {
  return <span className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold capitalize', TIER[tier])}>{tier === 'priority' ? '★ priority lead' : `${tier} lead`}</span>;
}

/* Horizontal leak map across the 7 categories */
export function LeakMap({ leaks, compact }: { leaks: LeakItem[]; compact?: boolean }) {
  return (
    <div className={cn('space-y-2.5', compact && 'space-y-2')}>
      {leaks.map((l) => {
        const color = l.severity >= 65 ? 'bg-danger' : l.severity >= 45 ? 'bg-accent' : l.severity >= 28 ? 'bg-warning' : 'bg-revenue';
        return (
          <div key={l.category} className="flex items-center gap-3">
            <span className={cn('shrink-0 text-right text-xs font-semibold text-muted-foreground', compact ? 'w-28' : 'w-36')}>{LEAK_LABEL[l.category]}</span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div className={cn('h-full rounded-full transition-all duration-700', color)} style={{ width: `${l.severity}%` }} />
            </div>
            <span className="w-8 shrink-0 text-right text-xs font-bold tabular-nums">{l.severity}</span>
          </div>
        );
      })}
    </div>
  );
}

export const STATUS_LABEL: Record<LeadStatus, string> = {
  new: 'New', scanned: 'Free scan', audited: 'Audited', paid_audit: 'Paid audit', proposal_sent: 'Proposal sent',
  deposit_paid: 'Deposit paid', in_delivery: 'In delivery', completed: 'Completed',
};
const STATUS_STYLE: Record<LeadStatus, string> = {
  new: 'bg-muted text-muted-foreground',
  scanned: 'bg-muted text-muted-foreground',
  audited: 'bg-sky-500/12 text-sky-600 dark:text-sky-400',
  paid_audit: 'bg-primary/12 text-primary',
  proposal_sent: 'bg-violet-500/12 text-violet-600 dark:text-violet-400',
  deposit_paid: 'bg-accent/15 text-accent',
  in_delivery: 'bg-warning/15 text-warning',
  completed: 'bg-revenue/15 text-revenue',
};
export function StatusBadge({ status }: { status: LeadStatus }) {
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold', STATUS_STYLE[status])}>{STATUS_LABEL[status]}</span>;
}
