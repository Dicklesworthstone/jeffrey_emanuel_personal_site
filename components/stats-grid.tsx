import type { Stat } from "@/lib/content";

export default function StatsGrid(props: { stats: Stat[] }) {
  return (
    <dl className="grid gap-px overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-800/60 text-sm text-slate-200 shadow-xl shadow-slate-950/20 sm:grid-cols-2 lg:grid-cols-4">
      {props.stats.map((stat) => (
        <div
          key={stat.label}
          className="group relative bg-slate-950/40 px-6 py-6 backdrop-blur transition-colors hover:bg-slate-950/20"
        >
          {/* Subtle inner glow on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          
          <dt className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 transition-colors group-hover:text-sky-400/70">
            {stat.label}
          </dt>
          <dd className="mt-3 text-3xl font-bold tracking-tight text-slate-100 sm:text-4xl">
            {stat.value}
          </dd>
          {stat.helper && (
            <p className="mt-2 text-xs font-medium leading-relaxed text-slate-400/80">
              {stat.helper}
            </p>
          )}
        </div>
      ))}
    </dl>
  );
}
