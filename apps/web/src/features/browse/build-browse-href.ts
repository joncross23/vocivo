import type { SessionSelection } from '@vocivo/contracts';
import { buildBrowseHrefFromSelection } from '../../lib/session-selection';

export function buildBrowseHref(
  selection: SessionSelection,
  update: Partial<{
    themeId: string | null;
    categoryId: string | null;
    grammarTypeId: string | null;
  }>,
): string {
  return buildBrowseHrefFromSelection({
    ...selection,
    themeIds: toIds(update.themeId, selection.themeIds),
    categoryIds: toIds(update.categoryId, selection.categoryIds),
    grammarTypeIds: toIds(update.grammarTypeId, selection.grammarTypeIds),
  });
}

function toIds(nextId: string | null | undefined, currentIds: string[]): string[] {
  if (nextId === undefined) {
    return currentIds;
  }

  return nextId === null ? [] : [nextId];
}
