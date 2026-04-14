import type {
  ContentRepository,
  ContentSetDefinition,
  SessionSelection,
} from '@vocivo/contracts';

export interface BrowseSnapshot {
  themes: ContentSetDefinition[];
  categories: ContentSetDefinition[];
  grammarTypes: ContentSetDefinition[];
  sourceDecks: ContentSetDefinition[];
  selection: SessionSelection;
  resultCount: number;
}

export interface GetBrowseSnapshotDependencies {
  contentRepository: ContentRepository;
  selection: SessionSelection;
}

export async function getBrowseSnapshot({
  contentRepository,
  selection,
}: GetBrowseSnapshotDependencies): Promise<BrowseSnapshot> {
  const [setDefinitions, matchingEntries] = await Promise.all([
    contentRepository.getSetDefinitions(),
    contentRepository.getEntries(selection, Number.MAX_SAFE_INTEGER),
  ]);

  const themes = getDefinitionsByKind(setDefinitions, 'theme');
  const categories = getDefinitionsByKind(setDefinitions, 'category')
    .filter((category) => matchesTheme(category, selection));
  const sourceDecks = getDefinitionsByKind(setDefinitions, 'source-deck')
    .filter((sourceDeck) => matchesSelection(sourceDeck, selection));

  const availableGrammarTypeIds = new Set(sourceDecks.map((sourceDeck) => sourceDeck.grammarTypeId));
  const grammarTypes = getDefinitionsByKind(setDefinitions, 'grammar-type')
    .filter((grammarType) =>
      availableGrammarTypeIds.size === 0
        ? matchesGrammarType(grammarType, selection)
        : availableGrammarTypeIds.has(grammarType.grammarTypeId));

  return {
    themes,
    categories,
    grammarTypes,
    sourceDecks,
    selection,
    resultCount: matchingEntries.length,
  };
}

function getDefinitionsByKind(
  setDefinitions: ContentSetDefinition[],
  kind: ContentSetDefinition['kind'],
): ContentSetDefinition[] {
  return setDefinitions
    .filter((setDefinition) => setDefinition.kind === kind)
    .sort((left, right) => left.title.localeCompare(right.title, 'en-GB'));
}

function matchesSelection(
  setDefinition: ContentSetDefinition,
  selection: SessionSelection,
): boolean {
  return matchesIds(selection.themeIds, setDefinition.themeId)
    && matchesIds(selection.categoryIds, setDefinition.categoryId)
    && matchesIds(selection.grammarTypeIds, setDefinition.grammarTypeId)
    && matchesIds(selection.sourceDeckIds, setDefinition.sourceDeckId);
}

function matchesTheme(
  setDefinition: ContentSetDefinition,
  selection: SessionSelection,
): boolean {
  return matchesIds(selection.themeIds, setDefinition.themeId);
}

function matchesGrammarType(
  setDefinition: ContentSetDefinition,
  selection: SessionSelection,
): boolean {
  return matchesIds(selection.grammarTypeIds, setDefinition.grammarTypeId);
}

function matchesIds(selectedIds: string[], currentId: string | null): boolean {
  return selectedIds.length === 0 || (currentId !== null && selectedIds.includes(currentId));
}
