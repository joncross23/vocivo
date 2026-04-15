import type {
  ContentSetDefinition,
  LearnerEntryState,
  LearnerProfile,
  SetAggregate,
} from '@vocivo/contracts';

export const previewLearnerEntryStates: LearnerEntryState[] = [
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

export const previewLearnerProfile: LearnerProfile = {
  totalXp: 14400,
  currentLevel: 12,
  streakDays: 18,
};

export function buildPreviewSetAggregates(
  setDefinitions: ContentSetDefinition[],
): SetAggregate[] {
  const sourceDeckDefinitions = setDefinitions.filter(
    (setDefinition) => setDefinition.kind === 'source-deck',
  );

  return sourceDeckDefinitions.map((setDefinition, index) =>
    buildPreviewSetAggregate(setDefinition, index));
}

function buildPreviewSetAggregate(
  setDefinition: ContentSetDefinition,
  index: number,
): SetAggregate {
  if (index === 0) {
    return {
      setId: setDefinition.id,
      totalItems: setDefinition.totalItems,
      itemsSeen: 0,
      dueItems: 0,
      weakItems: 0,
      scoredInteractions: 0,
      correctInteractions: 0,
      practiceState: 'untouched',
      lastPractisedAt: null,
    };
  }

  if (index === 1) {
    return {
      setId: setDefinition.id,
      totalItems: setDefinition.totalItems,
      itemsSeen: Math.min(6, setDefinition.totalItems),
      dueItems: Math.min(4, setDefinition.totalItems),
      weakItems: Math.min(2, setDefinition.totalItems),
      scoredInteractions: 8,
      correctInteractions: 5,
      practiceState: 'light-practice',
      lastPractisedAt: '2026-03-18T17:00:00.000Z',
    };
  }

  if (index === 2) {
    return {
      setId: setDefinition.id,
      totalItems: setDefinition.totalItems,
      itemsSeen: Math.min(
        Math.max(18, Math.floor(setDefinition.totalItems * 0.35)),
        setDefinition.totalItems,
      ),
      dueItems: Math.min(7, setDefinition.totalItems),
      weakItems: Math.min(3, setDefinition.totalItems),
      scoredInteractions: 28,
      correctInteractions: 21,
      practiceState: 'active-practice',
      lastPractisedAt: '2026-04-12T09:00:00.000Z',
    };
  }

  return {
    setId: setDefinition.id,
    totalItems: setDefinition.totalItems,
    itemsSeen: Math.max(1, Math.floor(setDefinition.totalItems * 0.78)),
    dueItems: 1,
    weakItems: 0,
    scoredInteractions: Math.max(12, setDefinition.totalItems),
    correctInteractions: Math.max(10, Math.floor(setDefinition.totalItems * 0.85)),
    practiceState: 'well-practised',
    lastPractisedAt: '2026-04-14T08:00:00.000Z',
  };
}
