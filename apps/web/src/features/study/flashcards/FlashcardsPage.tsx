'use client';

import Link from 'next/link';
import type { FlashcardSessionSnapshot } from '@vocivo/application';
import {
  applyFlashcardReview,
  buildSourceDeckAggregate,
  buildUpdatedLearnerProfile,
} from '@vocivo/application';
import type {
  FlashcardRating,
  LearnerEntryState,
  LearnerProfile,
  LearnerRepository,
  SetAggregate,
} from '@vocivo/contracts';
import { useEffect, useState } from 'react';
import { ensurePreviewLearnerSeed } from '../../../lib/client/browser-learner';
import { AppShell } from '../../shell/AppShell';

interface FlashcardsPageProps {
  snapshot: FlashcardSessionSnapshot;
}

const ratingOrder: FlashcardRating[] = ['again', 'hard', 'good', 'easy'];

export function FlashcardsPage({ snapshot }: FlashcardsPageProps) {
  const [learnerRepository, setLearnerRepository] = useState<LearnerRepository | null>(null);
  const [learnerProfile, setLearnerProfile] = useState<LearnerProfile>({
    totalXp: 0,
    currentLevel: 0,
    streakDays: 0,
  });
  const [entryStateMap, setEntryStateMap] = useState<Map<string, LearnerEntryState>>(new Map());
  const [deckAggregate, setDeckAggregate] = useState<SetAggregate>(() =>
    buildSourceDeckAggregate({
      deckDefinition: snapshot.deck,
      entries: snapshot.entries,
      entryStates: [],
      now: new Date(),
    }));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [sessionXp, setSessionXp] = useState(0);
  const [ratingCounts, setRatingCounts] = useState<Record<FlashcardRating, number>>({
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
  });

  const currentEntry = snapshot.entries[currentIndex] ?? null;
  const currentEntryState = currentEntry === null
    ? null
    : entryStateMap.get(currentEntry.id) ?? null;

  useEffect(() => {
    let isCancelled = false;

    async function loadLearnerState() {
      const repository = await ensurePreviewLearnerSeed([snapshot.deck]);
      const [profile, entryStates] = await Promise.all([
        repository.getProfile(),
        repository.listEntryStates(),
      ]);
      const nextEntryStateMap = new Map(
        entryStates
          .filter((entryState) => snapshot.entries.some((entry) => entry.id === entryState.entryId))
          .map((entryState) => [entryState.entryId, entryState]),
      );
      const nextDeckAggregate = buildSourceDeckAggregate({
        deckDefinition: snapshot.deck,
        entries: snapshot.entries,
        entryStates: [...nextEntryStateMap.values()],
        now: new Date(),
      });

      if (isCancelled) {
        return;
      }

      setLearnerRepository(repository);
      setLearnerProfile(profile);
      setEntryStateMap(nextEntryStateMap);
      setDeckAggregate(nextDeckAggregate);
    }

    void loadLearnerState();

    return () => {
      isCancelled = true;
    };
  }, [snapshot.deck, snapshot.entries]);

  useEffect(() => {
    function handleKeydown(event: KeyboardEvent) {
      if (currentEntry === null || isComplete) {
        return;
      }

      if (event.key === ' ') {
        event.preventDefault();
        setShowAnswer(true);
        return;
      }

      if (event.key.toLowerCase() === 'b') {
        event.preventDefault();
        void toggleBookmark();
        return;
      }

      if (!showAnswer) {
        return;
      }

      const rating = toFlashcardRating(event.key);

      if (rating !== null) {
        event.preventDefault();
        void submitRating(rating);
      }
    }

    window.addEventListener('keydown', handleKeydown);
    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  }, [currentEntry, isComplete, showAnswer, currentEntryState, entryStateMap, learnerProfile, learnerRepository]);

  if (isComplete) {
    return (
      <AppShell>
        <section className="mx-auto grid max-w-4xl gap-6">
          <div className="rounded-3xl border border-white/10 bg-graphite/80 p-6 shadow-radar backdrop-blur">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-glow">
              Session complete
            </p>
            <p className="mt-3 font-display text-4xl uppercase tracking-tight text-chalk sm:text-5xl">
              {snapshot.deck.title}
            </p>
            <p className="mt-3 max-w-2xl text-sm text-fog sm:text-base">
              Real flashcard ratings have been written into learner entry state,
              deck coverage, and shared XP totals.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <SummaryStat label="Session XP" value={String(sessionXp)} />
              <SummaryStat label="Level" value={String(learnerProfile.currentLevel)} />
              <SummaryStat label="Deck coverage" value={`${deckAggregate.itemsSeen}/${deckAggregate.totalItems}`} />
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-4">
              {ratingOrder.map((rating) => (
                <SummaryStat
                  key={rating}
                  label={rating}
                  value={String(ratingCounts[rating])}
                />
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setCurrentIndex(0);
                  setShowAnswer(false);
                  setIsComplete(false);
                  setSessionXp(0);
                  setRatingCounts({
                    again: 0,
                    hard: 0,
                    good: 0,
                    easy: 0,
                  });
                }}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-chalk transition-transform hover:-translate-y-0.5 hover:bg-white/10"
              >
                Study again
              </button>
              <Link
                href={`/decks/${snapshot.deck.id}`}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-chalk transition-transform hover:-translate-y-0.5 hover:bg-white/10"
              >
                Back to deck
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
                Flashcards
              </p>
              <p className="mt-3 font-display text-4xl uppercase tracking-tight text-chalk sm:text-5xl">
                {snapshot.deck.title}
              </p>
              <p className="mt-3 text-sm text-fog">
                {snapshot.theme?.title ?? 'Unknown theme'} / {snapshot.category?.title ?? 'Unknown category'} /{' '}
                {snapshot.grammarType?.title ?? 'Unknown grammar type'}
              </p>
            </div>

            <div className="rounded-2xl border border-glow/20 bg-black/20 px-4 py-3 text-right">
              <p className="text-xs uppercase tracking-[0.22em] text-fog">Progress</p>
              <p className="mt-1 font-display text-3xl tracking-tight text-chalk">
                {currentIndex + 1}/{snapshot.entries.length}
              </p>
            </div>
          </div>

          <div className="mt-8 overflow-hidden rounded-full border border-white/10 bg-black/20">
            <div
              className="h-2 rounded-full bg-glow transition-all"
              style={{
                width: `${((currentIndex + (showAnswer ? 1 : 0)) / Math.max(snapshot.entries.length, 1)) * 100}%`,
              }}
            />
          </div>

          <div className="mt-8" style={{ perspective: '1600px' }}>
            <div
              className="relative h-[420px] w-full rounded-[2rem] transition-transform duration-500"
              style={{
                transformStyle: 'preserve-3d',
                transform: showAnswer ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              <FlashcardFace
                label="Spanish"
                text={currentEntry?.spanish ?? ''}
                footer={`${currentIndex + 1} of ${snapshot.entries.length}`}
                accent="text-glow"
              />
              <FlashcardFace
                label="English"
                text={currentEntry?.englishPrimary ?? ''}
                footer={currentEntry?.englishAlternates.length === 0
                  ? 'Primary answer'
                  : `Also: ${currentEntry?.englishAlternates.join(', ')}`}
                accent="text-chalk"
                rotate
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setShowAnswer((current) => !current)}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-chalk transition-transform hover:-translate-y-0.5 hover:bg-white/10"
            >
              {showAnswer ? 'Hide answer' : 'Show answer'}
            </button>
            <button
              type="button"
              onClick={() => speakText(currentEntry?.spanish ?? '', 'es-ES')}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-chalk transition-transform hover:-translate-y-0.5 hover:bg-white/10"
            >
              Speak Spanish
            </button>
            <button
              type="button"
              onClick={() => speakText(currentEntry?.englishPrimary ?? '', 'en-GB')}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-chalk transition-transform hover:-translate-y-0.5 hover:bg-white/10"
            >
              Speak English
            </button>
            <button
              type="button"
              onClick={() => {
                void toggleBookmark();
              }}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-chalk transition-transform hover:-translate-y-0.5 hover:bg-white/10"
            >
              {currentEntryState?.bookmarked === true ? 'Bookmarked' : 'Bookmark'}
            </button>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            {ratingOrder.map((rating, index) => (
              <button
                key={rating}
                type="button"
                disabled={!showAnswer || learnerRepository === null}
                onClick={() => {
                  void submitRating(rating);
                }}
                className={`rounded-2xl border px-4 py-4 text-left transition-transform hover:-translate-y-0.5 ${
                  showAnswer && learnerRepository !== null
                    ? 'border-white/10 bg-white/5 hover:bg-white/10'
                    : 'border-white/5 bg-white/[0.02] opacity-50'
                }`}
              >
                <p className="text-xs uppercase tracking-[0.2em] text-fog">{index + 1}</p>
                <p className="mt-2 font-medium capitalize text-chalk">{rating}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <aside className="rounded-3xl border border-glow/20 bg-black/20 p-6">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-glow">
              Live coverage
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <SummaryStat label="Seen" value={`${deckAggregate.itemsSeen}/${deckAggregate.totalItems}`} />
              <SummaryStat label="Due now" value={String(deckAggregate.dueItems)} />
              <SummaryStat label="Weak" value={String(deckAggregate.weakItems)} />
              <SummaryStat label="XP" value={String(learnerProfile.totalXp)} />
            </div>
            <p className="mt-4 text-xs uppercase tracking-[0.18em] text-fog">
              {deckAggregate.practiceState.replace(/-/g, ' ')}
            </p>
          </aside>

          <aside className="rounded-3xl border border-white/10 bg-black/20 p-6">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-glow">
              Shortcuts
            </p>
            <ul className="mt-4 space-y-2 text-sm text-fog">
              <li>`Space` flip the card</li>
              <li>`1-4` rate again, hard, good, easy</li>
              <li>`B` toggle bookmark</li>
            </ul>
          </aside>
        </div>
      </section>
    </AppShell>
  );

  async function toggleBookmark() {
    if (learnerRepository === null || currentEntry === null) {
      return;
    }

    const nextEntryState: LearnerEntryState = currentEntryState ?? {
      entryId: currentEntry.id,
      status: 'unseen',
      bookmarked: false,
      dueAt: null,
      lastPractisedAt: null,
      scoredInteractions: 0,
      correctInteractions: 0,
    };
    const updatedEntryState = {
      ...nextEntryState,
      bookmarked: !nextEntryState.bookmarked,
    };
    const nextEntryStateMap = new Map(entryStateMap);
    nextEntryStateMap.set(currentEntry.id, updatedEntryState);

    setEntryStateMap(nextEntryStateMap);
    await learnerRepository.saveEntryState(updatedEntryState);
  }

  async function submitRating(rating: FlashcardRating) {
    if (learnerRepository === null || currentEntry === null) {
      return;
    }

    const now = new Date();
    const reviewResult = applyFlashcardReview({
      entryId: currentEntry.id,
      existingEntryState: currentEntryState,
      rating,
      now,
    });
    const nextEntryStateMap = new Map(entryStateMap);
    nextEntryStateMap.set(currentEntry.id, reviewResult.entryState);
    const nextLearnerProfile = buildUpdatedLearnerProfile({
      totalXp: learnerProfile.totalXp,
      xpGained: reviewResult.xpGained,
      streakDays: learnerProfile.streakDays,
    });
    const nextDeckAggregate = buildSourceDeckAggregate({
      deckDefinition: snapshot.deck,
      entries: snapshot.entries,
      entryStates: [...nextEntryStateMap.values()],
      now,
    });

    setEntryStateMap(nextEntryStateMap);
    setLearnerProfile(nextLearnerProfile);
    setDeckAggregate(nextDeckAggregate);
    setSessionXp((current) => current + reviewResult.xpGained);
    setRatingCounts((current) => ({
      ...current,
      [rating]: current[rating] + 1,
    }));
    setShowAnswer(false);

    await Promise.all([
      learnerRepository.saveEntryState(reviewResult.entryState),
      learnerRepository.saveSetAggregate(nextDeckAggregate),
      learnerRepository.saveProfile(nextLearnerProfile),
    ]);

    if (currentIndex >= snapshot.entries.length - 1) {
      setIsComplete(true);
      return;
    }

    setCurrentIndex((current) => current + 1);
  }
}

function FlashcardFace({
  label,
  text,
  footer,
  accent,
  rotate = false,
}: {
  label: string;
  text: string;
  footer: string;
  accent: string;
  rotate?: boolean;
}) {
  return (
    <div
      className="absolute inset-0 flex h-full w-full flex-col justify-between rounded-[2rem] border border-white/10 bg-black/30 p-8 shadow-radar"
      style={{
        backfaceVisibility: 'hidden',
        transform: rotate ? 'rotateY(180deg)' : 'rotateY(0deg)',
      }}
    >
      <p className="font-mono text-xs uppercase tracking-[0.28em] text-fog">{label}</p>
      <p className={`font-display text-5xl tracking-tight sm:text-6xl ${accent}`}>
        {text}
      </p>
      <p className="text-xs uppercase tracking-[0.2em] text-fog">{footer}</p>
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-fog">{label}</p>
      <p className="mt-2 text-lg font-medium text-chalk">{value}</p>
    </div>
  );
}

function speakText(text: string, language: string) {
  if (text.length === 0 || typeof window === 'undefined' || 'speechSynthesis' in window === false) {
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language;
  window.speechSynthesis.speak(utterance);
}

function toFlashcardRating(value: string): FlashcardRating | null {
  if (value === '1') {
    return 'again';
  }

  if (value === '2') {
    return 'hard';
  }

  if (value === '3') {
    return 'good';
  }

  if (value === '4') {
    return 'easy';
  }

  return null;
}
