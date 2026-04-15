'use client';

import Link from 'next/link';
import type { MatchingSessionSnapshot } from '@vocivo/application';
import {
  applyFlashcardReview,
  buildSourceDeckAggregate,
  buildUpdatedLearnerProfile,
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

interface MatchingPageProps {
  snapshot: MatchingSessionSnapshot;
}

interface MatchingTile {
  id: string;
  entryId: string;
  label: string;
  language: 'spanish' | 'english';
}

export function MatchingPage({ snapshot }: MatchingPageProps) {
  const [learnerRepository, setLearnerRepository] = useState<LearnerRepository | null>(null);
  const [learnerProfile, setLearnerProfile] = useState<LearnerProfile>({
    totalXp: 0,
    currentLevel: 0,
    streakDays: 0,
  });
  const [entryStateMap, setEntryStateMap] = useState<Map<string, LearnerEntryState>>(new Map());
  const [scopeAggregate, setScopeAggregate] = useState<SetAggregate>(() =>
    buildSelectionAggregate(snapshot, [], new Date()));
  const [tiles, setTiles] = useState<MatchingTile[]>(() => buildMatchingTiles(snapshot.entries));
  const [selectedTileIds, setSelectedTileIds] = useState<string[]>([]);
  const [mismatchedTileIds, setMismatchedTileIds] = useState<string[]>([]);
  const [matchedEntryIds, setMatchedEntryIds] = useState<string[]>([]);
  const [sessionXp, setSessionXp] = useState(0);
  const [moveCount, setMoveCount] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isResolvingPair, setIsResolvingPair] = useState(false);

  const selectionTitle = getSelectionTitle(snapshot);
  const selectionMeta = getSelectionMeta(snapshot);
  const launcherHref = buildStudyHref({
    selection: snapshot.selection,
  });
  const matchedCount = matchedEntryIds.length;

  useEffect(() => {
    setTiles(buildMatchingTiles(snapshot.entries));
  }, [snapshot.entries]);

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
          <div className="rounded-3xl border border-white/10 bg-graphite/80 p-6 shadow-radar backdrop-blur">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-glow">
              Matching complete
            </p>
            <p className="mt-3 font-display text-4xl uppercase tracking-tight text-chalk sm:text-5xl">
              {selectionTitle}
            </p>
            <p className="mt-3 max-w-2xl text-sm text-fog sm:text-base">
              Matched pairs have been written into learner progress and deck coverage across
              {` ${snapshot.sourceDecks.length} `}matching decks.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-4">
              <SummaryStat label="Pairs" value={`${matchedCount}/${snapshot.entries.length}`} />
              <SummaryStat label="Moves" value={String(moveCount)} />
              <SummaryStat label="Time" value={formatSeconds(elapsedSeconds)} />
              <SummaryStat label="Session XP" value={String(sessionXp)} />
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setTiles(buildMatchingTiles(snapshot.entries));
                  setSelectedTileIds([]);
                  setMismatchedTileIds([]);
                  setMatchedEntryIds([]);
                  setSessionXp(0);
                  setMoveCount(0);
                  setElapsedSeconds(0);
                  setIsComplete(false);
                  setIsResolvingPair(false);
                }}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-chalk transition-transform hover:-translate-y-0.5 hover:bg-white/10"
              >
                Play again
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
      <section className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.15fr,0.85fr]">
        <div className="rounded-3xl border border-white/10 bg-graphite/80 p-6 shadow-radar backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-glow">
                Matching
              </p>
              <p className="mt-3 font-display text-4xl uppercase tracking-tight text-chalk sm:text-5xl">
                {selectionTitle}
              </p>
              <p className="mt-3 max-w-2xl text-sm text-fog">
                {selectionMeta}
              </p>
            </div>

            <div className="rounded-2xl border border-glow/20 bg-black/20 px-4 py-3 text-right">
              <p className="text-xs uppercase tracking-[0.22em] text-fog">Pairs</p>
              <p className="mt-1 font-display text-3xl tracking-tight text-chalk">
                {matchedCount}/{snapshot.entries.length}
              </p>
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-fog">
                {snapshot.eligibleCount} match-safe terms
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {tiles.map((tile) => {
              const isMatched = matchedEntryIds.includes(tile.entryId);
              const isSelected = selectedTileIds.includes(tile.id);
              const isMismatched = mismatchedTileIds.includes(tile.id);

              return (
                <button
                  key={tile.id}
                  type="button"
                  disabled={isMatched || isResolvingPair}
                  onClick={() => {
                    void handleTileSelect(tile);
                  }}
                  className={`min-h-32 rounded-3xl border p-4 text-left transition-all ${
                    isMatched
                      ? 'border-glow/30 bg-glow/10 opacity-60'
                      : isMismatched
                        ? 'border-white/20 bg-white/10'
                        : isSelected
                          ? 'border-glow/40 bg-glow/10'
                          : 'border-white/10 bg-white/5 hover:-translate-y-0.5 hover:border-glow/25 hover:bg-white/10'
                  }`}
                >
                  <p className="text-xs uppercase tracking-[0.18em] text-fog">
                    {tile.language}
                  </p>
                  <p className="mt-4 text-lg font-medium text-chalk">
                    {tile.label}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <aside className="rounded-3xl border border-glow/20 bg-black/20 p-6">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-glow">
              Live stats
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <SummaryStat label="Moves" value={String(moveCount)} />
              <SummaryStat label="Time" value={formatSeconds(elapsedSeconds)} />
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
              <li>Pick one Spanish tile and one English tile to make a pair</li>
              <li>Correct pairs feed shared progress and XP</li>
              <li>Mismatches clear after a short pause so the board stays readable</li>
            </ul>
          </aside>
        </div>
      </section>
    </AppShell>
  );

  async function handleTileSelect(tile: MatchingTile) {
    if (learnerRepository === null || isResolvingPair) {
      return;
    }

    if (matchedEntryIds.includes(tile.entryId) || selectedTileIds.includes(tile.id)) {
      return;
    }

    const nextSelectedTileIds = [...selectedTileIds, tile.id];

    if (nextSelectedTileIds.length === 1) {
      setSelectedTileIds(nextSelectedTileIds);
      return;
    }

    const [firstTileId] = nextSelectedTileIds;
    const firstTile = tiles.find((candidateTile) => candidateTile.id === firstTileId) ?? null;

    if (firstTile === null) {
      setSelectedTileIds([tile.id]);
      return;
    }

    setIsResolvingPair(true);
    setSelectedTileIds(nextSelectedTileIds);
    setMoveCount((current) => current + 1);

    const isMatch = firstTile.entryId === tile.entryId && firstTile.language !== tile.language;

    if (isMatch) {
      const updatedMatchIds = [...matchedEntryIds, tile.entryId];
      setMatchedEntryIds(updatedMatchIds);
      setSelectedTileIds([]);
      await persistSuccessfulMatch(tile.entryId);
      setIsResolvingPair(false);

      if (updatedMatchIds.length >= snapshot.entries.length) {
        setIsComplete(true);
      }

      return;
    }

    setMismatchedTileIds(nextSelectedTileIds);
    window.setTimeout(() => {
      setSelectedTileIds([]);
      setMismatchedTileIds([]);
      setIsResolvingPair(false);
    }, 650);
  }

  async function persistSuccessfulMatch(entryId: string) {
    if (learnerRepository === null) {
      return;
    }

    const now = new Date();
    const reviewResult = applyFlashcardReview({
      entryId,
      existingEntryState: entryStateMap.get(entryId) ?? null,
      rating: 'good',
      now,
    });
    const nextEntryStateMap = new Map(entryStateMap);
    nextEntryStateMap.set(entryId, reviewResult.entryState);
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
    setSessionXp((current) => current + reviewResult.xpGained);

    await Promise.all([
      learnerRepository.saveEntryState(reviewResult.entryState),
      learnerRepository.saveProfile(nextLearnerProfile),
      ...nextDeckAggregates.map((setAggregate) => learnerRepository.saveSetAggregate(setAggregate)),
    ]);
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
  snapshot: MatchingSessionSnapshot,
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
  snapshot: MatchingSessionSnapshot,
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
  snapshot: MatchingSessionSnapshot,
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

function buildMatchingTiles(entries: MatchingSessionSnapshot['entries']): MatchingTile[] {
  const tiles = entries.flatMap((entry) => [
    {
      id: `${entry.id}-spanish`,
      entryId: entry.id,
      label: entry.spanish,
      language: 'spanish' as const,
    },
    {
      id: `${entry.id}-english`,
      entryId: entry.id,
      label: entry.englishPrimary,
      language: 'english' as const,
    },
  ]);

  return shuffle(tiles);
}

function shuffle<T>(items: T[]): T[] {
  const nextItems = [...items];

  for (let index = nextItems.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const currentItem = nextItems[index];
    nextItems[index] = nextItems[swapIndex]!;
    nextItems[swapIndex] = currentItem!;
  }

  return nextItems;
}

function getSelectionTitle(snapshot: MatchingSessionSnapshot): string {
  if (snapshot.selection.sourceDeckIds.length === 1 && snapshot.sourceDecks.length === 1) {
    return snapshot.sourceDecks[0]?.title ?? 'Matching';
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

  return 'Matching';
}

function getSelectionMeta(snapshot: MatchingSessionSnapshot): string {
  const parts = [
    snapshot.theme?.title,
    snapshot.category?.title,
    snapshot.grammarType?.title,
  ].filter((value): value is string => value !== undefined);

  if (parts.length === 0) {
    return `${snapshot.entries.length} playable pairs ready from ${snapshot.resultCount} matching terms.`;
  }

  return `${parts.join(' / ')} with ${snapshot.entries.length} playable pairs from ${snapshot.resultCount} matching terms.`;
}

function formatSeconds(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
