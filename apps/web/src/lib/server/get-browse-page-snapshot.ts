import { getBrowseSnapshot } from '@vocivo/application';
import type { SessionSelection } from '@vocivo/contracts';
import { getContentRepository } from './content-repository';

export async function getBrowsePageSnapshot(selection: SessionSelection) {
  return getBrowseSnapshot({
    contentRepository: getContentRepository(),
    selection,
  });
}
