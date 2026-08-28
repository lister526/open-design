import { Suspense } from 'react';
import { SiteShell } from '@/components/layout/SiteShell';
import { Landing } from '@/components/sections/Landing';

export default function Page() {
  return (
    <SiteShell>
      <Suspense fallback={null}>
        <Landing />
      </Suspense>
    </SiteShell>
  );
}
