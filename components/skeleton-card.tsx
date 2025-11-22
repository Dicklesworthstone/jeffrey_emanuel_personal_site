export default function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-800/80 bg-slate-950/80 p-6 shadow-lg shadow-slate-950/80 md:p-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="h-3 w-20 rounded bg-slate-800/80" />
          <div className="mt-3 h-5 w-3/4 rounded bg-slate-800/60" />
        </div>
        <div className="h-6 w-16 rounded-full bg-slate-800/60" />
      </div>

      {/* Short description */}
      <div className="mt-4 h-4 w-full rounded bg-slate-800/50" />

      {/* Description */}
      <div className="mt-3 space-y-2">
        <div className="h-4 w-full rounded bg-slate-800/40" />
        <div className="h-4 w-5/6 rounded bg-slate-800/40" />
      </div>

      {/* Tags and CTA */}
      <div className="mt-6 flex items-center justify-between gap-4">
        <div className="flex gap-2">
          <div className="h-6 w-16 rounded-md bg-slate-800/50" />
          <div className="h-6 w-20 rounded-md bg-slate-800/50" />
          <div className="h-6 w-14 rounded-md bg-slate-800/50" />
        </div>
        <div className="h-4 w-12 rounded bg-slate-800/50" />
      </div>
    </div>
  );
}
