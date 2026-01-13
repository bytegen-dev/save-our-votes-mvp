'use client';

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
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api/client';
import { showToast } from '@/lib/toast';
import type { Voter } from '@/lib/types/voter';

interface DeleteVoterDialogProps {
  voter: Voter | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DeleteVoterDialog({
  voter,
  open,
  onOpenChange,
  onSuccess,
}: DeleteVoterDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!voter?._id) return;

    try {
      setIsDeleting(true);
      await api.voters.delete(voter._id);
      showToast.success('Voter deleted successfully');
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error('Failed to delete voter:', error);
      showToast.error(
        error?.data?.message || error?.message || 'Failed to delete voter'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the voter{' '}
            <span className="text-foreground font-medium">
              {voter?.email || 'selected voter'}
            </span>
            .
            {voter?.used && (
              <span className="block mt-2 text-destructive">
                Warning: This voter has already voted. Deletion is not allowed.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline" disabled={isDeleting}>
              Cancel
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting || voter?.used}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
