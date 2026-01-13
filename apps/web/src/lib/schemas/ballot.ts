import { z } from 'zod';

export const createBallotSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  type: z.enum(['single', 'multiple'], {
    required_error: 'Voting type is required',
  }),
  maxSelections: z.number().min(1).max(10).optional(),
  options: z
    .array(
      z.object({
        text: z.string().min(1, 'Option text is required'),
        order: z.number().default(0),
      })
    )
    .min(2, 'At least 2 options are required'),
});

export type CreateBallotInput = z.infer<typeof createBallotSchema>;
