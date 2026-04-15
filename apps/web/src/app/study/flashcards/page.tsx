import { notFound } from 'next/navigation';
import { FlashcardsPage } from '../../../features/study/flashcards/FlashcardsPage';
import {
  parseSessionLimitSearchParam,
  parseSessionSelectionSearchParams,
} from '../../../lib/session-selection';
import { getFlashcardsPageSnapshot } from '../../../lib/server/get-flashcards-page-snapshot';

interface FlashcardsRouteProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function Page({ searchParams }: FlashcardsRouteProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const snapshot = await getFlashcardsPageSnapshot(
    parseSessionSelectionSearchParams(resolvedSearchParams),
    parseSessionLimitSearchParam(resolvedSearchParams.limit),
  );

  if (snapshot === null) {
    notFound();
  }

  return <FlashcardsPage snapshot={snapshot} />;
}
