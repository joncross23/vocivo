import { describe, expect, it } from 'vitest';
import { buildSourceDeckAggregate } from './build-source-deck-aggregate';

describe('buildSourceDeckAggregate', () => {
  it('builds due, weak, and practice coverage for a studied deck', () => {
    const aggregate = buildSourceDeckAggregate({
      deckDefinition: {
        id: 'deck-1',
        kind: 'source-deck',
        title: 'Identity / adjectives',
        themeId: 'theme-1',
        categoryId: 'identity-and-relationships',
        grammarTypeId: 'adjectives',
        sourceDeckId: 'deck-1',
        totalItems: 3,
      },
      entries: [
        {
          id: 'entry-1',
          sourceDeckId: 'deck-1',
          themeId: 'theme-1',
          categoryId: 'identity-and-relationships',
          grammarTypeId: 'adjectives',
          spanish: 'alegre',
          englishPrimary: 'cheerful',
          englishAlternates: [],
          rawDefinition: 'cheerful',
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
          sourceDeckId: 'deck-1',
          themeId: 'theme-1',
          categoryId: 'identity-and-relationships',
          grammarTypeId: 'adjectives',
          spanish: 'ambicioso',
          englishPrimary: 'ambitious',
          englishAlternates: [],
          rawDefinition: 'ambitious',
          answerComplexity: 'clean',
          modeEligibility: {
            reverseSafe: true,
            typingSafe: true,
            matchingSafe: true,
            arcadeSafe: true,
          },
        },
        {
          id: 'entry-3',
          sourceDeckId: 'deck-1',
          themeId: 'theme-1',
          categoryId: 'identity-and-relationships',
          grammarTypeId: 'adjectives',
          spanish: 'paciente',
          englishPrimary: 'patient',
          englishAlternates: [],
          rawDefinition: 'patient',
          answerComplexity: 'clean',
          modeEligibility: {
            reverseSafe: true,
            typingSafe: true,
            matchingSafe: true,
            arcadeSafe: true,
          },
        },
      ],
      entryStates: [
        {
          entryId: 'entry-1',
          status: 'weak',
          bookmarked: false,
          dueAt: '2026-04-15T09:00:00.000Z',
          lastPractisedAt: '2026-04-15T08:00:00.000Z',
          scoredInteractions: 2,
          correctInteractions: 1,
        },
        {
          entryId: 'entry-2',
          status: 'learning',
          bookmarked: true,
          dueAt: '2026-04-18T09:00:00.000Z',
          lastPractisedAt: '2026-04-15T09:00:00.000Z',
          scoredInteractions: 1,
          correctInteractions: 1,
        },
      ],
      now: new Date('2026-04-15T12:00:00.000Z'),
    });

    expect(aggregate).toEqual({
      setId: 'deck-1',
      totalItems: 3,
      itemsSeen: 2,
      dueItems: 1,
      weakItems: 1,
      scoredInteractions: 3,
      correctInteractions: 2,
      practiceState: 'well-practised',
      lastPractisedAt: '2026-04-15T09:00:00.000Z',
    });
  });

  it('does not count bookmark-only unseen entries as practised coverage', () => {
    const aggregate = buildSourceDeckAggregate({
      deckDefinition: {
        id: 'deck-1',
        kind: 'source-deck',
        title: 'Identity / adjectives',
        themeId: 'theme-1',
        categoryId: 'identity-and-relationships',
        grammarTypeId: 'adjectives',
        sourceDeckId: 'deck-1',
        totalItems: 2,
      },
      entries: [
        {
          id: 'entry-1',
          sourceDeckId: 'deck-1',
          themeId: 'theme-1',
          categoryId: 'identity-and-relationships',
          grammarTypeId: 'adjectives',
          spanish: 'alegre',
          englishPrimary: 'cheerful',
          englishAlternates: [],
          rawDefinition: 'cheerful',
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
          sourceDeckId: 'deck-1',
          themeId: 'theme-1',
          categoryId: 'identity-and-relationships',
          grammarTypeId: 'adjectives',
          spanish: 'paciente',
          englishPrimary: 'patient',
          englishAlternates: [],
          rawDefinition: 'patient',
          answerComplexity: 'clean',
          modeEligibility: {
            reverseSafe: true,
            typingSafe: true,
            matchingSafe: true,
            arcadeSafe: true,
          },
        },
      ],
      entryStates: [
        {
          entryId: 'entry-1',
          status: 'unseen',
          bookmarked: true,
          dueAt: null,
          lastPractisedAt: null,
          scoredInteractions: 0,
          correctInteractions: 0,
        },
      ],
      now: new Date('2026-04-15T12:00:00.000Z'),
    });

    expect(aggregate).toEqual({
      setId: 'deck-1',
      totalItems: 2,
      itemsSeen: 0,
      dueItems: 0,
      weakItems: 0,
      scoredInteractions: 0,
      correctInteractions: 0,
      practiceState: 'untouched',
      lastPractisedAt: null,
    });
  });
});
