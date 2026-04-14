import { describe, expect, it } from 'vitest';
import type { ContentRepository } from '@vocivo/contracts';
import { getBrowseSnapshot } from './get-browse-snapshot';

describe('getBrowseSnapshot', () => {
  it('returns filtered browse options and result counts', async () => {
    const repository: ContentRepository = {
      async getSetDefinitions() {
        return [
        {
          id: 'theme-1',
          kind: 'theme',
          title: 'Theme 1',
          themeId: 'theme-1',
          categoryId: null,
          grammarTypeId: null,
          sourceDeckId: null,
          totalItems: 749,
        },
        {
          id: 'theme-3',
          kind: 'theme',
          title: 'Theme 3',
          themeId: 'theme-3',
          categoryId: null,
          grammarTypeId: null,
          sourceDeckId: null,
          totalItems: 701,
        },
        {
          id: 'media-and-technology',
          kind: 'category',
          title: 'Media and technology',
          themeId: 'theme-3',
          categoryId: 'media-and-technology',
          grammarTypeId: null,
          sourceDeckId: null,
          totalItems: 128,
        },
        {
          id: 'nouns',
          kind: 'grammar-type',
          title: 'Nouns',
          themeId: null,
          categoryId: null,
          grammarTypeId: 'nouns',
          sourceDeckId: null,
          totalItems: 1332,
        },
        {
          id: 'deck-1',
          kind: 'source-deck',
          title: 'Media and technology / nouns',
          themeId: 'theme-3',
          categoryId: 'media-and-technology',
          grammarTypeId: 'nouns',
          sourceDeckId: 'deck-1',
          totalItems: 82,
        },
      ];
      },
      async getSetSummaries() {
        return [];
      },
      async getEntries() {
        return [
        {
          id: 'entry-1',
          sourceDeckId: 'deck-1',
          themeId: 'theme-3',
          categoryId: 'media-and-technology',
          grammarTypeId: 'nouns',
          spanish: 'la pantalla',
          englishPrimary: 'screen',
          englishAlternates: [],
          rawDefinition: 'screen',
          answerComplexity: 'clean',
          modeEligibility: {
            reverseSafe: true,
            typingSafe: true,
            matchingSafe: true,
            arcadeSafe: true,
          },
        },
      ];
      },
    };

    const snapshot = await getBrowseSnapshot({
      contentRepository: repository,
      selection: {
        themeIds: ['theme-3'],
        categoryIds: ['media-and-technology'],
        grammarTypeIds: ['nouns'],
        sourceDeckIds: [],
        includeWeakOnly: false,
        includeDueOnly: false,
        includeBookmarkedOnly: false,
      },
    });

    expect(snapshot.themes).toHaveLength(2);
    expect(snapshot.categories.map((category) => category.id)).toEqual(['media-and-technology']);
    expect(snapshot.grammarTypes.map((grammarType) => grammarType.id)).toEqual(['nouns']);
    expect(snapshot.sourceDecks.map((sourceDeck) => sourceDeck.id)).toEqual(['deck-1']);
    expect(snapshot.resultCount).toBe(1);
  });
});
