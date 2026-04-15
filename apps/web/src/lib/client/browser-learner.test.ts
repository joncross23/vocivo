import { describe, expect, it } from 'vitest';
import type { ContentSetDefinition, SetAggregate } from '@vocivo/contracts';
import { createInMemoryLearnerRepository } from '@vocivo/infrastructure';
import { seedPreviewLearnerRepository } from './browser-learner';

const sourceDeckDefinitions: ContentSetDefinition[] = [
  {
    id: 'deck-1',
    kind: 'source-deck',
    title: 'Identity / adjectives',
    themeId: 'theme-1',
    categoryId: 'identity-and-relationships',
    grammarTypeId: 'adjectives',
    sourceDeckId: 'deck-1',
    totalItems: 20,
  },
  {
    id: 'deck-2',
    kind: 'source-deck',
    title: 'Media and technology / nouns',
    themeId: 'theme-3',
    categoryId: 'media-and-technology',
    grammarTypeId: 'nouns',
    sourceDeckId: 'deck-2',
    totalItems: 24,
  },
];

describe('seedPreviewLearnerRepository', () => {
  it('seeds profile, entry states, and initial set aggregates for a fresh learner', async () => {
    const repository = createInMemoryLearnerRepository();

    await seedPreviewLearnerRepository({
      repository,
      sourceDeckDefinitions,
      hasStoredLearnerState: false,
    });

    await expect(repository.getProfile()).resolves.toEqual({
      totalXp: 14400,
      currentLevel: 12,
      streakDays: 18,
    });
    await expect(repository.listEntryStates()).resolves.toHaveLength(4);
    await expect(repository.listSetAggregates()).resolves.toHaveLength(2);
  });

  it('backfills missing deck aggregates without overwriting existing ones', async () => {
    const existingAggregate: SetAggregate = {
      setId: 'deck-1',
      totalItems: 20,
      itemsSeen: 14,
      dueItems: 3,
      weakItems: 1,
      scoredInteractions: 22,
      correctInteractions: 18,
      practiceState: 'active-practice',
      lastPractisedAt: '2026-04-15T08:00:00.000Z',
    };
    const repository = createInMemoryLearnerRepository({
      setAggregates: [existingAggregate],
    });

    await seedPreviewLearnerRepository({
      repository,
      sourceDeckDefinitions,
      hasStoredLearnerState: true,
    });

    await expect(repository.getSetAggregate('deck-1')).resolves.toEqual(existingAggregate);
    await expect(repository.getSetAggregate('deck-2')).resolves.toMatchObject({
      setId: 'deck-2',
      totalItems: 24,
    });
    await expect(repository.listSetAggregates()).resolves.toHaveLength(2);
  });
});
