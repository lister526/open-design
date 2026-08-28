'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Proposal } from '@/components/sections/Proposal';

function ProposalByQuery() {
  const params = useSearchParams();
  const id = params.get('id') || 'demo';
  return <Proposal id={id} />;
}

export default function ProposalQueryPage() {
  return (
    <Suspense fallback={null}>
      <ProposalByQuery />
    </Suspense>
  );
}
