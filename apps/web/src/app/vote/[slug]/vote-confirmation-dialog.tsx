'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import type { Election } from '@/lib/types/election';

interface VoteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  election: Election;
  selectedOptions: Record<string, string[]>;
}

export function VoteConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  election,
  selectedOptions,
}: VoteConfirmationDialogProps) {
  const primaryColor = election.branding?.primaryColor || '#000000';
  const secondaryColor = election.branding?.secondaryColor || '#666666';

  const getOptionText = (ballotId: string, optionId: string): string => {
    const ballot = election.ballots?.find((b) => b._id === ballotId);
    const option = ballot?.options?.find((o) => o._id === optionId);
    return option?.text || 'Unknown';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: secondaryColor,
          color: primaryColor,
        }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: primaryColor }}>
            Confirm Your Vote
          </DialogTitle>
          <DialogDescription style={{ color: primaryColor, opacity: 0.8 }}>
            Please review your selections before submitting. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {election.ballots?.map((ballot) => {
            const selections = selectedOptions[ballot._id] || [];
            
            if (selections.length === 0) return null;

            return (
              <div key={ballot._id} className="space-y-2">
                <h4 
                  className="font-medium"
                  style={{ color: primaryColor }}
                >
                  {ballot.title}
                </h4>
                <ul 
                  className="list-disc list-inside space-y-1 text-sm ml-2"
                  style={{ color: primaryColor, opacity: 0.9 }}
                >
                  {selections.map((optionId) => (
                    <li key={optionId}>{getOptionText(ballot._id, optionId)}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Once you submit, your vote cannot be changed. Make sure all selections are correct.
          </AlertDescription>
        </Alert>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            style={{
              borderColor: primaryColor,
              color: primaryColor,
            }}
          >
            Review
          </Button>
          <Button 
            onClick={onConfirm}
            style={{
              backgroundColor: primaryColor,
              color: secondaryColor,
            }}
          >
            Confirm and Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
