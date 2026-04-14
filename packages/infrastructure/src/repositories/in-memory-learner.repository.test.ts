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
    });

    await expect(repository.getProfile()).resolves.toEqual({
      totalXp: 14400,
      currentLevel: 12,
      streakDays: 18,
    });
    await expect(repository.listEntryStates()).resolves.toHaveLength(1);

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
