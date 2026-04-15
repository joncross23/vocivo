import type { SessionSelection } from '@vocivo/contracts';
import { getFlashcardSession } from '@vocivo/application';
import { getContentRepository } from './content-repository';

export async function getFlashcardsPageSnapshot(selection: SessionSelection, limit?: number) {
  return getFlashcardSession({
    contentRepository: getContentRepository(),
    selection,
    limit,
  });
}
