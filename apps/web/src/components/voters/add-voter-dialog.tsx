'use client';

import { useState } from 'react';
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
import { TokensDisplayDialog } from './tokens-display-dialog';

interface AddVoterDialogProps {
  electionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddVoterDialog({
  electionId,
  open,
  onOpenChange,
  onSuccess,
}: AddVoterDialogProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTokensDialog, setShowTokensDialog] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<{
    email: string;
    token: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast.error('Email is required');
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.voters.add(electionId, {
        email: email.trim(),
      });

      if (response.status === 'success') {
        setGeneratedToken({
          email: response.data.voter.email || email.trim(),
          token: response.data.token,
        });
        setShowTokensDialog(true);
        showToast.success('Voter added successfully');
        setEmail('');
        onSuccess();
      }
    } catch (error: any) {
      console.error('Failed to add voter:', error);
      showToast.error(
        error?.data?.message || error?.message || 'Failed to add voter'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setGeneratedToken(null);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Voter</DialogTitle>
            <DialogDescription>
              Add a single voter to this election. A unique token will be
              generated for them.
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
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Adding...' : 'Add Voter'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {generatedToken && (
        <TokensDisplayDialog
          open={showTokensDialog}
          onOpenChange={(open) => {
            setShowTokensDialog(open);
            if (!open) {
              handleClose();
            }
          }}
          voters={[generatedToken]}
        />
      )}
    </>
  );
}
