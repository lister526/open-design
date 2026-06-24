'use client';
import { Eyebrow } from './primitives';
import type { Diagnosis, LeadStatus } from '@/lib/types';
import { cn } from '@/lib/cn';

export function SectionHead({ eyebrow, title, subtitle, center }: { eyebrow?: string; title: string; subtitle?: string; center?: boolean }) {
  return (
    <div className={cn('max-w-2xl', center && 'mx-auto text-center')}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="mt-2.5 text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-3.5 text-lg leading-relaxed text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

export function ScoreRing({ score, size = 132 }: { score: number; size?: number }) {
  const r = size / 2 - 9;
  const c = 2 * Math.PI * r;
  const dash = (score / 100) * c;
  const color = score >= 80 ? 'hsl(var(--accent))' : score >= 65 ? 'hsl(var(--primary))' : score >= 45 ? 'hsl(var(--warning))' : 'hsl(var(--muted-foreground))';
  return (
    <div className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="hsl(var(--muted))" strokeWidth="9" fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth="9" fill="none" strokeLinecap="round" strokeDasharray={`${dash} ${c}`} className="transition-all duration-700" />
      </svg>
      <div className="absolute text-center">
        <div className="text-4xl font-extrabold">{score}</div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">/ 100</div>
      </div>
    </div>
  );
}

const TIER: Record<Diagnosis['tier'], string> = {
  priority: 'bg-accent/15 text-accent',
  hot: 'bg-danger/12 text-danger',
  warm: 'bg-warning/15 text-warning',
  cold: 'bg-muted text-muted-foreground',
};
export function TierBadge({ tier }: { tier: Diagnosis['tier'] }) {
  return <span className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold capitalize', TIER[tier])}>{tier === 'priority' ? '★ priority lead' : `${tier} lead`}</span>;
}

export const STATUS_LABEL: Record<LeadStatus, string> = {
  new: 'New', audited: 'Audited', paid_audit: 'Paid audit', proposal_sent: 'Proposal sent',
  deposit_paid: 'Deposit paid', in_delivery: 'In delivery', completed: 'Completed',
};
const STATUS_STYLE: Record<LeadStatus, string> = {
  new: 'bg-muted text-muted-foreground',
  audited: 'bg-sky-500/12 text-sky-600 dark:text-sky-400',
  paid_audit: 'bg-primary/12 text-primary',
  proposal_sent: 'bg-violet-500/12 text-violet-600 dark:text-violet-400',
  deposit_paid: 'bg-accent/15 text-accent',
  in_delivery: 'bg-warning/15 text-warning',
  completed: 'bg-success/15 text-success',
};
export function StatusBadge({ status }: { status: LeadStatus }) {
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold', STATUS_STYLE[status])}>{STATUS_LABEL[status]}</span>;
}
