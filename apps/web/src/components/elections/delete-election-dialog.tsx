'use client';

import { useState } from 'react';
import { api } from '@/lib/api/client';
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
import { showToast } from '@/lib/toast';
import type { Election } from '@/lib/types/election';

interface DeleteElectionDialogProps {
  election: Election | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DeleteElectionDialog({
  election,
  open,
  onOpenChange,
  onSuccess,
}: DeleteElectionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!election) return;

    try {
      setIsLoading(true);

      await api.elections.delete(election._id);

      showToast.success('Election deleted successfully!');
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error('Failed to delete election:', error);
      showToast.error(
        error?.data?.message || error?.message || 'Failed to delete election'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            election <strong>{election?.title}</strong> and all associated data
            including ballots, votes, and voter tokens.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
