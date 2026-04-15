import type {
  ContentSetDefinition,
  ContentSetSummary,
  SetAggregate,
} from '@vocivo/contracts';
import { derivePracticeState } from '@vocivo/domain';

export interface BuildContentSetSummariesInput {
  setDefinitions: ContentSetDefinition[];
  setAggregates: SetAggregate[];
  now: Date;
}

export function buildContentSetSummaries({
  setDefinitions,
  setAggregates,
  now,
}: BuildContentSetSummariesInput): ContentSetSummary[] {
  const sourceDeckDefinitions = setDefinitions.filter(
    (setDefinition) => setDefinition.kind === 'source-deck',
  );
  const setAggregateById = new Map(
    setAggregates.map((setAggregate) => [setAggregate.setId, setAggregate]),
  );
  const sourceDeckSummaries = sourceDeckDefinitions.map((setDefinition) =>
    toSourceDeckSummary(setDefinition, setAggregateById.get(setDefinition.id)));

  return setDefinitions.map((setDefinition) => {
    if (setDefinition.kind === 'source-deck') {
      return toSourceDeckSummary(setDefinition, setAggregateById.get(setDefinition.id));
    }

    return toRolledUpSummary(setDefinition, sourceDeckSummaries, now);
  });
}

function toSourceDeckSummary(
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

function toRolledUpSummary(
  setDefinition: ContentSetDefinition,
  sourceDeckSummaries: ContentSetSummary[],
  now: Date,
): ContentSetSummary {
  const matchingDeckSummaries = sourceDeckSummaries.filter((sourceDeckSummary) =>
    matchesDefinition(sourceDeckSummary, setDefinition));
  const itemsSeen = sumBy(matchingDeckSummaries, (summary) => summary.itemsSeen);
  const dueItems = sumBy(matchingDeckSummaries, (summary) => summary.dueItems);
  const weakItems = sumBy(matchingDeckSummaries, (summary) => summary.weakItems);
  const lastPractisedAt = getLatestPractisedAt(matchingDeckSummaries);

  return {
    ...setDefinition,
    itemsSeen,
    dueItems,
    weakItems,
    practiceState: derivePracticeState({
      totalItems: setDefinition.totalItems,
      itemsSeen,
      lastPractisedAt,
      now,
    }),
    lastPractisedAt,
  };
}

function matchesDefinition(
  sourceDeckSummary: ContentSetSummary,
  setDefinition: ContentSetDefinition,
): boolean {
  return matchesId(setDefinition.themeId, sourceDeckSummary.themeId)
    && matchesId(setDefinition.categoryId, sourceDeckSummary.categoryId)
    && matchesId(setDefinition.grammarTypeId, sourceDeckSummary.grammarTypeId)
    && matchesId(setDefinition.sourceDeckId, sourceDeckSummary.sourceDeckId);
}

function matchesId(selectedId: string | null, currentId: string | null): boolean {
  return selectedId === null || selectedId === currentId;
}

function sumBy<T>(items: T[], pickValue: (item: T) => number): number {
  return items.reduce((total, item) => total + pickValue(item), 0);
}

function getLatestPractisedAt(setSummaries: ContentSetSummary[]): string | null {
  let latestTimestamp = Number.NEGATIVE_INFINITY;
  let latestPractisedAt: string | null = null;

  for (const setSummary of setSummaries) {
    if (setSummary.lastPractisedAt === null) {
      continue;
    }

    const timestamp = Date.parse(setSummary.lastPractisedAt);

    if (timestamp > latestTimestamp) {
      latestTimestamp = timestamp;
      latestPractisedAt = setSummary.lastPractisedAt;
    }
  }

  return latestPractisedAt;
}
