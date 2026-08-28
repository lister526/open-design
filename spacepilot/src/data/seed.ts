import type { Lead, SupplierComponent, Partner } from '../lib/types';
import { diagnose, buildQuote } from '../lib/engine';
import type { AuditInput } from '../lib/types';

function makeLead(
  id: string, daysAgo: number, status: Lead['status'], input: AuditInput,
): Lead {
  const diagnosis = diagnose(input);
  const quote = buildQuote(input, input.budgetBand);
  return {
    id,
    createdAt: Date.now() - daysAgo * 86400000,
    status,
    input,
    diagnosis,
    quote,
    referralCode: 'SP-' + id.slice(-4),
  };
}

export const SEED_LEADS: Lead[] = [
  makeLead('L-9XK2', 1, 'proposal_sent', {
    userType: 'short_stay', country: 'Japan', city: 'Osaka', roomType: 'studio',
    roomSizeSqm: 28, pains: ['bad_photos', 'no_storage'], budgetBand: 'standard',
    style: 'japandi', timeline: 'asap', outcome: 'better_photos',
    email: 'kenji@stayosaka.jp', contactChannel: 'LINE @stayosaka', hasPhoto: true, hasFloorPlan: true,
  }),
  makeLead('L-7TB1', 2, 'deposit_paid', {
    userType: 'landlord', country: 'United Kingdom', city: 'Manchester', roomType: 'whole_unit',
    roomSizeSqm: 52, pains: ['low_rent', 'looks_dated'], budgetBand: 'premium',
    style: 'modern_luxe', timeline: '1_3m', outcome: 'higher_rent',
    email: 'a.shaw@northlet.co.uk', contactChannel: 'WhatsApp', hasPhoto: true, hasFloorPlan: false,
  }),
  makeLead('L-3QM8', 0, 'new', {
    userType: 'homeowner', country: 'United States', city: 'Austin', roomType: 'kitchen',
    roomSizeSqm: 18, pains: ['bad_layout', 'poor_lighting'], budgetBand: 'premium',
    style: 'warm_minimal', timeline: '3_6m', outcome: 'family_upgrade',
    email: 'maria.lopez@gmail.com', contactChannel: '', hasPhoto: true, hasFloorPlan: true,
  }),
  makeLead('L-5RD4', 4, 'completed', {
    userType: 'short_stay', country: 'Spain', city: 'Barcelona', roomType: 'living_room',
    roomSizeSqm: 24, pains: ['looks_dated', 'bad_photos'], budgetBand: 'standard',
    style: 'coastal', timeline: 'asap', outcome: 'better_photos',
    email: 'host@bcnstays.es', contactChannel: 'WhatsApp', hasPhoto: true, hasFloorPlan: false,
  }),
  makeLead('L-1FF9', 3, 'audited', {
    userType: 'designer', country: 'Singapore', city: 'Singapore', roomType: 'bedroom',
    roomSizeSqm: 16, pains: ['no_storage'], budgetBand: 'standard',
    style: 'scandi', timeline: '1_3m', outcome: 'better_storage',
    email: 'studio@formline.sg', contactChannel: '', hasPhoto: false, hasFloorPlan: true,
  }),
  makeLead('L-8AC0', 6, 'in_delivery', {
    userType: 'landlord', country: 'UAE', city: 'Dubai', roomType: 'whole_unit',
    roomSizeSqm: 70, pains: ['low_rent', 'looks_dated', 'poor_lighting'], budgetBand: 'premium',
    style: 'modern_luxe', timeline: 'asap', outcome: 'higher_rent',
    email: 'invest@gulfrent.ae', contactChannel: 'WhatsApp +971', hasPhoto: true, hasFloorPlan: true,
  }),
  makeLead('L-2HJ7', 5, 'aftercare', {
    userType: 'homeowner', country: 'South Korea', city: 'Seoul', roomType: 'entryway',
    roomSizeSqm: 8, pains: ['no_storage', 'not_accessible'], budgetBand: 'lean',
    style: 'warm_minimal', timeline: '3_6m', outcome: 'aging_friendly',
    email: 'jiwon@naver.com', contactChannel: 'KakaoTalk', hasPhoto: true, hasFloorPlan: false,
  }),
];

export const SUPPLIER_COMPONENTS: SupplierComponent[] = [
  {
    id: 'C-101', name: 'Modular Wall Storage System', category: 'Storage',
    modularUseCase: 'Living room / entryway vertical storage', costUsd: 220, retailUsd: 540,
    leadTimeDays: 18, countries: ['US', 'EU', 'JP', 'SG'], installComplexity: 'medium',
    complianceNote: 'Wall-anchor load rating per local code', modelUrl: 'https://models.spacepilot.ai/c-101.glb', image: '🗄️',
  },
  {
    id: 'C-102', name: 'Layered LED Lighting Kit', category: 'Lighting',
    modularUseCase: 'Ambient + task + accent in any room', costUsd: 85, retailUsd: 230,
    leadTimeDays: 7, countries: ['US', 'EU', 'JP', 'KR', 'AE'], installComplexity: 'low',
    complianceNote: 'Voltage/plug variant per region (CE/UL/PSE)', modelUrl: 'https://models.spacepilot.ai/c-102.glb', image: '💡',
  },
  {
    id: 'C-103', name: 'Fold-Away Workspace Desk', category: 'Furniture',
    modularUseCase: 'Studio / home office space-saving', costUsd: 140, retailUsd: 360,
    leadTimeDays: 14, countries: ['US', 'EU', 'SG'], installComplexity: 'low',
    complianceNote: 'Formaldehyde emission class E1/CARB', modelUrl: 'https://models.spacepilot.ai/c-103.glb', image: '🪑',
  },
  {
    id: 'C-104', name: 'Photo-Ready Staging Bundle', category: 'Soft goods',
    modularUseCase: 'Short-stay listing styling kit', costUsd: 95, retailUsd: 290,
    leadTimeDays: 5, countries: ['US', 'EU', 'JP', 'KR', 'AE', 'SG'], installComplexity: 'low',
    complianceNote: 'Textile flammability label where required', modelUrl: 'https://models.spacepilot.ai/c-104.glb', image: '🛏️',
  },
  {
    id: 'C-105', name: 'Compact Modular Kitchen Block', category: 'Kitchen',
    modularUseCase: 'Studio / small unit kitchenette', costUsd: 620, retailUsd: 1480,
    leadTimeDays: 28, countries: ['EU', 'JP', 'SG'], installComplexity: 'high',
    complianceNote: 'Plumbing & electrical certification required', modelUrl: 'https://models.spacepilot.ai/c-105.glb', image: '🍳',
  },
  {
    id: 'C-106', name: 'Aging-Friendly Bathroom Fittings', category: 'Accessibility',
    modularUseCase: 'Grab rails, non-slip, accessible fixtures', costUsd: 175, retailUsd: 420,
    leadTimeDays: 12, countries: ['US', 'EU', 'JP', 'KR'], installComplexity: 'medium',
    complianceNote: 'Accessibility standard (ADA/local) compliance', modelUrl: 'https://models.spacepilot.ai/c-106.glb', image: '🚿',
  },
  {
    id: 'C-107', name: 'Entryway Smart Console', category: 'Storage',
    modularUseCase: 'Shoe + key + parcel drop zone', costUsd: 110, retailUsd: 280,
    leadTimeDays: 10, countries: ['US', 'EU', 'KR', 'SG'], installComplexity: 'low',
    complianceNote: 'Standard furniture safety labeling', modelUrl: 'https://models.spacepilot.ai/c-107.glb', image: '🚪',
  },
  {
    id: 'C-108', name: 'Acoustic Wall Panel Set', category: 'Finishes',
    modularUseCase: 'Bedroom / office acoustic + style', costUsd: 130, retailUsd: 340,
    leadTimeDays: 15, countries: ['US', 'EU', 'JP'], installComplexity: 'medium',
    complianceNote: 'Fire-rating class per local building code', modelUrl: 'https://models.spacepilot.ai/c-108.glb', image: '🧱',
  },
];

export const PARTNERS: Partner[] = [
  { id: 'PA-01', name: 'Formline Studio', type: 'designer', serviceArea: 'Singapore', skills: ['Small-space', 'Japandi', 'Storage'], commissionPct: 12, rating: 4.9, projects: 38, status: 'active' },
  { id: 'PA-02', name: 'NorthFit Contractors', type: 'contractor', serviceArea: 'Manchester, UK', skills: ['Rental refit', 'Kitchen', 'Bath'], commissionPct: 10, rating: 4.7, projects: 64, status: 'active' },
  { id: 'PA-03', name: 'Osaka Makeover Co.', type: 'installer', serviceArea: 'Kansai, Japan', skills: ['Short-stay', 'Lighting', 'Staging'], commissionPct: 11, rating: 4.8, projects: 51, status: 'active' },
  { id: 'PA-04', name: 'GulfHome Supply', type: 'supplier', serviceArea: 'UAE / GCC', skills: ['Modular kitchen', 'Luxe finishes'], commissionPct: 0, rating: 4.6, projects: 22, status: 'active' },
  { id: 'PA-05', name: 'BCN Interiors', type: 'designer', serviceArea: 'Barcelona, Spain', skills: ['Coastal', 'Photo-ready'], commissionPct: 13, rating: 4.9, projects: 29, status: 'waitlist' },
];
