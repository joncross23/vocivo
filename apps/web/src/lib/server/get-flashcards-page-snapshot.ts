import { getFlashcardSession } from '@vocivo/application';
import { getContentRepository } from './content-repository';

export async function getFlashcardsPageSnapshot(deckId: string) {
  return getFlashcardSession({
    contentRepository: getContentRepository(),
    deckId,
  });
}
