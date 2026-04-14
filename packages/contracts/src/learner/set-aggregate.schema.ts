import { z } from 'zod';
import { practiceStateSchema } from '../content/content-set.schema';

export const setAggregateSchema = z.object({
  setId: z.string(),
  totalItems: z.number().int().nonnegative(),
  itemsSeen: z.number().int().nonnegative(),
  dueItems: z.number().int().nonnegative(),
  weakItems: z.number().int().nonnegative(),
  scoredInteractions: z.number().int().nonnegative(),
  correctInteractions: z.number().int().nonnegative(),
  practiceState: practiceStateSchema,
  lastPractisedAt: z.string().nullable(),
});

export type SetAggregate = z.infer<typeof setAggregateSchema>;
