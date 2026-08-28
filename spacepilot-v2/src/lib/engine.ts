/* ============================================================================
 * SpacePilot engine — Revenue-leak diagnosis + upgrade-kit + scenario proposal.
 *
 * All outputs are SCENARIO-BASED ESTIMATES, subject to local verification.
 * Nothing here is a guarantee of revenue. We model conservative ranges.
 * ========================================================================== */
import type {
  AuditInput, Band, ComplianceRiskFlag, KitItem, LeakCategory, LeakItem,
  ListingPerformancePassport, MarketScenario, PropertyType, Quote, QuoteLine,
  RevenueLeakScore, RoomType, ScanInput, ScenarioProposal, SupplierTrustLedger,
  UpgradeKit,
} from './types';

/* deterministic hash → 0..1 (for demo proposals from arbitrary ids) */
export function hash01(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
  return ((h >>> 0) % 100000) / 100000;
}

export const LEAK_CATEGORIES: LeakCategory[] = [
  'photo_pull', 'amenity_gap', 'design_memorability', 'layout_efficiency', 'durability', 'turnover_speed', 'compliance_risk',
];

export const LEAK_LABEL: Record<LeakCategory, string> = {
  photo_pull: 'Photo Pull',
  amenity_gap: 'Amenity Gap',
  design_memorability: 'Design Memorability',
  layout_efficiency: 'Layout Efficiency',
  durability: 'Durability',
  turnover_speed: 'Turnover Speed',
  compliance_risk: 'Compliance Risk',
};

const ROOM_FACTOR: Record<RoomType, number> = {
  studio: 1.1, one_bed: 1.2, two_bed: 1.45, living: 1.0, bedroom: 0.85,
  kitchen: 1.6, bathroom: 1.5, whole_unit: 1.35,
};
const PROP_SIZE: Record<PropertyType, number> = {
  studio: 28, one_bed: 42, two_bed: 62, apartment: 70, house: 110, serviced: 48, room: 16,
};

/* ----------------------------------------------------------------------------
 * 1) computeRevenueLeakScore — the diagnostic spine
 * -------------------------------------------------------------------------- */
export function computeRevenueLeakScore(i: ScanInput | AuditInput): RevenueLeakScore {
  const adr = Math.max(20, i.adrUsd || 120);
  const occ = Math.min(98, Math.max(10, i.occupancyPct || 60));
  const nights = 30 * (occ / 100);
  const monthlyRevenue = adr * nights;

  // per-category severity 0-100 driven by inputs (scenario heuristics)
  const photoBase = i.photoQuality === 'poor' ? 78 : i.photoQuality === 'average' ? 48 : 22;
  const adrGapVsMarket = adr < 90 ? 26 : adr < 160 ? 16 : 8;        // lower ADR → more upside room
  const occGap = occ < 55 ? 30 : occ < 70 ? 18 : 8;

  // extra signals available on full audit
  const audit = (i as AuditInput);
  const amenityCount = audit.amenities ? audit.amenities.length : 3;
  const rating = audit.rating ?? 4.4;

  const sev: Record<LeakCategory, number> = {
    photo_pull: clamp(photoBase + (i.goal === 'better_photos' ? 12 : 0)),
    amenity_gap: clamp(60 - amenityCount * 7 + (rating < 4.5 ? 14 : 0)),
    design_memorability: clamp(40 + (i.goal === 'premium_tier' ? 24 : 0) + adrGapVsMarket * 0.6),
    layout_efficiency: clamp((i.sizeSqm && i.sizeSqm < 30 ? 56 : 34) + (i.propertyType === 'studio' ? 12 : 0)),
    durability: clamp(38 + (audit.canReplaceFurniture === false ? 12 : 0)),
    turnover_speed: clamp(34 + occGap * 0.6 + (i.goal === 'faster_turnover' ? 18 : 0)),
    compliance_risk: clamp((audit.roomType === 'kitchen' || audit.roomType === 'bathroom' ? 30 : 12) + (audit.needsLandlordApproval ? 10 : 0)),
  };
  if (audit.biggestIssue && sev[audit.biggestIssue] !== undefined) sev[audit.biggestIssue] = clamp(sev[audit.biggestIssue] + 16);

  const leaks: LeakItem[] = LEAK_CATEGORIES.map((c) => {
    const severity = Math.round(sev[c]);
    // each leak drags a slice of revenue, scaled by its severity
    const dragShare: Record<LeakCategory, number> = {
      photo_pull: 0.10, amenity_gap: 0.06, design_memorability: 0.07,
      layout_efficiency: 0.05, durability: 0.03, turnover_speed: 0.05, compliance_risk: 0.02,
    };
    const monthlyDragUsd = Math.round((monthlyRevenue * dragShare[c] * (severity / 100)) / 5) * 5;
    return { category: c, severity, monthlyDragUsd, note: leakNote(c, severity) };
  }).sort((a, b) => b.severity - a.severity);

  const score = clamp(Math.round(leaks.reduce((a, l) => a + l.severity, 0) / leaks.length + leaks[0].severity * 0.15));
  const grade = score >= 70 ? 'critical' : score >= 50 ? 'leaking' : score >= 32 ? 'tuning' : 'optimized';
  return { score, grade, leaks, topLeaks: leaks.slice(0, 3) };
}

function leakNote(c: LeakCategory, sev: number): string {
  const hi = sev >= 55;
  const map: Record<LeakCategory, string> = {
    photo_pull: hi ? 'Photos under-sell the space — likely suppressing click-through and ADR.' : 'Photos are passable but not converting at their ceiling.',
    amenity_gap: hi ? 'Missing high-signal amenities guests filter for in this market.' : 'A few amenity gaps vs. comparable listings.',
    design_memorability: hi ? 'No distinct focal point — the listing blends in and resists premium pricing.' : 'Some character, but not yet a memorable signature.',
    layout_efficiency: hi ? 'Layout wastes usable space and reads cramped in photos.' : 'Minor layout friction reducing perceived size.',
    durability: hi ? 'Finishes likely to wear fast, raising rework and review risk.' : 'Durability is acceptable with minor reinforcement.',
    turnover_speed: hi ? 'Turnover friction is capping occupancy and raising cleaning cost.' : 'Turnover is workable but improvable.',
    compliance_risk: hi ? 'Potential local compliance items to verify before any wet-area work.' : 'Low compliance exposure; standard verification applies.',
  };
  return map[c];
}

const clamp = (n: number, lo = 4, hi = 99) => Math.min(hi, Math.max(lo, n));

/* ----------------------------------------------------------------------------
 * 2) estimateMonthlyUpside — scenario revenue ranges
 * -------------------------------------------------------------------------- */
const ADR_UPLIFT: Record<Band, number> = { lean: 0.06, standard: 0.11, premium: 0.18 };

export function estimateMonthlyUpside(i: ScanInput | AuditInput, leak: RevenueLeakScore, band: Band, projectMidUsd: number): MarketScenario {
  const adr = Math.max(20, i.adrUsd || 120);
  const occ = Math.min(98, Math.max(10, i.occupancyPct || 60));
  const nights = 30 * (occ / 100);

  // upside scales with how much leakage exists
  const leakFactor = 0.6 + (leak.score / 100) * 0.8; // 0.6..1.4
  const adrUpliftPct = ADR_UPLIFT[band] * leakFactor;
  const occUpliftPct = (band === 'premium' ? 0.05 : band === 'standard' ? 0.035 : 0.02) * leakFactor;

  const newAdr = adr * (1 + adrUpliftPct);
  const newNights = 30 * Math.min(0.98, occ / 100 * (1 + occUpliftPct));
  const monthlyUpside = newAdr * newNights - adr * nights;

  const low = Math.round((monthlyUpside * 0.65) / 5) * 5;
  const high = Math.round((monthlyUpside * 1.25) / 5) * 5;
  const paybackLow = high > 0 ? Math.max(1, Math.round(projectMidUsd / high)) : 0;
  const paybackHigh = low > 0 ? Math.max(1, Math.round(projectMidUsd / low)) : 0;
  return {
    monthlyUpsideLowUsd: low, monthlyUpsideHighUsd: high,
    annualUpsideLowUsd: low * 12, annualUpsideHighUsd: high * 12,
    adrUpliftPct: Math.round(adrUpliftPct * 1000) / 10,
    occupancyUpliftPct: Math.round(occUpliftPct * 1000) / 10,
    paybackMonthsLow: paybackLow, paybackMonthsHigh: paybackHigh,
  };
}

/* ----------------------------------------------------------------------------
 * 3) SKU Kit Library + recommendUpgradeKit
 * -------------------------------------------------------------------------- */
export const KIT_LIBRARY: KitItem[] = [
  { sku: 'SP-PHO-01', name: 'Photo-ready styling & soft-goods kit', category: 'photo_pull', costUsd: 95, retailUsd: 290, leadTimeDays: 5, install: 'low', emoji: '🛏️' },
  { sku: 'SP-PHO-02', name: 'Layered lighting & ambience system', category: 'photo_pull', costUsd: 85, retailUsd: 230, leadTimeDays: 7, install: 'low', emoji: '💡' },
  { sku: 'SP-AMN-01', name: 'High-signal amenity pack (coffee/desk/fast-wifi)', category: 'amenity_gap', costUsd: 140, retailUsd: 360, leadTimeDays: 6, install: 'low', emoji: '☕' },
  { sku: 'SP-MEM-01', name: 'Signature focal wall / headboard feature', category: 'design_memorability', costUsd: 320, retailUsd: 760, leadTimeDays: 16, install: 'medium', emoji: '🖼️' },
  { sku: 'SP-LAY-01', name: 'Space-multiplying storage & zoning', category: 'layout_efficiency', costUsd: 220, retailUsd: 540, leadTimeDays: 18, install: 'medium', emoji: '🗄️' },
  { sku: 'SP-DUR-01', name: 'Durable, easy-clean finishes', category: 'durability', costUsd: 180, retailUsd: 430, leadTimeDays: 12, install: 'medium', emoji: '🧱' },
  { sku: 'SP-TRN-01', name: 'Turnover-fast linen & reset system', category: 'turnover_speed', costUsd: 110, retailUsd: 280, leadTimeDays: 8, install: 'low', emoji: '🧺' },
  { sku: 'SP-CMP-01', name: 'Accessibility & safety fittings', category: 'compliance_risk', costUsd: 175, retailUsd: 420, leadTimeDays: 12, install: 'medium', emoji: '🛟' },
];

export function recommendUpgradeKit(i: ScanInput | AuditInput, leak: RevenueLeakScore, band: Band): UpgradeKit {
  const targets = leak.topLeaks.map((l) => l.category);
  // always anchor on photo + memorability for short-stay, then patch top leaks
  const wanted = new Set<LeakCategory>([...targets, 'photo_pull']);
  let items = KIT_LIBRARY.filter((k) => wanted.has(k.category));
  // de-dup by category, keep first
  const seen = new Set<string>();
  items = items.filter((k) => (seen.has(k.category) ? false : (seen.add(k.category), true)));

  // band scales scope
  const bandMult = band === 'premium' ? 1.6 : band === 'standard' ? 1.0 : 0.7;
  const size = i.sizeSqm || PROP_SIZE[i.propertyType] || 40;
  const sizeMult = clamp(size / 40, 0.6, 2.2) / 1;

  const projectMid = Math.round((items.reduce((a, k) => a + k.retailUsd, 0) * bandMult * sizeMult + 250) / 50) * 50;
  const low = Math.round((projectMid * 0.78) / 50) * 50;
  const high = Math.round((projectMid * 1.32) / 50) * 50;

  const name = band === 'premium' ? 'Premium Repositioning Kit' : band === 'standard' ? 'Revenue Refresh Kit' : 'Lean ROI Starter Kit';
  const tagline = band === 'premium'
    ? 'Reposition the listing into a higher booking bracket.'
    : band === 'standard'
      ? 'Fix the highest-ROI leaks and lift photo performance.'
      : 'The fastest-payback fixes first — minimal spend.';

  return {
    id: 'KIT-' + band.toUpperCase(),
    name, tagline,
    targetLeaks: Array.from(wanted),
    items,
    projectLowUsd: low, projectHighUsd: high, projectMidUsd: projectMid,
  };
}

/* ----------------------------------------------------------------------------
 * 4) buildListingPerformancePassport — the durable artifact (moat)
 * -------------------------------------------------------------------------- */
export function buildListingPerformancePassport(i: AuditInput): ListingPerformancePassport {
  const leak = computeRevenueLeakScore(i);
  const band = i.band || 'standard';
  const kit = recommendUpgradeKit(i, leak, band);
  const scenario = estimateMonthlyUpside(i, leak, band, kit.projectMidUsd);

  // evidence completeness grows passport confidence (why it gets stronger with use)
  let evidence = 30;
  if (i.listingUrl) evidence += 18;
  if (i.hasPhotos) evidence += 16;
  if (i.hasFloorPlan) evidence += 10;
  if (i.adrUsd > 0) evidence += 8;
  if (i.amenities && i.amenities.length) evidence += Math.min(12, i.amenities.length * 3);
  if (i.rating) evidence += 6;
  evidence = Math.min(100, evidence);
  const passportConfidence = evidence >= 75 ? 'high' : evidence >= 50 ? 'medium' : 'low';

  const beforeAfter = [
    { metric: 'Photo pull', before: i.photoQuality === 'poor' ? 'Dark, low-contrast hero shot' : 'Average, generic photos', afterScenario: 'Styled, well-lit, scroll-stopping hero (scenario)' },
    { metric: 'Estimated ADR', before: usd(i.adrUsd), afterScenario: `${usd(Math.round(i.adrUsd * (1 + scenario.adrUpliftPct / 100)))} (scenario)` },
    { metric: 'Memorability', before: 'Blends with comparable listings', afterScenario: 'Distinct signature element (scenario)' },
  ];

  const compliance: ComplianceRiskFlag[] = [
    { level: 'info', text: 'Estimates are scenario-based and subject to local market verification, seasonality and pricing strategy.' },
    { level: 'info', text: 'We improve real spaces and listing presentation. We do not fabricate amenities, hide defects or fake photos.' },
  ];
  if (i.roomType === 'kitchen' || i.roomType === 'bathroom' || i.propertyType === 'serviced') {
    compliance.push({ level: 'caution', text: 'Wet-area or serviced-unit work may require plumbing/electrical compliance checks before delivery.' });
  }
  if (i.needsLandlordApproval) {
    compliance.push({ level: 'caution', text: 'Landlord approval required for non-reversible changes — we default to reversible upgrades where possible.' });
  }

  const summary =
    `This ${labelProp(i.propertyType)} in ${i.city || i.country || 'your market'} scores ${leak.score}/100 on revenue leakage. ` +
    `The biggest leaks are ${leak.topLeaks.map((l) => LEAK_LABEL[l.category]).join(', ')}. ` +
    `The ${kit.name} targets these first for the fastest scenario payback.`;

  return {
    id: 'LPP-' + (i.email || i.city || 'demo'),
    market: [i.city, i.country].filter(Boolean).join(', ') || 'Your market',
    propertyType: i.propertyType,
    leak, scenario, recommendedKit: kit,
    passportConfidence, evidenceCompletenessPct: evidence,
    beforeAfter, compliance, summary,
  };
}

/* ----------------------------------------------------------------------------
 * 5) Quote + buildScenarioProposal
 * -------------------------------------------------------------------------- */
const MARGIN: Record<Band, number> = { lean: 0.3, standard: 0.36, premium: 0.42 };

export function buildQuote(kit: UpgradeKit, band: Band): Quote {
  const p = kit.projectMidUsd;
  const costs: Record<string, number> = {
    design: Math.round(p * 0.09), materials: Math.round(p * 0.26),
    furniture: Math.round(p * 0.3), delivery: Math.round(p * 0.07), install: Math.round(p * 0.16),
  };
  const m = MARGIN[band];
  const up = (c: number) => Math.round(c / (1 - m) / 5) * 5;
  const lines: QuoteLine[] = [
    { key: 'design', label: 'Design & space plan', costUsd: costs.design, customerUsd: up(costs.design) },
    { key: 'materials', label: 'Materials & finishes', costUsd: costs.materials, customerUsd: up(costs.materials) },
    { key: 'furniture', label: 'Kit components & furniture', costUsd: costs.furniture, customerUsd: up(costs.furniture) },
    { key: 'delivery', label: 'Local delivery', costUsd: costs.delivery, customerUsd: up(costs.delivery) },
    { key: 'install', label: 'Installation & photo-ready handover', costUsd: costs.install, customerUsd: up(costs.install) },
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
    depositUsd: Math.round((customerTotal * 0.2) / 5) * 5,
  };
}

export function buildScenarioProposal(passport: ListingPerformancePassport, band: Band, isDemo = false): ScenarioProposal {
  const quote = buildQuote(passport.recommendedKit, band);
  const timeline = [
    { phase: 'Lock & source', days: 'Day 0–3', detail: 'Deposit secures supplier capacity & installer slot.' },
    { phase: 'Produce & deliver', days: 'Day 3–14', detail: 'Components produced and delivered to the unit.' },
    { phase: 'Install', days: 'Day 14–18', detail: 'Local verified partner installs against the scope.' },
    { phase: 'Photo-ready handover', days: 'Day 18–20', detail: 'Styled, photographed, before/after impact logged.' },
  ];
  const handover = [
    { label: 'All kit items installed & functional', done: false },
    { label: 'Space styled to brief', done: false },
    { label: 'Professional listing photos captured', done: false },
    { label: 'Before/after impact recorded to passport', done: false },
    { label: 'Compliance checklist verified locally', done: false },
  ];
  return { passport, quote, timeline, handover, isDemo };
}

/* ----------------------------------------------------------------------------
 * 6) Lead scoring + scoreSupplierFit
 * -------------------------------------------------------------------------- */
export function scoreLead(i: AuditInput): { score: number; tier: 'cold' | 'warm' | 'hot' | 'priority' } {
  let s = 24;
  const ut: Record<string, number> = { bnb_host: 26, str_landlord: 25, operator: 24, agent: 16, designer: 14, contractor: 13, homeowner: 10 };
  s += ut[i.userType] ?? 10;
  const tl: Record<string, number> = { asap: 20, '1_3m': 14, '3_6m': 6, exploring: 0 };
  s += tl[i.timeline] ?? 0;
  const bb: Record<Band, number> = { lean: 4, standard: 10, premium: 16 };
  s += bb[i.band];
  if (i.adrUsd >= 150) s += 6;
  if (i.occupancyPct >= 65) s += 4;
  if (i.listingUrl) s += 6;
  if (i.hasPhotos) s += 4;
  if (i.email) s += 4;
  const score = Math.max(8, Math.min(99, Math.round(s)));
  const tier = score >= 80 ? 'priority' : score >= 65 ? 'hot' : score >= 45 ? 'warm' : 'cold';
  return { score, tier };
}

export function scoreSupplierFit(l: SupplierTrustLedger): number {
  const onTime = l.onTimeRatePct;                       // 0-100
  const rework = 100 - l.reworkRatePct * 3;             // penalize rework
  const photo = (l.photoHandoverScore / 5) * 100;       // 0-100
  const responsive = Math.max(0, 100 - l.responseTimeHours * 6);
  const experience = Math.min(100, l.completedProjects * 1.6);
  const trust = Math.round(onTime * 0.34 + rework * 0.2 + photo * 0.2 + responsive * 0.13 + experience * 0.13);
  return Math.max(0, Math.min(100, trust));
}

/* ----------------------------- helpers ----------------------------- */
function usd(n: number) { return '$' + Math.round(n).toLocaleString('en-US'); }
function labelProp(p: PropertyType) {
  return ({ studio: 'studio', one_bed: '1-bed unit', two_bed: '2-bed unit', apartment: 'apartment', house: 'house', serviced: 'serviced apartment', room: 'private room' } as Record<PropertyType, string>)[p] || 'unit';
}
