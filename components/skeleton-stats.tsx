export default function SkeletonStats() {
  return (
    <dl
      className="grid gap-4 text-sm text-slate-200 sm:grid-cols-2 lg:grid-cols-4"
      aria-hidden="true"
    >
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl border border-slate-800/80 bg-slate-900/70 px-4 py-4 shadow-lg shadow-slate-950/70 backdrop-blur"
        >
          <div className="h-3 w-24 rounded bg-slate-800/80" />
          <div className="mt-3 h-8 w-16 rounded bg-slate-800/60" />
          <div className="mt-3 h-3 w-32 rounded bg-slate-800/40" />
        </div>
      ))}
    </dl>
  );
}
