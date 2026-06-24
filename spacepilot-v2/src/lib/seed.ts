import type { AuditInput, Lead, SupplierComponent, Partner } from './types';
import { diagnose } from './engine';

function mk(id: string, daysAgo: number, status: Lead['status'], paidAudit: boolean, input: AuditInput): Lead {
  return { id, createdAt: Date.now() - daysAgo * 86400000, status, paidAudit, input, diagnosis: diagnose(input), referral: 'SP-' + id.slice(-4) };
}

export const SEED_LEADS: Lead[] = [
  mk('L-9XK2', 1, 'proposal_sent', true, { userType: 'bnb_host', country: 'Japan', city: 'Osaka', roomType: 'studio', sizeSqm: 28, nightlyRateUsd: 120, occupancyPct: 72, goals: ['better_photos', 'higher_adr'], band: 'standard', timeline: 'asap', hasPhotos: true, hasFloorPlan: true, email: 'kenji@stayosaka.jp', contact: 'LINE @stayosaka' }),
  mk('L-7TB1', 2, 'deposit_paid', true, { userType: 'operator', country: 'United Kingdom', city: 'Manchester', roomType: 'whole_unit', sizeSqm: 52, nightlyRateUsd: 180, occupancyPct: 68, goals: ['premium_tier', 'higher_adr'], band: 'premium', timeline: '1_3m', hasPhotos: true, hasFloorPlan: false, email: 'a.shaw@northlet.co.uk', contact: 'WhatsApp' }),
  mk('L-3QM8', 0, 'paid_audit', true, { userType: 'str_landlord', country: 'United States', city: 'Austin', roomType: 'one_bed', sizeSqm: 42, nightlyRateUsd: 210, occupancyPct: 75, goals: ['better_photos', 'more_occupancy'], band: 'standard', timeline: '1_3m', hasPhotos: true, hasFloorPlan: true, email: 'maria.lopez@gmail.com', contact: '' }),
  mk('L-5RD4', 4, 'completed', true, { userType: 'bnb_host', country: 'Spain', city: 'Barcelona', roomType: 'living', sizeSqm: 24, nightlyRateUsd: 95, occupancyPct: 80, goals: ['better_photos'], band: 'standard', timeline: 'asap', hasPhotos: true, hasFloorPlan: false, email: 'host@bcnstays.es', contact: 'WhatsApp' }),
  mk('L-1FF9', 3, 'audited', false, { userType: 'designer', country: 'Singapore', city: 'Singapore', roomType: 'bedroom', sizeSqm: 16, nightlyRateUsd: 0, occupancyPct: 0, goals: ['premium_tier'], band: 'standard', timeline: '1_3m', hasPhotos: false, hasFloorPlan: true, email: 'studio@formline.sg', contact: '' }),
  mk('L-8AC0', 6, 'in_delivery', true, { userType: 'operator', country: 'UAE', city: 'Dubai', roomType: 'whole_unit', sizeSqm: 70, nightlyRateUsd: 320, occupancyPct: 70, goals: ['premium_tier', 'higher_adr', 'better_photos'], band: 'premium', timeline: 'asap', hasPhotos: true, hasFloorPlan: true, email: 'invest@gulfrent.ae', contact: 'WhatsApp +971' }),
  mk('L-2HJ7', 5, 'new', false, { userType: 'str_landlord', country: 'United States', city: 'Miami', roomType: 'studio', sizeSqm: 30, nightlyRateUsd: 160, occupancyPct: 62, goals: ['higher_adr'], band: 'lean', timeline: '3_6m', hasPhotos: true, hasFloorPlan: false, email: 'frank@miamistays.com', contact: '' }),
];

export const SUPPLIERS: SupplierComponent[] = [
  { id: 'C-101', name: 'Modular Wall Storage System', category: 'Storage', useCase: 'Vertical storage for compact units', costUsd: 220, retailUsd: 540, leadTimeDays: 18, markets: ['US', 'EU', 'JP', 'SG'], install: 'medium', compliance: 'Wall-anchor load rating per local code', emoji: '🗄️' },
  { id: 'C-102', name: 'Layered LED Lighting Kit', category: 'Lighting', useCase: 'Ambient + task + accent in any room', costUsd: 85, retailUsd: 230, leadTimeDays: 7, markets: ['US', 'EU', 'JP', 'KR', 'AE'], install: 'low', compliance: 'CE/UL/PSE per region', emoji: '💡' },
  { id: 'C-103', name: 'Photo-Ready Staging Bundle', category: 'Soft goods', useCase: 'Short-stay listing styling kit', costUsd: 95, retailUsd: 290, leadTimeDays: 5, markets: ['US', 'EU', 'JP', 'KR', 'AE', 'SG'], install: 'low', compliance: 'Textile flammability label where required', emoji: '🛏️' },
  { id: 'C-104', name: 'Signature Headboard Wall', category: 'Furniture', useCase: 'High-impact bedroom focal point', costUsd: 320, retailUsd: 760, leadTimeDays: 16, markets: ['US', 'EU', 'JP'], install: 'medium', compliance: 'Formaldehyde class E1/CARB', emoji: '🛋️' },
  { id: 'C-105', name: 'Compact Modular Kitchenette', category: 'Kitchen', useCase: 'Studio / small unit kitchen', costUsd: 620, retailUsd: 1480, leadTimeDays: 28, markets: ['EU', 'JP', 'SG'], install: 'high', compliance: 'Plumbing & electrical certification', emoji: '🍳' },
  { id: 'C-106', name: 'Aging-Friendly Bath Fittings', category: 'Accessibility', useCase: 'Grab rails, non-slip, accessible fixtures', costUsd: 175, retailUsd: 420, leadTimeDays: 12, markets: ['US', 'EU', 'JP', 'KR'], install: 'medium', compliance: 'ADA/local accessibility standard', emoji: '🚿' },
  { id: 'C-107', name: 'Entryway Smart Console', category: 'Storage', useCase: 'Shoe + key + parcel drop zone', costUsd: 110, retailUsd: 280, leadTimeDays: 10, markets: ['US', 'EU', 'KR', 'SG'], install: 'low', compliance: 'Standard furniture safety labeling', emoji: '🚪' },
  { id: 'C-108', name: 'Acoustic Wall Panel Set', category: 'Finishes', useCase: 'Bedroom / office acoustic + style', costUsd: 130, retailUsd: 340, leadTimeDays: 15, markets: ['US', 'EU', 'JP'], install: 'medium', compliance: 'Fire-rating class per local code', emoji: '🧱' },
];

export const PARTNERS: Partner[] = [
  { id: 'PA-01', name: 'Formline Studio', type: 'designer', area: 'Singapore', skills: ['Small-space', 'Japandi', 'Storage'], commissionPct: 12, rating: 4.9, projects: 38, status: 'active' },
  { id: 'PA-02', name: 'NorthFit Contractors', type: 'contractor', area: 'Manchester, UK', skills: ['Rental refit', 'Kitchen', 'Bath'], commissionPct: 10, rating: 4.7, projects: 64, status: 'active' },
  { id: 'PA-03', name: 'Osaka Makeover Co.', type: 'installer', area: 'Kansai, Japan', skills: ['Short-stay', 'Lighting', 'Staging'], commissionPct: 11, rating: 4.8, projects: 51, status: 'active' },
  { id: 'PA-04', name: 'GulfHome Supply', type: 'supplier', area: 'UAE / GCC', skills: ['Modular kitchen', 'Luxe finishes'], commissionPct: 0, rating: 4.6, projects: 22, status: 'active' },
  { id: 'PA-05', name: 'BCN Interiors', type: 'designer', area: 'Barcelona, Spain', skills: ['Coastal', 'Photo-ready'], commissionPct: 13, rating: 4.9, projects: 29, status: 'waitlist' },
];
