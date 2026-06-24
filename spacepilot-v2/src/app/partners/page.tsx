import { SiteShell } from '@/components/layout/SiteShell';
import { Partners } from '@/components/sections/Partners';

export const metadata = { title: 'Partner Program · SpacePilot' };

export default function PartnersPage() {
  return (
    <SiteShell>
      <Partners />
    </SiteShell>
  );
}
