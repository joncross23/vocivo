'use client';

import Link from 'next/link';
import type { BrowseSnapshot } from '@vocivo/application';
import type {
  ContentSetDefinition,
  ContentSetSummary,
  SessionSelection,
} from '@vocivo/contracts';
import { usePersistedSetSummaryMap } from '../../lib/client/use-persisted-set-summary-map';
import { AppShell } from '../shell/AppShell';
import { buildBrowseHref } from './build-browse-href';

interface BrowsePageProps {
  snapshot: BrowseSnapshot;
  allSetDefinitions: ContentSetDefinition[];
}

export function BrowsePage({ snapshot, allSetDefinitions }: BrowsePageProps) {
  const selectedThemeId = snapshot.selection.themeIds[0] ?? null;
  const selectedCategoryId = snapshot.selection.categoryIds[0] ?? null;
  const selectedGrammarTypeId = snapshot.selection.grammarTypeIds[0] ?? null;
  const setSummaryMap = usePersistedSetSummaryMap({
    allSetDefinitions,
    seedSourceDeckDefinitions: allSetDefinitions.filter(
      (setDefinition) => setDefinition.kind === 'source-deck',
    ),
  });

  return (
    <AppShell>
      <section className="grid gap-6">
        <div className="rounded-3xl border border-white/10 bg-graphite/80 p-6 shadow-radar backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-display text-4xl uppercase tracking-tight text-chalk sm:text-5xl">
                Browse
              </p>
              <p className="mt-2 max-w-2xl text-sm text-fog sm:text-base">
                Real CSV-backed selector browsing by theme, category, grammar
                type, and source deck.
              </p>
            </div>
            <div className="rounded-2xl border border-glow/20 bg-black/20 px-4 py-3 text-right">
              <p className="text-xs uppercase tracking-[0.22em] text-fog">Result count</p>
              <p className="mt-1 font-display text-3xl tracking-tight text-chalk">
                {snapshot.resultCount}
              </p>
            </div>
          </div>
        </div>

        <section className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="space-y-6">
            <BrowseSection title="Themes">
              {snapshot.themes.map((theme) => (
                <BrowseCard
                  key={theme.id}
                  href={buildBrowseHref(snapshot.selection, {
                    themeId: selectedThemeId === theme.id ? null : theme.id,
                    categoryId: null,
                    grammarTypeId: selectedGrammarTypeId,
                  })}
                  isActive={selectedThemeId === theme.id}
                  title={theme.title}
                  meta={`${theme.totalItems} words`}
                  coverage={setSummaryMap.get(theme.id)}
                />
              ))}
            </BrowseSection>

            <BrowseSection title="Categories">
              <FilterChip
                href={buildBrowseHref(snapshot.selection, { categoryId: null })}
                isActive={selectedCategoryId === null}
                label="All"
              />
              {snapshot.categories.map((category) => (
                <FilterChip
                  key={category.id}
                  href={buildBrowseHref(snapshot.selection, {
                    categoryId: selectedCategoryId === category.id ? null : category.id,
                  })}
                  isActive={selectedCategoryId === category.id}
                  label={category.title}
                  meta={formatCompactCoverage(setSummaryMap.get(category.id))}
                />
              ))}
            </BrowseSection>

            <BrowseSection title="Grammar types">
              <FilterChip
                href={buildBrowseHref(snapshot.selection, { grammarTypeId: null })}
                isActive={selectedGrammarTypeId === null}
                label="All"
              />
              {snapshot.grammarTypes.map((grammarType) => (
                <FilterChip
                  key={grammarType.id}
                  href={buildBrowseHref(snapshot.selection, {
                    grammarTypeId:
                      selectedGrammarTypeId === grammarType.id ? null : grammarType.id,
                  })}
                  isActive={selectedGrammarTypeId === grammarType.id}
                  label={grammarType.title}
                  meta={formatCompactCoverage(setSummaryMap.get(grammarType.id))}
                />
              ))}
            </BrowseSection>
          </div>

          <div className="rounded-3xl border border-glow/20 bg-black/20 p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.28em] text-glow">
                  Matching decks
                </p>
                <p className="mt-2 text-sm text-fog">
                  Source deck buckets remain first-class launch points.
                </p>
              </div>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-fog">
                {snapshot.sourceDecks.length} decks
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {snapshot.sourceDecks.slice(0, 8).map((sourceDeck) => (
                <Link
                  key={sourceDeck.id}
                  href={`/decks/${sourceDeck.id}`}
                  className="block rounded-2xl border border-white/10 bg-white/5 p-4 transition-transform hover:-translate-y-0.5 hover:border-glow/30 hover:bg-white/10"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-chalk">{sourceDeck.title}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-fog">
                        {formatDeckMeta(sourceDeck, snapshot.selection)}
                      </p>
                      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-fog">
                        {formatCoverageLine(setSummaryMap.get(sourceDeck.id))}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="rounded-full border border-glow/20 px-3 py-1 text-xs text-chalk">
                        {sourceDeck.totalItems} words
                      </span>
                      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-fog">
                        {formatCoverageCounts(setSummaryMap.get(sourceDeck.id))}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </section>
    </AppShell>
  );
}

function BrowseSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-black/20 p-6">
      <p className="font-mono text-xs uppercase tracking-[0.28em] text-glow">{title}</p>
      <div className="mt-4 flex flex-wrap gap-3">{children}</div>
    </section>
  );
}

function BrowseCard({
  href,
  isActive,
  title,
  meta,
  coverage,
}: {
  href: string;
  isActive: boolean;
  title: string;
  meta: string;
  coverage?: ContentSetSummary;
}) {
  return (
    <Link
      href={href}
      className={`block w-full rounded-3xl border p-5 transition-transform hover:-translate-y-0.5 ${
        isActive
          ? 'border-glow/40 bg-glow/10'
          : 'border-white/10 bg-white/5 hover:border-glow/20 hover:bg-white/10'
      }`}
    >
      <p className="font-medium text-chalk">{title}</p>
      <p className="mt-2 text-xs uppercase tracking-[0.2em] text-fog">{meta}</p>
      <p className="mt-3 text-xs uppercase tracking-[0.18em] text-fog">
        {formatCoverageLine(coverage)}
      </p>
    </Link>
  );
}

function FilterChip({
  href,
  isActive,
  label,
  meta,
}: {
  href: string;
  isActive: boolean;
  label: string;
  meta?: string;
}) {
  return (
    <Link
      href={href}
      className={`rounded-2xl border px-4 py-3 text-sm transition-transform hover:-translate-y-0.5 ${
        isActive
          ? 'border-glow/40 bg-glow/10 text-chalk'
          : 'border-white/10 bg-white/5 text-fog hover:border-glow/20 hover:bg-white/10 hover:text-chalk'
      }`}
    >
      <span className="block">{label}</span>
      {meta === undefined ? null : (
        <span className="mt-1 block text-xs uppercase tracking-[0.18em] text-fog">
          {meta}
        </span>
      )}
    </Link>
  );
}

function formatDeckMeta(
  sourceDeck: BrowseSnapshot['sourceDecks'][number],
  selection: SessionSelection,
): string {
  const parts = [sourceDeck.themeId, sourceDeck.categoryId, sourceDeck.grammarTypeId]
    .filter((value) => value !== null)
    .map((value) => humaniseId(value));

  if (selection.themeIds.length === 0 && selection.categoryIds.length === 0 && selection.grammarTypeIds.length === 0) {
    return parts.join(' / ');
  }

  return parts.join(' / ');
}

function humaniseId(value: string): string {
  return value.replace(/-/g, ' ');
}

function formatCompactCoverage(setSummary?: ContentSetSummary): string | undefined {
  if (setSummary === undefined) {
    return undefined;
  }

  return `${formatPracticeState(setSummary.practiceState)} · ${setSummary.itemsSeen}/${setSummary.totalItems}`;
}

function formatCoverageLine(setSummary?: ContentSetSummary): string {
  if (setSummary === undefined) {
    return 'untouched · 0 seen';
  }

  return `${formatPracticeState(setSummary.practiceState)} · ${setSummary.itemsSeen}/${setSummary.totalItems} seen`;
}

function formatCoverageCounts(setSummary?: ContentSetSummary): string {
  if (setSummary === undefined) {
    return 'Due 0 · Weak 0';
  }

  return `Due ${setSummary.dueItems} · Weak ${setSummary.weakItems}`;
}

function formatPracticeState(value: ContentSetSummary['practiceState']): string {
  return value.replace(/-/g, ' ');
}
