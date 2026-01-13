import { requireAuth } from '@/lib/auth/middleware';
import { api } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Calendar } from 'lucide-react';
import Link from 'next/link';
import type { Election } from '@/lib/types/election';
import { ElectionsGrid } from '@/components/elections/elections-grid';
import { DashboardClient } from './dashboard-client';

async function getElections() {
  try {
    const response = await api.elections.list();
    return response.data.docs || [];
  } catch (error) {
    console.error('Failed to fetch elections:', error);
    return [];
  }
}

async function getDashboardStats() {
  try {
    const response = await api.dashboard.getStats();
    return response.data || null;
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    return null;
  }
}

export default async function DashboardPage() {
  const session = await requireAuth();
  const elections = await getElections();
  const stats = await getDashboardStats();

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
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

      <DashboardClient elections={elections} initialStats={stats} />

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
