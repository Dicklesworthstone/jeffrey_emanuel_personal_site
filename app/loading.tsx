export default function Loading() {
  return (
    <div className="flex min-h-[50vh] w-full items-center justify-center">
      <div
        className="flex flex-col items-center gap-4"
        role="status"
        aria-label="Loading content"
      >
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 animate-ping rounded-full bg-sky-500/20 motion-reduce:animate-none" />
          <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-sky-500/40 bg-sky-500/10">
            <div className="h-2 w-2 animate-pulse rounded-full bg-sky-400 motion-reduce:animate-none" />
          </div>
        </div>
        <p className="text-sm font-medium text-slate-400 animate-pulse motion-reduce:animate-none">
          Loading...
        </p>
      </div>
    </div>
  );
}
