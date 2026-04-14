import { readFile } from 'node:fs/promises';
import type { AnswerComplexity, ModeEligibility } from '@vocivo/contracts';
import {
  hasRequiredContent,
  normalizeSourceRow,
  type NormalizedSourceRow,
  type SourceCsvRow,
} from '../ingest/normalize-source-row';
import { parseSourceCsv } from '../ingest/parse-source-csv';
import type {
  ContentCatalogue,
  ContentCatalogueEntry,
  ContentCategory,
  ContentGrammarType,
  ContentSourceDeck,
  ContentTheme,
} from './content-catalogue';

const THEME_METADATA: Record<string, { id: string; title: string; sortIndex: number }> = {
  'Theme 1': {
    id: 'theme-1',
    title: 'Theme 1: People and lifestyle',
    sortIndex: 1,
  },
  'Theme 2': {
    id: 'theme-2',
    title: 'Theme 2: Popular culture',
    sortIndex: 2,
  },
  'Theme 3': {
    id: 'theme-3',
    title: 'Theme 3: Communication and the world around us',
    sortIndex: 3,
  },
};

const COMPLEX_NOTE_PATTERN = /\b(?:m|f|mpl|fpl|pre-noun|post-noun|after ser|after estar)\b/i;

export function buildContentCatalogue(sourceRows: SourceCsvRow[]): ContentCatalogue {
  const normalizedRows = sourceRows
    .map(normalizeSourceRow)
    .filter(hasRequiredContent);

  const entries = normalizedRows.map(buildEntry).sort(compareEntries);
  const themes = buildThemes(entries);
  const categories = buildCategories(entries);
  const grammarTypes = buildGrammarTypes(entries);
  const sourceDecks = buildSourceDecks(entries);

  return {
    entries,
    themes,
    categories,
    grammarTypes,
    sourceDecks,
  };
}

export function buildContentCatalogueFromCsvText(csvText: string): ContentCatalogue {
  return buildContentCatalogue(parseSourceCsv(csvText));
}

export async function loadContentCatalogueFromCsvFile(
  filePath: string | URL,
): Promise<ContentCatalogue> {
  const csvText = await readFile(filePath, 'utf8');
  return buildContentCatalogueFromCsvText(csvText);
}

function buildEntry(row: NormalizedSourceRow): ContentCatalogueEntry {
  const theme = getThemeMetadata(row.sourceThemeGroup);
  const categoryId = slugify(row.sourceTopic);
  const grammarTypeId = slugify(row.sourceWordType);
  const answerComplexity = classifyAnswerComplexity(row.spanish, row.rawDefinition);
  const englishAnswers = parseEnglishAnswers(row.rawDefinition);

  return {
    id: row.sourceItemId.length > 0 ? row.sourceItemId : buildFallbackEntryId(row),
    sourceItemId: row.sourceItemId.length > 0 ? row.sourceItemId : buildFallbackEntryId(row),
    sourceDeckId: row.sourceDeckId,
    themeId: theme.id,
    categoryId,
    grammarTypeId,
    spanish: row.spanish,
    englishPrimary: englishAnswers.primary,
    englishAlternates: englishAnswers.alternates,
    rawDefinition: row.rawDefinition,
    answerComplexity,
    modeEligibility: deriveModeEligibility({
      answerComplexity,
      spanish: row.spanish,
    }),
    sourceLabel: row.sourceLabel,
    sourceUrl: row.sourceUrl,
    sourceThemeLabel: row.sourceThemeGroup,
    sourceCategoryLabel: row.sourceTopic,
    sourceGrammarTypeLabel: row.sourceWordType,
    cardIndexInDeck: row.cardIndexInDeck,
    spanishAudioUrl: row.spanishAudioUrl,
    englishAudioUrl: row.englishAudioUrl,
  };
}

function buildThemes(entries: ContentCatalogueEntry[]): ContentTheme[] {
  const themes = new Map<string, ContentTheme>();

  for (const entry of entries) {
    const existing = themes.get(entry.themeId);

    if (existing === undefined) {
      themes.set(entry.themeId, {
        id: entry.themeId,
        title: themeTitleFromId(entry.themeId),
        totalItems: 1,
      });
      continue;
    }

    existing.totalItems += 1;
  }

  return [...themes.values()].sort(compareThemes);
}

function buildCategories(entries: ContentCatalogueEntry[]): ContentCategory[] {
  const categories = new Map<string, ContentCategory>();

  for (const entry of entries) {
    const existing = categories.get(entry.categoryId);

    if (existing === undefined) {
      categories.set(entry.categoryId, {
        id: entry.categoryId,
        title: entry.sourceCategoryLabel,
        themeId: entry.themeId,
        totalItems: 1,
      });
      continue;
    }

    existing.totalItems += 1;
  }

  return [...categories.values()].sort((left, right) =>
    compareThemeIds(left.themeId, right.themeId) || left.title.localeCompare(right.title, 'en-GB'));
}

function buildGrammarTypes(entries: ContentCatalogueEntry[]): ContentGrammarType[] {
  const grammarTypes = new Map<string, ContentGrammarType>();

  for (const entry of entries) {
    const existing = grammarTypes.get(entry.grammarTypeId);

    if (existing === undefined) {
      grammarTypes.set(entry.grammarTypeId, {
        id: entry.grammarTypeId,
        title: entry.sourceGrammarTypeLabel,
        totalItems: 1,
      });
      continue;
    }

    existing.totalItems += 1;
  }

  return [...grammarTypes.values()].sort((left, right) =>
    left.title.localeCompare(right.title, 'en-GB'));
}

function buildSourceDecks(entries: ContentCatalogueEntry[]): ContentSourceDeck[] {
  const sourceDecks = new Map<string, ContentSourceDeck>();

  for (const entry of entries) {
    const existing = sourceDecks.get(entry.sourceDeckId);

    if (existing === undefined) {
      sourceDecks.set(entry.sourceDeckId, {
        id: entry.sourceDeckId,
        title: `${entry.sourceCategoryLabel} / ${entry.sourceGrammarTypeLabel.toLowerCase()}`,
        themeId: entry.themeId,
        categoryId: entry.categoryId,
        grammarTypeId: entry.grammarTypeId,
        totalItems: 1,
        sourceLabel: entry.sourceLabel,
        sourceUrl: entry.sourceUrl,
      });
      continue;
    }

    existing.totalItems += 1;
  }

  return [...sourceDecks.values()].sort((left, right) =>
    compareThemeIds(left.themeId, right.themeId)
    || left.title.localeCompare(right.title, 'en-GB'));
}

function parseEnglishAnswers(rawDefinition: string): {
  primary: string;
  alternates: string[];
} {
  const parts = splitTopLevelCommaSeparated(rawDefinition)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);

  if (parts.length === 0) {
    return {
      primary: rawDefinition.trim(),
      alternates: [],
    };
  }

  const [primary, ...alternates] = parts;

  return {
    primary: primary ?? rawDefinition.trim(),
    alternates: unique(alternates),
  };
}

function classifyAnswerComplexity(spanish: string, rawDefinition: string): AnswerComplexity {
  const definitionAlternates = splitTopLevelCommaSeparated(rawDefinition);
  const spanishHasComplexSurface = hasComplexSpanishSurface(spanish);
  const parentheticalMatches = rawDefinition.match(/\([^)]*\)/g) ?? [];

  if (
    spanishHasComplexSurface
    || rawDefinition.includes('|')
    || rawDefinition.includes(';')
    || rawDefinition.includes('/')
    || parentheticalMatches.length > 1
    || COMPLEX_NOTE_PATTERN.test(rawDefinition)
  ) {
    return 'complex-form';
  }

  if (definitionAlternates.length > 1 || parentheticalMatches.length > 0) {
    return 'multi-gloss';
  }

  return 'clean';
}

function deriveModeEligibility(input: {
  answerComplexity: AnswerComplexity;
  spanish: string;
}): ModeEligibility {
  const spanishHasComplexSurface = hasComplexSpanishSurface(input.spanish);

  if (input.answerComplexity === 'complex-form' || spanishHasComplexSurface) {
    return {
      reverseSafe: false,
      typingSafe: false,
      matchingSafe: false,
      arcadeSafe: false,
    };
  }

  if (input.answerComplexity === 'multi-gloss') {
    return {
      reverseSafe: false,
      typingSafe: false,
      matchingSafe: true,
      arcadeSafe: false,
    };
  }

  return {
    reverseSafe: true,
    typingSafe: true,
    matchingSafe: true,
    arcadeSafe: true,
  };
}

function hasComplexSpanishSurface(spanish: string): boolean {
  return spanish.includes('|') || spanish.includes('/') || splitTopLevelCommaSeparated(spanish).length > 1;
}

function splitTopLevelCommaSeparated(value: string): string[] {
  const parts: string[] = [];
  let current = '';
  let depth = 0;

  for (const character of value) {
    if (character === '(') {
      depth += 1;
      current += character;
      continue;
    }

    if (character === ')') {
      depth = Math.max(depth - 1, 0);
      current += character;
      continue;
    }

    if (character === ',' && depth === 0) {
      parts.push(current);
      current = '';
      continue;
    }

    current += character;
  }

  parts.push(current);
  return parts;
}

function compareEntries(left: ContentCatalogueEntry, right: ContentCatalogueEntry): number {
  return compareThemeIds(left.themeId, right.themeId)
    || left.sourceCategoryLabel.localeCompare(right.sourceCategoryLabel, 'en-GB')
    || left.sourceGrammarTypeLabel.localeCompare(right.sourceGrammarTypeLabel, 'en-GB')
    || left.sourceDeckId.localeCompare(right.sourceDeckId, 'en-GB')
    || compareOptionalNumbers(left.cardIndexInDeck, right.cardIndexInDeck)
    || left.id.localeCompare(right.id, 'en-GB');
}

function compareThemes(left: ContentTheme, right: ContentTheme): number {
  return compareThemeIds(left.id, right.id) || left.title.localeCompare(right.title, 'en-GB');
}

function compareThemeIds(left: string, right: string): number {
  return themeSortIndex(left) - themeSortIndex(right) || left.localeCompare(right, 'en-GB');
}

function compareOptionalNumbers(left: number | null, right: number | null): number {
  const leftValue = left ?? Number.MAX_SAFE_INTEGER;
  const rightValue = right ?? Number.MAX_SAFE_INTEGER;
  return leftValue - rightValue;
}

function themeSortIndex(themeId: string): number {
  const metadata = Object.values(THEME_METADATA).find((candidate) => candidate.id === themeId);
  return metadata?.sortIndex ?? Number.MAX_SAFE_INTEGER;
}

function themeTitleFromId(themeId: string): string {
  const metadata = Object.values(THEME_METADATA).find((candidate) => candidate.id === themeId);
  return metadata?.title ?? themeId;
}

function getThemeMetadata(sourceThemeGroup: string): { id: string; title: string; sortIndex: number } {
  return THEME_METADATA[sourceThemeGroup] ?? {
    id: slugify(sourceThemeGroup),
    title: sourceThemeGroup,
    sortIndex: Number.MAX_SAFE_INTEGER,
  };
}

function buildFallbackEntryId(row: NormalizedSourceRow): string {
  return `${row.sourceDeckId}:${row.cardIndexInDeck ?? 'unknown'}:${slugify(row.spanish)}`;
}

function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}
