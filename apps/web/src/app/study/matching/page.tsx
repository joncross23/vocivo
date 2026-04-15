import { notFound } from 'next/navigation';
import { MatchingPage } from '../../../features/study/matching/MatchingPage';
import {
  parseSessionLimitSearchParam,
  parseSessionSelectionSearchParams,
} from '../../../lib/session-selection';
import { getMatchingPageSnapshot } from '../../../lib/server/get-matching-page-snapshot';

interface MatchingRouteProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function Page({ searchParams }: MatchingRouteProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const snapshot = await getMatchingPageSnapshot(
    parseSessionSelectionSearchParams(resolvedSearchParams),
    parseSessionLimitSearchParam(resolvedSearchParams.limit, 8),
  );

  if (snapshot === null) {
    notFound();
  }

  return <MatchingPage snapshot={snapshot} />;
}
