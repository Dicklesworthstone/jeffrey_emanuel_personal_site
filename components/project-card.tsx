import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/lib/content";

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="group flex flex-col rounded-2xl border border-slate-800/80 bg-slate-950/80 p-5 shadow-lg shadow-slate-950/70 ring-sky-500/0 transition-all hover:-translate-y-1.5 hover:border-sky-500/60 hover:ring-2">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
            {project.kind === "product" ? "Product" : "Open source"}
          </p>
          <h3 className="mt-1 text-base font-semibold text-slate-50">
            {project.name}
          </h3>
        </div>
        {project.badge && (
          <span className="rounded-full bg-sky-500/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-sky-200">
            {project.badge}
          </span>
        )}
      </div>
      <p className="mt-3 text-xs text-slate-400">{project.short}</p>
      <p className="mt-3 flex-1 text-sm text-slate-300">
        {project.description}
      </p>
      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="flex flex-wrap gap-1">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-900/80 px-2 py-0.5 text-[0.7rem] text-slate-400"
            >
              {tag}
            </span>
          ))}
        </div>
        <Link
          href={project.href}
          className="inline-flex items-center gap-1 text-xs font-medium text-sky-300 hover:text-sky-200"
        >
          View
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
    </article>
  );
}
