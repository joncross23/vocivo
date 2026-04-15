import type { BrowseSnapshot } from '@vocivo/application';
import { getBrowseSnapshot } from '@vocivo/application';
import type { ContentSetDefinition, SessionSelection } from '@vocivo/contracts';
import { getContentRepository } from './content-repository';

export interface BrowsePageSnapshot {
  snapshot: BrowseSnapshot;
  allSetDefinitions: ContentSetDefinition[];
}

export async function getBrowsePageSnapshot(
  selection: SessionSelection,
): Promise<BrowsePageSnapshot> {
  const contentRepository = getContentRepository();
  const [snapshot, allSetDefinitions] = await Promise.all([
    getBrowseSnapshot({
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
