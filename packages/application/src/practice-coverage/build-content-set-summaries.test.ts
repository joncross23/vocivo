import { describe, expect, it } from 'vitest';
import { buildContentSetSummaries } from './build-content-set-summaries';

describe('buildContentSetSummaries', () => {
  it('merges direct source deck aggregates and rolls them up to parent sets', () => {
    const summaries = buildContentSetSummaries({
      setDefinitions: [
        {
          id: 'theme-1',
          kind: 'theme',
          title: 'Theme 1',
          themeId: 'theme-1',
          categoryId: null,
          grammarTypeId: null,
          sourceDeckId: null,
          totalItems: 100,
        },
        {
          id: 'identity-and-relationships',
          kind: 'category',
          title: 'Identity and relationships',
          themeId: 'theme-1',
          categoryId: 'identity-and-relationships',
          grammarTypeId: null,
          sourceDeckId: null,
          totalItems: 70,
        },
        {
          id: 'adjectives',
          kind: 'grammar-type',
          title: 'Adjectives',
          themeId: null,
          categoryId: null,
          grammarTypeId: 'adjectives',
          sourceDeckId: null,
          totalItems: 88,
        },
        {
          id: 'deck-identity-adjectives',
          kind: 'source-deck',
          title: 'Identity / adjectives',
          themeId: 'theme-1',
          categoryId: 'identity-and-relationships',
          grammarTypeId: 'adjectives',
          sourceDeckId: 'deck-identity-adjectives',
          totalItems: 40,
        },
        {
          id: 'deck-identity-nouns',
          kind: 'source-deck',
          title: 'Identity / nouns',
          themeId: 'theme-1',
          categoryId: 'identity-and-relationships',
          grammarTypeId: 'nouns',
          sourceDeckId: 'deck-identity-nouns',
          totalItems: 30,
        },
        {
          id: 'deck-school-verbs',
          kind: 'source-deck',
          title: 'School / verbs',
          themeId: 'theme-1',
          categoryId: 'education-and-work',
          grammarTypeId: 'verbs',
          sourceDeckId: 'deck-school-verbs',
          totalItems: 30,
        },
      ],
      setAggregates: [
        {
          setId: 'deck-identity-adjectives',
          totalItems: 40,
          itemsSeen: 12,
          dueItems: 4,
          weakItems: 2,
          scoredInteractions: 18,
          correctInteractions: 13,
          practiceState: 'light-practice',
          lastPractisedAt: '2026-04-10T08:00:00.000Z',
        },
        {
          setId: 'deck-school-verbs',
          totalItems: 30,
          itemsSeen: 24,
          dueItems: 2,
          weakItems: 1,
          scoredInteractions: 28,
          correctInteractions: 24,
          practiceState: 'well-practised',
          lastPractisedAt: '2026-04-14T08:00:00.000Z',
        },
      ],
      now: new Date('2026-04-15T12:00:00.000Z'),
    });

    expect(summaries.find((summary) => summary.id === 'deck-identity-adjectives')).toMatchObject({
      itemsSeen: 12,
      dueItems: 4,
      weakItems: 2,
      practiceState: 'light-practice',
    });

    expect(summaries.find((summary) => summary.id === 'identity-and-relationships')).toMatchObject({
      itemsSeen: 12,
      dueItems: 4,
      weakItems: 2,
      practiceState: 'light-practice',
      lastPractisedAt: '2026-04-10T08:00:00.000Z',
    });

    expect(summaries.find((summary) => summary.id === 'theme-1')).toMatchObject({
      itemsSeen: 36,
      dueItems: 6,
      weakItems: 3,
      practiceState: 'active-practice',
      lastPractisedAt: '2026-04-14T08:00:00.000Z',
    });

    expect(summaries.find((summary) => summary.id === 'adjectives')).toMatchObject({
      itemsSeen: 12,
      dueItems: 4,
      weakItems: 2,
      practiceState: 'light-practice',
    });
  });

  it('defaults sets without learner data to untouched coverage', () => {
    const summaries = buildContentSetSummaries({
      setDefinitions: [
        {
          id: 'theme-2',
          kind: 'theme',
          title: 'Theme 2',
          themeId: 'theme-2',
          categoryId: null,
          grammarTypeId: null,
          sourceDeckId: null,
          totalItems: 20,
        },
        {
          id: 'deck-theme-2-nouns',
          kind: 'source-deck',
          title: 'Theme 2 / nouns',
          themeId: 'theme-2',
          categoryId: 'celebrity-culture',
          grammarTypeId: 'nouns',
          sourceDeckId: 'deck-theme-2-nouns',
          totalItems: 20,
        },
      ],
      setAggregates: [],
      now: new Date('2026-04-15T12:00:00.000Z'),
    });

    expect(summaries).toEqual([
      {
        id: 'theme-2',
        kind: 'theme',
        title: 'Theme 2',
        themeId: 'theme-2',
        categoryId: null,
        grammarTypeId: null,
        sourceDeckId: null,
        totalItems: 20,
        itemsSeen: 0,
        dueItems: 0,
        weakItems: 0,
        practiceState: 'untouched',
        lastPractisedAt: null,
      },
      {
        id: 'deck-theme-2-nouns',
        kind: 'source-deck',
        title: 'Theme 2 / nouns',
        themeId: 'theme-2',
        categoryId: 'celebrity-culture',
        grammarTypeId: 'nouns',
        sourceDeckId: 'deck-theme-2-nouns',
        totalItems: 20,
        itemsSeen: 0,
        dueItems: 0,
        weakItems: 0,
        practiceState: 'untouched',
        lastPractisedAt: null,
      },
    ]);
  });
});
