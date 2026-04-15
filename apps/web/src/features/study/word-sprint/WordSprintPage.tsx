'use client';

import Link from 'next/link';
import type {
  WordSprintSessionSnapshot,
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

interface WordSprintPageProps {
  snapshot: WordSprintSessionSnapshot;
}

export function WordSprintPage({ snapshot }: WordSprintPageProps) {
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
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [sessionXp, setSessionXp] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [submittedWordCount, setSubmittedWordCount] = useState(0);
  const [promptStartedAt, setPromptStartedAt] = useState(() => Date.now());
  const [shareState, setShareState] = useState<'idle' | 'copied'>('idle');

  const currentEntry = snapshot.entries[currentIndex] ?? null;
  const selectionTitle = getSelectionTitle(snapshot);
  const selectionMeta = getSelectionMeta(snapshot);
  const launcherHref = buildStudyHref({
    selection: snapshot.selection,
  });
  const answeredCount = currentIndex + (currentResult === null ? 0 : 1);
  const accuracy = answeredCount === 0
    ? 0
    : Math.round((correctCount / answeredCount) * 100);
  const wpm = elapsedSeconds === 0
    ? 0
    : Math.round((submittedWordCount / (elapsedSeconds / 60)) * 10) / 10;

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
    if (isComplete) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isComplete]);

  if (isComplete) {
    return (
      <AppShell>
        <section className="mx-auto grid max-w-4xl gap-6">
          <div className="overflow-hidden rounded-[2rem] border border-glow/20 bg-[radial-gradient(circle_at_top,#3b4252_0%,#1b1f27_45%,#0f1115_100%)] p-6 shadow-radar">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-glow">
              Sprint complete
            </p>
            <p className="mt-3 font-display text-4xl uppercase tracking-tight text-chalk sm:text-5xl">
              {selectionTitle}
            </p>
            <p className="mt-3 max-w-2xl text-sm text-fog sm:text-base">
              Fast exact answers built streak, speed bonus XP, and fresh coverage across
              {` ${snapshot.sourceDecks.length} `}matching decks.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-4">
              <SummaryStat label="Best streak" value={String(bestStreak)} />
              <SummaryStat label="Accuracy" value={`${accuracy}%`} />
              <SummaryStat label="WPM" value={String(wpm)} />
              <SummaryStat label="Session XP" value={String(sessionXp)} />
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setCurrentIndex(0);
                  setAnswer('');
                  setCurrentResult(null);
                  setIsComplete(false);
                  setElapsedSeconds(0);
                  setSessionXp(0);
                  setCurrentStreak(0);
                  setBestStreak(0);
                  setCorrectCount(0);
                  setSubmittedWordCount(0);
                  setPromptStartedAt(Date.now());
                  setShareState('idle');
                }}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-chalk transition-transform hover:-translate-y-0.5 hover:bg-white/10"
              >
                Sprint again
              </button>
              <button
                type="button"
                onClick={() => {
                  void copyResultSummary();
                }}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-chalk transition-transform hover:-translate-y-0.5 hover:bg-white/10"
              >
                {shareState === 'copied' ? 'Copied result' : 'Copy result'}
              </button>
              <Link
                href={launcherHref}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-chalk transition-transform hover:-translate-y-0.5 hover:bg-white/10"
              >
                Back to study
              </Link>
            </div>
          </div>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <section className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.12fr,0.88fr]">
        <div className={`overflow-hidden rounded-[2rem] border p-6 shadow-radar transition-colors ${getSprintShellClass(currentStreak)}`}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-glow">
                Word Sprint
              </p>
              <p className="mt-3 font-display text-4xl uppercase tracking-tight text-chalk sm:text-5xl">
                {selectionTitle}
              </p>
              <p className="mt-3 max-w-2xl text-sm text-fog">
                {selectionMeta}
              </p>
            </div>

            <div className="rounded-2xl border border-glow/20 bg-black/20 px-4 py-3 text-right">
              <p className="text-xs uppercase tracking-[0.22em] text-fog">Streak</p>
              <p className="mt-1 font-display text-3xl tracking-tight text-chalk">
                {currentStreak}
              </p>
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-fog">
                Best {bestStreak}
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-[1.75rem] border border-white/10 bg-black/25 p-8">
            <div className="flex items-center justify-between gap-4">
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-fog">
                Spanish prompt
              </p>
              <p className="text-xs uppercase tracking-[0.18em] text-fog">
                {currentIndex + 1}/{snapshot.entries.length}
              </p>
            </div>
            <p className="mt-6 font-display text-6xl tracking-tight text-chalk sm:text-7xl">
              {currentEntry?.spanish ?? ''}
            </p>
          </div>

          <form
            className="mt-6 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              void submitAnswer();
            }}
          >
            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-fog">
                English translation
              </span>
              <input
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                disabled={learnerRepository === null || currentResult !== null}
                autoComplete="off"
                spellCheck={false}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-2xl text-chalk outline-none transition-colors placeholder:text-fog/60 focus:border-glow/40"
                placeholder="Type fast and hit Enter"
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

            <div className="flex flex-wrap gap-3">
              {currentResult === null ? (
                <button
                  type="submit"
                  disabled={learnerRepository === null}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-transform ${
                    learnerRepository === null
                      ? 'border-white/5 bg-white/[0.02] text-fog opacity-50'
                      : 'border-white/10 bg-white/5 text-chalk hover:-translate-y-0.5 hover:bg-white/10'
                  }`}
                >
                  Check sprint answer
                </button>
              ) : (
                <button
                  type="button"
                  onClick={advanceToNext}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-chalk transition-transform hover:-translate-y-0.5 hover:bg-white/10"
                >
                  {currentIndex >= snapshot.entries.length - 1 ? 'Finish sprint' : 'Next word'}
                </button>
              )}
              <Link
                href={launcherHref}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-chalk transition-transform hover:-translate-y-0.5 hover:bg-white/10"
              >
                Back to study
              </Link>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <aside className="rounded-3xl border border-glow/20 bg-black/20 p-6">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-glow">
              Live sprint
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <SummaryStat label="Accuracy" value={`${accuracy}%`} />
              <SummaryStat label="WPM" value={String(wpm)} />
              <SummaryStat label="Time" value={formatSeconds(elapsedSeconds)} />
              <SummaryStat label="XP" value={String(learnerProfile.totalXp)} />
            </div>
            <p className="mt-4 text-xs uppercase tracking-[0.18em] text-fog">
              {scopeAggregate.practiceState.replace(/-/g, ' ')} across {snapshot.sourceDecks.length} decks
            </p>
          </aside>

          <aside className="rounded-3xl border border-white/10 bg-black/20 p-6">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-glow">
              Scoring
            </p>
            <ul className="mt-4 space-y-2 text-sm text-fog">
              <li>Exact answers keep the streak alive</li>
              <li>Fast exact answers earn extra sprint XP</li>
              <li>Fuzzy matches count, but they cool the streak</li>
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
    const responseDurationMs = Date.now() - promptStartedAt;
    const speedBonusXp = evaluation.isCorrect && evaluation.matchKind === 'exact'
      ? Math.max(0, 6 - Math.floor(responseDurationMs / 900))
      : 0;
    const nextStreak = evaluation.isCorrect && evaluation.matchKind === 'exact'
      ? currentStreak + 1
      : evaluation.isCorrect
        ? Math.max(1, currentStreak)
        : 0;
    const now = new Date();
    const reviewResult = applyFlashcardReview({
      entryId: currentEntry.id,
      existingEntryState: entryStateMap.get(currentEntry.id) ?? null,
      rating: toReviewRating(evaluation, responseDurationMs),
      now,
    });
    const totalXpGained = reviewResult.xpGained + speedBonusXp;
    const nextEntryStateMap = new Map(entryStateMap);
    nextEntryStateMap.set(currentEntry.id, reviewResult.entryState);
    const nextEntryStates = [...nextEntryStateMap.values()];
    const nextLearnerProfile = buildUpdatedLearnerProfile({
      totalXp: learnerProfile.totalXp,
      xpGained: totalXpGained,
      streakDays: learnerProfile.streakDays,
    });
    const nextScopeAggregate = buildSelectionAggregate(snapshot, nextEntryStates, now);
    const nextDeckAggregates = buildDeckAggregates(snapshot, nextEntryStates, now);

    setEntryStateMap(nextEntryStateMap);
    setLearnerProfile(nextLearnerProfile);
    setScopeAggregate(nextScopeAggregate);
    setCurrentResult(evaluation);
    setCurrentStreak(nextStreak);
    setBestStreak((current) => Math.max(current, nextStreak));
    setSessionXp((current) => current + totalXpGained);
    setSubmittedWordCount((current) => current + countWords(answer));
    setShareState('idle');

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
    setPromptStartedAt(Date.now());
  }

  async function copyResultSummary() {
    if (typeof navigator === 'undefined' || !('clipboard' in navigator)) {
      return;
    }

    await navigator.clipboard.writeText(
      `Vocivo Word Sprint\n${selectionTitle}\nBest streak: ${bestStreak}\nAccuracy: ${accuracy}%\nWPM: ${wpm}\nSession XP: ${sessionXp}`,
    );
    setShareState('copied');
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
  snapshot: WordSprintSessionSnapshot,
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
  snapshot: WordSprintSessionSnapshot,
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
  snapshot: WordSprintSessionSnapshot,
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

function getSelectionTitle(snapshot: WordSprintSessionSnapshot): string {
  if (snapshot.selection.sourceDeckIds.length === 1 && snapshot.sourceDecks.length === 1) {
    return snapshot.sourceDecks[0]?.title ?? 'Word Sprint';
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

  return 'Word Sprint';
}

function getSelectionMeta(snapshot: WordSprintSessionSnapshot): string {
  const parts = [
    snapshot.theme?.title,
    snapshot.category?.title,
    snapshot.grammarType?.title,
  ].filter((value): value is string => value !== undefined);

  if (parts.length === 0) {
    return `${snapshot.eligibleCount} sprint-ready prompts loaded from ${snapshot.resultCount} matching terms.`;
  }

  return `${parts.join(' / ')} with ${snapshot.eligibleCount} sprint-ready prompts from ${snapshot.resultCount} matching terms.`;
}

function formatResultHeading(result: WrittenAnswerEvaluation): string {
  if (!result.isCorrect) {
    return 'Sprint broken';
  }

  if (result.matchKind === 'fuzzy') {
    return 'Accepted, but not clean';
  }

  return 'Clean hit';
}

function toReviewRating(
  result: WrittenAnswerEvaluation,
  responseDurationMs: number,
): 'again' | 'hard' | 'good' | 'easy' {
  if (!result.isCorrect) {
    return 'again';
  }

  if (result.matchKind === 'fuzzy') {
    return 'hard';
  }

  return responseDurationMs <= 1800 ? 'easy' : 'good';
}

function formatSeconds(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function countWords(value: string): number {
  const trimmedValue = value.trim();
  return trimmedValue.length === 0 ? 0 : trimmedValue.split(/\s+/).length;
}

function getSprintShellClass(streak: number): string {
  if (streak >= 10) {
    return 'border-glow/45 bg-[radial-gradient(circle_at_top,#88c0d0_0%,#2e3440_35%,#0f1115_100%)]';
  }

  if (streak >= 5) {
    return 'border-glow/30 bg-[radial-gradient(circle_at_top,#5e81ac_0%,#2e3440_38%,#0f1115_100%)]';
  }

  return 'border-white/10 bg-[radial-gradient(circle_at_top,#3b4252_0%,#1b1f27_45%,#0f1115_100%)]';
}
