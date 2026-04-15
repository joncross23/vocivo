import { StudyPage } from '../../features/study/session/StudyPage';
import { parseSessionSelectionSearchParams } from '../../lib/session-selection';
import { getStudyPageSnapshot } from '../../lib/server/get-study-page-snapshot';

interface StudyRouteProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function Page({ searchParams }: StudyRouteProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const pageSnapshot = await getStudyPageSnapshot(
    parseSessionSelectionSearchParams(resolvedSearchParams),
  );

  return (
    <StudyPage
      snapshot={pageSnapshot.snapshot}
      allSetDefinitions={pageSnapshot.allSetDefinitions}
    />
  );
}
