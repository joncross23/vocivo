import type {
  FlashcardRating,
  LearnerEntryState,
} from '@vocivo/contracts';
import { calculateLevel } from '@vocivo/domain';

const ratingXpMap: Record<FlashcardRating, number> = {
  again: 4,
  hard: 7,
  good: 10,
  easy: 14,
};

interface ApplyFlashcardReviewInput {
  entryId: string;
  existingEntryState: LearnerEntryState | null;
  rating: FlashcardRating;
  now: Date;
}

export interface FlashcardReviewResult {
  entryState: LearnerEntryState;
  xpGained: number;
}

export function applyFlashcardReview({
  entryId,
  existingEntryState,
  rating,
  now,
}: ApplyFlashcardReviewInput): FlashcardReviewResult {
  const entryState = existingEntryState ?? {
    entryId,
    status: 'unseen' as const,
    bookmarked: false,
    dueAt: null,
    lastPractisedAt: null,
    scoredInteractions: 0,
    correctInteractions: 0,
  };
  const nextScoredInteractions = entryState.scoredInteractions + 1;
  const nextCorrectInteractions = entryState.correctInteractions + (rating === 'again' ? 0 : 1);
  const nextStatus = resolveNextStatus({
    rating,
    nextCorrectInteractions,
  });

  return {
    entryState: {
      ...entryState,
      status: nextStatus,
      dueAt: createDueAt(rating, nextStatus, now),
      lastPractisedAt: now.toISOString(),
      scoredInteractions: nextScoredInteractions,
      correctInteractions: nextCorrectInteractions,
    },
    xpGained: ratingXpMap[rating],
  };
}

export function buildUpdatedLearnerProfile(input: {
  totalXp: number;
  xpGained: number;
  streakDays: number;
}) {
  const totalXp = input.totalXp + input.xpGained;

  return {
    totalXp,
    currentLevel: calculateLevel(totalXp),
    streakDays: input.streakDays,
  };
}

function resolveNextStatus(input: {
  rating: FlashcardRating;
  nextCorrectInteractions: number;
}): LearnerEntryState['status'] {
  if (input.rating === 'again') {
    return 'weak';
  }

  if (input.rating === 'easy') {
    return 'mastered';
  }

  if (input.nextCorrectInteractions >= 3) {
    return 'mastered';
  }

  return 'learning';
}

function createDueAt(
  rating: FlashcardRating,
  nextStatus: LearnerEntryState['status'],
  now: Date,
): string | null {
  if (rating === 'again') {
    return now.toISOString();
  }

  if (rating === 'hard') {
    return addDays(now, 1).toISOString();
  }

  if (rating === 'good') {
    return addDays(now, nextStatus === 'mastered' ? 7 : 3).toISOString();
  }

  return addDays(now, 10).toISOString();
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
