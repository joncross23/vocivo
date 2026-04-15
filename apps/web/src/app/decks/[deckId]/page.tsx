import { notFound } from 'next/navigation';
import { DeckDetailPage } from '../../../features/decks/DeckDetailPage';
import { getDeckPageSnapshot } from '../../../lib/server/get-deck-page-snapshot';

interface DeckPageRouteProps {
  params: Promise<{
    deckId: string;
  }>;
}

export default async function Page({ params }: DeckPageRouteProps) {
  const { deckId } = await params;
  const pageSnapshot = await getDeckPageSnapshot(deckId);

  if (pageSnapshot === null) {
    notFound();
  }

  return (
    <DeckDetailPage
      snapshot={pageSnapshot.snapshot}
      allSetDefinitions={pageSnapshot.allSetDefinitions}
    />
  );
}
