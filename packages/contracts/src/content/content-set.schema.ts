import { z } from 'zod';

export const contentSetKindSchema = z.enum([
  'theme',
  'category',
  'grammar-type',
  'source-deck',
]);

export const practiceStateSchema = z.enum([
  'untouched',
  'light-practice',
  'active-practice',
  'well-practised',
]);

export const contentSetDefinitionSchema = z.object({
  id: z.string(),
  kind: contentSetKindSchema,
  title: z.string(),
  themeId: z.string().nullable(),
  categoryId: z.string().nullable(),
  grammarTypeId: z.string().nullable(),
  sourceDeckId: z.string().nullable(),
  totalItems: z.number().int().nonnegative(),
});

export const contentSetSummarySchema = contentSetDefinitionSchema.extend({
  itemsSeen: z.number().int().nonnegative(),
  dueItems: z.number().int().nonnegative(),
  weakItems: z.number().int().nonnegative(),
  practiceState: practiceStateSchema,
  lastPractisedAt: z.string().nullable(),
});

export type ContentSetDefinition = z.infer<typeof contentSetDefinitionSchema>;
export type ContentSetSummary = z.infer<typeof contentSetSummarySchema>;
export type ContentSetKind = z.infer<typeof contentSetKindSchema>;
export type PracticeState = z.infer<typeof practiceStateSchema>;
