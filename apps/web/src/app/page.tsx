import { HomePage } from '../features/shell/HomePage';
import { getHomePageSnapshot } from '../lib/server/get-home-page-snapshot';

export default async function Page() {
  const snapshot = await getHomePageSnapshot();

  return (
    <HomePage
      initialSnapshot={snapshot.initialSnapshot}
      sourceDeckDefinitions={snapshot.sourceDeckDefinitions}
    />
  );
}
