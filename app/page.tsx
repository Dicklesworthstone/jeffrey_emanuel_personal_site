"use client";

import Hero from "@/components/hero";
import Link from "next/link";
import SectionShell from "@/components/section-shell";
import ProjectCard from "@/components/project-card";
import Timeline from "@/components/timeline";
import { Cpu, GitBranch, PenSquare } from "lucide-react";
import { careerTimeline, projects, threads, writingHighlights } from "@/lib/content";
import { cn } from "@/lib/utils";
import { useHapticFeedback } from "@/hooks/use-haptic-feedback";

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
        kicker="Three overlapping threads: infrastructure, tools for agents, and research that actually moves markets."
      >
        <div className="flex -mx-4 px-4 overflow-x-auto pb-8 snap-x snap-mandatory md:grid md:grid-cols-3 md:gap-8 md:mx-0 md:px-0 md:pb-0 md:overflow-visible no-scrollbar">
          <div className="snap-center shrink-0 w-[85vw] sm:w-[60vw] md:w-auto glass-card rounded-3xl p-8">
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 shadow-emerald-500/20 drop-shadow-sm">
              Agent tooling
            </p>
            <h3 className="mt-4 text-xl font-bold leading-tight text-slate-50 md:text-2xl">
              SmartEdgar, MCP Agent Mail
            </h3>
            <p className="mt-4 text-base leading-relaxed text-slate-400">
              Tools that let analysts and LLMs cooperate instead of fighting
              PDFs, Git diffs, and static analyzers.
            </p>
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
          </div>
        </div>
      </SectionShell>

      <SectionShell
        id="projects"
        icon={GitBranch}
        eyebrow="Projects"
        title="Products and open source"
        kicker="A comprehensive collection of the tools, protocols, and experiments I’m building."
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
    </>
  );
}
