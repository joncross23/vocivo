import { describe, expect, it } from 'vitest';
import {
  DEFAULT_LEARNER_STORAGE_KEY,
  createLocalStorageLearnerRepository,
  type LearnerStorageLike,
} from './local-storage-learner.repository';

describe('createLocalStorageLearnerRepository', () => {
  it('persists profile, entry states, and set aggregates in storage', async () => {
    const repository = createLocalStorageLearnerRepository({
      storage: createMemoryStorage(),
    });

    await repository.saveProfile({
      totalXp: 14400,
      currentLevel: 12,
      streakDays: 18,
    });
    await repository.saveEntryState({
      entryId: 'entry-1',
      status: 'learning',
      bookmarked: true,
      dueAt: '2026-04-15T09:00:00.000Z',
      lastPractisedAt: '2026-04-14T09:00:00.000Z',
      scoredInteractions: 3,
      correctInteractions: 2,
    });
    await repository.saveSetAggregate({
      setId: 'deck-identity-adjectives',
      totalItems: 88,
      itemsSeen: 12,
      dueItems: 4,
      weakItems: 2,
      scoredInteractions: 18,
      correctInteractions: 14,
      practiceState: 'light-practice',
      lastPractisedAt: '2026-04-14T09:00:00.000Z',
    });

    await expect(repository.getProfile()).resolves.toEqual({
      totalXp: 14400,
      currentLevel: 12,
      streakDays: 18,
    });
    await expect(repository.listEntryStates()).resolves.toEqual([
      {
        entryId: 'entry-1',
        status: 'learning',
        bookmarked: true,
        dueAt: '2026-04-15T09:00:00.000Z',
        lastPractisedAt: '2026-04-14T09:00:00.000Z',
        scoredInteractions: 3,
        correctInteractions: 2,
      },
    ]);
    await expect(repository.listSetAggregates()).resolves.toEqual([
      {
        setId: 'deck-identity-adjectives',
        totalItems: 88,
        itemsSeen: 12,
        dueItems: 4,
        weakItems: 2,
        scoredInteractions: 18,
        correctInteractions: 14,
        practiceState: 'light-practice',
        lastPractisedAt: '2026-04-14T09:00:00.000Z',
      },
    ]);
  });

  it('falls back to an empty learner state when storage is malformed', async () => {
    const storage = createMemoryStorage();
    storage.setItem(DEFAULT_LEARNER_STORAGE_KEY, '{"profile": "broken"}');

    const repository = createLocalStorageLearnerRepository({ storage });

    await expect(repository.getProfile()).resolves.toEqual({
      totalXp: 0,
      currentLevel: 0,
      streakDays: 0,
    });
    await expect(repository.listEntryStates()).resolves.toEqual([]);
    await expect(repository.listSetAggregates()).resolves.toEqual([]);
  });
});

function createMemoryStorage(): LearnerStorageLike {
  const values = new Map<string, string>();

  return {
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, value);
    },
  };
}
