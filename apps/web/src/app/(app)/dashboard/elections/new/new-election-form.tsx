'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createElectionSchema, type CreateElectionInput } from '@/lib/schemas/election';
import { api } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { showToast } from '@/lib/toast';
import { ArrowLeft, Info } from 'lucide-react';
import Link from 'next/link';
import { Textarea } from '@/components/ui/textarea';

interface NewElectionFormProps {
  userId: string;
}

export function NewElectionForm({ userId }: NewElectionFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateElectionInput>({
    resolver: zodResolver(createElectionSchema),
    defaultValues: {
      description: '',
      draft: false,
    },
  });

  const onSubmit = async (data: CreateElectionInput) => {
    try {
      setIsLoading(true);

      if (!userId) {
        showToast.error('Unable to get user ID. Please try signing in again.');
        return;
      }

      const response = await api.elections.create({
        title: data.title,
        description: data.description,
        startAt: new Date(data.startAt).toISOString(),
        endAt: new Date(data.endAt).toISOString(),
        organizerId: userId,
      });

      if (response.status === 'success') {
        if (!data.draft && response.data?.election?._id) {
          try {
            await api.elections.publish(response.data.election._id);
            showToast.success('Election created and published successfully!');
          } catch (error: any) {
            console.error('Failed to publish election:', error);
            showToast.success('Election created successfully, but failed to publish.');
          }
        } else {
          showToast.success('Election created as draft successfully!');
        }
        router.push('/dashboard/elections');
        router.refresh();
      }
    } catch (error: any) {
      console.error('Failed to create election:', error);
      showToast.error(
        error?.data?.message || error?.message || 'Failed to create election'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const now = new Date();
  const defaultStart = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
  const defaultEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

  const formatDateTimeLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/elections">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl">Create New Election</h1>
          <p className="text-muted-foreground mt-2">
            Set up a new election with title, description, and dates
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Election Details</CardTitle>
          <CardDescription>
            Fill in the basic information for your election
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Student Council Election 2024"
                {...register('title')}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
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
                <Label htmlFor="startAt">Start Date & Time *</Label>
                <Input
                  id="startAt"
                  type="datetime-local"
                  defaultValue={formatDateTimeLocal(defaultStart)}
                  {...register('startAt')}
                />
                {errors.startAt && (
                  <p className="text-sm text-destructive">
                    {errors.startAt.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endAt">End Date & Time *</Label>
                <Input
                  id="endAt"
                  type="datetime-local"
                  defaultValue={formatDateTimeLocal(defaultEnd)}
                  {...register('endAt')}
                />
                {errors.endAt && (
                  <p className="text-sm text-destructive">
                    {errors.endAt.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Controller
                name="draft"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="draft"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="draft"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Create as draft
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[300px]">
                    <p className="text-sm">
                      By default, elections are published immediately. Check this box to create the election as a draft instead. You can publish it later from the election detail page.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Election'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
