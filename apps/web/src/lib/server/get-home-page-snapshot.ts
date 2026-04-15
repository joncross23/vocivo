import type { DashboardSnapshot } from '@vocivo/application';
import type { ContentSetDefinition } from '@vocivo/contracts';
import { getDashboardSnapshot } from '@vocivo/application';
import { createInMemoryLearnerRepository } from '@vocivo/infrastructure';
import { getContentRepository } from './content-repository';
import {
  buildPreviewSetAggregates,
  previewLearnerEntryStates,
  previewLearnerProfile,
} from '../preview-learner-seed';

export interface HomePageSnapshot {
  initialSnapshot: DashboardSnapshot;
  sourceDeckDefinitions: ContentSetDefinition[];
}

export async function getHomePageSnapshot(): Promise<HomePageSnapshot> {
  const contentRepository = getContentRepository();
  const setDefinitions = await contentRepository.getSetDefinitions();
  const sourceDeckDefinitions = setDefinitions.filter(
    (setDefinition) => setDefinition.kind === 'source-deck',
  );

  const initialSnapshot = await getDashboardSnapshot({
    contentRepository,
    learnerRepository: createInMemoryLearnerRepository({
      profile: previewLearnerProfile,
      entryStates: previewLearnerEntryStates,
      setAggregates: buildPreviewSetAggregates(sourceDeckDefinitions),
    }),
    now: new Date(),
  });

  return {
    initialSnapshot,
    sourceDeckDefinitions,
  };
}
