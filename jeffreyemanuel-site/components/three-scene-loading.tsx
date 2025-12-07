export default function ThreeSceneLoading() {
  return (
    <div className="flex h-[280px] w-full items-center justify-center sm:h-[380px] md:h-[420px] lg:h-[460px]">
      <div className="flex flex-col items-center gap-3">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 animate-ping rounded-full bg-sky-500/20" />
          <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-sky-500/40 bg-sky-500/10">
            <div className="h-2 w-2 animate-pulse rounded-full bg-sky-400" />
          </div>
        </div>
        <p className="text-xs text-slate-400">Loading visualization...</p>
      </div>
    </div>
  );
}
