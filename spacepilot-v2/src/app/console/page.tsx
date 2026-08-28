import { Suspense } from 'react';
import { Console } from '@/components/sections/Console';

export const metadata = { title: 'Demo Founder Console · SpacePilot' };

export default function ConsolePage() {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Loading…</div>}>
      <Console />
    </Suspense>
  );
}
