import { notFound } from 'next/navigation';
import { PracticeTestPage } from '../../../features/study/practice-test/PracticeTestPage';
import {
  parseSessionLimitSearchParam,
  parseSessionSelectionSearchParams,
} from '../../../lib/session-selection';
import { getPracticeTestPageSnapshot } from '../../../lib/server/get-practice-test-page-snapshot';

interface PracticeTestRouteProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function Page({ searchParams }: PracticeTestRouteProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const snapshot = await getPracticeTestPageSnapshot(
    parseSessionSelectionSearchParams(resolvedSearchParams),
    parseSessionLimitSearchParam(resolvedSearchParams.limit),
  );

  if (snapshot === null) {
    notFound();
  }

  return <PracticeTestPage snapshot={snapshot} />;
}
