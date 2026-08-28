import { Suspense } from 'react';
import { Audit } from '@/components/sections/Audit';

export const metadata = { title: 'Listing Revenue Leak Scan · SpacePilot' };

export default function AuditPage() {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Loading…</div>}>
      <Audit />
    </Suspense>
  );
}
