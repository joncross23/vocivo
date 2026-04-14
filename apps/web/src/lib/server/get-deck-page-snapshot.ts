import { getDeckDetailSnapshot } from '@vocivo/application';
import { getContentRepository } from './content-repository';

export async function getDeckPageSnapshot(deckId: string) {
  return getDeckDetailSnapshot({
    contentRepository: getContentRepository(),
    deckId,
  });
}
