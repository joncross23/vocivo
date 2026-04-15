'use client';

import Link from 'next/link';
import type { DashboardSnapshot } from '@vocivo/application';
import type { ContentSetDefinition } from '@vocivo/contracts';
import { useLiveDashboardSnapshot } from '../../lib/client/use-live-dashboard-snapshot';
import {
  buildStudyHref,
  createDeckSelection,
} from '../../lib/session-selection';
import { AppShell } from './AppShell';

interface HomePageProps {
  initialSnapshot: DashboardSnapshot;
  sourceDeckDefinitions: ContentSetDefinition[];
}

export function HomePage({
  initialSnapshot,
  sourceDeckDefinitions,
}: HomePageProps) {
  const snapshot = useLiveDashboardSnapshot({
    initialSnapshot,
    sourceDeckDefinitions,
  });
  const focusDeckId = snapshot.neglectedSets[0]?.id ?? null;
  const focusSelection = focusDeckId === null
    ? {
      themeIds: [],
      categoryIds: [],
      grammarTypeIds: [],
      sourceDeckIds: [],
      includeWeakOnly: false,
      includeDueOnly: false,
      includeBookmarkedOnly: false,
    }
    : createDeckSelection(focusDeckId);

  return (
    <AppShell>
      <section className="grid gap-6 lg:grid-cols-[1.3fr,0.9fr]">
        <div className="rounded-3xl border border-white/10 bg-graphite/80 p-6 shadow-radar backdrop-blur">
          <p className="font-display text-4xl uppercase tracking-tight text-chalk sm:text-6xl">
            Vocivo
          </p>
          <p className="mt-2 max-w-xl text-sm text-fog sm:text-base">
            Command-deck dashboard backed by shared application read models that
            join live content sets with learner practice coverage, due review,
            and profile totals.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Level" value={formatMetric(snapshot.currentLevel)} />
            <Stat label="Streak" value={formatMetric(snapshot.streakDays)} />
            <Stat label="Total XP" value={formatMetric(snapshot.totalXp)} />
            <Stat label="Due today" value={formatMetric(snapshot.dueTodayCount)} />
          </div>

          <div className="mt-8 grid gap-4 xl:grid-cols-2">
            <LaunchCard
              href={buildStudyHref({
                selection: focusSelection,
                mode: 'word-sprint',
              })}
              title="Word Sprint"
              description="Fastest way into a live typing race with streak pressure."
              meta={focusDeckId === null ? 'Whole catalogue' : `Focus deck ${focusDeckId}`}
            />
            <LaunchCard
              href={buildStudyHref({
                selection: focusSelection,
                mode: 'practice-test',
              })}
              title="Practice Test"
              description="Typed recall with fuzzy matching and shared progress."
              meta={`${snapshot.practisedEntryCount} practised entries`}
            />
            <LaunchCard
              href={buildStudyHref({
                selection: focusSelection,
                mode: 'matching',
              })}
              title="Matching"
              description="Quick pair-finding sessions that still feed learner coverage."
              meta={`${snapshot.practisedDeckCount} practised decks`}
            />
            <LaunchCard
              href="/browse"
              title="Browse Themes"
              description="Drill into themes, categories, grammar types, and deck scope."
              meta={`${sourceDeckDefinitions.length} source decks`}
            />
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MiniStat label="Practised decks" value={formatMetric(snapshot.practisedDeckCount)} />
            <MiniStat label="Well practised" value={formatMetric(snapshot.wellPractisedDeckCount)} />
            <MiniStat label="Mastered words" value={formatMetric(snapshot.masteredEntryCount)} />
            <MiniStat label="Weak words" value={formatMetric(snapshot.weakEntryCount)} />
          </div>
        </div>

        <div className="rounded-3xl border border-glow/20 bg-black/20 p-6">
          <div className="flex items-center justify-between gap-4">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-glow">
              Neglected sets
            </p>
            <p className="text-xs uppercase tracking-[0.25em] text-fog">
              Weak words {formatMetric(snapshot.weakEntryCount)}
            </p>
          </div>
          <ul className="mt-4 space-y-3 text-sm text-fog">
            {snapshot.neglectedSets.map((setSummary) => (
              <li
                key={setSummary.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-chalk">{setSummary.title}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.24em] text-fog">
                      {formatPracticeState(setSummary.practiceState)}
                    </p>
                  </div>
                  <Link
                    href={buildStudyHref({
                      selection: createDeckSelection(setSummary.id),
                    })}
                    className="rounded-full border border-glow/20 px-3 py-1 text-xs text-chalk transition-colors hover:border-glow/40 hover:text-glow"
                  >
                    Study set
                  </Link>
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-fog">
                  <span>Seen {setSummary.itemsSeen}</span>
                  <span>Due {setSummary.dueItems}</span>
                  <span>Weak {setSummary.weakItems}</span>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-fog">
            Neglected sets now come from the CSV-backed catalogue joined with
            learner-side set aggregates.
          </p>
        </div>
      </section>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-xs uppercase tracking-[0.25em] text-fog">{label}</p>
      <p className="mt-2 font-display text-3xl tracking-tight text-chalk">{value}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-fog">{label}</p>
      <p className="mt-2 text-lg font-medium text-chalk">{value}</p>
    </div>
  );
}

function LaunchCard({
  href,
  title,
  description,
  meta,
}: {
  href: string;
  title: string;
  description: string;
  meta: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-3xl border border-white/10 bg-white/5 p-5 transition-transform hover:-translate-y-0.5 hover:border-glow/30 hover:bg-white/10"
    >
      <p className="font-medium text-chalk">{title}</p>
      <p className="mt-3 text-sm text-fog">{description}</p>
      <p className="mt-4 text-xs uppercase tracking-[0.18em] text-fog">{meta}</p>
    </Link>
  );
}

function formatMetric(value: number): string {
  return value.toString();
}

function formatPracticeState(value: DashboardSnapshot['neglectedSets'][number]['practiceState']): string {
  return value.replace('-', ' ');
}
