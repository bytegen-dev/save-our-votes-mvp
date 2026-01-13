'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  updateElectionSchema,
  type UpdateElectionInput,
} from '@/lib/schemas/election';
import { api } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { showToast } from '@/lib/toast';
import type { Election } from '@/lib/types/election';

interface EditElectionDialogProps {
  election: Election | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditElectionDialog({
  election,
  open,
  onOpenChange,
  onSuccess,
}: EditElectionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateElectionInput>({
    resolver: zodResolver(updateElectionSchema),
  });

  useEffect(() => {
    if (election && open) {
      const startAt = new Date(election.startAt);
      const endAt = new Date(election.endAt);

      reset({
        title: election.title,
        description: election.description || '',
        startAt: formatDateTimeLocal(startAt),
        endAt: formatDateTimeLocal(endAt),
      });
    }
  }, [election, open, reset]);

  const formatDateTimeLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const onSubmit = async (data: UpdateElectionInput) => {
    if (!election) return;

    try {
      setIsLoading(true);

      const updateData: Partial<Election> = {
        title: data.title,
        description: data.description,
        startAt: new Date(data.startAt).toISOString(),
        endAt: new Date(data.endAt).toISOString(),
      };

      console.log('Updating election with data:', updateData);

      await api.elections.update(election._id, updateData);

      showToast.success('Election updated successfully!');
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error('Failed to update election:', error);
      showToast.error(
        error?.data?.message || error?.message || 'Failed to update election'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Election</DialogTitle>
          <DialogDescription>
            Update the election details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title *</Label>
            <Input
              id="edit-title"
              placeholder="e.g., Student Council Election 2024"
              {...register('title')}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              placeholder="Optional description of the election..."
              rows={4}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-startAt">Start Date & Time *</Label>
              <Input
                id="edit-startAt"
                type="datetime-local"
                {...register('startAt')}
              />
              {errors.startAt && (
                <p className="text-sm text-destructive">
                  {errors.startAt.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-endAt">End Date & Time *</Label>
              <Input
                id="edit-endAt"
                type="datetime-local"
                {...register('endAt')}
              />
              {errors.endAt && (
                <p className="text-sm text-destructive">
                  {errors.endAt.message}
                </p>
              )}
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
              {isLoading ? 'Updating...' : 'Update Election'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
