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

export async function ensurePreviewLearnerSeed(
  sourceDeckDefinitions: ContentSetDefinition[],
): Promise<LearnerRepository> {
  const repository = createBrowserLearnerRepository();

  if (window.localStorage.getItem(DEFAULT_LEARNER_STORAGE_KEY) !== null) {
    return repository;
  }

  await repository.saveProfile(previewLearnerProfile);

  for (const entryState of previewLearnerEntryStates) {
    await repository.saveEntryState(entryState);
  }

  for (const setAggregate of buildPreviewSetAggregates(sourceDeckDefinitions)) {
    await repository.saveSetAggregate(setAggregate);
  }

  return repository;
}
