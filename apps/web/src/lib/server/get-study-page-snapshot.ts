import type { StudyLaunchSnapshot } from '@vocivo/application';
import { getStudyLaunchSnapshot } from '@vocivo/application';
import type {
  ContentSetDefinition,
  SessionSelection,
} from '@vocivo/contracts';
import { getContentRepository } from './content-repository';

export interface StudyPageSnapshot {
  snapshot: StudyLaunchSnapshot;
  allSetDefinitions: ContentSetDefinition[];
}

export async function getStudyPageSnapshot(
  selection: SessionSelection,
): Promise<StudyPageSnapshot> {
  const contentRepository = getContentRepository();
  const [snapshot, allSetDefinitions] = await Promise.all([
    getStudyLaunchSnapshot({
      contentRepository,
      selection,
    }),
    contentRepository.getSetDefinitions(),
  ]);

  return {
    snapshot,
    allSetDefinitions,
  };
}
