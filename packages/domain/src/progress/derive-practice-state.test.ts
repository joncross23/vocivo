import { describe, expect, it } from 'vitest';
import { derivePracticeState } from './derive-practice-state';

describe('derivePracticeState', () => {
  const now = new Date('2026-04-14T12:00:00.000Z');

  it('returns untouched when nothing has been seen', () => {
    expect(
      derivePracticeState({
        totalItems: 20,
        itemsSeen: 0,
        lastPractisedAt: null,
        now,
      }),
    ).toBe('untouched');
  });

  it('returns light practice when activity is stale', () => {
    expect(
      derivePracticeState({
        totalItems: 20,
        itemsSeen: 10,
        lastPractisedAt: '2026-03-20T12:00:00.000Z',
        now,
      }),
    ).toBe('light-practice');
  });

  it('returns well practised when enough items have been seen recently', () => {
    expect(
      derivePracticeState({
        totalItems: 10,
        itemsSeen: 7,
        lastPractisedAt: '2026-04-13T12:00:00.000Z',
        now,
      }),
    ).toBe('well-practised');
  });
});
