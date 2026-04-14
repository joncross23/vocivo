import type {
  ContentEntry,
  ContentRepository,
  ContentSetDefinition,
} from '@vocivo/contracts';

export interface DeckDetailSnapshot {
  deck: ContentSetDefinition;
  previewEntries: ContentEntry[];
  theme: ContentSetDefinition | null;
  category: ContentSetDefinition | null;
  grammarType: ContentSetDefinition | null;
}

export interface GetDeckDetailSnapshotDependencies {
  contentRepository: ContentRepository;
  deckId: string;
  previewLimit?: number;
}

export async function getDeckDetailSnapshot({
  contentRepository,
  deckId,
  previewLimit = 8,
}: GetDeckDetailSnapshotDependencies): Promise<DeckDetailSnapshot | null> {
  const setDefinitions = await contentRepository.getSetDefinitions();
  const deck = setDefinitions.find((setDefinition) =>
    setDefinition.kind === 'source-deck' && setDefinition.id === deckId);

  if (deck === undefined) {
    return null;
  }

  const [previewEntries] = await Promise.all([
    contentRepository.getEntries({
      themeIds: [],
      categoryIds: [],
      grammarTypeIds: [],
      sourceDeckIds: [deckId],
      includeWeakOnly: false,
      includeDueOnly: false,
      includeBookmarkedOnly: false,
    }, previewLimit),
  ]);

  return {
    deck,
    previewEntries,
    theme: setDefinitions.find((setDefinition) =>
      setDefinition.kind === 'theme' && setDefinition.id === deck.themeId) ?? null,
    category: setDefinitions.find((setDefinition) =>
      setDefinition.kind === 'category' && setDefinition.id === deck.categoryId) ?? null,
    grammarType: setDefinitions.find((setDefinition) =>
      setDefinition.kind === 'grammar-type' && setDefinition.id === deck.grammarTypeId) ?? null,
  };
}
