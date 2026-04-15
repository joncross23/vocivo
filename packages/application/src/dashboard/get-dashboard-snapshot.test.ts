import { describe, expect, it } from 'vitest';
import type { ContentRepository, LearnerRepository } from '@vocivo/contracts';
import { getDashboardSnapshot } from './get-dashboard-snapshot';

const contentRepository: ContentRepository = {
  async getSetDefinitions() {
    return [
      {
        id: 'set-well-practised',
        kind: 'source-deck',
        title: 'Travel / verbs',
        themeId: 'theme-3',
        categoryId: 'travel-and-tourism',
        grammarTypeId: 'verbs',
        sourceDeckId: 'deck-travel-verbs',
        totalItems: 42,
      },
      {
        id: 'set-untouched',
        kind: 'source-deck',
        title: 'Identity / adjectives',
        themeId: 'theme-1',
        categoryId: 'identity-and-relationships',
        grammarTypeId: 'adjectives',
        sourceDeckId: 'deck-identity-adjectives',
        totalItems: 88,
      },
      {
        id: 'set-light-practice',
        kind: 'source-deck',
        title: 'Media / nouns',
        themeId: 'theme-3',
        categoryId: 'media-and-technology',
        grammarTypeId: 'nouns',
        sourceDeckId: 'deck-media-nouns',
        totalItems: 28,
      },
      {
        id: 'set-active-practice',
        kind: 'source-deck',
        title: 'Free time / nouns',
        themeId: 'theme-2',
        categoryId: 'free-time-activities',
        grammarTypeId: 'nouns',
        sourceDeckId: 'deck-free-time-nouns',
        totalItems: 51,
      },
    ];
  },
  async getSetSummaries() {
    return [];
  },
  async getEntries() {
    return [];
  },
};

const learnerRepository: LearnerRepository = {
  async getProfile() {
    return {
      totalXp: 14400,
      currentLevel: 12,
      streakDays: 18,
    };
  },
  async saveProfile() {},
  async listEntryStates() {
    return [
      {
        entryId: 'entry-1',
        status: 'weak',
        bookmarked: false,
        dueAt: '2026-04-14T07:00:00.000Z',
        lastPractisedAt: '2026-04-13T07:00:00.000Z',
        scoredInteractions: 4,
        correctInteractions: 2,
      },
      {
        entryId: 'entry-2',
        status: 'learning',
        bookmarked: false,
        dueAt: '2026-04-14T22:00:00.000Z',
        lastPractisedAt: '2026-04-14T08:00:00.000Z',
        scoredInteractions: 2,
        correctInteractions: 1,
      },
      {
        entryId: 'entry-3',
        status: 'mastered',
        bookmarked: true,
        dueAt: '2026-04-15T08:00:00.000Z',
        lastPractisedAt: '2026-04-12T08:00:00.000Z',
        scoredInteractions: 6,
        correctInteractions: 6,
      },
    ];
  },
  async getEntryState() {
    return null;
  },
  async saveEntryState() {},
  async listSetAggregates() {
    return [
      {
        setId: 'set-well-practised',
        totalItems: 42,
        itemsSeen: 33,
        dueItems: 2,
        weakItems: 1,
        scoredInteractions: 44,
        correctInteractions: 38,
        practiceState: 'well-practised',
        lastPractisedAt: '2026-04-14T08:00:00.000Z',
      },
      {
        setId: 'set-untouched',
        totalItems: 88,
        itemsSeen: 0,
        dueItems: 0,
        weakItems: 0,
        scoredInteractions: 0,
        correctInteractions: 0,
        practiceState: 'untouched',
        lastPractisedAt: null,
      },
      {
        setId: 'set-light-practice',
        totalItems: 28,
        itemsSeen: 5,
        dueItems: 4,
        weakItems: 2,
        scoredInteractions: 8,
        correctInteractions: 5,
        practiceState: 'light-practice',
        lastPractisedAt: '2026-03-12T10:00:00.000Z',
      },
      {
        setId: 'set-active-practice',
        totalItems: 51,
        itemsSeen: 19,
        dueItems: 6,
        weakItems: 1,
        scoredInteractions: 28,
        correctInteractions: 21,
        practiceState: 'active-practice',
        lastPractisedAt: '2026-04-11T09:30:00.000Z',
      },
    ];
  },
  async getSetAggregate() {
    return null;
  },
  async saveSetAggregate() {},
};

describe('getDashboardSnapshot', () => {
  it('surfaces neglected sets first and counts due and weak entries', async () => {
    const snapshot = await getDashboardSnapshot({
      contentRepository,
      learnerRepository,
      now: new Date('2026-04-14T12:00:00.000Z'),
    });

    expect(snapshot.neglectedSets.map((setSummary) => setSummary.id)).toEqual([
      'set-untouched',
      'set-light-practice',
      'set-active-practice',
      'set-well-practised',
    ]);
    expect(snapshot.dueTodayCount).toBe(2);
    expect(snapshot.weakEntryCount).toBe(1);
    expect(snapshot.masteredEntryCount).toBe(1);
    expect(snapshot.practisedEntryCount).toBe(3);
    expect(snapshot.practisedDeckCount).toBe(3);
    expect(snapshot.wellPractisedDeckCount).toBe(1);
    expect(snapshot.currentLevel).toBe(12);
    expect(snapshot.streakDays).toBe(18);
    expect(snapshot.totalXp).toBe(14400);
  });
});
