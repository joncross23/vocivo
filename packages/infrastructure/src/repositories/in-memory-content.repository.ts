import type {
  ContentEntry,
  ContentRepository,
  ContentSetSummary,
  SessionSelection,
} from '@vocivo/contracts';

interface CreateInMemoryContentRepositoryOptions {
  entries?: ContentEntry[];
  setSummaries?: ContentSetSummary[];
}

export function createInMemoryContentRepository({
  entries = [],
  setSummaries = [],
}: CreateInMemoryContentRepositoryOptions = {}): ContentRepository {
  return {
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
