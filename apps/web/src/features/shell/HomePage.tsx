import { AppShell } from './AppShell';

const launchItems = [
  'Flashcards',
  'Practice Test',
  'Match',
  'Sprint',
  'Games',
] as const;

export function HomePage() {
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
            <Stat label="Level" value="12" />
            <Stat label="Streak" value="18" />
            <Stat label="Due today" value="34" />
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
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-glow">
            Workspace status
          </p>
          <ul className="mt-4 space-y-3 text-sm text-fog">
            <li>Contracts, domain, application, UI, infrastructure, and testkit packages scaffolded.</li>
            <li>Next.js app shell ready for dashboard and browsing slices.</li>
            <li>CI will expand from repo hygiene into app checks once dependencies are installed.</li>
          </ul>
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
