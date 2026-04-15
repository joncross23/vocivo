import type {
  ContentEntry,
  ContentRepository,
  ContentSetDefinition,
  SessionSelection,
} from '@vocivo/contracts';
import { resolveSelectionContext } from './resolve-selection-context';

export interface StudyLaunchSnapshot {
  selection: SessionSelection;
  resultCount: number;
  previewEntries: ContentEntry[];
  flashcardEligibleCount: number;
  practiceTestEligibleCount: number;
  matchingEligibleCount: number;
  theme: ContentSetDefinition | null;
  category: ContentSetDefinition | null;
  grammarType: ContentSetDefinition | null;
  sourceDecks: ContentSetDefinition[];
  sourceDeckDefinitions: ContentSetDefinition[];
}

export interface GetStudyLaunchSnapshotDependencies {
  contentRepository: ContentRepository;
  selection: SessionSelection;
  previewLimit?: number;
}

export async function getStudyLaunchSnapshot({
  contentRepository,
  selection,
  previewLimit = 8,
}: GetStudyLaunchSnapshotDependencies): Promise<StudyLaunchSnapshot> {
  const [setDefinitions, matchingEntries] = await Promise.all([
    contentRepository.getSetDefinitions(),
    contentRepository.getEntries(selection, Number.MAX_SAFE_INTEGER),
  ]);
  const selectionContext = resolveSelectionContext(setDefinitions, selection);

  return {
    selection,
    resultCount: matchingEntries.length,
    previewEntries: matchingEntries.slice(0, previewLimit),
    flashcardEligibleCount: matchingEntries.length,
    practiceTestEligibleCount: matchingEntries.filter(
      (entry) => entry.modeEligibility.typingSafe,
    ).length,
    matchingEligibleCount: matchingEntries.filter(
      (entry) => entry.modeEligibility.matchingSafe,
    ).length,
    theme: selectionContext.theme,
    category: selectionContext.category,
    grammarType: selectionContext.grammarType,
    sourceDecks: selectionContext.matchingSourceDecks,
    sourceDeckDefinitions: selectionContext.sourceDeckDefinitions,
  };
}
