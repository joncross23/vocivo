import { describe, expect, it } from 'vitest';
import { calculateLevel } from './calculate-level';

describe('calculateLevel', () => {
  it('uses the shared square-root XP curve', () => {
    expect(calculateLevel(0)).toBe(0);
    expect(calculateLevel(100)).toBe(1);
    expect(calculateLevel(900)).toBe(3);
    expect(calculateLevel(14400)).toBe(12);
  });
});
