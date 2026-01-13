import { z } from 'zod';
import type { ElectionStatus } from '@/lib/types/election';

// Base schema object (without refine)
const baseElectionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  startAt: z.string().min(1, 'Start date is required'),
  endAt: z.string().min(1, 'End date is required'),
  draft: z.boolean().optional().default(false),
});

// Create schema with date validation
export const createElectionSchema = baseElectionSchema.refine((data) => {
  const start = new Date(data.startAt);
  const end = new Date(data.endAt);
  return start < end;
}, {
  message: 'End date must be after start date',
  path: ['endAt'],
});

// Update schema - same as create, status is calculated automatically
export const updateElectionSchema = baseElectionSchema.refine((data) => {
  const start = new Date(data.startAt);
  const end = new Date(data.endAt);
  return start < end;
}, {
  message: 'End date must be after start date',
  path: ['endAt'],
});

export type CreateElectionInput = z.infer<typeof createElectionSchema>;
export type UpdateElectionInput = z.infer<typeof updateElectionSchema>;