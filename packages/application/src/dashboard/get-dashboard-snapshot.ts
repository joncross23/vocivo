import type {
  ContentRepository,
  ContentSetDefinition,
  ContentSetSummary,
  LearnerRepository,
  LearnerEntryState,
  SetAggregate,
} from '@vocivo/contracts';
import { rankPracticeState } from '@vocivo/domain';

export interface DashboardSnapshot {
  neglectedSets: ContentSetSummary[];
  dueTodayCount: number;
  weakEntryCount: number;
  currentLevel: number;
  streakDays: number;
  totalXp: number;
}

export interface GetDashboardSnapshotDependencies {
  contentRepository: ContentRepository;
  learnerRepository: LearnerRepository;
  now: Date;
}

const NEGLECTED_SET_LIMIT = 4;

export async function getDashboardSnapshot({
  contentRepository,
  learnerRepository,
  now,
}: GetDashboardSnapshotDependencies): Promise<DashboardSnapshot> {
  const [setDefinitions, setAggregates, entryStates, profile] = await Promise.all([
    contentRepository.getSetDefinitions(),
    learnerRepository.listSetAggregates(),
    learnerRepository.listEntryStates(),
    learnerRepository.getProfile(),
  ]);

  const sourceDeckSetSummaries = buildSourceDeckSetSummaries(setDefinitions, setAggregates);

  return {
    neglectedSets: sourceDeckSetSummaries
      .sort(compareNeglectedSets)
      .slice(0, NEGLECTED_SET_LIMIT),
    dueTodayCount: countDueToday(entryStates, now),
    weakEntryCount: entryStates.filter((entryState) => entryState.status === 'weak').length,
    currentLevel: profile.currentLevel,
    streakDays: profile.streakDays,
    totalXp: profile.totalXp,
  };
}

function buildSourceDeckSetSummaries(
  setDefinitions: ContentSetDefinition[],
  setAggregates: SetAggregate[],
): ContentSetSummary[] {
  const setAggregateById = new Map(
    setAggregates.map((setAggregate) => [setAggregate.setId, setAggregate]),
  );

  return setDefinitions
    .filter((setDefinition) => setDefinition.kind === 'source-deck')
    .map((setDefinition) => toContentSetSummary(setDefinition, setAggregateById.get(setDefinition.id)));
}

function toContentSetSummary(
  setDefinition: ContentSetDefinition,
  setAggregate?: SetAggregate,
): ContentSetSummary {
  return {
    ...setDefinition,
    itemsSeen: setAggregate?.itemsSeen ?? 0,
    dueItems: setAggregate?.dueItems ?? 0,
    weakItems: setAggregate?.weakItems ?? 0,
    practiceState: setAggregate?.practiceState ?? 'untouched',
    lastPractisedAt: setAggregate?.lastPractisedAt ?? null,
  };
}

function compareNeglectedSets(left: ContentSetSummary, right: ContentSetSummary): number {
  const practiceStateDelta = rankPracticeState(left.practiceState) - rankPracticeState(right.practiceState);

  if (practiceStateDelta !== 0) {
    return practiceStateDelta;
  }

  const leftLastPractisedTime = left.lastPractisedAt === null ? Number.NEGATIVE_INFINITY : Date.parse(left.lastPractisedAt);
  const rightLastPractisedTime = right.lastPractisedAt === null ? Number.NEGATIVE_INFINITY : Date.parse(right.lastPractisedAt);

  if (leftLastPractisedTime !== rightLastPractisedTime) {
    return leftLastPractisedTime - rightLastPractisedTime;
  }

  return left.itemsSeen - right.itemsSeen;
}

function countDueToday(entryStates: LearnerEntryState[], now: Date): number {
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  return entryStates.filter((entryState) => {
    if (entryState.dueAt === null) {
      return false;
    }

    return Date.parse(entryState.dueAt) <= endOfToday.getTime();
  }).length;
}
