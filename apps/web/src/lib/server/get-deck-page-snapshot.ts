import type { DeckDetailSnapshot } from '@vocivo/application';
import type { ContentSetDefinition } from '@vocivo/contracts';
import { getDeckDetailSnapshot } from '@vocivo/application';
import { getContentRepository } from './content-repository';

export interface DeckPageSnapshot {
  snapshot: DeckDetailSnapshot;
  allSetDefinitions: ContentSetDefinition[];
}

export async function getDeckPageSnapshot(
  deckId: string,
): Promise<DeckPageSnapshot | null> {
  const contentRepository = getContentRepository();
  const [snapshot, allSetDefinitions] = await Promise.all([
    getDeckDetailSnapshot({
      contentRepository,
      deckId,
    }),
    contentRepository.getSetDefinitions(),
  ]);

  if (snapshot === null) {
    return null;
  }

  return {
    snapshot,
    allSetDefinitions,
  };
}
