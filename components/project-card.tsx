import Link from "next/link";
import { ArrowUpRight, Star, Github } from "lucide-react";
import type { Project } from "@/lib/content";
import { useHapticFeedback } from "@/hooks/use-haptic-feedback";

export default function ProjectCard({ project }: { project: Project }) {
  const { lightTap } = useHapticFeedback();
  // Extract star count from badge if it contains "stars" (e.g., "2.8K stars", "100 stars")
  const starMatch = project.badge?.match(/^([\d.]+[KkMm]?)\s+stars?$/);
  const starCount = starMatch ? starMatch[1] : null;
  const displayBadge = starCount ? null : project.badge;
  const isGitHub = project.href.includes("github.com/");

  return (
    <Link href={project.href} target="_blank" rel="noopener noreferrer" className="block" onTouchStart={lightTap}>
      <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-950/90 via-slate-950/80 to-slate-900/90 p-6 shadow-lg shadow-slate-950/70 ring-sky-500/0 backdrop-blur-sm transition-all hover:-translate-y-1.5 hover:border-sky-500/60 hover:shadow-sky-500/10 hover:ring-2 md:p-8">
        {/* Subtle gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-500/0 via-violet-500/0 to-emerald-400/0 opacity-0 transition-opacity duration-300 group-hover:opacity-5" />

        <div className="relative z-10">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-400 md:text-sm">
                  {project.kind === "product" ? "Product" : "Open source"}
                </p>
                {isGitHub && (
                  <Github className="h-3 w-3 text-slate-500 md:h-3.5 md:w-3.5" aria-hidden="true" />
                )}
              </div>
              <h3 className="mt-2 text-base font-semibold leading-snug text-slate-50 transition-colors group-hover:text-sky-200 md:mt-2.5 md:text-lg md:leading-snug">
                {project.name}
              </h3>
            </div>
            <div className="flex flex-col gap-1.5">
              {starCount && (
                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500/10 to-yellow-500/10 px-2.5 py-1 text-[0.65rem] font-semibold text-amber-200 ring-1 ring-amber-500/20">
                  <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                  {starCount}
                </span>
              )}
              {displayBadge && (
                <span className="rounded-full bg-sky-500/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-sky-200 ring-1 ring-sky-500/20">
                  {displayBadge}
                </span>
              )}
            </div>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-slate-400 md:mt-4 md:text-base">
            {project.short}
          </p>

          <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-300 md:mt-4 md:text-base">
            {project.description}
          </p>

          <div className="mt-5 flex items-center justify-between gap-4 md:mt-6">
            <div className="flex flex-wrap gap-1.5 md:gap-2">
              {project.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-slate-900/80 px-2 py-1 text-xs text-slate-400 ring-1 ring-slate-800/60 transition-colors group-hover:bg-slate-800/80 group-hover:text-slate-300 md:px-2.5 md:text-sm"
                >
                  {tag}
                </span>
              ))}
              {project.tags.length > 4 && (
                <span className="rounded-md bg-slate-900/80 px-2 py-1 text-xs text-slate-500 ring-1 ring-slate-800/60 md:px-2.5 md:text-sm">
                  +{project.tags.length - 4}
                </span>
              )}
            </div>
            <div className="inline-flex items-center gap-1 text-sm font-medium text-sky-300 transition-colors group-hover:text-sky-200 md:text-base">
              View
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 md:h-4 md:w-4" />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
