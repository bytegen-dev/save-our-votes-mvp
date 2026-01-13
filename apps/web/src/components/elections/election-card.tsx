'use client';

import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  BarChart3,
  FileText,
} from 'lucide-react';
import Link from 'next/link';
import type { Election } from '@/lib/types/election';
import { ElectionStatusBadge, getElectionStatus } from './election-status';

interface ElectionCardProps {
  election: Election;
  onEdit: (election: Election) => void;
  onDelete: (election: Election) => void;
  onConvertToDraft: (election: Election) => void;
  onPublish?: (election: Election) => void;
}

export function ElectionCard({
  election,
  onEdit,
  onDelete,
  onConvertToDraft,
  onPublish,
}: ElectionCardProps) {
  const router = useRouter();
  const startAt = new Date(election.startAt);
  const endAt = new Date(election.endAt);

  const handleCardClick = () => {
    router.push(`/dashboard/elections/${election._id}`);
  };

  return (
    <Card
      className="hover:shadow-md hover:bg-accent/20 transition-all cursor-pointer group"
      onClick={handleCardClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0" onClick={handleCardClick}>
            <CardTitle className="text-lg mb-2 truncate group-hover:text-primary transition-colors">
              {election.title}
            </CardTitle>
            <div className="flex items-center gap-2 mb-2">
              <ElectionStatusBadge election={election} />
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEdit(election);
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href={`/dashboard/elections/${election._id}/duplicate`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href={`/dashboard/elections/${election._id}/results`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Results
                </Link>
              </DropdownMenuItem>
              {getElectionStatus(election) === 'draft' && onPublish && (
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onPublish(election);
                  }}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Publish
                </DropdownMenuItem>
              )}
              {getElectionStatus(election) !== 'draft' && (
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onConvertToDraft(election);
                  }}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Convert to Draft
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                className="text-destructive"
                onSelect={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(election);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        {election.description && (
          <CardDescription className="mb-4 line-clamp-2">
            {election.description}
          </CardDescription>
        )}
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Start:</span>
            <span>{startAt.toLocaleDateString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">End:</span>
            <span>{endAt.toLocaleDateString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Ballots:</span>
            <span>{election.ballots?.length || 0}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
