import { requireAuth } from '@/lib/auth/middleware';
import { api } from '@/lib/api/client';
import { notFound } from 'next/navigation';
import { ElectionDetailClient } from './election-detail-client';
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

async function getVoterCount(electionId: string): Promise<number> {
  try {
    const response = await api.voters.list(electionId);
    return response.data.voters?.length || 0;
  } catch (error) {
    console.error('Failed to fetch voter count:', error);
    return 0;
  }
}

export default async function ElectionDetailPage({
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

  const voterCount = await getVoterCount(id);

  return <ElectionDetailClient election={election} voterCount={voterCount} />;
}
