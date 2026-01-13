'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Copy,
  BarChart3,
  Calendar,
  Users,
  FileText,
  Settings,
  Info,
  Globe,
  Minus,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Election } from '@/lib/types/election';
import {
  ElectionStatusBadge,
  getElectionStatus,
} from '@/components/elections/election-status';
import { EditElectionDialog } from '@/components/elections/edit-election-dialog';
import { DeleteElectionDialog } from '@/components/elections/delete-election-dialog';
import { CreateBallotDialog } from '@/components/ballots/create-ballot-dialog';
import { EditBallotDialog } from '@/components/ballots/edit-ballot-dialog';
import { useState } from 'react';
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
import { showToast } from '@/lib/toast';
import { MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ElectionDetailClientProps {
  election: Election;
}

export function ElectionDetailClient({ election }: ElectionDetailClientProps) {
  const router = useRouter();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createBallotDialogOpen, setCreateBallotDialogOpen] = useState(false);
  const [editBallotDialogOpen, setEditBallotDialogOpen] = useState(false);
  const [deleteBallotDialogOpen, setDeleteBallotDialogOpen] = useState(false);
  const [selectedBallot, setSelectedBallot] = useState<
    Election['ballots'][0] | null
  >(null);
  const [isDeletingBallot, setIsDeletingBallot] = useState(false);
  const [convertToDraftDialogOpen, setConvertToDraftDialogOpen] =
    useState(false);
  const [isConvertingToDraft, setIsConvertingToDraft] = useState(false);

  const startAt = new Date(election.startAt);
  const endAt = new Date(election.endAt);

  const handleSuccess = () => {
    router.refresh();
  };

  const handleEditBallot = (ballot: Election['ballots'][0]) => {
    setSelectedBallot(ballot);
    setEditBallotDialogOpen(true);
  };

  const handleDeleteBallot = (ballot: Election['ballots'][0]) => {
    setSelectedBallot(ballot);
    setDeleteBallotDialogOpen(true);
  };

  const confirmDeleteBallot = async () => {
    if (!selectedBallot?._id) {
      showToast.error('Ballot ID is missing');
      return;
    }

    try {
      setIsDeletingBallot(true);
      await api.ballots.delete(election._id, selectedBallot._id);
      showToast.success('Ballot deleted successfully!');
      setDeleteBallotDialogOpen(false);
      setSelectedBallot(null);
      handleSuccess();
    } catch (error: any) {
      console.error('Failed to delete ballot:', error);
      showToast.error(
        error?.data?.message || error?.message || 'Failed to delete ballot'
      );
    } finally {
      setIsDeletingBallot(false);
    }
  };

  const confirmConvertToDraft = async () => {
    if (!election._id) return;

    try {
      setIsConvertingToDraft(true);
      await api.elections.convertToDraft(election._id);
      showToast.success('Election converted to draft successfully!');
      setConvertToDraftDialogOpen(false);
      handleSuccess();
    } catch (error: any) {
      console.error('Failed to convert to draft:', error);
      showToast.error(
        error?.data?.message || error?.message || 'Failed to convert to draft'
      );
    } finally {
      setIsConvertingToDraft(false);
    }
  };

  return (
    <>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/elections">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl xl:text-3xl">{election.title}</h1>
              <ElectionStatusBadge election={election} />
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-2">
            {getElectionStatus(election) === 'draft' && (
              <Button
                onClick={async () => {
                  try {
                    await api.elections.publish(election._id);
                    showToast.success('Election published successfully!');
                    handleSuccess();
                  } catch (error: any) {
                    showToast.error(
                      error?.data?.message ||
                        error?.message ||
                        'Failed to publish election'
                    );
                  }
                }}
              >
                <Globe className="mr-2 h-4 w-4" />
                Publish
              </Button>
            )}
            {getElectionStatus(election) !== 'draft' && (
              <Button
                variant="outline"
                onClick={() => setConvertToDraftDialogOpen(true)}
              >
                <span className="relative mr-2 inline-block">
                  <Globe className="h-4 w-4" />
                  <Minus
                    className="absolute top-1/2 left-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45"
                    strokeWidth={3}
                  />
                </span>
                Convert to Draft
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(true)}
              className="lg:flex lg:items-center lg:gap-2"
            >
              <Edit className="h-4 w-4 lg:mr-2" />
              <span className="hidden lg:inline">Edit</span>
            </Button>
            <Button
              variant="outline"
              asChild
              className="lg:flex lg:items-center lg:gap-2"
            >
              <Link href={`/dashboard/elections/${election._id}/duplicate`}>
                <Copy className="h-4 w-4 lg:mr-2" />
                <span className="hidden lg:inline">Duplicate</span>
              </Link>
            </Button>
          </div>
          {/* Mobile: Dropdown menu */}
          <div className="lg:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {getElectionStatus(election) === 'draft' && (
                  <DropdownMenuItem
                    onClick={async () => {
                      try {
                        await api.elections.publish(election._id);
                        showToast.success('Election published successfully!');
                        handleSuccess();
                      } catch (error: any) {
                        showToast.error(
                          error?.data?.message ||
                            error?.message ||
                            'Failed to publish election'
                        );
                      }
                    }}
                  >
                    <Globe className="mr-2 h-4 w-4" />
                    Publish
                  </DropdownMenuItem>
                )}
                {getElectionStatus(election) !== 'draft' && (
                  <DropdownMenuItem
                    onClick={() => setConvertToDraftDialogOpen(true)}
                  >
                    <span className="relative mr-2 inline-block">
                      <Globe className="h-4 w-4" />
                      <Minus
                        className="absolute top-1/2 left-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45"
                        strokeWidth={3}
                      />
                    </span>
                    Convert to Draft
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/elections/${election._id}/duplicate`}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Description */}
        <div>
          <p className="text-muted-foreground">
            Election details and management
          </p>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Election Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <CardTitle>Election Details</CardTitle>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Basic information about this election</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Button variant="outline" asChild>
                  <Link href={`/dashboard/elections/${election._id}/results`}>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Results
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {election.description && (
                <div>
                  <h3 className="text-sm text-muted-foreground mb-1">
                    Description
                  </h3>
                  <p className="text-sm">{election.description}</p>
                </div>
              )}
              <div>
                <h3 className="text-sm text-muted-foreground mb-1">
                  Start Date & Time
                </h3>
                <p className="text-sm">{startAt.toLocaleString()}</p>
              </div>
              <div>
                <h3 className="text-sm text-muted-foreground mb-1">
                  End Date & Time
                </h3>
                <p className="text-sm">{endAt.toLocaleString()}</p>
              </div>
              <div>
                <h3 className="text-sm text-muted-foreground mb-1">Created</h3>
                <p className="text-sm">
                  {new Date(election.createdAt).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>Statistics</CardTitle>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Election metrics and data</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Ballots</span>
                </div>
                <span className="text-2xl">
                  {election.ballots?.length || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Voters</span>
                </div>
                <span className="text-2xl">0</span>
                {/* TODO: Fetch actual voter count */}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Duration</span>
                </div>
                <span className="text-sm">
                  {Math.ceil(
                    (endAt.getTime() - startAt.getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}{' '}
                  days
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ballots Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <CardTitle>Ballots</CardTitle>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Manage the ballots for this election</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Button onClick={() => setCreateBallotDialogOpen(true)}>
                Add Ballot
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {election.ballots && election.ballots.length > 0 ? (
              <div className="space-y-2">
                {election.ballots.map((ballot) => (
                  <div
                    key={ballot._id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <h4>{ballot.title}</h4>
                      {ballot.description && (
                        <p className="text-sm text-muted-foreground">
                          {ballot.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {ballot.options?.length || 0} options •{' '}
                        {ballot.type === 'single'
                          ? 'Single choice'
                          : 'Multiple choice'}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleEditBallot(ballot)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteBallot(ballot)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg mb-2">No ballots yet</h3>
                <p className="text-sm text-muted-foreground">
                  Create a ballot to start building your election
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <EditElectionDialog
        election={election}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={handleSuccess}
      />

      <DeleteElectionDialog
        election={election}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onSuccess={() => {
          router.push('/dashboard/elections');
        }}
      />

      <CreateBallotDialog
        electionId={election._id}
        open={createBallotDialogOpen}
        onOpenChange={setCreateBallotDialogOpen}
        onSuccess={handleSuccess}
      />

      <EditBallotDialog
        electionId={election._id}
        ballot={selectedBallot}
        open={editBallotDialogOpen}
        onOpenChange={setEditBallotDialogOpen}
        onSuccess={handleSuccess}
      />

      <AlertDialog
        open={deleteBallotDialogOpen}
        onOpenChange={setDeleteBallotDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              ballot{' '}
              <span className="text-foreground">
                &quot;{selectedBallot?.title || 'selected ballot'}&quot;
              </span>{' '}
              and all associated votes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline" disabled={isDeletingBallot}>
                Cancel
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="destructive"
                onClick={confirmDeleteBallot}
                disabled={isDeletingBallot}
              >
                {isDeletingBallot ? 'Deleting...' : 'Delete'}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={convertToDraftDialogOpen}
        onOpenChange={setConvertToDraftDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Convert to Draft?</AlertDialogTitle>
            <AlertDialogDescription>
              This will convert the election{' '}
              <span className="text-foreground">
                &quot;{election.title}&quot;
              </span>{' '}
              back to draft status. The election will no longer be visible to
              voters until you publish it again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isConvertingToDraft}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmConvertToDraft}
              disabled={isConvertingToDraft}
            >
              {isConvertingToDraft ? 'Converting...' : 'Convert to Draft'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
