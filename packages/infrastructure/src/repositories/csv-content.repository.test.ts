import { describe, expect, it } from 'vitest';
import { createCsvContentRepository } from './csv-content.repository';

describe('createCsvContentRepository', () => {
  const repository = createCsvContentRepository({
    csvFilePath: new URL('../../../../data/raw/knowt_flashcards_translations_full.csv', import.meta.url),
  });

  it('returns content definitions from the real CSV catalogue', async () => {
    const setDefinitions = await repository.getSetDefinitions();

    expect(setDefinitions.filter((setDefinition) => setDefinition.kind === 'theme')).toHaveLength(3);
    expect(setDefinitions.filter((setDefinition) => setDefinition.kind === 'category')).toHaveLength(9);
    expect(setDefinitions.filter((setDefinition) => setDefinition.kind === 'grammar-type')).toHaveLength(3);
    expect(setDefinitions.filter((setDefinition) => setDefinition.kind === 'source-deck')).toHaveLength(27);
  });

  it('filters entries by theme, category, and grammar type', async () => {
    const entries = await repository.getEntries(
      {
        themeIds: ['theme-3'],
        categoryIds: ['media-and-technology'],
        grammarTypeIds: ['nouns'],
        sourceDeckIds: [],
        includeWeakOnly: false,
        includeDueOnly: false,
        includeBookmarkedOnly: false,
      },
      500,
    );

    expect(entries).toHaveLength(82);
    expect(entries[0]?.themeId).toBe('theme-3');
    expect(entries[0]?.categoryId).toBe('media-and-technology');
    expect(entries[0]?.grammarTypeId).toBe('nouns');
  });
});
