import { notFound } from 'next/navigation';
import { WordSprintPage } from '../../../features/study/word-sprint/WordSprintPage';
import {
  parseSessionLimitSearchParam,
  parseSessionSelectionSearchParams,
} from '../../../lib/session-selection';
import { getWordSprintPageSnapshot } from '../../../lib/server/get-word-sprint-page-snapshot';

interface WordSprintRouteProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function Page({ searchParams }: WordSprintRouteProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const snapshot = await getWordSprintPageSnapshot(
    parseSessionSelectionSearchParams(resolvedSearchParams),
    parseSessionLimitSearchParam(resolvedSearchParams.limit, 25),
  );

  if (snapshot === null) {
    notFound();
  }

  return <WordSprintPage snapshot={snapshot} />;
}
