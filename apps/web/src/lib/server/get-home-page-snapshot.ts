import type { ContentSetSummary, LearnerEntryState } from '@vocivo/contracts';
import { getDashboardSnapshot } from '@vocivo/application';
import {
  createInMemoryContentRepository,
  createInMemoryLearnerRepository,
} from '@vocivo/infrastructure';

const previewSetSummaries: ContentSetSummary[] = [
  {
    id: 'set-identity-adjectives',
    kind: 'source-deck',
    title: 'Identity / adjectives',
    themeId: 'theme-1',
    categoryId: 'identity-and-relationships',
    grammarTypeId: 'adjectives',
    sourceDeckId: '6f55bbaf-a295-4ff1-a5eb-57db35baf543',
    totalItems: 88,
    itemsSeen: 0,
    dueItems: 0,
    weakItems: 0,
    practiceState: 'untouched',
    lastPractisedAt: null,
  },
  {
    id: 'set-media-nouns',
    kind: 'source-deck',
    title: 'Media / nouns',
    themeId: 'theme-3',
    categoryId: 'media-and-technology',
    grammarTypeId: 'nouns',
    sourceDeckId: 'media-nouns',
    totalItems: 28,
    itemsSeen: 6,
    dueItems: 4,
    weakItems: 2,
    practiceState: 'light-practice',
    lastPractisedAt: '2026-03-18T17:00:00.000Z',
  },
  {
    id: 'set-education-verbs',
    kind: 'source-deck',
    title: 'Education / verbs',
    themeId: 'theme-1',
    categoryId: 'education-and-work',
    grammarTypeId: 'verbs',
    sourceDeckId: 'education-verbs',
    totalItems: 62,
    itemsSeen: 18,
    dueItems: 7,
    weakItems: 3,
    practiceState: 'active-practice',
    lastPractisedAt: '2026-04-12T09:00:00.000Z',
  },
  {
    id: 'set-travel-verbs',
    kind: 'source-deck',
    title: 'Travel / verbs',
    themeId: 'theme-3',
    categoryId: 'travel-and-tourism',
    grammarTypeId: 'verbs',
    sourceDeckId: 'travel-verbs',
    totalItems: 42,
    itemsSeen: 33,
    dueItems: 2,
    weakItems: 1,
    practiceState: 'well-practised',
    lastPractisedAt: '2026-04-14T08:00:00.000Z',
  },
];

const previewEntryStates: LearnerEntryState[] = [
  {
    entryId: 'entry-1',
    status: 'weak',
    bookmarked: false,
    dueAt: '2026-04-14T07:00:00.000Z',
    lastPractisedAt: '2026-04-13T20:00:00.000Z',
    scoredInteractions: 4,
    correctInteractions: 2,
  },
  {
    entryId: 'entry-2',
    status: 'learning',
    bookmarked: true,
    dueAt: '2026-04-14T22:00:00.000Z',
    lastPractisedAt: '2026-04-14T08:00:00.000Z',
    scoredInteractions: 2,
    correctInteractions: 1,
  },
  {
    entryId: 'entry-3',
    status: 'weak',
    bookmarked: false,
    dueAt: '2026-04-15T08:00:00.000Z',
    lastPractisedAt: '2026-04-12T11:00:00.000Z',
    scoredInteractions: 6,
    correctInteractions: 4,
  },
  {
    entryId: 'entry-4',
    status: 'mastered',
    bookmarked: false,
    dueAt: null,
    lastPractisedAt: '2026-04-14T09:30:00.000Z',
    scoredInteractions: 8,
    correctInteractions: 8,
  },
];

const previewProfile = {
  totalXp: 14400,
  currentLevel: 12,
  streakDays: 18,
};

export async function getHomePageSnapshot() {
  return getDashboardSnapshot({
    contentRepository: createInMemoryContentRepository({
      setSummaries: previewSetSummaries,
    }),
    learnerRepository: createInMemoryLearnerRepository({
      profile: previewProfile,
      entryStates: previewEntryStates,
    }),
    now: new Date(),
  });
}
