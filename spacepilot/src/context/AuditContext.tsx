import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Lead } from '../lib/types';

interface AuditCtx {
  activeLead: Lead | null;
  setActiveLead: (l: Lead | null) => void;
}

const Ctx = createContext<AuditCtx | null>(null);

export function AuditProvider({ children }: { children: ReactNode }) {
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  return <Ctx.Provider value={{ activeLead, setActiveLead }}>{children}</Ctx.Provider>;
}

export function useAudit(): AuditCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAudit must be used within AuditProvider');
  return ctx;
}
