export type UserType = 'str_landlord' | 'operator' | 'bnb_host' | 'agent' | 'designer' | 'contractor' | 'homeowner';
export type RoomType = 'studio' | 'one_bed' | 'two_bed' | 'living' | 'bedroom' | 'kitchen' | 'bathroom' | 'whole_unit';
export type Goal = 'higher_adr' | 'better_photos' | 'more_occupancy' | 'faster_turnover' | 'premium_tier' | 'aging_friendly';
export type Band = 'lean' | 'standard' | 'premium';
export type Timeline = 'asap' | '1_3m' | '3_6m' | 'exploring';
export type LeadStatus = 'new' | 'audited' | 'paid_audit' | 'proposal_sent' | 'deposit_paid' | 'in_delivery' | 'completed';

export interface AuditInput {
  userType: UserType;
  country: string;
  city: string;
  roomType: RoomType;
  sizeSqm: number;
  nightlyRateUsd: number;
  occupancyPct: number;
  goals: Goal[];
  band: Band;
  timeline: Timeline;
  hasPhotos: boolean;
  hasFloorPlan: boolean;
  email: string;
  contact: string;
}

export interface RoiScenario {
  monthlyUpliftUsd: number;
  annualUpliftUsd: number;
  paybackMonths: number;
  adrUpliftPct: number;
}

export interface Diagnosis {
  score: number;
  tier: 'cold' | 'warm' | 'hot' | 'priority';
  summary: string;
  projectLowUsd: number;
  projectHighUsd: number;
  recommendedPackage: string;
  modules: { name: string; costUsd: number; retailUsd: number }[];
  roi: RoiScenario;
  risks: string[];
}

export interface QuoteLine { key: string; label: string; customerUsd: number; costUsd: number; }
export interface Quote {
  band: Band;
  lines: QuoteLine[];
  customerTotalUsd: number;
  costTotalUsd: number;
  platformFeeUsd: number;
  marginUsd: number;
  marginPct: number;
}

export interface Lead {
  id: string;
  createdAt: number;
  status: LeadStatus;
  paidAudit: boolean;
  input: AuditInput;
  diagnosis: Diagnosis;
  referral: string;
}

export interface SupplierComponent {
  id: string; name: string; category: string; useCase: string;
  costUsd: number; retailUsd: number; leadTimeDays: number;
  markets: string[]; install: 'low' | 'medium' | 'high'; compliance: string; emoji: string;
}

export interface Partner {
  id: string; name: string; type: 'designer' | 'contractor' | 'installer' | 'supplier';
  area: string; skills: string[]; commissionPct: number; rating: number; projects: number; status: 'active' | 'waitlist';
}
