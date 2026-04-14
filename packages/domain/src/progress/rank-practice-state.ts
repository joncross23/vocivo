import type { PracticeState } from '@vocivo/contracts';

const practiceStateRankMap: Record<PracticeState, number> = {
  untouched: 0,
  'light-practice': 1,
  'active-practice': 2,
  'well-practised': 3,
};

export function rankPracticeState(practiceState: PracticeState): number {
  return practiceStateRankMap[practiceState];
}
