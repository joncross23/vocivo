import type { ContentSetSummary } from '@vocivo/contracts';

export interface DashboardSnapshot {
  highlightedSets: ContentSetSummary[];
}

export function getDashboardSnapshot(highlightedSets: ContentSetSummary[]): DashboardSnapshot {
  return { highlightedSets };
}
