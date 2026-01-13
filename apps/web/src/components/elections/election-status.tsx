import { Badge } from '@/components/ui/badge';
import type { ElectionStatus } from '@/lib/types/election';

export function getStatusColor(status: ElectionStatus): string {
  switch (status) {
    case 'draft':
      return 'bg-gray-500 !text-white';
    case 'scheduled':
      return 'bg-blue-500 !text-white';
    case 'open':
      return 'bg-green-500 !text-white';
    case 'closed':
      return 'bg-gray-400 !text-white';
    default:
      return 'bg-gray-500 !text-white';
  }
}

export function getStatusLabel(status: ElectionStatus): string {
  switch (status) {
    case 'draft':
      return 'Draft';
    case 'scheduled':
      return 'Scheduled';
    case 'open':
      return 'Active';
    case 'closed':
      return 'Closed';
    default:
      return status;
  }
}

export function getElectionStatus(election: { startAt: string; endAt: string; status?: ElectionStatus }): ElectionStatus {
  const now = new Date();
  const startAt = new Date(election.startAt);
  const endAt = new Date(election.endAt);

  if (election.status === 'draft') {
    return 'draft';
  }

  if (now < startAt) return 'scheduled';
  if (now >= startAt && now <= endAt) return 'open';
  if (now > endAt) return 'closed';
  
  return election.status || 'draft';
}

interface ElectionStatusBadgeProps {
  election: { startAt: string; endAt: string; status: ElectionStatus };
}

export function ElectionStatusBadge({ election }: ElectionStatusBadgeProps) {
  const status = getElectionStatus(election);
  
  return (
    <Badge variant="secondary" className={getStatusColor(status)}>
      {getStatusLabel(status)}
    </Badge>
  );
}
