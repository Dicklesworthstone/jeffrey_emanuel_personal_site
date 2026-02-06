/**
 * Loading skeleton shown during route transitions to /tldr.
 * Mirrors the structure of the actual page for minimal layout shift.
 */
export default function TldrLoading() {
  return (
    <main className="min-h-screen overflow-x-hidden" aria-hidden="true">
      {/* Hero skeleton */}
      <section className="relative overflow-hidden py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="mx-auto h-8 w-48 animate-pulse rounded-lg bg-slate-800/60" />
            <div className="mx-auto h-12 w-3/4 animate-pulse rounded-lg bg-slate-800/40" />
            <div className="mx-auto h-5 w-2/3 animate-pulse rounded-lg bg-slate-800/30" />
            {/* Stats row */}
            <div className="mx-auto flex max-w-md justify-center gap-6 pt-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="h-8 w-16 animate-pulse rounded-lg bg-slate-800/50" />
                  <div className="h-3 w-20 animate-pulse rounded bg-slate-800/30" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Flywheel explanation + diagram skeleton */}
      <section className="py-12 md:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="space-y-4">
              <div className="h-8 w-3/4 animate-pulse rounded-lg bg-slate-800/50" />
              <div className="h-4 w-full animate-pulse rounded bg-slate-800/30" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-slate-800/30" />
              <div className="h-4 w-full animate-pulse rounded bg-slate-800/30" />
              <div className="h-4 w-4/6 animate-pulse rounded bg-slate-800/30" />
            </div>
            {/* Circular diagram placeholder */}
            <div className="mx-auto flex h-72 w-72 items-center justify-center rounded-full border border-slate-800/40 bg-slate-900/30">
              <div className="h-16 w-16 animate-pulse rounded-full bg-slate-800/50" />
            </div>
          </div>
        </div>
      </section>

      {/* Tool grid skeleton */}
      <section className="py-12 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 space-y-16">
          {/* Search bar skeleton */}
          <div className="mx-auto max-w-2xl">
            <div className="h-12 w-full animate-pulse rounded-2xl border border-slate-800/40 bg-slate-900/30" />
          </div>

          {/* Section header + card grid */}
          {[1, 2].map((section) => (
            <div key={section} className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-800/50" />
                  <div className="h-7 w-48 animate-pulse rounded-lg bg-slate-800/40" />
                </div>
                <div className="h-4 w-96 max-w-full animate-pulse rounded bg-slate-800/25" />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: section === 1 ? 6 : 3 }, (_, i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-xl border border-slate-800/40 bg-slate-900/30 p-5"
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 shrink-0 rounded-xl bg-slate-800/50" />
                      <div className="flex-1 space-y-2">
                        <div className="h-5 w-24 rounded bg-slate-800/50" />
                        <div className="h-3 w-32 rounded bg-slate-800/30" />
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="h-3 w-full rounded bg-slate-800/25" />
                      <div className="h-3 w-5/6 rounded bg-slate-800/25" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
