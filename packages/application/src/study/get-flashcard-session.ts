import type {
  ContentEntry,
  ContentRepository,
  ContentSetDefinition,
} from '@vocivo/contracts';

export interface FlashcardSessionSnapshot {
  deck: ContentSetDefinition;
  entries: ContentEntry[];
  theme: ContentSetDefinition | null;
  category: ContentSetDefinition | null;
  grammarType: ContentSetDefinition | null;
}

export interface GetFlashcardSessionDependencies {
  contentRepository: ContentRepository;
  deckId: string;
}

export async function getFlashcardSession({
  contentRepository,
  deckId,
}: GetFlashcardSessionDependencies): Promise<FlashcardSessionSnapshot | null> {
  const setDefinitions = await contentRepository.getSetDefinitions();
  const deck = setDefinitions.find((setDefinition) =>
    setDefinition.kind === 'source-deck' && setDefinition.id === deckId);

  if (deck === undefined) {
    return null;
  }

  const entries = await contentRepository.getEntries({
    themeIds: [],
    categoryIds: [],
    grammarTypeIds: [],
    sourceDeckIds: [deckId],
    includeWeakOnly: false,
    includeDueOnly: false,
    includeBookmarkedOnly: false,
  }, deck.totalItems);

  return {
    deck,
    entries,
    theme: setDefinitions.find((setDefinition) =>
      setDefinition.kind === 'theme' && setDefinition.id === deck.themeId) ?? null,
    category: setDefinitions.find((setDefinition) =>
      setDefinition.kind === 'category' && setDefinition.id === deck.categoryId) ?? null,
    grammarType: setDefinitions.find((setDefinition) =>
      setDefinition.kind === 'grammar-type' && setDefinition.id === deck.grammarTypeId) ?? null,
  };
}
