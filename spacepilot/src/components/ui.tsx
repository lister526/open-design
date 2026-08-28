import type { ReactNode } from 'react';
import type { Diagnosis, LeadStatus } from '../lib/types';

export function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const r = size / 2 - 8;
  const c = 2 * Math.PI * r;
  const dash = (score / 100) * c;
  const color = score >= 80 ? '#11c9a6' : score >= 65 ? '#2466ff' : score >= 45 ? '#f59e0b' : '#94a3b8';
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#e8edf5" strokeWidth="8" fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth="8" fill="none"
          strokeLinecap="round" strokeDasharray={`${dash} ${c}`}
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-3xl font-extrabold text-ink-900">{score}</div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-ink-700/50">/ 100</div>
      </div>
    </div>
  );
}

const TIER_STYLE: Record<Diagnosis['intentTier'], string> = {
  priority: 'bg-accent-500/15 text-accent-600',
  hot: 'bg-rose-500/12 text-rose-600',
  warm: 'bg-amber-500/15 text-amber-600',
  cold: 'bg-ink-900/[.06] text-ink-700',
};

export function TierBadge({ tier }: { tier: Diagnosis['intentTier'] }) {
  return <span className={`chip capitalize ${TIER_STYLE[tier]}`}>{tier === 'priority' ? '★ priority lead' : `${tier} lead`}</span>;
}

const STATUS_LABEL: Record<LeadStatus, string> = {
  new: 'New lead', audited: 'Audited', proposal_sent: 'Proposal sent',
  deposit_paid: 'Deposit paid', in_delivery: 'In delivery', completed: 'Completed', aftercare: 'Aftercare',
};
const STATUS_STYLE: Record<LeadStatus, string> = {
  new: 'bg-ink-900/[.06] text-ink-700',
  audited: 'bg-sky-500/12 text-sky-700',
  proposal_sent: 'bg-brand-500/12 text-brand-700',
  deposit_paid: 'bg-accent-500/15 text-accent-600',
  in_delivery: 'bg-violet-500/12 text-violet-700',
  completed: 'bg-emerald-500/12 text-emerald-700',
  aftercare: 'bg-amber-500/15 text-amber-700',
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return <span className={`chip ${STATUS_STYLE[status]}`}>{STATUS_LABEL[status]}</span>;
}
export { STATUS_LABEL };

export function SectionHeader({ eyebrow, title, subtitle, center }: {
  eyebrow?: string; title: string; subtitle?: string; center?: boolean;
}) {
  return (
    <div className={`max-w-2xl ${center ? 'mx-auto text-center' : ''}`}>
      {eyebrow && <p className="section-eyebrow">{eyebrow}</p>}
      <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-3 text-lg leading-relaxed text-ink-700/80">{subtitle}</p>}
    </div>
  );
}

export function Stat({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <div>
      <div className={`text-2xl font-extrabold ${accent ? 'text-brand-600' : 'text-ink-900'}`}>{value}</div>
      <div className="mt-0.5 text-sm text-ink-700/70">{label}</div>
    </div>
  );
}
