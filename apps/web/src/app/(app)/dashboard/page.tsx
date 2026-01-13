import { requireAuth } from '@/lib/auth/middleware';
import { api } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, BarChart3, Calendar, Users } from 'lucide-react';
import Link from 'next/link';
import type { Election } from '@/lib/types/election';
import { ElectionsGrid } from '@/components/elections/elections-grid';
import { getElectionStatus } from '@/components/elections/election-status';

async function getElections() {
  try {
    const response = await api.elections.list();
    return response.data.docs || [];
  } catch (error) {
    console.error('Failed to fetch elections:', error);
    return [];
  }
}

export default async function DashboardPage() {
  const session = await requireAuth();
  const elections = await getElections();

  const totalElections = elections.length;
  const activeElections = elections.filter(
    (e) => getElectionStatus(e) === 'open'
  ).length;
  const scheduledElections = elections.filter(
    (e) => getElectionStatus(e) === 'scheduled'
  ).length;
  const closedElections = elections.filter(
    (e) => getElectionStatus(e) === 'closed'
  ).length;

  const totalVoters = 0;

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {session.user?.name || session.user?.email}
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/elections/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Election
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Elections</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalElections}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {scheduledElections} scheduled, {closedElections} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Active Elections</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeElections}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently running
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Voters</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVoters}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Registered voters
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scheduledElections}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Upcoming elections
            </p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl mb-4">Elections</h2>
        {elections.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg mb-2">No elections yet</h3>
              <p className="text-sm text-muted-foreground mb-4 text-center">
                Get started by creating your first election
              </p>
              <Button asChild>
                <Link href="/dashboard/elections/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Election
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <ElectionsGrid elections={elections} />
        )}
      </div>
    </div>
  );
}
