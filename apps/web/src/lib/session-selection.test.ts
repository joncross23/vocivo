import { describe, expect, it } from 'vitest';
import {
  buildBrowseHrefFromSelection,
  buildStudyHref,
  parseSessionLimitSearchParam,
  parseSessionSelectionSearchParams,
} from './session-selection';

describe('session-selection helpers', () => {
  it('parses the shared study selection search params contract', () => {
    expect(parseSessionSelectionSearchParams({
      theme: 'theme-3',
      category: 'media-and-technology',
      grammar: 'nouns',
      deck: 'deck-media-nouns',
      weak: '1',
      due: 'false',
      bookmarked: 'true',
    })).toEqual({
      themeIds: ['theme-3'],
      categoryIds: ['media-and-technology'],
      grammarTypeIds: ['nouns'],
      sourceDeckIds: ['deck-media-nouns'],
      includeWeakOnly: true,
      includeDueOnly: false,
      includeBookmarkedOnly: true,
    });
  });

  it('builds reusable browse and study hrefs from a selection', () => {
    const selection = {
      themeIds: ['theme-3'],
      categoryIds: ['media-and-technology'],
      grammarTypeIds: ['nouns'],
      sourceDeckIds: ['deck-media-nouns'],
      includeWeakOnly: false,
      includeDueOnly: false,
      includeBookmarkedOnly: false,
    };

    expect(buildBrowseHrefFromSelection(selection)).toBe(
      '/browse?theme=theme-3&category=media-and-technology&grammar=nouns',
    );
    expect(buildStudyHref({
      selection,
      mode: 'flashcards',
      limit: 30,
    })).toBe(
      '/study/flashcards?theme=theme-3&category=media-and-technology&grammar=nouns&deck=deck-media-nouns&limit=30',
    );
    expect(parseSessionLimitSearchParam('120')).toBe(100);
  });
});
