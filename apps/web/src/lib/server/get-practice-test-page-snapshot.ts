import type { SessionSelection } from '@vocivo/contracts';
import { getPracticeTestSession } from '@vocivo/application';
import { getContentRepository } from './content-repository';

export async function getPracticeTestPageSnapshot(
  selection: SessionSelection,
  limit?: number,
) {
  return getPracticeTestSession({
    contentRepository: getContentRepository(),
    selection,
    limit,
  });
}
