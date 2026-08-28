import { Proposal } from '@/components/sections/Proposal';
import { SEED_LEADS } from '@/lib/seed';

export const metadata = { title: 'Your Proposal · SpacePilot' };

// Pre-generate demo + all seed proposals so they work on a fully static export.
// Any other id is handled client-side via the query-param page (/proposal?id=...).
export function generateStaticParams() {
  return [{ id: 'demo' }, ...SEED_LEADS.map((l) => ({ id: l.id }))];
}

export const dynamicParams = false;

export default async function ProposalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Proposal id={id} />;
}
