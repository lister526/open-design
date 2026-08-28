import type { UserType, PropertyType, RoomType, Goal, Band, Timeline, LeakCategory, PhotoQuality } from './types';

export const USER_TYPES: { value: UserType; label: string; sub: string }[] = [
  { value: 'str_landlord', label: 'Short-term rental landlord', sub: 'Airbnb / Vrbo' },
  { value: 'operator', label: 'Apartment operator', sub: 'Multi-unit portfolio' },
  { value: 'bnb_host', label: 'B&B / guesthouse', sub: 'Boutique stays' },
  { value: 'agent', label: 'Real estate agent', sub: 'Listings & sales' },
  { value: 'designer', label: 'Interior designer', sub: 'Studio / freelance' },
  { value: 'contractor', label: 'Contractor / installer', sub: 'Build & fit-out' },
  { value: 'homeowner', label: 'Homeowner', sub: 'Owner-occupied' },
];

export const PROPERTY_TYPES: { value: PropertyType; label: string; icon: string }[] = [
  { value: 'studio', label: 'Studio', icon: '🏠' },
  { value: 'one_bed', label: '1-bed', icon: '🛏️' },
  { value: 'two_bed', label: '2-bed', icon: '🛌' },
  { value: 'apartment', label: 'Apartment', icon: '🏢' },
  { value: 'house', label: 'House', icon: '🏡' },
  { value: 'serviced', label: 'Serviced apt', icon: '🛎️' },
  { value: 'room', label: 'Private room', icon: '🚪' },
];

export const ROOM_TYPES: { value: RoomType; label: string; icon: string }[] = [
  { value: 'studio', label: 'Studio', icon: '🏠' },
  { value: 'one_bed', label: '1-bed unit', icon: '🛏️' },
  { value: 'two_bed', label: '2-bed unit', icon: '🛌' },
  { value: 'living', label: 'Living room', icon: '🛋️' },
  { value: 'bedroom', label: 'Bedroom', icon: '🛏️' },
  { value: 'kitchen', label: 'Kitchen', icon: '🍳' },
  { value: 'bathroom', label: 'Bathroom', icon: '🚿' },
  { value: 'whole_unit', label: 'Whole unit', icon: '🏢' },
];

export const PHOTO_QUALITIES: { value: PhotoQuality; label: string }[] = [
  { value: 'poor', label: 'Poor' },
  { value: 'average', label: 'Average' },
  { value: 'good', label: 'Good' },
];

export const GOALS: { value: Goal; label: string }[] = [
  { value: 'higher_adr', label: 'Raise ADR (nightly rate)' },
  { value: 'more_bookings', label: 'Improve occupancy' },
  { value: 'better_photos', label: 'Upgrade photos' },
  { value: 'faster_turnover', label: 'Reduce turnover time' },
  { value: 'premium_tier', label: 'Premium repositioning' },
];

export const LEAK_OPTIONS: { value: LeakCategory; label: string }[] = [
  { value: 'photo_pull', label: 'Photos don’t pull clicks' },
  { value: 'amenity_gap', label: 'Missing key amenities' },
  { value: 'design_memorability', label: 'Forgettable / generic design' },
  { value: 'layout_efficiency', label: 'Cramped / awkward layout' },
  { value: 'durability', label: 'Worn / fragile finishes' },
  { value: 'turnover_speed', label: 'Slow turnover between stays' },
  { value: 'compliance_risk', label: 'Safety / compliance concerns' },
];

export const AMENITIES = [
  'Fast Wi-Fi', 'Work desk', 'Espresso / coffee', 'Smart TV', 'Blackout curtains',
  'Washer', 'Dishwasher', 'Air conditioning', 'Self check-in', 'Crib / family',
];

export const BANDS: { value: Band; label: string; hint: string }[] = [
  { value: 'lean', label: 'Lean', hint: 'Max ROI, minimal spend' },
  { value: 'standard', label: 'Standard', hint: 'Balanced revenue refresh' },
  { value: 'premium', label: 'Premium', hint: 'Top-tier repositioning' },
];

export const TIMELINES: { value: Timeline; label: string }[] = [
  { value: 'asap', label: 'ASAP (this month)' },
  { value: '1_3m', label: '1–3 months' },
  { value: '3_6m', label: '3–6 months' },
  { value: 'exploring', label: 'Exploring' },
];

export const COUNTRIES = [
  'United States', 'United Kingdom', 'Japan', 'Singapore', 'UAE', 'Spain', 'Germany',
  'France', 'South Korea', 'Australia', 'Canada', 'Mexico', 'Thailand', 'China', 'Other',
];

export function labelOf<T extends string>(list: { value: T; label: string }[], v: T) {
  return list.find((x) => x.value === v)?.label ?? v;
}
