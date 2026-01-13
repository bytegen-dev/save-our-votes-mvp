'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createBallotSchema, type CreateBallotInput } from '@/lib/schemas/ballot';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { showToast } from '@/lib/toast';
import { Plus, Trash2 } from 'lucide-react';
import { Controller } from 'react-hook-form';

interface CreateBallotDialogProps {
  electionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateBallotDialog({
  electionId,
  open,
  onOpenChange,
  onSuccess,
}: CreateBallotDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateBallotInput>({
    resolver: zodResolver(createBallotSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'single',
      maxSelections: 1,
      options: [{ text: '', order: 0 }, { text: '', order: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'options',
  });

  const ballotType = watch('type');

  const onSubmit = async (data: CreateBallotInput) => {
    try {
      setIsLoading(true);

      const payload = {
        title: data.title,
        description: data.description,
        type: data.type,
        maxSelections: data.type === 'multiple' ? (data.maxSelections || 1) : 1,
        options: data.options.map((opt, index) => ({
          text: opt.text,
          order: opt.order ?? index,
        })),
      };

      await api.ballots.create(electionId, payload);

      showToast.success('Ballot created successfully!');
      reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error('Failed to create ballot:', error);
      showToast.error(
        error?.data?.message || error?.message || 'Failed to create ballot'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Ballot</DialogTitle>
          <DialogDescription>
            Add a new ballot to this election. A ballot contains positions or questions with candidates or options.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ballot-title">Title *</Label>
            <Input
              id="ballot-title"
              placeholder="e.g., President, Vice President"
              {...register('title')}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ballot-description">Description</Label>
            <Textarea
              id="ballot-description"
              placeholder="Optional description of this ballot..."
              rows={3}
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
              <Label htmlFor="ballot-type">Voting Type *</Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="ballot-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single Choice</SelectItem>
                      <SelectItem value="multiple">Multiple Choice</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.type && (
                <p className="text-sm text-destructive">{errors.type.message}</p>
              )}
            </div>

            {ballotType === 'multiple' && (
              <div className="space-y-2">
                <Label htmlFor="ballot-maxSelections">Max Selections</Label>
                <Input
                  id="ballot-maxSelections"
                  type="number"
                  min="1"
                  max="10"
                  {...register('maxSelections', { valueAsNumber: true })}
                />
                {errors.maxSelections && (
                  <p className="text-sm text-destructive">
                    {errors.maxSelections.message}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Options *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ text: '', order: fields.length })}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Option
              </Button>
            </div>
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-2">
                <div className="flex-1">
                  <Input
                    placeholder={`Option ${index + 1}`}
                    {...register(`options.${index}.text`)}
                  />
                  {errors.options?.[index]?.text && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.options[index]?.text?.message}
                    </p>
                  )}
                </div>
                {fields.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    className="mt-0"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
            {errors.options && typeof errors.options.message === 'string' && (
              <p className="text-sm text-destructive">{errors.options.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Ballot'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
