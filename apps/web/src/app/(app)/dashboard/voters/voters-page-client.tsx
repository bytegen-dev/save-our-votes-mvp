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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  Download,
  Users,
  Mail,
  Edit,
  Trash2,
  MoreVertical,
} from 'lucide-react';
import type { Election } from '@/lib/types/election';
import type { Voter } from '@/lib/types/voter';
import { ImportVotersDialog } from '@/components/voters/import-voters-dialog';
import { AddVoterDialog } from '@/components/voters/add-voter-dialog';
import { EditVoterDialog } from '@/components/voters/edit-voter-dialog';
import { DeleteVoterDialog } from '@/components/voters/delete-voter-dialog';
import { showToast } from '@/lib/toast';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { api } from '@/lib/api/client';

interface VotersPageClientProps {
  elections: Election[];
  voters: Voter[] | null;
}

export function VotersPageClient({ elections, voters }: VotersPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const electionIdFromUrl = searchParams.get('election') || '';
  const [selectedElectionId, setSelectedElectionId] =
    useState<string>(electionIdFromUrl);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedVoters, setSelectedVoters] = useState<Set<string>>(new Set());
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [selectedVoter, setSelectedVoter] = useState<Voter | null>(null);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);

  useEffect(() => {
    setSelectedElectionId(electionIdFromUrl);
  }, [electionIdFromUrl]);

  const handleElectionChange = (electionId: string) => {
    setSelectedElectionId(electionId);
    router.push(`/dashboard/voters?election=${electionId}`);
  };

  const handleImportSuccess = () => {
    router.refresh();
    setSelectedVoters(new Set());
  };

  const handleEditVoter = (voter: Voter) => {
    setSelectedVoter(voter);
    setEditDialogOpen(true);
  };

  const handleDeleteVoter = (voter: Voter) => {
    setSelectedVoter(voter);
    setDeleteDialogOpen(true);
  };

  const handleEditSuccess = () => {
    router.refresh();
    setSelectedVoter(null);
  };

  const handleDeleteSuccess = () => {
    router.refresh();
    setSelectedVoter(null);
    setSelectedVoters(new Set());
  };

  const handleSelectVoter = (voterId: string, checked: boolean) => {
    const newSelected = new Set(selectedVoters);
    if (checked) {
      newSelected.add(voterId);
    } else {
      newSelected.delete(voterId);
    }
    setSelectedVoters(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (!voters) return;
    if (checked) {
      const pendingVoters = voters.filter((v) => !v.used);
      setSelectedVoters(new Set(pendingVoters.map((v) => v._id)));
    } else {
      setSelectedVoters(new Set());
    }
  };

  const handleBulkDelete = async () => {
    if (selectedVoters.size === 0) return;

    try {
      setIsDeletingBulk(true);
      const voterIds = Array.from(selectedVoters);
      await api.voters.deleteBulk(voterIds);
      showToast.success(`${voterIds.length} voter(s) deleted successfully`);
      setBulkDeleteDialogOpen(false);
      setSelectedVoters(new Set());
      router.refresh();
    } catch (error: any) {
      console.error('Failed to delete voters:', error);
      showToast.error(
        error?.data?.message || error?.message || 'Failed to delete voters'
      );
    } finally {
      setIsDeletingBulk(false);
    }
  };

  const selectedCount = selectedVoters.size;
  const canSelectAll = voters && voters.length > 0;
  const allPendingSelected =
    canSelectAll &&
    voters.filter((v) => !v.used).every((v) => selectedVoters.has(v._id));

  const handleExportCSV = async () => {
    if (!selectedElectionId || !voters || voters.length === 0) {
      showToast.error('No voters to export');
      return;
    }

    setIsExporting(true);
    try {
      const csvRows: string[] = [];
      csvRows.push('email'); // Header row - lowercase to match import format

      for (const voter of voters) {
        if (voter.email) {
          csvRows.push(`"${voter.email}"`);
        }
      }

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const selectedElection = elections.find(
        (e) => e._id === selectedElectionId
      );
      a.download = `${
        selectedElection?.title.replace(/[^a-z0-9]/gi, '_') || 'voters'
      }_voters.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      showToast.success('Voters exported to CSV');
    } catch (error) {
      console.error('Failed to export voters:', error);
      showToast.error('Failed to export voters');
    } finally {
      setIsExporting(false);
    }
  };

  const selectedElection = elections.find((e) => e._id === selectedElectionId);
  const usedCount = voters?.filter((v) => v.used).length || 0;
  const pendingCount = voters?.filter((v) => !v.used).length || 0;

  return (
    <>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl">Voters</h1>
            <p className="text-muted-foreground mt-1">
              Manage voters for your elections
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Select Election</CardTitle>
            <CardDescription>
              Choose an election to view and manage its voters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedElectionId}
              onValueChange={handleElectionChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an election" />
              </SelectTrigger>
              <SelectContent>
                {elections.map((e) => (
                  <SelectItem key={e._id} value={e._id}>
                    {e.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedElectionId && voters !== null && (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Total Voters</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{voters.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Voted</CardTitle>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{usedCount}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {voters.length > 0
                      ? `${((usedCount / voters.length) * 100).toFixed(
                          1
                        )}% turnout`
                      : '0% turnout'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Pending</CardTitle>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingCount}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <CardTitle>Voter List</CardTitle>
                    <CardDescription>
                      {selectedElection?.title} - {voters.length} voters
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {selectedCount > 0 && (
                      <Button
                        variant="destructive"
                        onClick={() => setBulkDeleteDialogOpen(true)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Selected ({selectedCount})
                      </Button>
                    )}
                    <Button onClick={() => setAddDialogOpen(true)}>
                      <Users className="mr-2 h-4 w-4" />
                      Add Voter
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setImportDialogOpen(true)}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Import CSV
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleExportCSV}
                      disabled={isExporting || voters.length === 0}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export CSV
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {voters.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">
                          <Checkbox
                            checked={allPendingSelected || false}
                            onCheckedChange={handleSelectAll}
                            disabled={!canSelectAll}
                          />
                        </TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Voted At</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead className="w-[50px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {voters.map((voter) => (
                        <TableRow key={voter._id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedVoters.has(voter._id)}
                              onCheckedChange={(checked) =>
                                handleSelectVoter(voter._id, !!checked)
                              }
                              disabled={voter.used}
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {voter.email || 'No email'}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={voter.used ? 'default' : 'secondary'}
                            >
                              {voter.used ? 'Voted' : 'Pending'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {voter.usedAt
                              ? new Date(voter.usedAt).toLocaleString()
                              : '-'}
                          </TableCell>
                          <TableCell>
                            {new Date(voter.createdAt).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleEditVoter(voter)}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDeleteVoter(voter)}
                                  disabled={voter.used}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg mb-2">No voters yet</h3>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {!selectedElectionId && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg mb-2">No election selected</h3>
              <p className="text-sm text-muted-foreground mb-4 text-center">
                Please select an election from the dropdown above to view its
                voters.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <AddVoterDialog
        electionId={selectedElectionId || ''}
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={handleImportSuccess}
      />

      <ImportVotersDialog
        electionId={selectedElectionId}
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onSuccess={handleImportSuccess}
      />

      <EditVoterDialog
        voter={selectedVoter}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={handleEditSuccess}
      />

      <DeleteVoterDialog
        voter={selectedVoter}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onSuccess={handleDeleteSuccess}
      />

      <AlertDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Voters?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{' '}
              <span className="text-foreground font-medium">
                {selectedCount} voter{selectedCount !== 1 ? 's' : ''}
              </span>
              . Only pending voters (who haven't voted) can be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline" disabled={isDeletingBulk}>
                Cancel
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="destructive"
                onClick={handleBulkDelete}
                disabled={isDeletingBulk}
              >
                {isDeletingBulk ? 'Deleting...' : 'Delete'}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
