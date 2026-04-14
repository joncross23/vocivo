import { describe, expect, it } from 'vitest';
import { createInMemoryLearnerRepository } from './in-memory-learner.repository';

describe('createInMemoryLearnerRepository', () => {
  it('stores learner profile values alongside entry state', async () => {
    const repository = createInMemoryLearnerRepository({
      profile: {
        totalXp: 14400,
        currentLevel: 12,
        streakDays: 18,
      },
      entryStates: [
        {
          entryId: 'entry-1',
          status: 'learning',
          bookmarked: false,
          dueAt: null,
          lastPractisedAt: null,
          scoredInteractions: 0,
          correctInteractions: 0,
        },
      ],
      setAggregates: [
        {
          setId: 'deck-1',
          totalItems: 42,
          itemsSeen: 12,
          dueItems: 4,
          weakItems: 2,
          scoredInteractions: 20,
          correctInteractions: 15,
          practiceState: 'light-practice',
          lastPractisedAt: '2026-04-12T09:00:00.000Z',
        },
      ],
    });

    await expect(repository.getProfile()).resolves.toEqual({
      totalXp: 14400,
      currentLevel: 12,
      streakDays: 18,
    });
    await expect(repository.listEntryStates()).resolves.toHaveLength(1);
    await expect(repository.listSetAggregates()).resolves.toEqual([
      {
        setId: 'deck-1',
        totalItems: 42,
        itemsSeen: 12,
        dueItems: 4,
        weakItems: 2,
        scoredInteractions: 20,
        correctInteractions: 15,
        practiceState: 'light-practice',
        lastPractisedAt: '2026-04-12T09:00:00.000Z',
      },
    ]);

    await repository.saveProfile({
      totalXp: 19600,
      currentLevel: 14,
      streakDays: 21,
    });

    await expect(repository.getProfile()).resolves.toEqual({
      totalXp: 19600,
      currentLevel: 14,
      streakDays: 21,
    });
  });
});
