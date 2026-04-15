import { describe, expect, it } from 'vitest';
import type { ContentRepository } from '@vocivo/contracts';
import { getFlashcardSession } from './get-flashcard-session';

const contentRepository: ContentRepository = {
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
        totalItems: 100,
      },
      {
        id: 'media-and-technology',
        kind: 'category',
        title: 'Media and technology',
        themeId: 'theme-3',
        categoryId: 'media-and-technology',
        grammarTypeId: null,
        sourceDeckId: null,
        totalItems: 82,
      },
      {
        id: 'nouns',
        kind: 'grammar-type',
        title: 'Nouns',
        themeId: null,
        categoryId: null,
        grammarTypeId: 'nouns',
        sourceDeckId: null,
        totalItems: 500,
      },
      {
        id: 'deck-media-nouns',
        kind: 'source-deck',
        title: 'Media and technology / nouns',
        themeId: 'theme-3',
        categoryId: 'media-and-technology',
        grammarTypeId: 'nouns',
        sourceDeckId: 'deck-media-nouns',
        totalItems: 2,
      },
    ];
  },
  async getSetSummaries() {
    return [];
  },
  async getEntries(selection) {
    if (!selection.sourceDeckIds.includes('deck-media-nouns')) {
      return [];
    }

    return [
      {
        id: 'entry-1',
        sourceDeckId: 'deck-media-nouns',
        themeId: 'theme-3',
        categoryId: 'media-and-technology',
        grammarTypeId: 'nouns',
        spanish: 'cámara',
        englishPrimary: 'camera',
        englishAlternates: [],
        rawDefinition: 'camera',
        answerComplexity: 'clean',
        modeEligibility: {
          reverseSafe: true,
          typingSafe: true,
          matchingSafe: true,
          arcadeSafe: true,
        },
      },
      {
        id: 'entry-2',
        sourceDeckId: 'deck-media-nouns',
        themeId: 'theme-3',
        categoryId: 'media-and-technology',
        grammarTypeId: 'nouns',
        spanish: 'pantalla',
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

describe('getFlashcardSession', () => {
  it('builds a deck-backed flashcard session snapshot', async () => {
    const snapshot = await getFlashcardSession({
      contentRepository,
      deckId: 'deck-media-nouns',
    });

    expect(snapshot?.deck.id).toBe('deck-media-nouns');
    expect(snapshot?.theme?.id).toBe('theme-3');
    expect(snapshot?.category?.id).toBe('media-and-technology');
    expect(snapshot?.grammarType?.id).toBe('nouns');
    expect(snapshot?.entries).toHaveLength(2);
  });
});
