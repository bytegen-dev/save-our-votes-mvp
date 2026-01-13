import { requireAuth } from '@/lib/auth/middleware';
import { api } from '@/lib/api/client';
import { ResultsOverviewClient } from './results-overview-client';

async function getElections() {
  try {
    const response = await api.elections.list();
    return response.data.docs || [];
  } catch (error) {
    console.error('Failed to fetch elections:', error);
    return [];
  }
}

export default async function ResultsPage() {
  await requireAuth();
  const elections = await getElections();

  return <ResultsOverviewClient elections={elections} />;
}
