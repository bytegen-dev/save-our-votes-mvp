import { requireAuth } from '@/lib/auth/middleware';
import { api } from '@/lib/api/client';
import { ElectionsPageClient } from './elections-page-client';
import type { Election } from '@/lib/types/election';

async function getElections() {
  try {
    const response = await api.elections.list();
    return response.data.docs || [];
  } catch (error) {
    console.error('Failed to fetch elections:', error);
    return [];
  }
}

export default async function ElectionsPage() {
  await requireAuth();
  const elections = await getElections();

  return <ElectionsPageClient initialElections={elections} />;
}
