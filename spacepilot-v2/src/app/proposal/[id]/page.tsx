import { Proposal } from '@/components/sections/Proposal';

export const metadata = { title: 'Your Proposal · SpacePilot' };

export default async function ProposalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Proposal id={id} />;
}
