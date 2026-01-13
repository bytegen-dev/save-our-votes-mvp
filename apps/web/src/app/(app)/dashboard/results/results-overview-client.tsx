'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BarChart3, Users, Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { Election } from '@/lib/types/election';
import { ElectionStatusBadge } from '@/components/elections/election-status';

interface ResultsOverviewClientProps {
  elections: Election[];
}

export function ResultsOverviewClient({
  elections,
}: ResultsOverviewClientProps) {
  const router = useRouter();

  const handleViewResults = (electionId: string) => {
    router.push(`/dashboard/elections/${electionId}/results`);
  };

  if (elections.length === 0) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl">Results</h1>
          <p className="text-muted-foreground mt-1">
            View and analyze election results
          </p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg mb-2">No elections found</h3>
            <p className="text-sm text-muted-foreground mb-4 text-center">
              Create an election to view results
            </p>
            <Button asChild>
              <Link href="/dashboard/elections/new">Create Election</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl">Results</h1>
        <p className="text-muted-foreground mt-1">
          View and analyze election results
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {elections.map((election) => {
          const startAt = new Date(election.startAt);
          const endAt = new Date(election.endAt);
          const ballotCount = election.ballots?.length || 0;

          return (
            <Card
              key={election._id}
              className="hover:bg-accent/50 transition-colors cursor-pointer"
              onClick={() => handleViewResults(election._id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="truncate">{election.title}</CardTitle>
                    {election.description && (
                      <CardDescription className="mt-1 line-clamp-2">
                        {election.description}
                      </CardDescription>
                    )}
                  </div>
                  <ElectionStatusBadge election={election} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <BarChart3 className="h-4 w-4" />
                      <span>Ballots</span>
                    </div>
                    <span>{ballotCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>End Date</span>
                    </div>
                    <span className="text-right">
                      {endAt.toLocaleDateString()}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewResults(election._id);
                    }}
                  >
                    View Results
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
