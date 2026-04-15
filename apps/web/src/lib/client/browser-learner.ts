'use client';

import type { ContentSetDefinition, LearnerRepository } from '@vocivo/contracts';
import {
  DEFAULT_LEARNER_STORAGE_KEY,
  createLocalStorageLearnerRepository,
} from '@vocivo/infrastructure/local-storage-learner';
import {
  buildPreviewSetAggregates,
  previewLearnerEntryStates,
  previewLearnerProfile,
} from '../preview-learner-seed';

export function createBrowserLearnerRepository(): LearnerRepository {
  return createLocalStorageLearnerRepository({
    storage: window.localStorage,
  });
}

export async function seedPreviewLearnerRepository({
  repository,
  sourceDeckDefinitions,
  hasStoredLearnerState,
}: {
  repository: LearnerRepository;
  sourceDeckDefinitions: ContentSetDefinition[];
  hasStoredLearnerState: boolean;
}): Promise<LearnerRepository> {
  if (!hasStoredLearnerState) {
    await repository.saveProfile(previewLearnerProfile);

    for (const entryState of previewLearnerEntryStates) {
      await repository.saveEntryState(entryState);
    }
  }

  const existingAggregateIds = new Set(
    (await repository.listSetAggregates()).map((setAggregate) => setAggregate.setId),
  );

  for (const setAggregate of buildPreviewSetAggregates(sourceDeckDefinitions)) {
    if (!existingAggregateIds.has(setAggregate.setId)) {
      await repository.saveSetAggregate(setAggregate);
    }
  }

  return repository;
}

export async function ensurePreviewLearnerSeed(
  sourceDeckDefinitions: ContentSetDefinition[],
): Promise<LearnerRepository> {
  const repository = createBrowserLearnerRepository();
  return seedPreviewLearnerRepository({
    repository,
    sourceDeckDefinitions,
    hasStoredLearnerState: window.localStorage.getItem(DEFAULT_LEARNER_STORAGE_KEY) !== null,
  });
}
