import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { buildContentCatalogue } from './build-content-catalogue';
import { parseSourceCsv } from '../ingest/parse-source-csv';

describe('buildContentCatalogue', () => {
  it('builds a deterministic catalogue from a focused CSV sample', () => {
    const csv = [
      'source_index,source_label,source_url,source_url_deck_id,source_theme_group,source_topic,source_word_type,card_index_in_deck,card_flashcardId,card_term_text,card_definition_text,card_termAudio,card_definitionAudio',
      '1,[Theme 1] Identity and relationships - Adjectives,https://example.com/deck-1,deck-1,Theme 1,Identity and relationships,Adjectives,1,entry-clean,alegre,cheerful,https://audio.example.com/alegre.mp3,https://audio.example.com/cheerful.mp3',
      '1,[Theme 1] Identity and relationships - Adjectives,https://example.com/deck-1,deck-1,Theme 1,Identity and relationships,Adjectives,2,entry-multi,bonito,"pretty, nice",,',
      '2,[Theme 3] Media and technology - Nouns,https://example.com/deck-2,deck-2,Theme 3,Media and technology,Nouns,1,entry-complex,grande,"big, large (m, f) (post-noun)",,',
      '3,[Theme 2] Celebrity culture - Nouns,https://example.com/deck-3,deck-3,Theme 2,Celebrity culture,Nouns,1,entry-blank,,should be ignored,,',
    ].join('\n');

    const catalogue = buildContentCatalogue(parseSourceCsv(csv));

    expect(catalogue.entries).toHaveLength(3);
    expect(catalogue.themes).toEqual([
      {
        id: 'theme-1',
        title: 'Theme 1: People and lifestyle',
        totalItems: 2,
      },
      {
        id: 'theme-3',
        title: 'Theme 3: Communication and the world around us',
        totalItems: 1,
      },
    ]);
    expect(catalogue.categories.map((category) => category.id)).toEqual([
      'identity-and-relationships',
      'media-and-technology',
    ]);
    expect(catalogue.grammarTypes.map((grammarType) => grammarType.id)).toEqual([
      'adjectives',
      'nouns',
    ]);
    expect(catalogue.sourceDecks.map((sourceDeck) => sourceDeck.id)).toEqual([
      'deck-1',
      'deck-2',
    ]);
    expect(catalogue.entries.map((entry) => ({
      id: entry.id,
      englishPrimary: entry.englishPrimary,
      englishAlternates: entry.englishAlternates,
      answerComplexity: entry.answerComplexity,
      modeEligibility: entry.modeEligibility,
    }))).toEqual([
      {
        id: 'entry-clean',
        englishPrimary: 'cheerful',
        englishAlternates: [],
        answerComplexity: 'clean',
        modeEligibility: {
          reverseSafe: true,
          typingSafe: true,
          matchingSafe: true,
          arcadeSafe: true,
        },
      },
      {
        id: 'entry-multi',
        englishPrimary: 'pretty',
        englishAlternates: ['nice'],
        answerComplexity: 'multi-gloss',
        modeEligibility: {
          reverseSafe: false,
          typingSafe: false,
          matchingSafe: true,
          arcadeSafe: false,
        },
      },
      {
        id: 'entry-complex',
        englishPrimary: 'big',
        englishAlternates: ['large (m, f) (post-noun)'],
        answerComplexity: 'complex-form',
        modeEligibility: {
          reverseSafe: false,
          typingSafe: false,
          matchingSafe: false,
          arcadeSafe: false,
        },
      },
    ]);
  });

  it('matches the expected taxonomy counts from the real source CSV', async () => {
    const csv = await readFile(
      new URL('../../../../data/raw/knowt_flashcards_translations_full.csv', import.meta.url),
      'utf8',
    );

    const catalogue = buildContentCatalogue(parseSourceCsv(csv));

    expect(catalogue.entries).toHaveLength(2038);
    expect(catalogue.themes.map((theme) => ({
      id: theme.id,
      totalItems: theme.totalItems,
    }))).toEqual([
      { id: 'theme-1', totalItems: 749 },
      { id: 'theme-2', totalItems: 588 },
      { id: 'theme-3', totalItems: 701 },
    ]);
    expect(catalogue.categories).toHaveLength(9);
    expect(catalogue.grammarTypes).toHaveLength(3);
    expect(catalogue.sourceDecks).toHaveLength(27);
  });
});
