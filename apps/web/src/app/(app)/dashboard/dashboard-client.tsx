'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Calendar, Users, TrendingUp } from 'lucide-react';
import { api } from '@/lib/api/client';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardStats {
  overall: {
    totalVoters: number;
    totalVotes: number;
    votersWhoVoted: number;
    overallTurnout: number;
  };
  elections: Array<{
    electionId: string;
    electionTitle: string;
    voters: number;
    voted: number;
    votes: number;
    turnout: number;
  }>;
}

interface DashboardClientProps {
  elections: Array<{
    _id: string;
    title: string;
  }>;
  initialStats?: DashboardStats | null;
}

export function DashboardClient({
  elections,
  initialStats,
}: DashboardClientProps) {
  const [stats, setStats] = useState<DashboardStats | null>(initialStats || null);
  const [isLoading, setIsLoading] = useState(!initialStats);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const response = await api.dashboard.getStats();
        if (response.status === 'success' && response.data) {
          setStats(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch stats on mount
    fetchStats();

    // Refresh stats every 30 seconds for live updates
    const interval = setInterval(fetchStats, 30000);

    return () => clearInterval(interval);
  }, []);

  const totalElections = elections.length;
  const activeElections = elections.filter((e) => {
    const now = new Date();
    // This is a simplified check - you might want to use getElectionStatus
    return true; // Placeholder
  }).length;

  if (isLoading && !stats) {
    return (
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}
      >
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm">Total Elections</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl">{totalElections}</div>
          <p className="text-xs text-muted-foreground mt-1">
            All elections
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm">Total Voters</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl">
            {stats?.overall.totalVoters || 0}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Registered across all elections
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm">Total Votes</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl">
            {stats?.overall.totalVotes || 0}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Votes cast
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm">Overall Turnout</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl">
            {stats?.overall.overallTurnout.toFixed(1) || '0.0'}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats?.overall.votersWhoVoted || 0} of {stats?.overall.totalVoters || 0} voted
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
