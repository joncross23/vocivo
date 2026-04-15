import type {
  ContentEntry,
  ContentRepository,
  ContentSetDefinition,
  SessionSelection,
} from '@vocivo/contracts';
import { resolveSelectionContext } from './resolve-selection-context';

export interface PracticeTestSessionSnapshot {
  selection: SessionSelection;
  entries: ContentEntry[];
  selectedEntries: ContentEntry[];
  sourceDeckEntries: ContentEntry[];
  resultCount: number;
  eligibleCount: number;
  theme: ContentSetDefinition | null;
  category: ContentSetDefinition | null;
  grammarType: ContentSetDefinition | null;
  sourceDecks: ContentSetDefinition[];
  sourceDeckDefinitions: ContentSetDefinition[];
}

export interface GetPracticeTestSessionDependencies {
  contentRepository: ContentRepository;
  selection: SessionSelection;
  limit?: number;
}

export async function getPracticeTestSession({
  contentRepository,
  selection,
  limit = 20,
}: GetPracticeTestSessionDependencies): Promise<PracticeTestSessionSnapshot | null> {
  const [setDefinitions, selectedEntries] = await Promise.all([
    contentRepository.getSetDefinitions(),
    contentRepository.getEntries(selection, Number.MAX_SAFE_INTEGER),
  ]);
  const selectionContext = resolveSelectionContext(setDefinitions, selection);

  if (selectedEntries.length === 0) {
    return null;
  }

  const eligibleEntries = selectedEntries.filter((entry) => entry.modeEligibility.typingSafe);

  if (eligibleEntries.length === 0) {
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
    entries: eligibleEntries.slice(0, limit),
    selectedEntries,
    sourceDeckEntries,
    resultCount: selectedEntries.length,
    eligibleCount: eligibleEntries.length,
    theme: selectionContext.theme,
    category: selectionContext.category,
    grammarType: selectionContext.grammarType,
    sourceDecks: selectionContext.matchingSourceDecks,
    sourceDeckDefinitions: selectionContext.sourceDeckDefinitions,
  };
}
