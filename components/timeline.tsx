import type { TimelineItem } from "@/lib/content";

export default function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="space-y-5 text-sm text-slate-300 md:relative md:space-y-0 md:border-l md:border-slate-800/80 md:pl-6">
      {items.map((item) => (
        <li
          key={`${item.org}-${item.period}`}
          className="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-4 shadow-md shadow-slate-950/40 md:relative md:mb-8 md:rounded-none md:border-none md:bg-transparent md:p-0 md:shadow-none md:pl-8 last:md:mb-0"
        >
          <div className="hidden md:block absolute -left-[9px] mt-1 h-3 w-3 rounded-full border border-slate-800 bg-slate-950 shadow shadow-slate-950/80" />
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            {item.period}
          </p>
          <h3 className="mt-1 text-sm font-semibold text-slate-50">
            {item.title}
          </h3>
          <p className="text-xs text-slate-400">{item.org}</p>
          <p className="mt-2 text-xs text-slate-500">{item.location}</p>
          <p className="mt-2 text-sm text-slate-300">{item.body}</p>
        </li>
      ))}
    </ol>
  );
}
