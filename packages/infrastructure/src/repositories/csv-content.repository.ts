import type {
  ContentCatalogue,
  ContentCatalogueEntry,
  ContentCategory,
  ContentGrammarType,
  ContentSourceDeck,
  ContentTheme,
} from '@vocivo/content-pipeline';
import { loadContentCatalogueFromCsvFile } from '@vocivo/content-pipeline';
import type {
  ContentEntry,
  ContentRepository,
  ContentSetDefinition,
  ContentSetSummary,
  SessionSelection,
} from '@vocivo/contracts';

export interface CreateCsvContentRepositoryOptions {
  csvFilePath: string | URL;
}

export function createCsvContentRepository({
  csvFilePath,
}: CreateCsvContentRepositoryOptions): ContentRepository {
  let cataloguePromise: Promise<ContentCatalogue> | null = null;

  async function getCatalogue(): Promise<ContentCatalogue> {
    if (cataloguePromise === null) {
      cataloguePromise = loadContentCatalogueFromCsvFile(csvFilePath);
    }

    return cataloguePromise;
  }

  return {
    async getSetDefinitions() {
      const catalogue = await getCatalogue();

      return buildSetDefinitions(catalogue);
    },
    async getSetSummaries(selection) {
      const setDefinitions = await this.getSetDefinitions();

      return setDefinitions
        .filter((setDefinition) => matchesSelection(setDefinition, selection))
        .map(toUntouchedSummary);
    },
    async getEntries(selection, limit) {
      const catalogue = await getCatalogue();

      return catalogue.entries
        .filter((entry) => matchesSelection(entry, selection))
        .slice(0, limit)
        .map(toContentEntry);
    },
  };
}

function buildSetDefinitions(catalogue: ContentCatalogue): ContentSetDefinition[] {
  return [
    ...catalogue.themes.map(toThemeDefinition),
    ...catalogue.categories.map(toCategoryDefinition),
    ...catalogue.grammarTypes.map(toGrammarTypeDefinition),
    ...catalogue.sourceDecks.map(toSourceDeckDefinition),
  ];
}

function toThemeDefinition(theme: ContentTheme): ContentSetDefinition {
  return {
    id: theme.id,
    kind: 'theme',
    title: theme.title,
    themeId: theme.id,
    categoryId: null,
    grammarTypeId: null,
    sourceDeckId: null,
    totalItems: theme.totalItems,
  };
}

function toCategoryDefinition(category: ContentCategory): ContentSetDefinition {
  return {
    id: category.id,
    kind: 'category',
    title: category.title,
    themeId: category.themeId,
    categoryId: category.id,
    grammarTypeId: null,
    sourceDeckId: null,
    totalItems: category.totalItems,
  };
}

function toGrammarTypeDefinition(grammarType: ContentGrammarType): ContentSetDefinition {
  return {
    id: grammarType.id,
    kind: 'grammar-type',
    title: grammarType.title,
    themeId: null,
    categoryId: null,
    grammarTypeId: grammarType.id,
    sourceDeckId: null,
    totalItems: grammarType.totalItems,
  };
}

function toSourceDeckDefinition(sourceDeck: ContentSourceDeck): ContentSetDefinition {
  return {
    id: sourceDeck.id,
    kind: 'source-deck',
    title: sourceDeck.title,
    themeId: sourceDeck.themeId,
    categoryId: sourceDeck.categoryId,
    grammarTypeId: sourceDeck.grammarTypeId,
    sourceDeckId: sourceDeck.id,
    totalItems: sourceDeck.totalItems,
  };
}

function toUntouchedSummary(setDefinition: ContentSetDefinition): ContentSetSummary {
  return {
    ...setDefinition,
    itemsSeen: 0,
    dueItems: 0,
    weakItems: 0,
    practiceState: 'untouched',
    lastPractisedAt: null,
  };
}

function toContentEntry(entry: ContentCatalogueEntry): ContentEntry {
  return {
    id: entry.id,
    sourceDeckId: entry.sourceDeckId,
    themeId: entry.themeId,
    categoryId: entry.categoryId,
    grammarTypeId: entry.grammarTypeId,
    spanish: entry.spanish,
    englishPrimary: entry.englishPrimary,
    englishAlternates: entry.englishAlternates,
    rawDefinition: entry.rawDefinition,
    answerComplexity: entry.answerComplexity,
    modeEligibility: entry.modeEligibility,
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
