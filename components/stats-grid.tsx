import type { Stat } from "@/lib/content";

export default function StatsGrid(props: { stats: Stat[] }) {
  return (
    <dl className="grid gap-4 text-sm text-slate-200 sm:grid-cols-2 lg:grid-cols-4">
      {props.stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-2xl border border-slate-800/80 bg-slate-900/70 px-4 py-4 shadow-lg shadow-slate-950/70 backdrop-blur"
        >
          <dt className="text-xs font-medium uppercase tracking-[0.18em] text-sky-300/80">
            {stat.label}
          </dt>
          <dd className="mt-2 text-2xl font-semibold text-slate-50">
            {stat.value}
          </dd>
          {stat.helper && (
            <p className="mt-2 text-xs text-slate-400">{stat.helper}</p>
          )}
        </div>
      ))}
    </dl>
  );
}
