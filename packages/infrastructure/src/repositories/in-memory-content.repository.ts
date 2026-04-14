import type {
  ContentEntry,
  ContentRepository,
  ContentSetDefinition,
  ContentSetSummary,
  SessionSelection,
} from '@vocivo/contracts';

interface CreateInMemoryContentRepositoryOptions {
  entries?: ContentEntry[];
  setDefinitions?: ContentSetDefinition[];
  setSummaries?: ContentSetSummary[];
}

export function createInMemoryContentRepository({
  entries = [],
  setDefinitions = [],
  setSummaries = [],
}: CreateInMemoryContentRepositoryOptions = {}): ContentRepository {
  return {
    async getSetDefinitions() {
      return setDefinitions.length > 0
        ? setDefinitions
        : setSummaries.map(toContentSetDefinition);
    },
    async getSetSummaries(selection) {
      return setSummaries.filter((setSummary) => matchesSelection(setSummary, selection));
    },
    async getEntries(selection, limit) {
      return entries.filter((entry) => matchesSelection(entry, selection)).slice(0, limit);
    },
  };
}

function matchesSelection(
  candidate: {
    themeId: string | null;
    categoryId: string | null;
    grammarTypeId: string | null;
    sourceDeckId: string | null;
  },
  selection?: SessionSelection,
): boolean {
  if (selection === undefined) {
    return true;
  }

  return matchesIdFilter(selection.themeIds, candidate.themeId)
    && matchesIdFilter(selection.categoryIds, candidate.categoryId)
    && matchesIdFilter(selection.grammarTypeIds, candidate.grammarTypeId)
    && matchesIdFilter(selection.sourceDeckIds, candidate.sourceDeckId);
}

function matchesIdFilter(filterValues: string[], candidateValue: string | null): boolean {
  if (filterValues.length === 0) {
    return true;
  }

  return candidateValue !== null && filterValues.includes(candidateValue);
}

function toContentSetDefinition(setSummary: ContentSetSummary): ContentSetDefinition {
  const {
    id,
    title,
    themeId,
    categoryId,
    grammarTypeId,
    sourceDeckId,
    totalItems,
  } = setSummary;

  return {
    id,
    kind: inferContentSetKind(setSummary),
    title,
    themeId,
    categoryId,
    grammarTypeId,
    sourceDeckId,
    totalItems,
  };
}

function inferContentSetKind(setSummary: ContentSetSummary): ContentSetDefinition['kind'] {
  if (setSummary.sourceDeckId !== null) {
    return 'source-deck';
  }

  if (setSummary.grammarTypeId !== null) {
    return 'grammar-type';
  }

  if (setSummary.categoryId !== null) {
    return 'category';
  }

  return 'theme';
}
