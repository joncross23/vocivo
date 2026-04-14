import { z } from 'zod';

export const answerComplexitySchema = z.enum(['clean', 'multi-gloss', 'complex-form']);

export const modeEligibilitySchema = z.object({
  reverseSafe: z.boolean(),
  typingSafe: z.boolean(),
  matchingSafe: z.boolean(),
  arcadeSafe: z.boolean(),
});

export const contentEntrySchema = z.object({
  id: z.string(),
  sourceDeckId: z.string(),
  themeId: z.string(),
  categoryId: z.string(),
  grammarTypeId: z.string(),
  spanish: z.string(),
  englishPrimary: z.string(),
  englishAlternates: z.array(z.string()),
  rawDefinition: z.string(),
  answerComplexity: answerComplexitySchema,
  modeEligibility: modeEligibilitySchema,
});

export type ContentEntry = z.infer<typeof contentEntrySchema>;
export type AnswerComplexity = z.infer<typeof answerComplexitySchema>;
export type ModeEligibility = z.infer<typeof modeEligibilitySchema>;
