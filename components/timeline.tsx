import type { TimelineItem } from "@/lib/content";

export default function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <div className="relative space-y-12 pl-2 md:pl-0">
      {/* Tech-inspired vertical track */}
      <div className="absolute left-6 top-4 bottom-4 hidden w-px bg-gradient-to-b from-sky-500/80 via-slate-700/50 to-transparent md:block" />

      {items.map((item, index) => {
        const isLatest = index === 0;
        
        return (
          <div key={`${item.org}-${item.period}`} className="group relative md:pl-20">
            
            {/* Desktop Node Indicator - Center aligned to 24.5px (Line center) */}
            <div className="hidden md:flex absolute left-[8.5px] top-1 h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-950 shadow-lg ring-4 ring-slate-950 z-10 transition-all duration-300 group-hover:border-sky-500/50 group-hover:shadow-sky-900/20">
              {isLatest ? (
                 <div className="h-2 w-2 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,1)] animate-pulse" />
              ) : (
                 <span className="text-[9px] font-mono text-slate-600 group-hover:text-sky-500">
                    {items.length - index}
                 </span>
              )}
            </div>

            {/* Content Card */}
            <div className="relative rounded-2xl border border-slate-800/40 bg-slate-900/10 p-6 backdrop-blur-sm transition-all duration-300 hover:bg-slate-900/30 hover:border-slate-700/60">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                 <div>
                    <h3 className={`text-lg font-bold tracking-tight ${isLatest ? 'text-sky-100' : 'text-slate-100'}`}>
                      {item.title}
                    </h3>
                    <p className="text-sm font-medium text-sky-400/80 font-mono mt-0.5">
                      {item.org}
                    </p>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="rounded-md bg-slate-950/50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 ring-1 ring-slate-800">
                      {item.period}
                    </span>
                 </div>
              </div>
              
              <p className="mt-4 text-base leading-relaxed text-slate-400">
                {item.body}
              </p>
              
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-600 font-mono">
                 <span className="h-1 w-1 rounded-full bg-slate-700" />
                 {item.location}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
