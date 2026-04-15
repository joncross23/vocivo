import { z } from 'zod';

export const flashcardRatingSchema = z.enum([
  'again',
  'hard',
  'good',
  'easy',
]);

export type FlashcardRating = z.infer<typeof flashcardRatingSchema>;
