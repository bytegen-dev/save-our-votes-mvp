import { requireAuth } from '@/lib/auth/middleware';
import { api } from '@/lib/api/client';
import { ElectionResultsClient } from './election-results-client';
import { notFound } from 'next/navigation';

async function getElection(electionId: string) {
  try {
    const response = await api.elections.get(electionId);
    return response.data.election || null;
  } catch (error) {
    console.error('Failed to fetch election:', error);
    return null;
  }
}

async function getElectionResults(electionId: string) {
  try {
    const response = await api.votes.getResults(electionId);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch results:', error);
    return null;
  }
}

export default async function ElectionResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth();
  const { id } = await params;

  const [election, results] = await Promise.all([
    getElection(id),
    getElectionResults(id),
  ]);

  if (!election) {
    notFound();
  }

  return <ElectionResultsClient election={election} results={results} />;
}
