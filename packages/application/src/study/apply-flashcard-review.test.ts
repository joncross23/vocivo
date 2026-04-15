import { describe, expect, it } from 'vitest';
import { applyFlashcardReview, buildUpdatedLearnerProfile } from './apply-flashcard-review';

describe('applyFlashcardReview', () => {
  it('marks an again rating as weak and due immediately', () => {
    const result = applyFlashcardReview({
      entryId: 'entry-1',
      existingEntryState: {
        entryId: 'entry-1',
        status: 'learning',
        bookmarked: true,
        dueAt: null,
        lastPractisedAt: null,
        scoredInteractions: 1,
        correctInteractions: 1,
      },
      rating: 'again',
      now: new Date('2026-04-15T12:00:00.000Z'),
    });

    expect(result).toEqual({
      entryState: {
        entryId: 'entry-1',
        status: 'weak',
        bookmarked: true,
        dueAt: '2026-04-15T12:00:00.000Z',
        lastPractisedAt: '2026-04-15T12:00:00.000Z',
        scoredInteractions: 2,
        correctInteractions: 1,
      },
      xpGained: 4,
    });
  });

  it('promotes sustained success to mastered', () => {
    const result = applyFlashcardReview({
      entryId: 'entry-2',
      existingEntryState: {
        entryId: 'entry-2',
        status: 'learning',
        bookmarked: false,
        dueAt: null,
        lastPractisedAt: '2026-04-14T12:00:00.000Z',
        scoredInteractions: 2,
        correctInteractions: 2,
      },
      rating: 'good',
      now: new Date('2026-04-15T12:00:00.000Z'),
    });

    expect(result).toEqual({
      entryState: {
        entryId: 'entry-2',
        status: 'mastered',
        bookmarked: false,
        dueAt: '2026-04-22T12:00:00.000Z',
        lastPractisedAt: '2026-04-15T12:00:00.000Z',
        scoredInteractions: 3,
        correctInteractions: 3,
      },
      xpGained: 10,
    });
  });
});

describe('buildUpdatedLearnerProfile', () => {
  it('recalculates the shared level curve from total XP', () => {
    expect(buildUpdatedLearnerProfile({
      totalXp: 14400,
      xpGained: 100,
      streakDays: 18,
    })).toEqual({
      totalXp: 14500,
      currentLevel: 12,
      streakDays: 18,
    });
  });
});
