import type {
  ContentEntry,
  ContentSetDefinition,
  LearnerEntryState,
  SetAggregate,
} from '@vocivo/contracts';
import { derivePracticeState } from '@vocivo/domain';

export interface BuildSourceDeckAggregateInput {
  deckDefinition: ContentSetDefinition;
  entries: ContentEntry[];
  entryStates: LearnerEntryState[];
  now: Date;
}

export function buildSourceDeckAggregate({
  deckDefinition,
  entries,
  entryStates,
  now,
}: BuildSourceDeckAggregateInput): SetAggregate {
  const entryStateById = new Map(
    entryStates.map((entryState) => [entryState.entryId, entryState]),
  );
  const deckEntryStates = entries
    .map((entry) => entryStateById.get(entry.id))
    .filter((entryState): entryState is LearnerEntryState => entryState !== undefined);
  const itemsSeen = deckEntryStates.length;
  const dueItems = deckEntryStates.filter((entryState) =>
    entryState.dueAt !== null && Date.parse(entryState.dueAt) <= now.getTime()).length;
  const weakItems = deckEntryStates.filter((entryState) => entryState.status === 'weak').length;
  const scoredInteractions = sumBy(deckEntryStates, (entryState) => entryState.scoredInteractions);
  const correctInteractions = sumBy(deckEntryStates, (entryState) => entryState.correctInteractions);
  const lastPractisedAt = getLatestPractisedAt(deckEntryStates);

  return {
    setId: deckDefinition.id,
    totalItems: deckDefinition.totalItems,
    itemsSeen,
    dueItems,
    weakItems,
    scoredInteractions,
    correctInteractions,
    practiceState: derivePracticeState({
      totalItems: deckDefinition.totalItems,
      itemsSeen,
      lastPractisedAt,
      now,
    }),
    lastPractisedAt,
  };
}

function sumBy<T>(items: T[], pickValue: (item: T) => number): number {
  return items.reduce((total, item) => total + pickValue(item), 0);
}

function getLatestPractisedAt(entryStates: LearnerEntryState[]): string | null {
  let latestTimestamp = Number.NEGATIVE_INFINITY;
  let latestPractisedAt: string | null = null;

  for (const entryState of entryStates) {
    if (entryState.lastPractisedAt === null) {
      continue;
    }

    const timestamp = Date.parse(entryState.lastPractisedAt);

    if (timestamp > latestTimestamp) {
      latestTimestamp = timestamp;
      latestPractisedAt = entryState.lastPractisedAt;
    }
  }

  return latestPractisedAt;
}
