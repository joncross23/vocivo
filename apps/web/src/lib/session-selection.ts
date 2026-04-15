import type {
  SessionMode,
  SessionSelection,
} from '@vocivo/contracts';

type SearchParamValue = string | string[] | undefined;
type SearchParamsLike = Record<string, SearchParamValue>;

export function parseSessionSelectionSearchParams(
  searchParams: SearchParamsLike,
): SessionSelection {
  return {
    themeIds: toArray(searchParams.theme),
    categoryIds: toArray(searchParams.category),
    grammarTypeIds: toArray(searchParams.grammar),
    sourceDeckIds: toArray(searchParams.deck),
    includeWeakOnly: toBoolean(searchParams.weak),
    includeDueOnly: toBoolean(searchParams.due),
    includeBookmarkedOnly: toBoolean(searchParams.bookmarked),
  };
}

export function parseSessionLimitSearchParam(
  value: SearchParamValue,
  fallback = 20,
): number {
  const parsedValue = Number.parseInt(firstValue(value) ?? '', 10);

  if (!Number.isFinite(parsedValue) || parsedValue < 1) {
    return fallback;
  }

  return Math.min(parsedValue, 100);
}

export function buildSessionSearchParams(
  selection: SessionSelection,
  options?: {
    limit?: number;
  },
): URLSearchParams {
  const params = new URLSearchParams();

  appendParams(params, 'theme', selection.themeIds);
  appendParams(params, 'category', selection.categoryIds);
  appendParams(params, 'grammar', selection.grammarTypeIds);
  appendParams(params, 'deck', selection.sourceDeckIds);

  if (selection.includeWeakOnly) {
    params.set('weak', '1');
  }

  if (selection.includeDueOnly) {
    params.set('due', '1');
  }

  if (selection.includeBookmarkedOnly) {
    params.set('bookmarked', '1');
  }

  if (options?.limit !== undefined) {
    params.set('limit', String(options.limit));
  }

  return params;
}

export function buildStudyHref(input: {
  selection: SessionSelection;
  mode?: SessionMode;
  limit?: number;
}): string {
  const basePath = input.mode === undefined ? '/study' : `/study/${input.mode}`;
  const params = buildSessionSearchParams(input.selection, {
    limit: input.limit,
  });
  const query = params.toString();

  return query.length > 0 ? `${basePath}?${query}` : basePath;
}

export function buildBrowseHrefFromSelection(selection: SessionSelection): string {
  const params = new URLSearchParams();

  appendParams(params, 'theme', selection.themeIds);
  appendParams(params, 'category', selection.categoryIds);
  appendParams(params, 'grammar', selection.grammarTypeIds);

  const query = params.toString();
  return query.length > 0 ? `/browse?${query}` : '/browse';
}

export function createDeckSelection(deckId: string): SessionSelection {
  return {
    themeIds: [],
    categoryIds: [],
    grammarTypeIds: [],
    sourceDeckIds: [deckId],
    includeWeakOnly: false,
    includeDueOnly: false,
    includeBookmarkedOnly: false,
  };
}

function appendParams(
  params: URLSearchParams,
  key: string,
  values: string[],
): void {
  for (const value of values) {
    params.append(key, value);
  }
}

function toArray(value: SearchParamValue): string[] {
  if (typeof value === 'string' && value.length > 0) {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.filter((entry) => entry.length > 0);
  }

  return [];
}

function toBoolean(value: SearchParamValue): boolean {
  const nextValue = firstValue(value);
  return nextValue === '1' || nextValue === 'true';
}

function firstValue(value: SearchParamValue): string | undefined {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    return value[0];
  }

  return undefined;
}
