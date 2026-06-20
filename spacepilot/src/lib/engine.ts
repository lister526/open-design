import type {
  AuditInput, Diagnosis, Quote, QuoteLine, BudgetBand, RoomType,
} from './types';

// ---------- Opportunity / lead scoring ----------
// Scores capture commercial intent: who pays fastest at the highest value.
export function scoreLead(input: AuditInput): { score: number; tier: Diagnosis['intentTier'] } {
  let s = 30;

  // User type weight — ROI-driven buyers score highest
  const utWeight: Record<string, number> = {
    short_stay: 26, landlord: 24, contractor: 16, designer: 14, homeowner: 12, supplier: 8,
  };
  s += utWeight[input.userType] ?? 10;

  // Timeline urgency
  const tlWeight: Record<string, number> = { asap: 20, '1_3m': 14, '3_6m': 6, exploring: 0 };
  s += tlWeight[input.timeline] ?? 0;

  // Budget appetite
  const bbWeight: Record<BudgetBand, number> = { lean: 4, standard: 10, premium: 16 };
  s += bbWeight[input.budgetBand];

  // Commercial outcomes signal monetizable intent
  if (['higher_rent', 'faster_sale', 'better_photos'].includes(input.outcome)) s += 8;

  // Engagement signals
  if (input.hasPhoto) s += 4;
  if (input.hasFloorPlan) s += 3;
  if (input.email) s += 4;
  if (input.contactChannel) s += 3;

  // Whole-unit & kitchen jobs carry larger ticket size
  if (input.roomType === 'whole_unit') s += 6;
  if (input.roomType === 'kitchen') s += 4;

  const score = Math.max(5, Math.min(99, Math.round(s)));
  const tier: Diagnosis['intentTier'] =
    score >= 80 ? 'priority' : score >= 65 ? 'hot' : score >= 45 ? 'warm' : 'cold';
  return { score, tier };
}

// ---------- Project value estimate ----------
// Base USD per sqm by budget band; reflects real-world local fit-out ranges.
const PER_SQM: Record<BudgetBand, [number, number]> = {
  lean: [90, 180],
  standard: [180, 360],
  premium: [360, 720],
};

const ROOM_FACTOR: Record<RoomType, number> = {
  living_room: 1.0, bedroom: 0.85, kitchen: 1.6, bathroom: 1.5,
  entryway: 0.6, home_office: 0.8, studio: 1.1, kids_room: 0.8, whole_unit: 1.3,
};

export function estimateProject(input: AuditInput): { low: number; high: number } {
  const [pLow, pHigh] = PER_SQM[input.budgetBand];
  const factor = ROOM_FACTOR[input.roomType] ?? 1;
  const size = Math.max(6, input.roomSizeSqm);
  const low = Math.round((pLow * size * factor) / 50) * 50;
  const high = Math.round((pHigh * size * factor) / 50) * 50;
  return { low: Math.max(900, low), high: Math.max(1800, high) };
}

// ---------- Diagnosis ----------
const MODULE_LIBRARY: Record<string, string> = {
  no_storage: 'Built-in & modular storage (vertical + concealed)',
  looks_dated: 'Surface refresh: paint, finishes, hardware',
  bad_layout: 'Layout re-zoning & circulation plan',
  poor_lighting: 'Layered lighting (ambient + task + accent)',
  low_rent: 'Photo-ready styling for listing uplift',
  bad_photos: 'Staging kit + soft goods for listing photos',
  not_accessible: 'Aging-friendly & accessibility fittings',
  cant_sell: 'Neutral buyer-appeal restyle',
};

export function diagnose(input: AuditInput): Diagnosis {
  const { score, tier } = scoreLead(input);
  const { low, high } = estimateProject(input);

  const modules = new Set<string>();
  input.pains.forEach((p) => modules.add(MODULE_LIBRARY[p]));
  // Always include core modules
  modules.add('Furniture & component selection');
  modules.add('Local delivery & installation coordination');

  // Recommended package routing — the monetization funnel
  let recommendedPackage = 'AI Room Audit';
  let recommendedPackagePriceUsd = 49;
  if (tier === 'priority' || tier === 'hot') {
    recommendedPackage = 'Pro Redesign Brief';
    recommendedPackagePriceUsd = high > 12000 ? 999 : 699;
  } else if (tier === 'warm') {
    recommendedPackage = 'AI Room Audit+';
    recommendedPackagePriceUsd = 149;
  }

  // ROI angle only for commercial operators (compliant, scenario-based language)
  let roiAngle: string | undefined;
  if (input.userType === 'landlord' || input.userType === 'short_stay') {
    const monthlyUplift = Math.round((low * 0.012) / 5) * 5;
    roiAngle =
      `Scenario estimate: a transformation in this range could support an indicative monthly ` +
      `revenue uplift of around ${monthlyUplift} (illustrative, subject to local market conditions, ` +
      `occupancy and pricing — not a guarantee).`;
  }

  const riskNotes = [
    'Estimates are scenario-based and exclude permits, structural work and local taxes unless scoped.',
    'Final pricing depends on site survey, material availability and installer capacity in your city.',
  ];
  if (input.roomType === 'kitchen' || input.roomType === 'bathroom') {
    riskNotes.push('Wet areas may require plumbing/electrical compliance checks before delivery.');
  }

  const summary = buildSummary(input, score);

  return {
    opportunityScore: score,
    intentTier: tier,
    summary,
    projectLowUsd: low,
    projectHighUsd: high,
    recommendedPackage,
    recommendedPackagePriceUsd,
    roiAngle,
    modules: Array.from(modules).filter(Boolean),
    riskNotes,
  };
}

function buildSummary(input: AuditInput, score: number): string {
  const painText =
    input.pains.length > 0
      ? input.pains.map((p) => MODULE_LIBRARY[p]?.split(':')[0].toLowerCase()).join(', ')
      : 'general refresh needs';
  return (
    `Your ${humanRoom(input.roomType)} (~${input.roomSizeSqm} m²) shows clear upside. ` +
    `We detected priorities around ${painText}. With an opportunity score of ${score}/100, ` +
    `this space is a strong candidate for a structured, buildable transformation rather than a cosmetic-only fix.`
  );
}

function humanRoom(r: RoomType): string {
  return r.replace(/_/g, ' ');
}

// ---------- Quote engine ----------
const MARGIN_TARGET: Record<BudgetBand, number> = { lean: 0.28, standard: 0.34, premium: 0.4 };

export function buildQuote(input: AuditInput, band: BudgetBand): Quote {
  const { low, high } = estimateProject({ ...input, budgetBand: band });
  const project = Math.round((low + high) / 2);

  // Cost split (internal) — transparent, editable, extensible
  const designCost = Math.round(project * 0.08);
  const materialsCost = Math.round(project * 0.26);
  const furnitureCost = Math.round(project * 0.30);
  const deliveryCost = Math.round(project * 0.07);
  const installCost = Math.round(project * 0.16);

  const margin = MARGIN_TARGET[band];
  const markup = (cost: number) => Math.round((cost / (1 - margin)) / 5) * 5;

  const lines: QuoteLine[] = [
    { key: 'design', label: 'Design & space plan fee', costUsd: designCost, customerUsd: markup(designCost) },
    { key: 'materials', label: 'Materials & finishes', costUsd: materialsCost, customerUsd: markup(materialsCost) },
    { key: 'furniture', label: 'Furniture & components', costUsd: furnitureCost, customerUsd: markup(furnitureCost) },
    { key: 'delivery', label: 'Local delivery', costUsd: deliveryCost, customerUsd: markup(deliveryCost) },
    { key: 'install', label: 'Installation', costUsd: installCost, customerUsd: markup(installCost) },
  ];

  const subtotalCustomer = lines.reduce((a, l) => a + l.customerUsd, 0);
  // Platform coordination fee — a primary monetization lever
  const coordination = Math.round((subtotalCustomer * 0.10) / 5) * 5;
  lines.push({ key: 'coordination', label: 'Platform coordination fee', costUsd: 0, customerUsd: coordination });

  // Optional warranty
  const warranty = Math.round((subtotalCustomer * 0.04) / 5) * 5;
  lines.push({ key: 'warranty', label: 'Optional 24-month warranty', costUsd: Math.round(warranty * 0.4), customerUsd: warranty });

  const customerTotal = lines.reduce((a, l) => a + l.customerUsd, 0);
  const costTotal = lines.reduce((a, l) => a + l.costUsd, 0);
  const grossMargin = customerTotal - costTotal;

  return {
    band,
    lines,
    customerTotalUsd: customerTotal,
    costTotalUsd: costTotal,
    grossMarginUsd: grossMargin,
    grossMarginPct: Math.round((grossMargin / customerTotal) * 100),
  };
}
