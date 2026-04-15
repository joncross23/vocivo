import { describe, expect, it } from 'vitest';
import { evaluateWrittenAnswer } from './evaluate-written-answer';

const entry = {
  id: 'entry-1',
  sourceDeckId: 'deck-media-nouns',
  themeId: 'theme-3',
  categoryId: 'media-and-technology',
  grammarTypeId: 'nouns',
  spanish: 'cámara',
  englishPrimary: 'camera',
  englishAlternates: ['video camera'],
  rawDefinition: 'camera',
  answerComplexity: 'clean' as const,
  modeEligibility: {
    reverseSafe: true,
    typingSafe: true,
    matchingSafe: true,
    arcadeSafe: true,
  },
};

describe('evaluateWrittenAnswer', () => {
  it('accepts exact matches after normalisation', () => {
    expect(evaluateWrittenAnswer({
      entry,
      submittedAnswer: ' Camera ',
    })).toMatchObject({
      isCorrect: true,
      matchKind: 'exact',
      matchedAnswer: 'camera',
    });
  });

  it('accepts close fuzzy matches for longer answers', () => {
    expect(evaluateWrittenAnswer({
      entry,
      submittedAnswer: 'camrea',
    })).toMatchObject({
      isCorrect: true,
      matchKind: 'fuzzy',
      matchedAnswer: 'camera',
    });
  });

  it('rejects unrelated answers', () => {
    expect(evaluateWrittenAnswer({
      entry,
      submittedAnswer: 'screen',
    })).toMatchObject({
      isCorrect: false,
      matchKind: 'incorrect',
      matchedAnswer: null,
    });
  });
});
