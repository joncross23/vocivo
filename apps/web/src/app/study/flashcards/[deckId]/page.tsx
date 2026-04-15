import { notFound } from 'next/navigation';
import { FlashcardsPage } from '../../../../features/study/flashcards/FlashcardsPage';
import { createDeckSelection } from '../../../../lib/session-selection';
import { getFlashcardsPageSnapshot } from '../../../../lib/server/get-flashcards-page-snapshot';

interface FlashcardsRouteProps {
  params: Promise<{
    deckId: string;
  }>;
}

export default async function Page({ params }: FlashcardsRouteProps) {
  const { deckId } = await params;
  const snapshot = await getFlashcardsPageSnapshot(createDeckSelection(deckId));

  if (snapshot === null) {
    notFound();
  }

  return <FlashcardsPage snapshot={snapshot} />;
}
