import { describe, expect, it } from 'vitest';
import { rankPracticeState } from './rank-practice-state';

describe('rankPracticeState', () => {
  it('prioritises untouched and light-practice sets ahead of healthier sets', () => {
    expect(rankPracticeState('untouched')).toBeLessThan(rankPracticeState('light-practice'));
    expect(rankPracticeState('light-practice')).toBeLessThan(rankPracticeState('active-practice'));
    expect(rankPracticeState('active-practice')).toBeLessThan(rankPracticeState('well-practised'));
  });
});
