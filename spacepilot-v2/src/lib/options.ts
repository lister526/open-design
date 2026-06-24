import type { UserType, RoomType, Goal, Band, Timeline } from './types';

export const USER_TYPES: { value: UserType; label: string; sub: string }[] = [
  { value: 'str_landlord', label: 'Short-term rental landlord', sub: 'Airbnb / VRBO' },
  { value: 'operator', label: 'Apartment operator', sub: 'Multi-unit portfolio' },
  { value: 'bnb_host', label: 'B&B / guesthouse', sub: 'Boutique stays' },
  { value: 'agent', label: 'Real estate agent', sub: 'Listings & sales' },
  { value: 'designer', label: 'Interior designer', sub: 'Studio / freelance' },
  { value: 'contractor', label: 'Contractor / installer', sub: 'Build & fit-out' },
  { value: 'homeowner', label: 'Homeowner', sub: 'Owner-occupied' },
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

export const GOALS: { value: Goal; label: string }[] = [
  { value: 'higher_adr', label: 'Higher nightly rate (ADR)' },
  { value: 'better_photos', label: 'Photos that convert' },
  { value: 'more_occupancy', label: 'Higher occupancy' },
  { value: 'faster_turnover', label: 'Faster turnover' },
  { value: 'premium_tier', label: 'Move up a price tier' },
  { value: 'aging_friendly', label: 'Accessible / aging-friendly' },
];

export const BANDS: { value: Band; label: string; hint: string }[] = [
  { value: 'lean', label: 'Lean', hint: 'Max ROI refresh' },
  { value: 'standard', label: 'Standard', hint: 'Balanced upgrade' },
  { value: 'premium', label: 'Premium', hint: 'Top-tier, photo-ready' },
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
