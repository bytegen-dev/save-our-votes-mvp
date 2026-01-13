'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Calendar } from 'lucide-react';
import Link from 'next/link';
import type { Election } from '@/lib/types/election';
import { ElectionsGrid } from '@/components/elections/elections-grid';
import { getElectionStatus } from '@/components/elections/election-status';
import type { ElectionStatus } from '@/lib/types/election';

interface ElectionsPageClientProps {
  initialElections: Election[];
}

export function ElectionsPageClient({
  initialElections,
}: ElectionsPageClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredElections = useMemo(() => {
    let filtered = initialElections;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (election) =>
          election.title.toLowerCase().includes(query) ||
          election.description?.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(
        (election) => getElectionStatus(election) === statusFilter
      );
    }

    return filtered;
  }, [initialElections, searchQuery, statusFilter]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl">Elections</h1>
          <p className="text-muted-foreground mt-2">
            Manage and monitor all your elections
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/elections/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Election
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search elections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="w-full sm:w-[180px]">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="open">Active</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {filteredElections.length} of {initialElections.length}{' '}
        elections
      </div>

      {filteredElections.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg mb-2">
              {searchQuery || statusFilter !== 'all'
                ? 'No elections found'
                : 'No elections yet'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4 text-center">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by creating your first election'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Button asChild>
                <Link href="/dashboard/elections/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Election
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <ElectionsGrid elections={filteredElections} />
      )}
    </div>
  );
}
