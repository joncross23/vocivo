'use client';

import { buildContentSetSummaries } from '@vocivo/application';
import type { ContentSetDefinition, ContentSetSummary } from '@vocivo/contracts';
import { startTransition, useEffect, useState } from 'react';
import { createBrowserLearnerRepository, ensurePreviewLearnerSeed } from './browser-learner';

interface UsePersistedSetSummaryMapInput {
  allSetDefinitions: ContentSetDefinition[];
  seedSourceDeckDefinitions?: ContentSetDefinition[];
}

export function usePersistedSetSummaryMap({
  allSetDefinitions,
  seedSourceDeckDefinitions = [],
}: UsePersistedSetSummaryMapInput): Map<string, ContentSetSummary> {
  const [summaryMap, setSummaryMap] = useState(() =>
    toSummaryMap(
      buildContentSetSummaries({
        setDefinitions: allSetDefinitions,
        setAggregates: [],
        now: new Date(),
      }),
    ),
  );

  useEffect(() => {
    let isCancelled = false;

    async function loadSummaryMap() {
      const repository = seedSourceDeckDefinitions.length > 0
        ? await ensurePreviewLearnerSeed(seedSourceDeckDefinitions)
        : createBrowserLearnerRepository();
      const setAggregates = await repository.listSetAggregates();
      const nextSummaryMap = toSummaryMap(
        buildContentSetSummaries({
          setDefinitions: allSetDefinitions,
          setAggregates,
          now: new Date(),
        }),
      );

      if (isCancelled) {
        return;
      }

      startTransition(() => {
        setSummaryMap(nextSummaryMap);
      });
    }

    void loadSummaryMap();

    return () => {
      isCancelled = true;
    };
  }, [allSetDefinitions, seedSourceDeckDefinitions]);

  return summaryMap;
}

function toSummaryMap(
  setSummaries: ContentSetSummary[],
): Map<string, ContentSetSummary> {
  return new Map(setSummaries.map((setSummary) => [setSummary.id, setSummary]));
}
