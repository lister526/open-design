import type { Lead, LeadStatus } from './types';
import { SEED_LEADS } from '../data/seed';

const LEADS_KEY = 'spacepilot.leads';
const WAITLIST_KEY = 'spacepilot.waitlist';
const PARTNERS_KEY = 'spacepilot.partnerApps';

export function genId(prefix = 'L'): string {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`.toUpperCase();
}

export function genReferral(): string {
  return 'SP-' + Math.random().toString(36).slice(2, 8).toUpperCase();
}

// ---------- Leads ----------
export function getLeads(): Lead[] {
  try {
    const raw = localStorage.getItem(LEADS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  // seed on first run
  localStorage.setItem(LEADS_KEY, JSON.stringify(SEED_LEADS));
  return SEED_LEADS;
}

export function saveLead(lead: Lead): void {
  const leads = getLeads();
  const idx = leads.findIndex((l) => l.id === lead.id);
  if (idx >= 0) leads[idx] = lead;
  else leads.unshift(lead);
  localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
}

export function getLead(id: string): Lead | undefined {
  return getLeads().find((l) => l.id === id);
}

export function updateLeadStatus(id: string, status: LeadStatus): void {
  const leads = getLeads();
  const lead = leads.find((l) => l.id === id);
  if (lead) {
    lead.status = status;
    localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
  }
}

// ---------- Waitlist / email capture ----------
export interface WaitlistEntry {
  id: string;
  email: string;
  kind: 'city' | 'partner' | 'newsletter';
  meta?: string;
  createdAt: number;
}

export function getWaitlist(): WaitlistEntry[] {
  try {
    return JSON.parse(localStorage.getItem(WAITLIST_KEY) || '[]');
  } catch { return []; }
}

export function addWaitlist(entry: Omit<WaitlistEntry, 'id' | 'createdAt'>): void {
  const list = getWaitlist();
  list.unshift({ ...entry, id: genId('W'), createdAt: Date.now() });
  localStorage.setItem(WAITLIST_KEY, JSON.stringify(list));
}

// ---------- Partner applications ----------
export interface PartnerApp {
  id: string;
  name: string;
  type: string;
  serviceArea: string;
  skills: string;
  email: string;
  createdAt: number;
}

export function getPartnerApps(): PartnerApp[] {
  try {
    return JSON.parse(localStorage.getItem(PARTNERS_KEY) || '[]');
  } catch { return []; }
}

export function addPartnerApp(app: Omit<PartnerApp, 'id' | 'createdAt'>): void {
  const list = getPartnerApps();
  list.unshift({ ...app, id: genId('P'), createdAt: Date.now() });
  localStorage.setItem(PARTNERS_KEY, JSON.stringify(list));
}

export function resetDemoData(): void {
  localStorage.removeItem(LEADS_KEY);
  localStorage.removeItem(WAITLIST_KEY);
  localStorage.removeItem(PARTNERS_KEY);
}
