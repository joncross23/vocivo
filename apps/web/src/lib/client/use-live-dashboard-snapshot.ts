'use client';

import type { DashboardSnapshot } from '@vocivo/application';
import { getDashboardSnapshot } from '@vocivo/application';
import type { ContentSetDefinition } from '@vocivo/contracts';
import { createInMemoryContentRepository } from '@vocivo/infrastructure/in-memory-content';
import { startTransition, useEffect, useState } from 'react';
import { ensurePreviewLearnerSeed } from './browser-learner';

interface UseLiveDashboardSnapshotInput {
  initialSnapshot: DashboardSnapshot;
  sourceDeckDefinitions: ContentSetDefinition[];
}

export function useLiveDashboardSnapshot({
  initialSnapshot,
  sourceDeckDefinitions,
}: UseLiveDashboardSnapshotInput): DashboardSnapshot {
  const [snapshot, setSnapshot] = useState(initialSnapshot);

  useEffect(() => {
    let isCancelled = false;

    async function loadSnapshot() {
      const learnerRepository = await ensurePreviewLearnerSeed(sourceDeckDefinitions);
      const nextSnapshot = await getDashboardSnapshot({
        contentRepository: createInMemoryContentRepository({
          setDefinitions: sourceDeckDefinitions,
        }),
        learnerRepository,
        now: new Date(),
      });

      if (isCancelled) {
        return;
      }

      startTransition(() => {
        setSnapshot(nextSnapshot);
      });
    }

    void loadSnapshot();

    return () => {
      isCancelled = true;
    };
  }, [initialSnapshot, sourceDeckDefinitions]);

  return snapshot;
}
