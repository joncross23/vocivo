'use client';

import Link from 'next/link';
import type { StudyLaunchSnapshot } from '@vocivo/application';
import type {
  ContentSetDefinition,
  ContentSetSummary,
  SessionSelection,
} from '@vocivo/contracts';
import { usePersistedSetSummaryMap } from '../../../lib/client/use-persisted-set-summary-map';
import {
  buildBrowseHrefFromSelection,
  buildStudyHref,
} from '../../../lib/session-selection';
import { AppShell } from '../../shell/AppShell';

interface StudyPageProps {
  snapshot: StudyLaunchSnapshot;
  allSetDefinitions: ContentSetDefinition[];
}

export function StudyPage({ snapshot, allSetDefinitions }: StudyPageProps) {
  const setSummaryMap = usePersistedSetSummaryMap({
    allSetDefinitions,
    seedSourceDeckDefinitions: snapshot.sourceDeckDefinitions,
  });
  const selectionTitle = getSelectionTitle(snapshot);
  const selectionMeta = getSelectionMeta(snapshot);

  return (
    <AppShell>
      <section className="grid gap-6">
        <div className="rounded-3xl border border-white/10 bg-graphite/80 p-6 shadow-radar backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-glow">
                Study launcher
              </p>
              <p className="mt-3 font-display text-4xl uppercase tracking-tight text-chalk sm:text-5xl">
                {selectionTitle}
              </p>
              <p className="mt-3 max-w-3xl text-sm text-fog sm:text-base">
                {selectionMeta}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={buildBrowseHrefFromSelection(snapshot.selection)}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-chalk transition-transform hover:-translate-y-0.5 hover:bg-white/10"
              >
                Refine in browse
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StudyStat label="Matching terms" value={String(snapshot.resultCount)} />
            <StudyStat label="Matching decks" value={String(snapshot.sourceDecks.length)} />
            <StudyStat label="Typing safe" value={String(snapshot.practiceTestEligibleCount)} />
            <StudyStat label="Match safe" value={String(snapshot.matchingEligibleCount)} />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <SelectionChip label="Theme" value={snapshot.theme?.title ?? 'All themes'} />
            <SelectionChip label="Category" value={snapshot.category?.title ?? 'All categories'} />
            <SelectionChip label="Grammar" value={snapshot.grammarType?.title ?? 'All grammar types'} />
            <SelectionChip
              label="Quick filters"
              value={formatQuickFilters(snapshot.selection)}
            />
          </div>
        </div>

        <section className="grid gap-6 lg:grid-cols-[1.05fr,0.95fr]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-white/10 bg-black/20 p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.28em] text-glow">
                    Launch modes
                  </p>
                  <p className="mt-2 text-sm text-fog">
                    One scope, shared across the study modes we are building out.
                  </p>
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-fog">
                  {snapshot.resultCount} terms
                </span>
              </div>

              <div className="mt-5 grid gap-4 xl:grid-cols-3">
                <ModeCard
                  title="Flashcards"
                  description="Live now with persisted ratings, audio, bookmarks, and shared XP."
                  meta={`${snapshot.flashcardEligibleCount} cards ready`}
                  href={buildStudyHref({
                    selection: snapshot.selection,
                    mode: 'flashcards',
                  })}
                  ctaLabel="Launch flashcards"
                />
                <ModeCard
                  title="Practice test"
                  description="Typed answers and written recall will launch from this same study scope."
                  meta={`${snapshot.practiceTestEligibleCount} typing-safe terms`}
                  badge="Next"
                />
                <ModeCard
                  title="Matching"
                  description="Timed matching will reuse the same selection without rebuilding the deck."
                  meta={`${snapshot.matchingEligibleCount} match-safe terms`}
                  badge="Next"
                />
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-black/20 p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.28em] text-glow">
                    Preview terms
                  </p>
                  <p className="mt-2 text-sm text-fog">
                    The current selection pulls directly from the CSV-backed vocabulary catalogue.
                  </p>
                </div>
              </div>

              {snapshot.previewEntries.length === 0 ? (
                <p className="mt-6 text-sm text-fog">
                  No terms match this selection yet. Try widening the scope in browse.
                </p>
              ) : (
                <ul className="mt-5 space-y-3">
                  {snapshot.previewEntries.map((entry) => (
                    <li
                      key={entry.id}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                    >
                      <div>
                        <p className="font-medium text-chalk">{entry.spanish}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-fog">
                          {entry.answerComplexity.replace(/-/g, ' ')}
                        </p>
                      </div>
                      <p className="text-sm text-fog">{entry.englishPrimary}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <section className="rounded-3xl border border-glow/20 bg-black/20 p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.28em] text-glow">
                  Matching decks
                </p>
                <p className="mt-2 text-sm text-fog">
                  Coverage stays visible per set, so light-practice areas still stand out.
                </p>
              </div>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-fog">
                {snapshot.sourceDecks.length} decks
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {snapshot.sourceDecks.slice(0, 10).map((sourceDeck) => (
                <Link
                  key={sourceDeck.id}
                  href={buildStudyHref({
                    selection: toSourceDeckSelection(snapshot.selection, sourceDeck.id),
                  })}
                  className="block rounded-2xl border border-white/10 bg-white/5 p-4 transition-transform hover:-translate-y-0.5 hover:border-glow/30 hover:bg-white/10"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-chalk">{sourceDeck.title}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-fog">
                        {formatCoverageLine(setSummaryMap.get(sourceDeck.id))}
                      </p>
                    </div>
                    <span className="rounded-full border border-glow/20 px-3 py-1 text-xs text-chalk">
                      {sourceDeck.totalItems} words
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </section>
      </section>
    </AppShell>
  );
}

function ModeCard({
  title,
  description,
  meta,
  href,
  ctaLabel,
  badge,
}: {
  title: string;
  description: string;
  meta: string;
  href?: string;
  ctaLabel?: string;
  badge?: string;
}) {
  const className = 'block rounded-3xl border border-white/10 bg-white/5 p-5 transition-transform hover:-translate-y-0.5 hover:border-glow/30 hover:bg-white/10';

  if (href === undefined || ctaLabel === undefined) {
    return (
      <div className={`${className} opacity-80`}>
        <div className="flex items-center justify-between gap-3">
          <p className="font-medium text-chalk">{title}</p>
          {badge === undefined ? null : (
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-fog">
              {badge}
            </span>
          )}
        </div>
        <p className="mt-3 text-sm text-fog">{description}</p>
        <p className="mt-4 text-xs uppercase tracking-[0.18em] text-fog">{meta}</p>
      </div>
    );
  }

  return (
    <Link href={href} className={className}>
      <p className="font-medium text-chalk">{title}</p>
      <p className="mt-3 text-sm text-fog">{description}</p>
      <p className="mt-4 text-xs uppercase tracking-[0.18em] text-fog">{meta}</p>
      <p className="mt-5 text-xs uppercase tracking-[0.2em] text-glow">{ctaLabel}</p>
    </Link>
  );
}

function SelectionChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-full border border-white/10 bg-black/20 px-4 py-2">
      <p className="text-[11px] uppercase tracking-[0.18em] text-fog">{label}</p>
      <p className="mt-1 text-sm text-chalk">{value}</p>
    </div>
  );
}

function StudyStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-fog">{label}</p>
      <p className="mt-2 text-lg font-medium text-chalk">{value}</p>
    </div>
  );
}

function getSelectionTitle(snapshot: StudyLaunchSnapshot): string {
  if (snapshot.selection.sourceDeckIds.length === 1 && snapshot.sourceDecks.length === 1) {
    return snapshot.sourceDecks[0]?.title ?? 'Study selection';
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

  return 'Study selection';
}

function getSelectionMeta(snapshot: StudyLaunchSnapshot): string {
  const parts = [
    snapshot.theme?.title,
    snapshot.category?.title,
    snapshot.grammarType?.title,
  ].filter((value): value is string => value !== undefined);

  if (parts.length === 0) {
    return 'Launch a session from the whole vocabulary catalogue, or narrow it down by theme, category, grammar type, or deck.';
  }

  return `${parts.join(' / ')} with ${snapshot.sourceDecks.length} matching decks and ${snapshot.resultCount} matching terms.`;
}

function formatQuickFilters(selection: SessionSelection): string {
  const filters = [
    selection.includeWeakOnly ? 'Weak' : null,
    selection.includeDueOnly ? 'Due' : null,
    selection.includeBookmarkedOnly ? 'Bookmarked' : null,
  ].filter((value): value is string => value !== null);

  return filters.length === 0 ? 'None' : filters.join(' / ');
}

function formatCoverageLine(summary?: ContentSetSummary): string {
  if (summary === undefined) {
    return 'untouched';
  }

  return `${summary.practiceState.replace(/-/g, ' ')} · ${summary.itemsSeen}/${summary.totalItems} seen`;
}

function toSourceDeckSelection(
  selection: SessionSelection,
  sourceDeckId: string,
): SessionSelection {
  return {
    ...selection,
    sourceDeckIds: [sourceDeckId],
  };
}
