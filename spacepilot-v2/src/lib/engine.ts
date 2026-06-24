import type { AuditInput, Band, Diagnosis, Goal, Quote, QuoteLine, RoiScenario, RoomType } from './types';

/* ---------------- ROI calculator (used on landing + audit) ---------------- */
// Scenario-based, compliant. Refreshed short-stay listings typically support
// an ADR uplift; we model a conservative band by budget tier.
const ADR_UPLIFT: Record<Band, number> = { lean: 0.06, standard: 0.11, premium: 0.18 };

export function computeRoi(input: {
  nightlyRateUsd: number; occupancyPct: number; band: Band; projectMidUsd: number;
}): RoiScenario {
  const adrUpliftPct = ADR_UPLIFT[input.band];
  const nightsPerMonth = 30 * (input.occupancyPct / 100);
  const monthlyUpliftUsd = Math.round(input.nightlyRateUsd * adrUpliftPct * nightsPerMonth);
  const annualUpliftUsd = monthlyUpliftUsd * 12;
  const paybackMonths = monthlyUpliftUsd > 0 ? Math.max(1, Math.round(input.projectMidUsd / monthlyUpliftUsd)) : 0;
  return { monthlyUpliftUsd, annualUpliftUsd, paybackMonths, adrUpliftPct };
}

/* ---------------- Project estimate ---------------- */
const PER_SQM: Record<Band, [number, number]> = {
  lean: [95, 190], standard: [190, 380], premium: [380, 760],
};
const ROOM_FACTOR: Record<RoomType, number> = {
  studio: 1.1, one_bed: 1.2, two_bed: 1.45, living: 1.0, bedroom: 0.85,
  kitchen: 1.6, bathroom: 1.5, whole_unit: 1.35,
};

export function estimateProject(input: Pick<AuditInput, 'band' | 'roomType' | 'sizeSqm'>) {
  const [lo, hi] = PER_SQM[input.band];
  const f = ROOM_FACTOR[input.roomType] ?? 1;
  const size = Math.max(8, input.sizeSqm);
  const low = Math.max(900, Math.round((lo * size * f) / 50) * 50);
  const high = Math.max(1800, Math.round((hi * size * f) / 50) * 50);
  return { low, high, mid: Math.round((low + high) / 2) };
}

/* ---------------- Lead scoring ---------------- */
export function scoreLead(i: AuditInput): { score: number; tier: Diagnosis['tier'] } {
  let s = 28;
  const ut: Record<string, number> = { bnb_host: 26, str_landlord: 25, operator: 24, agent: 16, designer: 14, contractor: 13, homeowner: 10 };
  s += ut[i.userType] ?? 10;
  const tl: Record<string, number> = { asap: 20, '1_3m': 14, '3_6m': 6, exploring: 0 };
  s += tl[i.timeline] ?? 0;
  const bb: Record<Band, number> = { lean: 4, standard: 10, premium: 16 };
  s += bb[i.band];
  if (i.goals.includes('higher_adr')) s += 6;
  if (i.goals.includes('premium_tier')) s += 4;
  if (i.nightlyRateUsd >= 150) s += 6;
  if (i.occupancyPct >= 65) s += 4;
  if (i.hasPhotos) s += 4;
  if (i.hasFloorPlan) s += 3;
  if (i.email) s += 4;
  if (i.contact) s += 3;
  if (i.roomType === 'whole_unit') s += 5;
  const score = Math.max(8, Math.min(99, Math.round(s)));
  const tier = score >= 80 ? 'priority' : score >= 65 ? 'hot' : score >= 45 ? 'warm' : 'cold';
  return { score, tier };
}

/* ---------------- Modules ---------------- */
const MODULE_MAP: Record<Goal, { name: string; costUsd: number; retailUsd: number }> = {
  higher_adr: { name: 'Signature focal upgrade (bed wall / lounge)', costUsd: 320, retailUsd: 760 },
  better_photos: { name: 'Photo-ready staging & soft-goods kit', costUsd: 110, retailUsd: 310 },
  more_occupancy: { name: 'Layered lighting & ambience system', costUsd: 95, retailUsd: 260 },
  faster_turnover: { name: 'Durable, easy-clean finishes & storage', costUsd: 180, retailUsd: 430 },
  premium_tier: { name: 'Premium materials & fixture refresh', costUsd: 420, retailUsd: 980 },
  aging_friendly: { name: 'Accessible fittings & non-slip package', costUsd: 175, retailUsd: 420 },
};

export function diagnose(i: AuditInput): Diagnosis {
  const { score, tier } = scoreLead(i);
  const est = estimateProject(i);
  const roi = computeRoi({ nightlyRateUsd: i.nightlyRateUsd, occupancyPct: i.occupancyPct, band: i.band, projectMidUsd: est.mid });

  const modules = i.goals.map((g) => MODULE_MAP[g]);
  if (modules.length === 0) modules.push(MODULE_MAP.better_photos);
  modules.push({ name: 'Local delivery & install coordination', costUsd: Math.round(est.mid * 0.12), retailUsd: Math.round(est.mid * 0.18) });

  const recommendedPackage = tier === 'priority' || tier === 'hot'
    ? (est.high > 12000 ? 'Pro Redesign Brief — Premium' : 'Pro Redesign Brief')
    : tier === 'warm' ? 'Pro Redesign Brief — Lean' : 'AI Room Audit';

  const summary =
    `Your ${i.roomType.replace(/_/g, ' ')} (~${i.sizeSqm} m²) in ${i.city || i.country || 'your market'} is a strong candidate for a measured, ` +
    `revenue-focused refresh. At an opportunity score of ${score}/100, the highest-leverage moves target ` +
    `${i.goals.map((g) => g.replace(/_/g, ' ')).join(', ') || 'photo performance'}.`;

  const risks = [
    'Revenue figures are scenario-based estimates, subject to local market verification, seasonality and pricing strategy.',
    'Final project pricing is confirmed after a site survey and depends on material availability and installer capacity.',
  ];
  if (i.roomType === 'kitchen' || i.roomType === 'bathroom' || i.roomType === 'whole_unit') {
    risks.push('Wet areas may require plumbing/electrical compliance checks before delivery.');
  }

  return {
    score, tier, summary,
    projectLowUsd: est.low, projectHighUsd: est.high,
    recommendedPackage, modules, roi, risks,
  };
}

/* ---------------- Quote engine ---------------- */
const MARGIN: Record<Band, number> = { lean: 0.3, standard: 0.36, premium: 0.42 };

export function buildQuote(i: AuditInput, band: Band): Quote {
  const est = estimateProject({ ...i, band });
  const p = est.mid;
  const costs: Record<string, number> = {
    design: Math.round(p * 0.09),
    materials: Math.round(p * 0.26),
    furniture: Math.round(p * 0.3),
    delivery: Math.round(p * 0.07),
    install: Math.round(p * 0.16),
  };
  const m = MARGIN[band];
  const up = (c: number) => Math.round(c / (1 - m) / 5) * 5;
  const lines: QuoteLine[] = [
    { key: 'design', label: 'Design & space plan', costUsd: costs.design, customerUsd: up(costs.design) },
    { key: 'materials', label: 'Materials & finishes', costUsd: costs.materials, customerUsd: up(costs.materials) },
    { key: 'furniture', label: 'Furniture & components', costUsd: costs.furniture, customerUsd: up(costs.furniture) },
    { key: 'delivery', label: 'Local delivery', costUsd: costs.delivery, customerUsd: up(costs.delivery) },
    { key: 'install', label: 'Installation', costUsd: costs.install, customerUsd: up(costs.install) },
  ];
  const sub = lines.reduce((a, l) => a + l.customerUsd, 0);
  const platformFee = Math.round((sub * 0.12) / 5) * 5;
  lines.push({ key: 'fee', label: 'Platform coordination fee (12%)', costUsd: 0, customerUsd: platformFee });
  const customerTotal = lines.reduce((a, l) => a + l.customerUsd, 0);
  const costTotal = lines.reduce((a, l) => a + l.costUsd, 0);
  const margin = customerTotal - costTotal;
  return {
    band, lines, customerTotalUsd: customerTotal, costTotalUsd: costTotal,
    platformFeeUsd: platformFee, marginUsd: margin, marginPct: Math.round((margin / customerTotal) * 100),
  };
}
