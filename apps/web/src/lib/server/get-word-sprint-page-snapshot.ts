import type { SessionSelection } from '@vocivo/contracts';
import { getWordSprintSession } from '@vocivo/application';
import { getContentRepository } from './content-repository';

export async function getWordSprintPageSnapshot(
  selection: SessionSelection,
  limit?: number,
) {
  return getWordSprintSession({
    contentRepository: getContentRepository(),
    selection,
    limit,
  });
}
