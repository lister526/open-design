/* ============================================================================
 * SpacePilot — AI Listing Revenue Upgrade OS
 * Domain types. Everything here is SCENARIO-BASED; nothing is guaranteed.
 * ========================================================================== */

export type UserType = 'str_landlord' | 'operator' | 'bnb_host' | 'agent' | 'designer' | 'contractor' | 'homeowner';
export type PropertyType = 'studio' | 'one_bed' | 'two_bed' | 'apartment' | 'house' | 'serviced' | 'room';
export type RoomType = 'studio' | 'one_bed' | 'two_bed' | 'living' | 'bedroom' | 'kitchen' | 'bathroom' | 'whole_unit';
export type PhotoQuality = 'poor' | 'average' | 'good';
export type Goal = 'higher_adr' | 'more_bookings' | 'better_photos' | 'faster_turnover' | 'premium_tier';
export type Band = 'lean' | 'standard' | 'premium';
export type Timeline = 'asap' | '1_3m' | '3_6m' | 'exploring';
export type LeadStatus = 'new' | 'scanned' | 'audited' | 'paid_audit' | 'proposal_sent' | 'deposit_paid' | 'in_delivery' | 'completed';

/* The seven leak categories — the spine of the diagnosis. */
export type LeakCategory =
  | 'photo_pull'
  | 'amenity_gap'
  | 'design_memorability'
  | 'layout_efficiency'
  | 'durability'
  | 'turnover_speed'
  | 'compliance_risk';

/* ----------------------------- Scanner / Audit input ----------------------------- */
export interface ScanInput {
  city: string;
  country: string;
  propertyType: PropertyType;
  adrUsd: number;
  occupancyPct: number;
  sizeSqm: number;
  photoQuality: PhotoQuality;
  goal: Goal;
}

export interface AuditInput extends ScanInput {
  userType: UserType;
  listingUrl: string;
  mode: 'listing' | 'manual' | 'photos';
  // unit economics
  nightsAvailable: number;
  cleaningFeeUsd: number;
  minStay: number;
  rating: number; // 0-5
  // room evidence
  roomType: RoomType;
  biggestIssue: LeakCategory;
  amenities: string[];
  // constraints
  band: Band;
  timeline: Timeline;
  canReplaceFurniture: boolean;
  needsLandlordApproval: boolean;
  hasPhotos: boolean;
  hasFloorPlan: boolean;
  // goal + contact
  goals: Goal[];
  email: string;
  contact: string;
}

/* ----------------------------- Revenue Leak Score ----------------------------- */
export interface LeakItem {
  category: LeakCategory;
  severity: number;      // 0-100, higher = bigger leak
  monthlyDragUsd: number; // scenario estimate of monthly revenue lost
  note: string;
}

export interface RevenueLeakScore {
  score: number;          // 0-100 overall (higher = more leakage / more upside)
  grade: 'critical' | 'leaking' | 'tuning' | 'optimized';
  leaks: LeakItem[];      // all 7 categories, sorted by severity
  topLeaks: LeakItem[];   // top 3
}

/* ----------------------------- Market scenario ----------------------------- */
export interface MarketScenario {
  monthlyUpsideLowUsd: number;
  monthlyUpsideHighUsd: number;
  annualUpsideLowUsd: number;
  annualUpsideHighUsd: number;
  adrUpliftPct: number;
  occupancyUpliftPct: number;
  paybackMonthsLow: number;
  paybackMonthsHigh: number;
}

/* ----------------------------- Upgrade Kit / SKU library ----------------------------- */
export interface KitItem {
  sku: string;
  name: string;
  category: LeakCategory;
  costUsd: number;
  retailUsd: number;
  leadTimeDays: number;
  install: 'low' | 'medium' | 'high';
  emoji: string;
}

export interface UpgradeKit {
  id: string;
  name: string;
  tagline: string;
  targetLeaks: LeakCategory[];
  items: KitItem[];
  projectLowUsd: number;
  projectHighUsd: number;
  projectMidUsd: number;
}

/* ----------------------------- Listing Performance Passport ----------------------------- */
export interface BeforeAfterImpact {
  metric: string;
  before: string;
  afterScenario: string;
}

export interface ComplianceRiskFlag {
  level: 'info' | 'caution' | 'block';
  text: string;
}

export interface ListingPerformancePassport {
  id: string;
  market: string;
  propertyType: PropertyType;
  leak: RevenueLeakScore;
  scenario: MarketScenario;
  recommendedKit: UpgradeKit;
  passportConfidence: 'low' | 'medium' | 'high'; // grows with evidence provided
  evidenceCompletenessPct: number;
  beforeAfter: BeforeAfterImpact[];
  compliance: ComplianceRiskFlag[];
  summary: string;
}

/* ----------------------------- Quote ----------------------------- */
export interface QuoteLine { key: string; label: string; customerUsd: number; costUsd: number; }
export interface Quote {
  band: Band;
  lines: QuoteLine[];
  customerTotalUsd: number;
  costTotalUsd: number;
  platformFeeUsd: number;
  marginUsd: number;
  marginPct: number;
  depositUsd: number;
}

/* ----------------------------- Scenario Proposal ----------------------------- */
export interface HandoverItem { label: string; done: boolean; }
export interface ScenarioProposal {
  passport: ListingPerformancePassport;
  quote: Quote;
  timeline: { phase: string; days: string; detail: string }[];
  handover: HandoverItem[];
  isDemo: boolean;
}

/* ----------------------------- Lead ----------------------------- */
export interface Lead {
  id: string;
  createdAt: number;
  status: LeadStatus;
  paidAudit: boolean;
  input: AuditInput;
  passport: ListingPerformancePassport;
  referral: string;
}

/* ----------------------------- Supplier Trust Ledger ----------------------------- */
export interface SupplierComponent {
  id: string; name: string; category: string; useCase: string;
  costUsd: number; retailUsd: number; leadTimeDays: number;
  markets: string[]; install: 'low' | 'medium' | 'high'; compliance: string; emoji: string;
}

export interface SupplierTrustLedger {
  supplierId: string;
  onTimeRatePct: number;
  reworkRatePct: number;
  photoHandoverScore: number; // 0-5
  avgProjectValueUsd: number;
  responseTimeHours: number;
  completedProjects: number;
  trustScore: number; // derived 0-100
}

/* ----------------------------- Partner ----------------------------- */
export interface Partner {
  id: string; name: string; type: 'designer' | 'contractor' | 'installer' | 'supplier';
  area: string; skills: string[]; commissionPct: number; status: 'verified' | 'demo' | 'applying';
  ledger: SupplierTrustLedger;
}

/* ----------------------------- Room Upgrade Graph ----------------------------- */
export interface RoomUpgradeGraphNode {
  id: string;
  leak: LeakCategory;
  fix: string;
  unlocks: string[];      // downstream node ids it enables
  avgUpliftPct: number;   // scenario
  confidenceSamples: number; // how many projects inform this edge
}
