import { describe, expect, it } from 'vitest';
import type { ContentRepository } from '@vocivo/contracts';
import { getDeckDetailSnapshot } from './get-deck-detail-snapshot';

describe('getDeckDetailSnapshot', () => {
  it('returns deck metadata and preview entries', async () => {
    const repository: ContentRepository = {
      async getSetDefinitions() {
        return [
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

    const snapshot = await getDeckDetailSnapshot({
      contentRepository: repository,
      deckId: 'deck-1',
    });

    expect(snapshot?.deck.title).toBe('Media and technology / nouns');
    expect(snapshot?.theme?.id).toBe('theme-3');
    expect(snapshot?.category?.id).toBe('media-and-technology');
    expect(snapshot?.grammarType?.id).toBe('nouns');
    expect(snapshot?.previewEntries).toHaveLength(1);
  });
});
