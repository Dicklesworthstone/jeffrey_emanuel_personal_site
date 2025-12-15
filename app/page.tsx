"use client";

import Hero from "@/components/hero";
import Link from "next/link";
import SectionShell from "@/components/section-shell";
import ProjectCard from "@/components/project-card";
import Timeline from "@/components/timeline";
import { Cpu, GitBranch, PenSquare, Workflow, Zap, ArrowRight } from "lucide-react";
import { careerTimeline, projects, threads, writingHighlights, flywheelTools } from "@/lib/content";
import { cn } from "@/lib/utils";
import { useHapticFeedback } from "@/hooks/use-haptic-feedback";
import { motion } from "framer-motion";

export default function HomePage() {
  const featuredProjects = projects;
  const featuredWriting = writingHighlights;
  const featuredThreads = threads;
  const { lightTap } = useHapticFeedback();

  return (
    <>
      <Hero />

      <SectionShell
        id="snapshot"
        icon={Cpu}
        eyebrow="Snapshot"
        title="Where I sit in the AI stack"
        kicker="Three overlapping threads: an ecosystem of agent tools I use to run 10+ agents simultaneously, research that moves markets, and protocol infrastructure."
      >
        <div className="flex -mx-4 px-4 overflow-x-auto pb-8 snap-x snap-mandatory md:grid md:grid-cols-3 md:gap-8 md:mx-0 md:px-0 md:pb-0 md:overflow-visible no-scrollbar">
          <div className="snap-center shrink-0 w-[85vw] sm:w-[60vw] md:w-auto glass-card rounded-3xl p-8 border border-violet-500/20 bg-gradient-to-br from-violet-950/20 to-transparent">
            <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400 shadow-violet-500/20 drop-shadow-sm">
              The Flywheel
            </p>
            <h3 className="mt-4 text-xl font-bold leading-tight text-slate-50 md:text-2xl">
              7 Tools That Amplify Each Other
            </h3>
            <p className="mt-4 text-base leading-relaxed text-slate-400">
              MCP Agent Mail, Beads Viewer, CASS Memory, and 4 more tools that let
              coding agents coordinate, remember, and work safely together. Each
              tool makes the others more powerful.
            </p>
            <Link
              href="/projects"
              className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-violet-400 transition-colors hover:text-violet-300"
            >
              Explore the ecosystem
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="snap-center shrink-0 w-[85vw] sm:w-[60vw] md:w-auto glass-card rounded-3xl p-8">
            <p className="text-[10px] font-bold uppercase tracking-widest text-fuchsia-400 shadow-fuchsia-500/20 drop-shadow-sm">
              Markets & research
            </p>
            <h3 className="mt-4 text-xl font-bold leading-tight text-slate-50 md:text-2xl">
              Essays that move numbers
            </h3>
            <p className="mt-4 text-base leading-relaxed text-slate-400">
              Long-form work that connects model internals and infrastructure
              economics all the way back to cash flows and valuations.
            </p>
            <Link
              href="/writing"
              className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-fuchsia-400 transition-colors hover:text-fuchsia-300"
            >
              Read essays
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="snap-center shrink-0 w-[85vw] sm:w-[60vw] md:w-auto glass-card rounded-3xl p-8">
            <p className="text-[10px] font-bold uppercase tracking-widest text-sky-400 shadow-sky-500/20 drop-shadow-sm">
              Infrastructure
            </p>
            <h3 className="mt-4 text-xl font-bold leading-tight text-slate-50 md:text-2xl">
              Lumera Network
            </h3>
            <p className="mt-4 text-base leading-relaxed text-slate-400">
              A Cosmos-based L1 for durable storage and AI verification, aimed
              at the world where agents talk to chains as fluently as to APIs.
            </p>
            <a
              href="https://pastel.network"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-sky-400 transition-colors hover:text-sky-300"
            >
              Visit Lumera
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </SectionShell>

      {/* Flywheel Preview Banner */}
      <section className="relative overflow-hidden py-16 sm:py-24">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-violet-950/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.08),transparent_70%)]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/projects"
            className="group block"
            onTouchStart={lightTap}
          >
            <div className="relative rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-950/30 via-black/40 to-black/20 p-8 sm:p-12 backdrop-blur-sm transition-all duration-300 hover:border-violet-500/40 hover:shadow-2xl hover:shadow-violet-500/10">
              {/* Decorative elements */}
              <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-violet-500/10 blur-3xl" />
              <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-fuchsia-500/10 blur-3xl" />

              <div className="relative flex flex-col items-center text-center lg:flex-row lg:items-start lg:text-left lg:justify-between lg:gap-12">
                <div className="max-w-2xl">
                  <div className="mb-4 flex items-center justify-center lg:justify-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-lg shadow-violet-500/30">
                      <Workflow className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-violet-400">
                      Featured Ecosystem
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                    The Agentic Coding Tooling Flywheel
                  </h2>

                  <p className="mt-4 text-base leading-relaxed text-slate-400 sm:text-lg">
                    Seven interconnected tools that transform how AI coding agents work together.
                    Coordination, memory, task tracking, safety, and search. I use these to run
                    10+ agents simultaneously. My GitHub squares get darker green each month because
                    each tool amplifies the others.
                  </p>
                </div>

                {/* Mini flywheel preview */}
                <div className="mt-8 lg:mt-0 flex flex-col items-center">
                  <div className="relative flex h-32 w-32 sm:h-40 sm:w-40 items-center justify-center">
                    {/* Animated dashed ring */}
                    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100">
                      <motion.circle
                        cx="50"
                        cy="50"
                        r="48"
                        fill="none"
                        stroke="rgba(139, 92, 246, 0.3)"
                        strokeWidth="1"
                        strokeDasharray="8 4"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        style={{ transformOrigin: "center" }}
                      />
                    </svg>
                    {/* Tool dots - positioned using percentages for responsive scaling */}
                    {flywheelTools.map((tool, i) => {
                      const angle = ((i / flywheelTools.length) * 2 * Math.PI) - (Math.PI / 2);
                      // Use 38% of container size as radius (leaves room for dot size)
                      const radiusPercent = 38;
                      const xPercent = Math.cos(angle) * radiusPercent;
                      const yPercent = Math.sin(angle) * radiusPercent;
                      return (
                        <motion.div
                          key={tool.id}
                          className={cn(
                            "absolute h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-gradient-to-br shadow-lg",
                            tool.color
                          )}
                          style={{
                            left: `calc(50% + ${xPercent}% - 6px)`,
                            top: `calc(50% + ${yPercent}% - 6px)`,
                          }}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: i * 0.1 }}
                        />
                      );
                    })}
                    {/* Center icon */}
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-500/20 ring-1 ring-violet-500/40">
                      <Zap className="h-6 w-6 text-violet-400" />
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-2 text-sm font-bold text-violet-400 transition-colors group-hover:text-violet-300">
                    Explore the interactive flywheel
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      <SectionShell
        id="projects"
        icon={GitBranch}
        eyebrow="Projects"
        title="Products and open source"
        kicker="A comprehensive collection of the tools, protocols, and experiments I'm building."
      >
        <div className="flex -mx-4 px-4 overflow-x-auto pb-8 snap-x snap-mandatory md:grid md:grid-cols-2 md:gap-8 lg:grid-cols-3 md:mx-0 md:px-0 md:pb-0 md:overflow-visible no-scrollbar">
          {featuredProjects.map((project) => (
             <div key={project.name} className="snap-center shrink-0 w-[85vw] sm:w-[60vw] md:w-auto h-full">
                <ProjectCard project={project} />
             </div>
          ))}
        </div>
      </SectionShell>

      <SectionShell
        id="writing"
        icon={PenSquare}
        eyebrow="Writing"
        title="Essays, memos, and research notes"
        kicker="A mix of public writing and GitHub-native research artifacts."
      >
        <div className="flex -mx-4 px-4 overflow-x-auto pb-8 snap-x snap-mandatory md:grid md:grid-cols-3 md:gap-8 md:mx-0 md:px-0 md:pb-0 md:overflow-visible no-scrollbar">
          {featuredWriting.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              onTouchStart={lightTap}
              className="snap-center shrink-0 w-[85vw] sm:w-[60vw] md:w-auto glass-card group flex flex-col rounded-3xl p-8 hover:border-sky-500/30"
            >
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                <span>{item.source}</span>
                <span className="h-0.5 w-0.5 rounded-full bg-slate-500" />
                <span>{item.category}</span>
              </div>
              
              <h3 className="mt-4 text-xl font-bold leading-tight text-slate-50 transition-colors group-hover:text-sky-200">
                {item.title}
              </h3>
              
              <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-400">
                {item.blurb}
              </p>
              
              <div className="mt-8 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400 transition-colors group-hover:text-sky-300">
                Read the essay
                <span className="text-lg leading-none">→</span>
              </div>
            </Link>
          ))}
        </div>
      </SectionShell>

      <SectionShell
        id="timeline"
        icon={Cpu}
        eyebrow="Background"
        title="From hedge funds to agents and chains"
        kicker="A condensed view of the path that got me here."
      >
        <Timeline items={careerTimeline} />
      </SectionShell>

      {featuredThreads.length > 0 && (
        <SectionShell
          id="threads"
          icon={PenSquare}
          eyebrow="Threads"
          title="Selected X posts"
          kicker="I write a lot more informally on X. Here are a few good entry points."
        >
          <div className="flex -mx-4 px-4 overflow-x-auto pb-8 snap-x snap-mandatory md:grid md:grid-cols-3 md:gap-8 md:mx-0 md:px-0 md:pb-0 md:overflow-visible no-scrollbar">
            {featuredThreads.map((thread) => (
              <a
                key={thread.href}
                href={thread.href}
                target="_blank"
                rel="noreferrer noopener"
                onTouchStart={lightTap}
                className="snap-center shrink-0 w-[85vw] sm:w-[60vw] md:w-auto glass-card group flex flex-col rounded-3xl p-8 hover:border-sky-500/30"
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Thread on X
                </p>
                <h3 className="mt-4 text-lg font-bold leading-snug text-slate-50 transition-colors group-hover:text-sky-200">
                  {thread.title}
                </h3>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-400">
                  {thread.blurb}
                </p>
                <div className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400 transition-colors group-hover:text-sky-300">
                  Open thread
                  <span className="text-lg leading-none">→</span>
                </div>
              </a>
            ))}
          </div>
        </SectionShell>
      )}
    </>
  );
}
