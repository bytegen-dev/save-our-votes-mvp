import { requireAuth } from '@/lib/auth/middleware';
import { NewElectionForm } from './new-election-form';

export default async function NewElectionPage() {
  const session = await requireAuth();
  
  // Extract user ID from Better Auth session
  const userId = (session.user as any)?.id || (session.user as any)?._id;
  
  if (!userId) {
    throw new Error('Unable to get user ID from session');
  }

  return <NewElectionForm userId={userId} />;
}
