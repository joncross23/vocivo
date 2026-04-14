import type { PropsWithChildren } from 'react';

export function Surface({ children }: PropsWithChildren) {
  return (
    <div className="rounded-3xl border border-white/10 bg-graphite/80 p-6 shadow-radar backdrop-blur">
      {children}
    </div>
  );
}
