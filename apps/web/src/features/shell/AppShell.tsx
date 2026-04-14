export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-dashboard-grid px-6 py-8 sm:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="flex items-center justify-between rounded-full border border-white/10 bg-black/20 px-5 py-3 backdrop-blur">
          <div>
            <p className="font-display text-2xl uppercase tracking-tight text-chalk">
              Vocivo
            </p>
            <p className="text-xs uppercase tracking-[0.28em] text-fog">
              Workspace scaffold
            </p>
          </div>
          <nav className="flex items-center gap-4 text-sm text-fog">
            <span>Dashboard</span>
            <span>Browse</span>
            <span>Decks</span>
            <span>Stats</span>
          </nav>
        </header>

        {children}
      </div>
    </main>
  );
}
