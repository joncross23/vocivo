import type { SessionSelection } from '@vocivo/contracts';

export function buildBrowseHref(
  selection: SessionSelection,
  update: Partial<{
    themeId: string | null;
    categoryId: string | null;
    grammarTypeId: string | null;
  }>,
): string {
  const nextSelection = {
    themeId: update.themeId !== undefined ? update.themeId : selection.themeIds[0] ?? null,
    categoryId: update.categoryId !== undefined ? update.categoryId : selection.categoryIds[0] ?? null,
    grammarTypeId:
      update.grammarTypeId !== undefined ? update.grammarTypeId : selection.grammarTypeIds[0] ?? null,
  };

  const params = new URLSearchParams();

  if (nextSelection.themeId !== null) {
    params.set('theme', nextSelection.themeId);
  }

  if (nextSelection.categoryId !== null) {
    params.set('category', nextSelection.categoryId);
  }

  if (nextSelection.grammarTypeId !== null) {
    params.set('grammar', nextSelection.grammarTypeId);
  }

  const query = params.toString();
  return query.length > 0 ? `/browse?${query}` : '/browse';
}
