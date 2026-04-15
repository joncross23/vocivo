import type {
  ContentSetDefinition,
  SessionSelection,
} from '@vocivo/contracts';

export interface SelectionContext {
  theme: ContentSetDefinition | null;
  category: ContentSetDefinition | null;
  grammarType: ContentSetDefinition | null;
  sourceDeckDefinitions: ContentSetDefinition[];
  matchingSourceDecks: ContentSetDefinition[];
}

export function resolveSelectionContext(
  setDefinitions: ContentSetDefinition[],
  selection: SessionSelection,
): SelectionContext {
  const sourceDeckDefinitions = setDefinitions.filter(
    (setDefinition) => setDefinition.kind === 'source-deck',
  );
  const matchingSourceDecks = sourceDeckDefinitions.filter((setDefinition) =>
    matchesSelection(setDefinition, selection));

  return {
    theme: findSelectedDefinition(
      setDefinitions,
      'theme',
      resolveContextId(selection.themeIds[0] ?? null, matchingSourceDecks, 'themeId'),
    ),
    category: findSelectedDefinition(
      setDefinitions,
      'category',
      resolveContextId(selection.categoryIds[0] ?? null, matchingSourceDecks, 'categoryId'),
    ),
    grammarType: findSelectedDefinition(
      setDefinitions,
      'grammar-type',
      resolveContextId(
        selection.grammarTypeIds[0] ?? null,
        matchingSourceDecks,
        'grammarTypeId',
      ),
    ),
    sourceDeckDefinitions,
    matchingSourceDecks,
  };
}

function findSelectedDefinition(
  setDefinitions: ContentSetDefinition[],
  kind: ContentSetDefinition['kind'],
  id: string | null,
): ContentSetDefinition | null {
  if (id === null) {
    return null;
  }

  return setDefinitions.find((setDefinition) =>
    setDefinition.kind === kind && setDefinition.id === id) ?? null;
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

function matchesIds(selectedIds: string[], currentId: string | null): boolean {
  return selectedIds.length === 0 || (currentId !== null && selectedIds.includes(currentId));
}

function resolveContextId(
  selectedId: string | null,
  matchingSourceDecks: ContentSetDefinition[],
  key: 'themeId' | 'categoryId' | 'grammarTypeId',
): string | null {
  if (selectedId !== null) {
    return selectedId;
  }

  const matchingIds = new Set(
    matchingSourceDecks
      .map((sourceDeck) => sourceDeck[key])
      .filter((value): value is string => value !== null),
  );

  return matchingIds.size === 1 ? [...matchingIds][0] ?? null : null;
}
