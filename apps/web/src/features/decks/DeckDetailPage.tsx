'use client';

import Link from 'next/link';
import type { DeckDetailSnapshot } from '@vocivo/application';
import type { ContentSetDefinition, ContentSetSummary } from '@vocivo/contracts';
import { usePersistedSetSummaryMap } from '../../lib/client/use-persisted-set-summary-map';
import { AppShell } from '../shell/AppShell';

interface DeckDetailPageProps {
  snapshot: DeckDetailSnapshot;
  allSetDefinitions: ContentSetDefinition[];
}

export function DeckDetailPage({
  snapshot,
  allSetDefinitions,
}: DeckDetailPageProps) {
  const setSummaryMap = usePersistedSetSummaryMap({
    allSetDefinitions,
    seedSourceDeckDefinitions: allSetDefinitions.filter(
      (setDefinition) => setDefinition.kind === 'source-deck',
    ),
  });
  const deckSummary = setSummaryMap.get(snapshot.deck.id);
  const themeSummary = snapshot.theme === null ? undefined : setSummaryMap.get(snapshot.theme.id);
  const categorySummary = snapshot.category === null ? undefined : setSummaryMap.get(snapshot.category.id);
  const grammarTypeSummary = snapshot.grammarType === null
    ? undefined
    : setSummaryMap.get(snapshot.grammarType.id);

  return (
    <AppShell>
      <section className="grid gap-6 lg:grid-cols-[1.05fr,0.95fr]">
        <div className="rounded-3xl border border-white/10 bg-graphite/80 p-6 shadow-radar backdrop-blur">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-glow">
            Deck
          </p>
          <p className="mt-3 font-display text-4xl uppercase tracking-tight text-chalk sm:text-5xl">
            {snapshot.deck.title}
          </p>
          <p className="mt-3 text-sm text-fog">
            {snapshot.theme?.title ?? 'Unknown theme'} / {snapshot.category?.title ?? 'Unknown category'} /{' '}
            {snapshot.grammarType?.title ?? 'Unknown grammar type'}
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <DeckStat label="Terms" value={String(snapshot.deck.totalItems)} />
            <CoverageStat label="Deck coverage" summary={deckSummary} />
            <CoverageStat label="Theme coverage" summary={themeSummary} />
            <CoverageStat label="Category coverage" summary={categorySummary} />
            <CoverageStat label="Grammar coverage" summary={grammarTypeSummary} />
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/study/flashcards/${snapshot.deck.id}`}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-chalk transition-transform hover:-translate-y-0.5 hover:bg-white/10"
            >
              Flashcards
            </Link>
            <ActionButton label="Practice test" />
            <ActionButton label="Match" />
            <ActionButton label="Spaced review" />
          </div>
        </div>

        <div className="rounded-3xl border border-glow/20 bg-black/20 p-6">
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-glow">
              Terms preview
            </p>
            <Link
              href="/browse"
              className="text-xs uppercase tracking-[0.2em] text-fog transition-colors hover:text-chalk"
            >
              Back to browse
            </Link>
          </div>

          <ul className="mt-4 space-y-3">
            {snapshot.previewEntries.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-chalk">{entry.spanish}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-fog">
                    {entry.answerComplexity.replace('-', ' ')}
                  </p>
                </div>
                <p className="text-sm text-fog">{entry.englishPrimary}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </AppShell>
  );
}

function DeckStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-fog">{label}</p>
      <p className="mt-2 text-lg font-medium text-chalk">{value}</p>
    </div>
  );
}

function CoverageStat({
  label,
  summary,
}: {
  label: string;
  summary?: ContentSetSummary;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-fog">{label}</p>
      <p className="mt-2 text-sm font-medium uppercase tracking-[0.18em] text-chalk">
        {summary === undefined ? 'untouched' : formatPracticeState(summary.practiceState)}
      </p>
      <p className="mt-2 text-xs uppercase tracking-[0.16em] text-fog">
        {summary === undefined ? '0/0 seen' : `${summary.itemsSeen}/${summary.totalItems} seen`}
      </p>
      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-fog">
        {summary === undefined ? 'Due 0 · Weak 0' : `Due ${summary.dueItems} · Weak ${summary.weakItems}`}
      </p>
    </div>
  );
}

function ActionButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-chalk transition-transform hover:-translate-y-0.5 hover:bg-white/10"
    >
      {label}
    </button>
  );
}

function formatPracticeState(value: ContentSetSummary['practiceState']): string {
  return value.replace(/-/g, ' ');
}
