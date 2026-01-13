import { requireAuth } from '@/lib/auth/middleware';
import { api } from '@/lib/api/client';
import { notFound, redirect } from 'next/navigation';
import { DuplicateElectionClient } from './duplicate-election-client';
import type { Election } from '@/lib/types/election';

async function getElection(id: string): Promise<Election | null> {
  try {
    const response = await api.elections.get(id);
    return response.data.election || null;
  } catch (error) {
    console.error('Failed to fetch election:', error);
    return null;
  }
}

export default async function DuplicateElectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth();
  const { id } = await params;
  const election = await getElection(id);

  if (!election) {
    notFound();
  }

  return <DuplicateElectionClient election={election} />;
}
