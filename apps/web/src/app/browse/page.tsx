import { BrowsePage } from '../../features/browse/BrowsePage';
import { getBrowsePageSnapshot } from '../../lib/server/get-browse-page-snapshot';

interface BrowsePageRouteProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function Page({ searchParams }: BrowsePageRouteProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const pageSnapshot = await getBrowsePageSnapshot({
    themeIds: toArray(resolvedSearchParams.theme),
    categoryIds: toArray(resolvedSearchParams.category),
    grammarTypeIds: toArray(resolvedSearchParams.grammar),
    sourceDeckIds: [],
    includeWeakOnly: false,
    includeDueOnly: false,
    includeBookmarkedOnly: false,
  });

  return (
    <BrowsePage
      snapshot={pageSnapshot.snapshot}
      allSetDefinitions={pageSnapshot.allSetDefinitions}
    />
  );
}

function toArray(value: string | string[] | undefined): string[] {
  if (typeof value === 'string' && value.length > 0) {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.filter((entry) => entry.length > 0);
  }

  return [];
}
