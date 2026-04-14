import type { DashboardSnapshot } from '@vocivo/application';
import { AppShell } from './AppShell';

const launchItems = [
  'Flashcards',
  'Practice Test',
  'Match',
  'Sprint',
  'Games',
] as const;

interface HomePageProps {
  snapshot: DashboardSnapshot;
}

export function HomePage({ snapshot }: HomePageProps) {
  return (
    <AppShell>
      <section className="grid gap-6 lg:grid-cols-[1.3fr,0.9fr]">
        <div className="rounded-3xl border border-white/10 bg-graphite/80 p-6 shadow-radar backdrop-blur">
          <p className="font-display text-4xl uppercase tracking-tight text-chalk sm:text-6xl">
            Vocivo
          </p>
          <p className="mt-2 max-w-xl text-sm text-fog sm:text-base">
            Command-deck scaffold for the shared learner system, selector-first
            browsing, and the first flashcard loop.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Stat label="Level" value={formatMetric(snapshot.currentLevel)} />
            <Stat label="Streak" value={formatMetric(snapshot.streakDays)} />
            <Stat label="Due today" value={formatMetric(snapshot.dueTodayCount)} />
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {launchItems.map((item) => (
              <button
                key={item}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-chalk transition-transform hover:-translate-y-0.5 hover:bg-white/10"
                type="button"
              >
                {item}
              </button>
            ))}
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
                  <span className="rounded-full border border-glow/20 px-3 py-1 text-xs text-chalk">
                    {setSummary.totalItems} words
                  </span>
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
            Dashboard metrics are now flowing through the shared application path.
            XP and streak remain placeholders until persistence lands.
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

function formatMetric(value: number): string {
  return value.toString();
}

function formatPracticeState(value: DashboardSnapshot['neglectedSets'][number]['practiceState']): string {
  return value.replace('-', ' ');
}
