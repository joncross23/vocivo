import type {
  GetPracticeTestSessionDependencies,
  PracticeTestSessionSnapshot,
} from './get-practice-test-session';
import { getPracticeTestSession } from './get-practice-test-session';

export type WordSprintSessionSnapshot = PracticeTestSessionSnapshot;

export async function getWordSprintSession(
  dependencies: GetPracticeTestSessionDependencies,
): Promise<WordSprintSessionSnapshot | null> {
  return getPracticeTestSession({
    ...dependencies,
    limit: dependencies.limit ?? 25,
  });
}
