import { z } from 'zod';

export const learnerEntryStatusSchema = z.enum([
  'unseen',
  'seen',
  'learning',
  'weak',
  'mastered',
]);

export const learnerEntryStateSchema = z.object({
  entryId: z.string(),
  status: learnerEntryStatusSchema,
  bookmarked: z.boolean(),
  dueAt: z.string().nullable(),
  lastPractisedAt: z.string().nullable(),
  scoredInteractions: z.number().int().nonnegative(),
  correctInteractions: z.number().int().nonnegative(),
});

export type LearnerEntryState = z.infer<typeof learnerEntryStateSchema>;
export type LearnerEntryStatus = z.infer<typeof learnerEntryStatusSchema>;
