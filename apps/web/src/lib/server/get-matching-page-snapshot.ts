import type { SessionSelection } from '@vocivo/contracts';
import { getMatchingSession } from '@vocivo/application';
import { getContentRepository } from './content-repository';

export async function getMatchingPageSnapshot(
  selection: SessionSelection,
  limit?: number,
) {
  return getMatchingSession({
    contentRepository: getContentRepository(),
    selection,
    limit,
  });
}
