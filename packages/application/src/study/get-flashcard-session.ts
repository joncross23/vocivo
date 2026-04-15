import type {
  ContentEntry,
  ContentRepository,
  ContentSetDefinition,
  SessionSelection,
} from '@vocivo/contracts';
import { resolveSelectionContext } from './resolve-selection-context';

export interface FlashcardSessionSnapshot {
  selection: SessionSelection;
  entries: ContentEntry[];
  selectedEntries: ContentEntry[];
  sourceDeckEntries: ContentEntry[];
  resultCount: number;
  theme: ContentSetDefinition | null;
  category: ContentSetDefinition | null;
  grammarType: ContentSetDefinition | null;
  sourceDecks: ContentSetDefinition[];
  sourceDeckDefinitions: ContentSetDefinition[];
}

export interface GetFlashcardSessionDependencies {
  contentRepository: ContentRepository;
  selection: SessionSelection;
  limit?: number;
}

export async function getFlashcardSession({
  contentRepository,
  selection,
  limit = 20,
}: GetFlashcardSessionDependencies): Promise<FlashcardSessionSnapshot | null> {
  const setDefinitions = await contentRepository.getSetDefinitions();
  const selectionContext = resolveSelectionContext(setDefinitions, selection);
  const selectedEntries = await contentRepository.getEntries(
    selection,
    Number.MAX_SAFE_INTEGER,
  );

  if (selectedEntries.length === 0) {
    return null;
  }

  const sourceDeckEntries = selectionContext.matchingSourceDecks.length === 0
    ? selectedEntries
    : await contentRepository.getEntries({
      themeIds: [],
      categoryIds: [],
      grammarTypeIds: [],
      sourceDeckIds: selectionContext.matchingSourceDecks.map((sourceDeck) => sourceDeck.id),
      includeWeakOnly: false,
      includeDueOnly: false,
      includeBookmarkedOnly: false,
    }, Number.MAX_SAFE_INTEGER);

  return {
    selection,
    entries: selectedEntries.slice(0, limit),
    selectedEntries,
    sourceDeckEntries,
    resultCount: selectedEntries.length,
    theme: selectionContext.theme,
    category: selectionContext.category,
    grammarType: selectionContext.grammarType,
    sourceDecks: selectionContext.matchingSourceDecks,
    sourceDeckDefinitions: selectionContext.sourceDeckDefinitions,
  };
}
