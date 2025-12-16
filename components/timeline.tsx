import type { TimelineItem } from "@/lib/content";
import { cn } from "@/lib/utils";

export default function Timeline({ items }: { items: TimelineItem[] }) {
  const latestIndex = items.findIndex((item) => item.period.includes("Present"));
  return (
    <div className="relative">
      {/* Vertical track - Optimized for depth */}
      <div className="absolute left-6 top-4 bottom-4 hidden w-px bg-gradient-to-b from-sky-500/50 via-white/5 to-transparent md:block" />

      <ol className="space-y-8 pl-2 md:space-y-12 md:pl-0">
        {items.map((item, index) => {
          const isLatest = latestIndex === -1 ? index === 0 : index === latestIndex;
          
          return (
            <li key={`${item.org}-${item.period}`} className="group relative md:pl-20">
              
              {/* Desktop Node Indicator */}
              <div className={cn(
                "hidden md:flex absolute left-[8.5px] top-1 h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-slate-950/50 shadow-lg backdrop-blur-md z-10 transition-all duration-500",
                "group-hover:border-sky-500/30 group-hover:shadow-[0_0_20px_-5px_rgba(56,189,248,0.3)]"
              )}>
                {isLatest ? (
                   <div className="h-2 w-2 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                ) : (
                   <div className="h-1.5 w-1.5 rounded-full bg-slate-700 transition-colors group-hover:bg-sky-500/50" />
                )}
              </div>

              {/* Content Card - Glass Effect */}
              <div className={cn(
                "glass-card rounded-3xl p-6 md:p-8 transition-transform duration-300 group-hover:-translate-y-1"
              )}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                   <div className="space-y-1">
                      <h3 className={cn(
                        "text-lg font-bold tracking-tight transition-colors",
                        isLatest ? "text-white" : "text-slate-200 group-hover:text-white"
                      )}>
                        {item.title}
                      </h3>
                      <p className="text-sm font-semibold uppercase tracking-wider text-sky-400">
                        {item.org}
                      </p>
                   </div>
                   
                   <div className="flex items-center gap-3">
                      <span className="inline-flex items-center rounded-full border border-white/5 bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 transition-colors group-hover:border-white/10 group-hover:text-slate-300">
                        {item.period}
                      </span>
                   </div>
                </div>
                
                <p className="mt-4 text-base leading-relaxed text-slate-400 group-hover:text-slate-300/90">
                  {item.body}
                </p>
                
                <div className="mt-6 flex items-center gap-2 text-xs font-medium text-slate-600">
                   <span className="h-1 w-1 rounded-full bg-slate-700" />
                   <span className="uppercase tracking-wider">{item.location}</span>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
