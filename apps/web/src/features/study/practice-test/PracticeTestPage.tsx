'use client';

import Link from 'next/link';
import type {
  PracticeTestSessionSnapshot,
  WrittenAnswerEvaluation,
} from '@vocivo/application';
import {
  applyFlashcardReview,
  buildSourceDeckAggregate,
  buildUpdatedLearnerProfile,
  evaluateWrittenAnswer,
} from '@vocivo/application';
import type {
  ContentSetDefinition,
  LearnerEntryState,
  LearnerProfile,
  LearnerRepository,
  SetAggregate,
} from '@vocivo/contracts';
import { useEffect, useState } from 'react';
import { ensurePreviewLearnerSeed } from '../../../lib/client/browser-learner';
import { buildStudyHref } from '../../../lib/session-selection';
import { AppShell } from '../../shell/AppShell';

interface PracticeTestPageProps {
  snapshot: PracticeTestSessionSnapshot;
}

export function PracticeTestPage({ snapshot }: PracticeTestPageProps) {
  const [learnerRepository, setLearnerRepository] = useState<LearnerRepository | null>(null);
  const [learnerProfile, setLearnerProfile] = useState<LearnerProfile>({
    totalXp: 0,
    currentLevel: 0,
    streakDays: 0,
  });
  const [entryStateMap, setEntryStateMap] = useState<Map<string, LearnerEntryState>>(new Map());
  const [scopeAggregate, setScopeAggregate] = useState<SetAggregate>(() =>
    buildSelectionAggregate(snapshot, [], new Date()));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [currentResult, setCurrentResult] = useState<WrittenAnswerEvaluation | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [sessionXp, setSessionXp] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const currentEntry = snapshot.entries[currentIndex] ?? null;
  const answeredCount = currentIndex + (currentResult === null ? 0 : 1);
  const selectionTitle = getSelectionTitle(snapshot);
  const selectionMeta = getSelectionMeta(snapshot);
  const launcherHref = buildStudyHref({
    selection: snapshot.selection,
  });
  const accuracy = answeredCount === 0
    ? 0
    : Math.round((correctCount / answeredCount) * 100);

  useEffect(() => {
    let isCancelled = false;

    async function loadLearnerState() {
      const repository = await ensurePreviewLearnerSeed(snapshot.sourceDeckDefinitions);
      const [profile, entryStates] = await Promise.all([
        repository.getProfile(),
        repository.listEntryStates(),
      ]);
      const nextEntryStateMap = new Map(
        entryStates.map((entryState) => [entryState.entryId, entryState]),
      );
      const nextScopeAggregate = buildSelectionAggregate(
        snapshot,
        entryStates,
        new Date(),
      );

      if (isCancelled) {
        return;
      }

      setLearnerRepository(repository);
      setLearnerProfile(profile);
      setEntryStateMap(nextEntryStateMap);
      setScopeAggregate(nextScopeAggregate);
    }

    void loadLearnerState();

    return () => {
      isCancelled = true;
    };
  }, [snapshot]);

  useEffect(() => {
    function handleKeydown(event: KeyboardEvent) {
      if (currentEntry === null || isComplete) {
        return;
      }

      if (event.key === 'Enter') {
        event.preventDefault();

        if (currentResult === null) {
          void submitAnswer();
          return;
        }

        advanceToNext();
      }
    }

    window.addEventListener('keydown', handleKeydown);
    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  }, [currentEntry, currentResult, isComplete, answer, learnerRepository, learnerProfile, entryStateMap]);

  if (isComplete) {
    return (
      <AppShell>
        <section className="mx-auto grid max-w-4xl gap-6">
          <div className="rounded-3xl border border-white/10 bg-graphite/80 p-6 shadow-radar backdrop-blur">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-glow">
              Practice complete
            </p>
            <p className="mt-3 font-display text-4xl uppercase tracking-tight text-chalk sm:text-5xl">
              {selectionTitle}
            </p>
            <p className="mt-3 max-w-2xl text-sm text-fog sm:text-base">
              Typed answers have been written into learner state and per-deck coverage across
              {` ${snapshot.sourceDecks.length} `}matching decks.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-4">
              <SummaryStat label="Correct" value={`${correctCount}/${snapshot.entries.length}`} />
              <SummaryStat label="Accuracy" value={`${accuracy}%`} />
              <SummaryStat label="Session XP" value={String(sessionXp)} />
              <SummaryStat label="Level" value={String(learnerProfile.currentLevel)} />
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setCurrentIndex(0);
                  setAnswer('');
                  setCurrentResult(null);
                  setIsComplete(false);
                  setSessionXp(0);
                  setCorrectCount(0);
                }}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-chalk transition-transform hover:-translate-y-0.5 hover:bg-white/10"
              >
                Try again
              </button>
              <Link
                href={launcherHref}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-chalk transition-transform hover:-translate-y-0.5 hover:bg-white/10"
              >
                Back to study
              </Link>
              <Link
                href="/browse"
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-chalk transition-transform hover:-translate-y-0.5 hover:bg-white/10"
              >
                Browse more
              </Link>
            </div>
          </div>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <section className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="rounded-3xl border border-white/10 bg-graphite/80 p-6 shadow-radar backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-glow">
                Practice test
              </p>
              <p className="mt-3 font-display text-4xl uppercase tracking-tight text-chalk sm:text-5xl">
                {selectionTitle}
              </p>
              <p className="mt-3 max-w-2xl text-sm text-fog">
                {selectionMeta}
              </p>
            </div>

            <div className="rounded-2xl border border-glow/20 bg-black/20 px-4 py-3 text-right">
              <p className="text-xs uppercase tracking-[0.22em] text-fog">Queue</p>
              <p className="mt-1 font-display text-3xl tracking-tight text-chalk">
                {currentIndex + 1}/{snapshot.entries.length}
              </p>
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-fog">
                {snapshot.eligibleCount} typing-safe terms
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-[2rem] border border-white/10 bg-black/30 p-8 shadow-radar">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-fog">
              Spanish prompt
            </p>
            <p className="mt-6 font-display text-5xl tracking-tight text-glow sm:text-6xl">
              {currentEntry?.spanish ?? ''}
            </p>
            <p className="mt-4 text-xs uppercase tracking-[0.18em] text-fog">
              Type the primary or alternate English translation
            </p>
          </div>

          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-fog">
                Your answer
              </span>
              <input
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                disabled={currentResult !== null}
                autoComplete="off"
                spellCheck={false}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-lg text-chalk outline-none transition-colors placeholder:text-fog/60 focus:border-glow/40"
                placeholder="Type the English translation"
              />
            </label>

            {currentResult === null ? null : (
              <div className={`rounded-2xl border p-4 ${
                currentResult.isCorrect
                  ? 'border-glow/30 bg-glow/10'
                  : 'border-white/10 bg-white/5'
              }`}>
                <p className="text-xs uppercase tracking-[0.18em] text-fog">
                  {formatResultHeading(currentResult)}
                </p>
                <p className="mt-2 text-sm text-chalk">
                  Accepted answers: {currentResult.acceptedAnswers.join(', ')}
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {currentResult === null ? (
              <button
                type="button"
                onClick={() => {
                  void submitAnswer();
                }}
                disabled={learnerRepository === null}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-transform ${
                  learnerRepository === null
                    ? 'border-white/5 bg-white/[0.02] text-fog opacity-50'
                    : 'border-white/10 bg-white/5 text-chalk hover:-translate-y-0.5 hover:bg-white/10'
                }`}
              >
                Check answer
              </button>
            ) : (
              <button
                type="button"
                onClick={advanceToNext}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-chalk transition-transform hover:-translate-y-0.5 hover:bg-white/10"
              >
                {currentIndex >= snapshot.entries.length - 1 ? 'Finish session' : 'Next question'}
              </button>
            )}
            <Link
              href={launcherHref}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-chalk transition-transform hover:-translate-y-0.5 hover:bg-white/10"
            >
              Back to study
            </Link>
          </div>
        </div>

        <div className="space-y-6">
          <aside className="rounded-3xl border border-glow/20 bg-black/20 p-6">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-glow">
              Live stats
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <SummaryStat label="Correct" value={`${correctCount}/${answeredCount}`} />
              <SummaryStat label="Accuracy" value={`${accuracy}%`} />
              <SummaryStat label="Practised" value={`${scopeAggregate.itemsSeen}/${scopeAggregate.totalItems}`} />
              <SummaryStat label="XP" value={String(learnerProfile.totalXp)} />
            </div>
            <p className="mt-4 text-xs uppercase tracking-[0.18em] text-fog">
              {scopeAggregate.practiceState.replace(/-/g, ' ')} across {snapshot.sourceDecks.length} decks
            </p>
          </aside>

          <aside className="rounded-3xl border border-white/10 bg-black/20 p-6">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-glow">
              Rules
            </p>
            <ul className="mt-4 space-y-2 text-sm text-fog">
              <li>`Enter` checks the answer and moves on</li>
              <li>Close spelling matches are accepted for longer answers</li>
              <li>Typing-safe terms only are included in this mode</li>
            </ul>
          </aside>
        </div>
      </section>
    </AppShell>
  );

  async function submitAnswer() {
    if (learnerRepository === null || currentEntry === null || currentResult !== null) {
      return;
    }

    const evaluation = evaluateWrittenAnswer({
      entry: currentEntry,
      submittedAnswer: answer,
    });
    const now = new Date();
    const reviewRating = toReviewRating(evaluation);
    const reviewResult = applyFlashcardReview({
      entryId: currentEntry.id,
      existingEntryState: entryStateMap.get(currentEntry.id) ?? null,
      rating: reviewRating,
      now,
    });
    const nextEntryStateMap = new Map(entryStateMap);
    nextEntryStateMap.set(currentEntry.id, reviewResult.entryState);
    const nextEntryStates = [...nextEntryStateMap.values()];
    const nextLearnerProfile = buildUpdatedLearnerProfile({
      totalXp: learnerProfile.totalXp,
      xpGained: reviewResult.xpGained,
      streakDays: learnerProfile.streakDays,
    });
    const nextScopeAggregate = buildSelectionAggregate(snapshot, nextEntryStates, now);
    const nextDeckAggregates = buildDeckAggregates(snapshot, nextEntryStates, now);

    setEntryStateMap(nextEntryStateMap);
    setLearnerProfile(nextLearnerProfile);
    setScopeAggregate(nextScopeAggregate);
    setCurrentResult(evaluation);
    setSessionXp((current) => current + reviewResult.xpGained);

    if (evaluation.isCorrect) {
      setCorrectCount((current) => current + 1);
    }

    await Promise.all([
      learnerRepository.saveEntryState(reviewResult.entryState),
      learnerRepository.saveProfile(nextLearnerProfile),
      ...nextDeckAggregates.map((setAggregate) => learnerRepository.saveSetAggregate(setAggregate)),
    ]);
  }

  function advanceToNext() {
    if (currentResult === null) {
      return;
    }

    if (currentIndex >= snapshot.entries.length - 1) {
      setIsComplete(true);
      return;
    }

    setCurrentIndex((current) => current + 1);
    setAnswer('');
    setCurrentResult(null);
  }
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-fog">{label}</p>
      <p className="mt-2 text-lg font-medium text-chalk">{value}</p>
    </div>
  );
}

function buildSelectionAggregate(
  snapshot: PracticeTestSessionSnapshot,
  entryStates: LearnerEntryState[],
  now: Date,
): SetAggregate {
  return buildSourceDeckAggregate({
    deckDefinition: createSelectionDefinition(snapshot),
    entries: snapshot.selectedEntries,
    entryStates,
    now,
  });
}

function buildDeckAggregates(
  snapshot: PracticeTestSessionSnapshot,
  entryStates: LearnerEntryState[],
  now: Date,
): SetAggregate[] {
  return snapshot.sourceDecks.map((sourceDeck) =>
    buildSourceDeckAggregate({
      deckDefinition: sourceDeck,
      entries: snapshot.sourceDeckEntries.filter(
        (entry) => entry.sourceDeckId === sourceDeck.id,
      ),
      entryStates,
      now,
    }));
}

function createSelectionDefinition(
  snapshot: PracticeTestSessionSnapshot,
): ContentSetDefinition {
  return {
    id: 'study-selection',
    kind: 'source-deck',
    title: getSelectionTitle(snapshot),
    themeId: snapshot.theme?.id ?? null,
    categoryId: snapshot.category?.id ?? null,
    grammarTypeId: snapshot.grammarType?.id ?? null,
    sourceDeckId: null,
    totalItems: snapshot.resultCount,
  };
}

function getSelectionTitle(snapshot: PracticeTestSessionSnapshot): string {
  if (snapshot.selection.sourceDeckIds.length === 1 && snapshot.sourceDecks.length === 1) {
    return snapshot.sourceDecks[0]?.title ?? 'Practice test';
  }

  if (snapshot.category !== null && snapshot.grammarType !== null) {
    return `${snapshot.category.title} / ${snapshot.grammarType.title}`;
  }

  if (snapshot.category !== null) {
    return snapshot.category.title;
  }

  if (snapshot.theme !== null) {
    return snapshot.theme.title;
  }

  if (snapshot.grammarType !== null) {
    return snapshot.grammarType.title;
  }

  return 'Practice test';
}

function getSelectionMeta(snapshot: PracticeTestSessionSnapshot): string {
  const parts = [
    snapshot.theme?.title,
    snapshot.category?.title,
    snapshot.grammarType?.title,
  ].filter((value): value is string => value !== undefined);

  if (parts.length === 0) {
    return `${snapshot.eligibleCount} typing-safe cards ready from ${snapshot.resultCount} matching terms.`;
  }

  return `${parts.join(' / ')} with ${snapshot.eligibleCount} typing-safe cards from ${snapshot.resultCount} matching terms.`;
}

function formatResultHeading(result: WrittenAnswerEvaluation): string {
  if (!result.isCorrect) {
    return 'Incorrect';
  }

  if (result.matchKind === 'fuzzy') {
    return 'Accepted as a close match';
  }

  return 'Correct';
}

function toReviewRating(result: WrittenAnswerEvaluation): 'again' | 'hard' | 'good' {
  if (!result.isCorrect) {
    return 'again';
  }

  return result.matchKind === 'fuzzy' ? 'hard' : 'good';
}
