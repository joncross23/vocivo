import type { ContentSetSummary } from '@vocivo/contracts';

export function createContentSetSummary(
  overrides: Partial<ContentSetSummary> = {},
): ContentSetSummary {
  return {
    id: 'theme-3.media-and-technology.nouns',
    kind: 'source-deck',
    title: 'Media and technology / nouns',
    themeId: 'theme-3',
    categoryId: 'media-and-technology',
    grammarTypeId: 'nouns',
    sourceDeckId: 'deck-1',
    totalItems: 82,
    itemsSeen: 12,
    dueItems: 5,
    weakItems: 3,
    practiceState: 'light-practice',
    lastPractisedAt: '2026-04-03T12:00:00.000Z',
    ...overrides,
  };
}
