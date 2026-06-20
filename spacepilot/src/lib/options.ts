import type {
  UserType, RoomType, PainPoint, Outcome, Style, Timeline, BudgetBand,
} from './types';

export const USER_TYPES: { value: UserType; label: string; sub: string }[] = [
  { value: 'landlord', label: 'Landlord', sub: 'Long-term rentals' },
  { value: 'short_stay', label: 'Short-stay operator', sub: 'Airbnb / serviced' },
  { value: 'homeowner', label: 'Homeowner', sub: 'Owner-occupied' },
  { value: 'designer', label: 'Designer', sub: 'Studio / freelance' },
  { value: 'contractor', label: 'Contractor', sub: 'Build / install' },
  { value: 'supplier', label: 'Supplier', sub: 'Furniture / materials' },
];

export const ROOM_TYPES: { value: RoomType; label: string; icon: string }[] = [
  { value: 'living_room', label: 'Living room', icon: '🛋️' },
  { value: 'bedroom', label: 'Bedroom', icon: '🛏️' },
  { value: 'kitchen', label: 'Kitchen', icon: '🍳' },
  { value: 'bathroom', label: 'Bathroom', icon: '🚿' },
  { value: 'entryway', label: 'Entryway', icon: '🚪' },
  { value: 'home_office', label: 'Home office', icon: '💻' },
  { value: 'studio', label: 'Studio unit', icon: '🏠' },
  { value: 'kids_room', label: 'Kids room', icon: '🧸' },
  { value: 'whole_unit', label: 'Whole unit', icon: '🏢' },
];

export const PAIN_POINTS: { value: PainPoint; label: string }[] = [
  { value: 'no_storage', label: 'Not enough storage' },
  { value: 'looks_dated', label: 'Looks dated / tired' },
  { value: 'bad_layout', label: 'Inefficient layout' },
  { value: 'poor_lighting', label: 'Poor lighting' },
  { value: 'low_rent', label: 'Rent below market' },
  { value: 'bad_photos', label: 'Photos don’t convert' },
  { value: 'not_accessible', label: 'Not accessible / aging-friendly' },
  { value: 'cant_sell', label: 'Slow to sell' },
];

export const OUTCOMES: { value: Outcome; label: string }[] = [
  { value: 'higher_rent', label: 'Higher rent' },
  { value: 'better_storage', label: 'Better storage' },
  { value: 'faster_sale', label: 'Faster sale' },
  { value: 'better_photos', label: 'Photo-ready listing' },
  { value: 'aging_friendly', label: 'Aging-friendly upgrade' },
  { value: 'family_upgrade', label: 'Family upgrade' },
];

export const STYLES: { value: Style; label: string; swatch: string }[] = [
  { value: 'warm_minimal', label: 'Warm minimal', swatch: 'from-amber-100 to-stone-200' },
  { value: 'japandi', label: 'Japandi', swatch: 'from-stone-200 to-emerald-100' },
  { value: 'modern_luxe', label: 'Modern luxe', swatch: 'from-zinc-300 to-zinc-100' },
  { value: 'scandi', label: 'Scandinavian', swatch: 'from-sky-100 to-slate-100' },
  { value: 'industrial', label: 'Industrial', swatch: 'from-zinc-400 to-zinc-200' },
  { value: 'coastal', label: 'Coastal', swatch: 'from-sky-200 to-cyan-100' },
];

export const TIMELINES: { value: Timeline; label: string }[] = [
  { value: 'asap', label: 'ASAP (this month)' },
  { value: '1_3m', label: '1–3 months' },
  { value: '3_6m', label: '3–6 months' },
  { value: 'exploring', label: 'Just exploring' },
];

export const BUDGET_BANDS: { value: BudgetBand; label: string; hint: string }[] = [
  { value: 'lean', label: 'Lean', hint: 'Smart refresh, max ROI' },
  { value: 'standard', label: 'Standard', hint: 'Balanced transformation' },
  { value: 'premium', label: 'Premium', hint: 'High-end, photo-ready' },
];

export const COUNTRIES = [
  'United States', 'United Kingdom', 'Japan', 'Singapore', 'UAE',
  'Germany', 'France', 'Spain', 'South Korea', 'Australia',
  'Canada', 'Hong Kong', 'China', 'Brazil', 'Other',
];

export function labelFor<T extends string>(
  list: { value: T; label: string }[], v: T,
): string {
  return list.find((x) => x.value === v)?.label ?? v;
}
