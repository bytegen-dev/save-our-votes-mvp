'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download, BarChart3, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { Election } from '@/lib/types/election';
import { showToast } from '@/lib/toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface ResultsData {
  electionId: string;
  results: Array<{
    ballotId: string;
    ballotTitle: string;
    ballotDescription?: string;
    ballotType: string;
    options: Array<{
      optionId: string;
      text: string;
      order: number;
      photo?: string;
      bio?: string;
      votes: number;
    }>;
    totalVotes: number;
  }>;
}

interface ElectionResultsClientProps {
  election: Election;
  results: ResultsData | null;
}

export function ElectionResultsClient({
  election,
  results,
}: ElectionResultsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ballotParam = searchParams.get('ballot');
  const [selectedBallotId, setSelectedBallotId] = useState<string>(ballotParam || 'all');

  useEffect(() => {
    const ballotParam = searchParams.get('ballot');
    setSelectedBallotId(ballotParam || 'all');
  }, [searchParams]);

  const handleBallotChange = (ballotId: string) => {
    setSelectedBallotId(ballotId);
    if (ballotId === 'all') {
      router.push(`/dashboard/elections/${election._id}/results`);
    } else {
      router.push(`/dashboard/elections/${election._id}/results?ballot=${ballotId}`);
    }
  };

  const handleExportCSV = () => {
    if (!results) return;

    const csvRows: string[] = [];
    csvRows.push('Election Results');
    csvRows.push(`Election: ${election.title}`);
    csvRows.push(`Generated: ${new Date().toISOString()}`);
    csvRows.push('');

    const ballotsToExport =
      selectedBallotId === 'all'
        ? results.results
        : results.results.filter((b) => b.ballotId === selectedBallotId);

    ballotsToExport.forEach((ballotResult) => {
      csvRows.push(`Ballot: ${ballotResult.ballotTitle}`);
      csvRows.push('Candidate, Votes, Percentage');

      const sortedOptions = [...ballotResult.options].sort(
        (a, b) => b.votes - a.votes
      );
      sortedOptions.forEach((option) => {
        const percentage =
          ballotResult.totalVotes > 0
            ? ((option.votes / ballotResult.totalVotes) * 100).toFixed(2)
            : '0.00';
        csvRows.push(`"${option.text}",${option.votes},${percentage}%`);
      });

      csvRows.push(`Total Votes,${ballotResult.totalVotes}`);
      csvRows.push('');
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${election.title.replace(/[^a-z0-9]/gi, '_')}_results.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    showToast.success('Results exported to CSV');
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/dashboard/elections/${election._id}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl">Results</h1>
            <p className="text-muted-foreground mt-1">{election.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={selectedBallotId} onValueChange={handleBallotChange}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Select a ballot" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ballots</SelectItem>
              {results?.results.map((ballotResult) => (
                <SelectItem key={ballotResult.ballotId} value={ballotResult.ballotId}>
                  {ballotResult.ballotTitle}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {results?.results && results.results.length > 0 ? (
        <div className="space-y-6">
          {results.results
            .filter((ballotResult) =>
              selectedBallotId === 'all' || ballotResult.ballotId === selectedBallotId
            )
            .map((ballotResult) => {
            const sortedOptions = [...ballotResult.options].sort(
              (a, b) => b.votes - a.votes
            );
            const maxVotes = Math.max(
              ...ballotResult.options.map((o) => o.votes),
              1
            );

            return (
              <Card key={ballotResult.ballotId}>
                <CardHeader>
                  <CardTitle>{ballotResult.ballotTitle}</CardTitle>
                  {ballotResult.ballotDescription && (
                    <CardDescription>
                      {ballotResult.ballotDescription}
                    </CardDescription>
                  )}
                  <div className="flex items-center gap-4 mt-2">
                    <div className="text-sm text-muted-foreground">
                      Total Votes:{' '}
                      <span className="text-foreground">
                        {ballotResult.totalVotes}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sortedOptions.map((option) => {
                      const percentage =
                        ballotResult.totalVotes > 0
                          ? (
                              (option.votes / ballotResult.totalVotes) *
                              100
                            ).toFixed(1)
                          : '0';
                      const barWidth = (option.votes / maxVotes) * 100;

                      return (
                        <div key={option.optionId} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-3">
                              {option.photo ? (
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={option.photo} alt={option.text} />
                                  <AvatarFallback>
                                    {option.text?.[0]?.toUpperCase() || 'C'}
                                  </AvatarFallback>
                                </Avatar>
                              ) : (
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback>
                                    {option.text?.[0]?.toUpperCase() || 'C'}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              <div>
                                <span className="block">{option.text}</span>
                                {option.bio && (
                                  <span className="text-xs text-muted-foreground line-clamp-1">
                                    {option.bio}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-muted-foreground">
                                {option.votes} votes
                              </span>
                              <span className="w-16 text-right">
                                {percentage}%
                              </span>
                            </div>
                          </div>
                          <div className="h-8 bg-muted rounded-md overflow-hidden relative">
                            <div
                              className="h-full bg-primary transition-all duration-500 flex items-center justify-end pr-2"
                              style={{ width: `${barWidth}%` }}
                            >
                              {option.votes > 0 && (
                                <span className="text-xs text-primary-foreground">
                                  {option.votes}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg mb-2">No results yet</h3>
            <p className="text-sm text-muted-foreground text-center">
              No votes have been cast for this election
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
