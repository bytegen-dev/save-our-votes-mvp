'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Copy } from 'lucide-react';
import Link from 'next/link';
import type { Election } from '@/lib/types/election';
import { showToast } from '@/lib/toast';

const duplicateElectionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
});

type DuplicateElectionInput = z.infer<typeof duplicateElectionSchema>;

interface DuplicateElectionClientProps {
  election: Election;
}

export function DuplicateElectionClient({ election }: DuplicateElectionClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DuplicateElectionInput>({
    resolver: zodResolver(duplicateElectionSchema),
    defaultValues: {
      title: `Copy of ${election.title}`,
    },
  });

  const onSubmit = async (data: DuplicateElectionInput) => {
    try {
      setIsLoading(true);

      const response = await api.elections.duplicate(election._id, data.title);

      if (response.status === 'success') {
        showToast.success('Election duplicated successfully!');
        router.push(`/dashboard/elections/${response.data.election._id}`);
      }
    } catch (error: any) {
      console.error('Failed to duplicate election:', error);
      showToast.error(
        error?.data?.message || error?.message || 'Failed to duplicate election'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/elections/${election._id}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl">Duplicate Election</h1>
          <p className="text-muted-foreground mt-1">
            Create a copy of "{election.title}"
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Election Details</CardTitle>
          <CardDescription>
            The duplicated election will include all ballots and candidates. You can modify the
            title and dates after creation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">New Election Title</Label>
              <Input
                id="title"
                type="text"
                placeholder="Copy of Election Title"
                {...register('title')}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
              <h3 className="text-sm">What will be copied:</h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Election description</li>
                <li>All ballots and positions</li>
                <li>All candidates and options</li>
                <li>Candidate photos and bios (if any)</li>
              </ul>
            </div>

            <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
              <h3 className="text-sm">What will be reset:</h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Start and end dates (set to 7-14 days from now)</li>
                <li>Status (set to draft)</li>
                <li>Voter list (empty, needs to be imported)</li>
                <li>Vote results (empty)</li>
              </ul>
            </div>

            <div className="flex items-center gap-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Copy className="mr-2 h-4 w-4 animate-spin" />
                    Duplicating...
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate Election
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                asChild
                disabled={isLoading}
              >
                <Link href={`/dashboard/elections/${election._id}`}>Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
