import { z } from 'zod';

export const learnerProfileSchema = z.object({
  totalXp: z.number().int().nonnegative(),
  currentLevel: z.number().int().nonnegative(),
  streakDays: z.number().int().nonnegative(),
});

export type LearnerProfile = z.infer<typeof learnerProfileSchema>;
