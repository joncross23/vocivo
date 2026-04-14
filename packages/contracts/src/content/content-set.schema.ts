import { z } from 'zod';

export const practiceStateSchema = z.enum([
  'untouched',
  'light-practice',
  'active-practice',
  'well-practised',
]);

export const contentSetSummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  themeId: z.string().nullable(),
  categoryId: z.string().nullable(),
  grammarTypeId: z.string().nullable(),
  sourceDeckId: z.string().nullable(),
  totalItems: z.number().int().nonnegative(),
  itemsSeen: z.number().int().nonnegative(),
  dueItems: z.number().int().nonnegative(),
  weakItems: z.number().int().nonnegative(),
  practiceState: practiceStateSchema,
  lastPractisedAt: z.string().nullable(),
});

export type ContentSetSummary = z.infer<typeof contentSetSummarySchema>;
export type PracticeState = z.infer<typeof practiceStateSchema>;
