import type { ContentEntry } from '@vocivo/contracts';

export interface WrittenAnswerEvaluation {
  isCorrect: boolean;
  matchKind: 'exact' | 'fuzzy' | 'incorrect';
  matchedAnswer: string | null;
  acceptedAnswers: string[];
}

export function evaluateWrittenAnswer(input: {
  entry: ContentEntry;
  submittedAnswer: string;
}): WrittenAnswerEvaluation {
  const acceptedAnswers = toAcceptedAnswers(input.entry);
  const normalisedSubmittedAnswer = normaliseAnswer(input.submittedAnswer);

  if (normalisedSubmittedAnswer.length === 0) {
    return {
      isCorrect: false,
      matchKind: 'incorrect',
      matchedAnswer: null,
      acceptedAnswers,
    };
  }

  for (const acceptedAnswer of acceptedAnswers) {
    const normalisedAcceptedAnswer = normaliseAnswer(acceptedAnswer);

    if (normalisedSubmittedAnswer === normalisedAcceptedAnswer) {
      return {
        isCorrect: true,
        matchKind: 'exact',
        matchedAnswer: acceptedAnswer,
        acceptedAnswers,
      };
    }

    if (isFuzzyMatch(normalisedSubmittedAnswer, normalisedAcceptedAnswer)) {
      return {
        isCorrect: true,
        matchKind: 'fuzzy',
        matchedAnswer: acceptedAnswer,
        acceptedAnswers,
      };
    }
  }

  return {
    isCorrect: false,
    matchKind: 'incorrect',
    matchedAnswer: null,
    acceptedAnswers,
  };
}

function toAcceptedAnswers(entry: ContentEntry): string[] {
  return [entry.englishPrimary, ...entry.englishAlternates];
}

function normaliseAnswer(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function isFuzzyMatch(submittedAnswer: string, acceptedAnswer: string): boolean {
  if (submittedAnswer.length < 5 || acceptedAnswer.length < 5) {
    return false;
  }

  if (hasSingleAdjacentTransposition(submittedAnswer, acceptedAnswer)) {
    return true;
  }

  const lengthDifference = Math.abs(submittedAnswer.length - acceptedAnswer.length);

  if (lengthDifference > 1) {
    return false;
  }

  return levenshteinDistance(submittedAnswer, acceptedAnswer) <= 1;
}

function hasSingleAdjacentTransposition(left: string, right: string): boolean {
  if (left.length !== right.length) {
    return false;
  }

  for (let index = 0; index < left.length - 1; index += 1) {
    if (
      left[index] !== right[index]
      && left[index] === right[index + 1]
      && left[index + 1] === right[index]
      && left.slice(index + 2) === right.slice(index + 2)
      && left.slice(0, index) === right.slice(0, index)
    ) {
      return true;
    }
  }

  return false;
}

function levenshteinDistance(left: string, right: string): number {
  const rows = left.length + 1;
  const columns = right.length + 1;
  const matrix = Array.from({ length: rows }, () => new Array<number>(columns).fill(0));

  for (let row = 0; row < rows; row += 1) {
    matrix[row]![0] = row;
  }

  for (let column = 0; column < columns; column += 1) {
    matrix[0]![column] = column;
  }

  for (let row = 1; row < rows; row += 1) {
    for (let column = 1; column < columns; column += 1) {
      const substitutionCost = left[row - 1] === right[column - 1] ? 0 : 1;
      matrix[row]![column] = Math.min(
        matrix[row - 1]![column]! + 1,
        matrix[row]![column - 1]! + 1,
        matrix[row - 1]![column - 1]! + substitutionCost,
      );
    }
  }

  return matrix[left.length]![right.length]!;
}
