'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Lead, LeadStatus } from '@/lib/types';
import { SEED_LEADS } from '@/lib/seed';

export interface WaitlistEntry { id: string; email: string; kind: 'city' | 'partner' | 'newsletter'; meta?: string; createdAt: number; }
export interface PartnerApp { id: string; name: string; type: string; area: string; skills: string; email: string; createdAt: number; }

interface DataState {
  leads: Lead[];
  waitlist: WaitlistEntry[];
  partnerApps: PartnerApp[];
  addLead: (l: Lead) => void;
  upsertLead: (l: Lead) => void;
  setStatus: (id: string, status: LeadStatus) => void;
  markPaidAudit: (id: string) => void;
  getLead: (id: string) => Lead | undefined;
  addWaitlist: (e: Omit<WaitlistEntry, 'id' | 'createdAt'>) => void;
  addPartnerApp: (a: Omit<PartnerApp, 'id' | 'createdAt'>) => void;
  reset: () => void;
}

const id = (p = 'L') => `${p}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`.toUpperCase();

export const useData = create<DataState>()(
  persist(
    (set, get) => ({
      leads: SEED_LEADS,
      waitlist: [],
      partnerApps: [],
      addLead: (l) => set((s) => ({ leads: [l, ...s.leads] })),
      upsertLead: (l) => set((s) => {
        const idx = s.leads.findIndex((x) => x.id === l.id);
        if (idx < 0) return { leads: [l, ...s.leads] };
        const next = [...s.leads]; next[idx] = l; return { leads: next };
      }),
      setStatus: (lid, status) => set((s) => ({ leads: s.leads.map((l) => (l.id === lid ? { ...l, status } : l)) })),
      markPaidAudit: (lid) => set((s) => ({ leads: s.leads.map((l) => (l.id === lid ? { ...l, paidAudit: true, status: l.status === 'audited' || l.status === 'new' ? 'paid_audit' : l.status } : l)) })),
      getLead: (lid) => get().leads.find((l) => l.id === lid),
      addWaitlist: (e) => set((s) => ({ waitlist: [{ ...e, id: id('W'), createdAt: Date.now() }, ...s.waitlist] })),
      addPartnerApp: (a) => set((s) => ({ partnerApps: [{ ...a, id: id('P'), createdAt: Date.now() }, ...s.partnerApps] })),
      reset: () => set({ leads: SEED_LEADS, waitlist: [], partnerApps: [] }),
    }),
    { name: 'spacepilot.data' },
  ),
);

export const newLeadId = () => id('L');
export const newReferral = () => 'SP-' + Math.random().toString(36).slice(2, 7).toUpperCase();
