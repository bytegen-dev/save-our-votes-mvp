import { notFound } from 'next/navigation';
import { api } from '@/lib/api/client';
import type { Election } from '@/lib/types/election';
import { VotingPageClient } from './voting-page-client';

async function getElectionBySlug(slug: string): Promise<Election | null> {
  try {
    const response = await api.elections.getBySlug(slug);
    if (response.status === 'success' && response.data?.election) {
      return response.data.election;
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch election:', error);
    return null;
  }
}

export default async function VotingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const election = await getElectionBySlug(slug);

  if (!election) {
    notFound();
  }

  return <VotingPageClient election={election} />;
}
