import { z } from 'zod';

export const sessionModeSchema = z.enum([
  'flashcards',
  'practice-test',
  'matching',
  'word-sprint',
  'car-racing',
  'traffic-jam',
]);

export const sessionSelectionSchema = z.object({
  themeIds: z.array(z.string()).default([]),
  categoryIds: z.array(z.string()).default([]),
  grammarTypeIds: z.array(z.string()).default([]),
  sourceDeckIds: z.array(z.string()).default([]),
  includeWeakOnly: z.boolean().default(false),
  includeDueOnly: z.boolean().default(false),
  includeBookmarkedOnly: z.boolean().default(false),
});

export const sessionRequestSchema = z.object({
  mode: sessionModeSchema,
  selection: sessionSelectionSchema,
  limit: z.number().int().positive().max(100).default(20),
});

export type SessionMode = z.infer<typeof sessionModeSchema>;
export type SessionSelection = z.infer<typeof sessionSelectionSchema>;
export type SessionRequest = z.infer<typeof sessionRequestSchema>;
