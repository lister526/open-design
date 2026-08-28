// Shared domain types for SpacePilot AI

export type UserType =
  | 'homeowner'
  | 'landlord'
  | 'short_stay'
  | 'designer'
  | 'contractor'
  | 'supplier';

export type RoomType =
  | 'living_room'
  | 'bedroom'
  | 'kitchen'
  | 'bathroom'
  | 'entryway'
  | 'home_office'
  | 'studio'
  | 'kids_room'
  | 'whole_unit';

export type PainPoint =
  | 'no_storage'
  | 'looks_dated'
  | 'bad_layout'
  | 'poor_lighting'
  | 'low_rent'
  | 'bad_photos'
  | 'not_accessible'
  | 'cant_sell';

export type Outcome =
  | 'higher_rent'
  | 'better_storage'
  | 'faster_sale'
  | 'better_photos'
  | 'aging_friendly'
  | 'family_upgrade';

export type Style =
  | 'warm_minimal'
  | 'japandi'
  | 'modern_luxe'
  | 'scandi'
  | 'industrial'
  | 'coastal';

export type Timeline = 'asap' | '1_3m' | '3_6m' | 'exploring';

export type BudgetBand = 'lean' | 'standard' | 'premium';

export type LeadStatus =
  | 'new'
  | 'audited'
  | 'proposal_sent'
  | 'deposit_paid'
  | 'in_delivery'
  | 'completed'
  | 'aftercare';

export interface AuditInput {
  userType: UserType;
  country: string;
  city: string;
  roomType: RoomType;
  roomSizeSqm: number;
  pains: PainPoint[];
  budgetBand: BudgetBand;
  style: Style;
  timeline: Timeline;
  outcome: Outcome;
  email: string;
  contactChannel: string; // whatsapp/line/wechat handle
  hasPhoto: boolean;
  hasFloorPlan: boolean;
}

export interface Diagnosis {
  opportunityScore: number; // 0-100
  intentTier: 'cold' | 'warm' | 'hot' | 'priority';
  summary: string;
  projectLowUsd: number;
  projectHighUsd: number;
  recommendedPackage: string;
  recommendedPackagePriceUsd: number;
  roiAngle?: string;
  modules: string[];
  riskNotes: string[];
}

export interface QuoteLine {
  key: string;
  label: string;
  customerUsd: number;
  costUsd: number; // internal cost (admin only)
}

export interface Quote {
  band: BudgetBand;
  lines: QuoteLine[];
  customerTotalUsd: number;
  costTotalUsd: number;
  grossMarginUsd: number;
  grossMarginPct: number;
}

export interface Lead {
  id: string;
  createdAt: number;
  status: LeadStatus;
  input: AuditInput;
  diagnosis: Diagnosis;
  quote: Quote;
  referralCode?: string;
}

export interface SupplierComponent {
  id: string;
  name: string;
  category: string;
  modularUseCase: string;
  costUsd: number;
  retailUsd: number;
  leadTimeDays: number;
  countries: string[];
  installComplexity: 'low' | 'medium' | 'high';
  complianceNote: string;
  modelUrl: string;
  image: string; // emoji/placeholder
}

export interface Partner {
  id: string;
  name: string;
  type: 'designer' | 'contractor' | 'installer' | 'supplier';
  serviceArea: string;
  skills: string[];
  commissionPct: number;
  rating: number;
  projects: number;
  status: 'active' | 'waitlist';
}
