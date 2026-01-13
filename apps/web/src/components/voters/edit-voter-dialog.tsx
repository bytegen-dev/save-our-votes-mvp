'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api/client';
import { showToast } from '@/lib/toast';
import type { Voter } from '@/lib/types/voter';

interface EditVoterDialogProps {
  voter: Voter | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditVoterDialog({
  voter,
  open,
  onOpenChange,
  onSuccess,
}: EditVoterDialogProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (voter && open) {
      setEmail(voter.email || '');
    } else if (!open) {
      setEmail('');
    }
  }, [voter, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voter?._id) return;

    if (!email.trim()) {
      showToast.error('Email is required');
      return;
    }

    try {
      setIsLoading(true);
      await api.voters.update(voter._id, { email: email.trim() });
      showToast.success('Voter updated successfully');
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error('Failed to update voter:', error);
      showToast.error(
        error?.data?.message || error?.message || 'Failed to update voter'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Voter</DialogTitle>
          <DialogDescription>
            Update the voter's email address.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voter@example.com"
                disabled={isLoading}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
