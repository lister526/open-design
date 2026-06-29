import type { AuditInput, Lead, SupplierComponent, Partner, SupplierTrustLedger } from './types';
import { buildListingPerformancePassport, scoreSupplierFit } from './engine';

const BASE: Partial<AuditInput> = {
  mode: 'manual', listingUrl: '', nightsAvailable: 28, cleaningFeeUsd: 45, minStay: 2,
  rating: 4.6, canReplaceFurniture: true, needsLandlordApproval: false,
  hasPhotos: true, hasFloorPlan: false, contact: '',
};

function mk(id: string, daysAgo: number, status: Lead['status'], paidAudit: boolean, partial: Partial<AuditInput>): Lead {
  const input = { ...BASE, ...partial } as AuditInput;
  return {
    id, createdAt: Date.now() - daysAgo * 86400000, status, paidAudit, input,
    passport: buildListingPerformancePassport(input), referral: 'SP-' + id.slice(-4),
  };
}

export const SEED_LEADS: Lead[] = [
  mk('L-9XK2', 1, 'proposal_sent', true, { userType: 'bnb_host', country: 'Japan', city: 'Osaka', propertyType: 'one_bed', roomType: 'bedroom', sizeSqm: 28, adrUsd: 120, occupancyPct: 72, photoQuality: 'poor', goal: 'better_photos', goals: ['better_photos', 'higher_adr'], biggestIssue: 'photo_pull', amenities: ['Fast Wi-Fi', 'Smart TV'], band: 'standard', timeline: 'asap', email: 'kenji@stayosaka.jp', listingUrl: 'https://airbnb.com/rooms/osaka' }),
  mk('L-7TB1', 2, 'deposit_paid', true, { userType: 'operator', country: 'United Kingdom', city: 'Manchester', propertyType: 'studio', roomType: 'studio', sizeSqm: 26, adrUsd: 95, occupancyPct: 64, photoQuality: 'average', goal: 'premium_tier', goals: ['premium_tier', 'higher_adr'], biggestIssue: 'layout_efficiency', amenities: ['Work desk', 'Fast Wi-Fi'], band: 'premium', timeline: '1_3m', email: 'a.shaw@northlet.co.uk' }),
  mk('L-3QM8', 0, 'paid_audit', true, { userType: 'str_landlord', country: 'United States', city: 'Austin', propertyType: 'one_bed', roomType: 'living', sizeSqm: 42, adrUsd: 210, occupancyPct: 75, photoQuality: 'average', goal: 'more_bookings', goals: ['better_photos', 'more_bookings'], biggestIssue: 'design_memorability', amenities: ['Fast Wi-Fi', 'Smart TV', 'Air conditioning'], band: 'standard', timeline: '1_3m', email: 'maria.lopez@gmail.com' }),
  mk('L-5RD4', 4, 'completed', true, { userType: 'bnb_host', country: 'Spain', city: 'Barcelona', propertyType: 'apartment', roomType: 'living', sizeSqm: 54, adrUsd: 130, occupancyPct: 80, photoQuality: 'good', goal: 'higher_adr', goals: ['higher_adr'], biggestIssue: 'design_memorability', amenities: ['Fast Wi-Fi', 'Espresso / coffee', 'Air conditioning', 'Smart TV'], band: 'standard', timeline: 'asap', email: 'host@bcnstays.es' }),
  mk('L-1FF9', 3, 'audited', false, { userType: 'designer', country: 'Singapore', city: 'Singapore', propertyType: 'room', roomType: 'bedroom', sizeSqm: 16, adrUsd: 0, occupancyPct: 0, photoQuality: 'average', goal: 'premium_tier', goals: ['premium_tier'], biggestIssue: 'design_memorability', amenities: ['Fast Wi-Fi'], band: 'standard', timeline: '1_3m', email: 'studio@formline.sg' }),
  mk('L-8AC0', 6, 'in_delivery', true, { userType: 'operator', country: 'UAE', city: 'Dubai', propertyType: 'serviced', roomType: 'whole_unit', sizeSqm: 70, adrUsd: 320, occupancyPct: 70, photoQuality: 'average', goal: 'premium_tier', goals: ['premium_tier', 'higher_adr', 'better_photos'], biggestIssue: 'design_memorability', amenities: ['Fast Wi-Fi', 'Smart TV', 'Air conditioning', 'Self check-in'], band: 'premium', timeline: 'asap', email: 'invest@gulfrent.ae' }),
  mk('L-2HJ7', 5, 'scanned', false, { userType: 'str_landlord', country: 'United States', city: 'Miami', propertyType: 'studio', roomType: 'studio', sizeSqm: 30, adrUsd: 160, occupancyPct: 62, photoQuality: 'poor', goal: 'higher_adr', goals: ['higher_adr'], biggestIssue: 'photo_pull', amenities: ['Fast Wi-Fi'], band: 'lean', timeline: '3_6m', email: 'frank@miamistays.com' }),
];

/* Deterministic demo lead for /proposal/demo and any missing id. */
export function demoLead(id = 'demo'): Lead {
  const input = {
    ...BASE, userType: 'str_landlord', country: 'Japan', city: 'Osaka', propertyType: 'one_bed',
    roomType: 'bedroom', sizeSqm: 30, adrUsd: 118, occupancyPct: 68, photoQuality: 'poor',
    goal: 'higher_adr', goals: ['higher_adr', 'better_photos'], biggestIssue: 'photo_pull',
    amenities: ['Fast Wi-Fi', 'Smart TV'], band: 'standard', timeline: '1_3m',
    email: 'demo@spacepilot.example', listingUrl: 'https://airbnb.com/rooms/demo', hasPhotos: true,
  } as AuditInput;
  return {
    id, createdAt: Date.now(), status: 'proposal_sent', paidAudit: true, input,
    passport: buildListingPerformancePassport(input), referral: 'SP-DEMO',
  };
}

/* SKU / supplier catalog */
export const SUPPLIERS: SupplierComponent[] = [
  { id: 'C-101', name: 'Modular Wall Storage System', category: 'Storage', useCase: 'Vertical storage for compact units', costUsd: 220, retailUsd: 540, leadTimeDays: 18, markets: ['US', 'EU', 'JP', 'SG'], install: 'medium', compliance: 'Wall-anchor load rating per local code', emoji: '🗄️' },
  { id: 'C-102', name: 'Layered LED Lighting Kit', category: 'Lighting', useCase: 'Ambient + task + accent in any room', costUsd: 85, retailUsd: 230, leadTimeDays: 7, markets: ['US', 'EU', 'JP', 'KR', 'AE'], install: 'low', compliance: 'CE/UL/PSE per region', emoji: '💡' },
  { id: 'C-103', name: 'Photo-Ready Staging Bundle', category: 'Soft goods', useCase: 'Short-stay listing styling kit', costUsd: 95, retailUsd: 290, leadTimeDays: 5, markets: ['US', 'EU', 'JP', 'KR', 'AE', 'SG'], install: 'low', compliance: 'Textile flammability label where required', emoji: '🛏️' },
  { id: 'C-104', name: 'Signature Headboard Wall', category: 'Furniture', useCase: 'High-impact bedroom focal point', costUsd: 320, retailUsd: 760, leadTimeDays: 16, markets: ['US', 'EU', 'JP'], install: 'medium', compliance: 'Formaldehyde class E1/CARB', emoji: '🖼️' },
  { id: 'C-105', name: 'High-Signal Amenity Pack', category: 'Amenity', useCase: 'Coffee, desk, fast-wifi, smart TV', costUsd: 140, retailUsd: 360, leadTimeDays: 6, markets: ['US', 'EU', 'JP', 'SG'], install: 'low', compliance: 'Electrical certification per region', emoji: '☕' },
  { id: 'C-106', name: 'Accessibility & Safety Fittings', category: 'Compliance', useCase: 'Grab rails, non-slip, accessible fixtures', costUsd: 175, retailUsd: 420, leadTimeDays: 12, markets: ['US', 'EU', 'JP', 'KR'], install: 'medium', compliance: 'ADA/local accessibility standard', emoji: '🛟' },
  { id: 'C-107', name: 'Turnover-Fast Linen System', category: 'Turnover', useCase: 'Fast reset linen & textiles', costUsd: 110, retailUsd: 280, leadTimeDays: 8, markets: ['US', 'EU', 'KR', 'SG'], install: 'low', compliance: 'Standard textile labeling', emoji: '🧺' },
  { id: 'C-108', name: 'Durable Easy-Clean Finishes', category: 'Finishes', useCase: 'Hard-wearing surfaces & panels', costUsd: 180, retailUsd: 430, leadTimeDays: 15, markets: ['US', 'EU', 'JP'], install: 'medium', compliance: 'Fire-rating class per local code', emoji: '🧱' },
];

function ledger(supplierId: string, l: Omit<SupplierTrustLedger, 'supplierId' | 'trustScore'>): SupplierTrustLedger {
  const base = { supplierId, ...l, trustScore: 0 };
  return { ...base, trustScore: scoreSupplierFit(base) };
}

export const PARTNERS: Partner[] = [
  { id: 'PA-01', name: 'Formline Studio', type: 'designer', area: 'Singapore', skills: ['Small-space', 'Japandi', 'Storage'], commissionPct: 12, status: 'verified', ledger: ledger('PA-01', { onTimeRatePct: 96, reworkRatePct: 3, photoHandoverScore: 4.9, avgProjectValueUsd: 4200, responseTimeHours: 3, completedProjects: 38 }) },
  { id: 'PA-02', name: 'NorthFit Contractors', type: 'contractor', area: 'Manchester, UK', skills: ['Rental refit', 'Kitchen', 'Bath'], commissionPct: 10, status: 'verified', ledger: ledger('PA-02', { onTimeRatePct: 91, reworkRatePct: 6, photoHandoverScore: 4.4, avgProjectValueUsd: 5600, responseTimeHours: 6, completedProjects: 64 }) },
  { id: 'PA-03', name: 'Osaka Makeover Co.', type: 'installer', area: 'Kansai, Japan', skills: ['Short-stay', 'Lighting', 'Staging'], commissionPct: 11, status: 'verified', ledger: ledger('PA-03', { onTimeRatePct: 98, reworkRatePct: 2, photoHandoverScore: 4.8, avgProjectValueUsd: 3800, responseTimeHours: 4, completedProjects: 51 }) },
  { id: 'PA-04', name: 'GulfHome Supply', type: 'supplier', area: 'UAE / GCC', skills: ['Modular kitchen', 'Luxe finishes'], commissionPct: 0, status: 'demo', ledger: ledger('PA-04', { onTimeRatePct: 88, reworkRatePct: 9, photoHandoverScore: 4.1, avgProjectValueUsd: 9800, responseTimeHours: 9, completedProjects: 22 }) },
  { id: 'PA-05', name: 'BCN Interiors', type: 'designer', area: 'Barcelona, Spain', skills: ['Coastal', 'Photo-ready'], commissionPct: 13, status: 'demo', ledger: ledger('PA-05', { onTimeRatePct: 94, reworkRatePct: 4, photoHandoverScore: 4.7, avgProjectValueUsd: 4500, responseTimeHours: 5, completedProjects: 29 }) },
];

/* Landing demo cases */
export const DEMO_CASES = [
  {
    id: 'osaka', city: 'Osaka', flag: '🇯🇵', title: 'Compact 1BR · dark photos',
    symptoms: ['Dark, low-contrast photos', 'Weak focal point', 'Low storage = cramped look'],
    kit: 'Revenue Refresh Kit', range: '$2,400–$4,200', payback: '5–9 mo (scenario)',
    seed: { city: 'Osaka', country: 'Japan', propertyType: 'one_bed', adrUsd: 118, occupancyPct: 68, sizeSqm: 30, photoQuality: 'poor', goal: 'higher_adr' },
  },
  {
    id: 'manchester', city: 'Manchester', flag: '🇬🇧', title: 'City studio · poor WFH appeal',
    symptoms: ['No work-from-stay zone', 'Cluttered layout', 'Generic, forgettable styling'],
    kit: 'Lean ROI Starter Kit', range: '$1,600–$3,100', payback: '4–8 mo (scenario)',
    seed: { city: 'Manchester', country: 'United Kingdom', propertyType: 'studio', adrUsd: 95, occupancyPct: 64, sizeSqm: 26, photoQuality: 'average', goal: 'more_bookings' },
  },
  {
    id: 'dubai', city: 'Dubai', flag: '🇦🇪', title: 'Premium apt · weak brand memory',
    symptoms: ['High ADR potential, low memorability', 'No signature element', 'Photos undersell finish'],
    kit: 'Premium Repositioning Kit', range: '$7,800–$13,400', payback: '6–11 mo (scenario)',
    seed: { city: 'Dubai', country: 'UAE', propertyType: 'serviced', adrUsd: 320, occupancyPct: 70, sizeSqm: 70, photoQuality: 'average', goal: 'premium_tier' },
  },
] as const;

/* Room Upgrade Graph (moat) demo nodes */
export const UPGRADE_GRAPH = [
  { id: 'g1', leak: 'photo_pull', fix: 'Layered lighting + styled hero', unlocks: ['g2', 'g3'], avgUpliftPct: 9, confidenceSamples: 142 },
  { id: 'g2', leak: 'design_memorability', fix: 'Signature focal wall', unlocks: ['g4'], avgUpliftPct: 7, confidenceSamples: 88 },
  { id: 'g3', leak: 'amenity_gap', fix: 'High-signal amenity pack', unlocks: ['g4'], avgUpliftPct: 5, confidenceSamples: 110 },
  { id: 'g4', leak: 'layout_efficiency', fix: 'Space-multiplying storage', unlocks: [], avgUpliftPct: 4, confidenceSamples: 67 },
] as const;
