import type { PracticeState } from '@vocivo/contracts';

interface DerivePracticeStateInput {
  totalItems: number;
  itemsSeen: number;
  lastPractisedAt: string | null;
  now: Date;
}

const STALE_DAYS = 14;

export function derivePracticeState({
  totalItems,
  itemsSeen,
  lastPractisedAt,
  now,
}: DerivePracticeStateInput): PracticeState {
  if (itemsSeen === 0) {
    return 'untouched';
  }

  const seenRatio = totalItems === 0 ? 0 : itemsSeen / totalItems;
  const isStale = lastPractisedAt === null
    ? true
    : daysBetween(new Date(lastPractisedAt), now) >= STALE_DAYS;

  if (seenRatio < 0.2 || isStale) {
    return 'light-practice';
  }

  if (seenRatio >= 0.6) {
    return 'well-practised';
  }

  return 'active-practice';
}

function daysBetween(date: Date, now: Date): number {
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}
