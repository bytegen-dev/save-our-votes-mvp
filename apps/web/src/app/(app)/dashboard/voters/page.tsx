import { requireAuth } from '@/lib/auth/middleware';
import { api } from '@/lib/api/client';
import { VotersPageClient } from './voters-page-client';

async function getElections() {
  try {
    const response = await api.elections.list();
    return response.data.docs || [];
  } catch (error) {
    console.error('Failed to fetch elections:', error);
    return [];
  }
}

async function getVoters(electionId: string | null) {
  if (!electionId) {
    return null;
  }

  try {
    const response = await api.voters.list(electionId);
    return response.data.voters || [];
  } catch (error) {
    console.error('Failed to fetch voters:', error);
    return null;
  }
}

export default async function VotersPage({
  searchParams,
}: {
  searchParams: Promise<{ election?: string }>;
}) {
  await requireAuth();
  const params = await searchParams;
  const electionId = params.election;
  const elections = await getElections();
  const voters = electionId ? await getVoters(electionId) : null;

  return <VotersPageClient elections={elections} voters={voters} />;
}
