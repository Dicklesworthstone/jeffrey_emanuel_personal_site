"use client";

import Hero from "@/components/hero";
import SectionShell from "@/components/section-shell";
import ProjectCard from "@/components/project-card";
import Timeline from "@/components/timeline";
import { Cpu, GitBranch, PenSquare } from "lucide-react";
import { careerTimeline, projects, threads, writingHighlights } from "@/lib/content";

export default function HomePage() {
  const featuredProjects = projects.slice(0, 3);
  const featuredWriting = writingHighlights.slice(0, 3);
  const featuredThreads = threads.slice(0, 3);

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
        <div className="grid gap-6 md:grid-cols-3 md:gap-8">
          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/80 p-6 shadow-lg shadow-slate-950/80 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-300/90 md:text-sm">
              Infrastructure
            </p>
            <h3 className="mt-3 text-lg font-semibold leading-snug text-slate-50 md:mt-4 md:text-xl">
              Lumera Network
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-300 md:mt-4 md:text-base md:leading-relaxed">
              A Cosmos-based L1 for durable storage and AI verification, aimed
              at the world where agents talk to chains as fluently as to APIs.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/80 p-6 shadow-lg shadow-slate-950/80 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300/90 md:text-sm">
              Agent tooling
            </p>
            <h3 className="mt-3 text-lg font-semibold leading-snug text-slate-50 md:mt-4 md:text-xl">
              SmartEdgar, MCP Agent Mail, UBS
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-300 md:mt-4 md:text-base md:leading-relaxed">
              Tools that let analysts and LLMs cooperate instead of fighting
              PDFs, Git diffs, and static analyzers.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/80 p-6 shadow-lg shadow-slate-950/80 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-fuchsia-300/90 md:text-sm">
              Markets & research
            </p>
            <h3 className="mt-3 text-lg font-semibold leading-snug text-slate-50 md:mt-4 md:text-xl">
              Essays that move numbers
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-300 md:mt-4 md:text-base md:leading-relaxed">
              Long-form work that connects model internals and infrastructure
              economics all the way back to cash flows and valuations.
            </p>
          </div>
        </div>
      </SectionShell>

      <SectionShell
        id="projects"
        icon={GitBranch}
        eyebrow="Projects"
        title="Products and open source"
        kicker="A small sample of what I’m building right now. See the projects page for the expanded list."
      >
        <div className="grid gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
          {featuredProjects.map((project) => (
            <ProjectCard key={project.name} project={project} />
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
        <div className="grid gap-6 md:grid-cols-3 md:gap-8">
          {featuredWriting.map((item) => (
            <a
              key={item.title}
              href={item.href}
              target="_blank"
              rel="noreferrer noopener"
              className="group flex flex-col rounded-2xl border border-slate-800/80 bg-slate-950/80 p-6 shadow-lg shadow-slate-950/80 transition hover:-translate-y-1 hover:border-sky-500/70 md:p-8"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400 md:text-sm">
                {item.source} • {item.category}
              </p>
              <h3 className="mt-3 text-base font-semibold leading-snug text-slate-50 group-hover:text-sky-100 md:mt-4 md:text-lg md:leading-snug">
                {item.title}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-400 md:mt-4 md:text-base">{item.blurb}</p>
              <span className="mt-4 text-sm font-medium text-sky-300 group-hover:text-sky-200 md:mt-5 md:text-base">
                Read the essay →
              </span>
            </a>
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
        <div className="grid gap-6 md:grid-cols-3 md:gap-8">
          {featuredThreads.map((thread) => (
            <a
              key={thread.href}
              href={thread.href}
              target="_blank"
              rel="noreferrer noopener"
              className="group flex flex-col rounded-2xl border border-slate-800/80 bg-slate-950/80 p-6 shadow-lg shadow-slate-950/80 transition hover:-translate-y-1 hover:border-sky-500/70 md:p-8"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400 md:text-sm">
                Thread on X
              </p>
              <h3 className="mt-3 text-base font-semibold leading-snug text-slate-50 group-hover:text-sky-100 md:mt-4 md:text-lg md:leading-snug">
                {thread.title}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-400 md:mt-4 md:text-base">
                {thread.blurb}
              </p>
              <span className="mt-4 text-sm font-medium text-sky-300 group-hover:text-sky-200 md:mt-5 md:text-base">
                Open thread →
              </span>
            </a>
          ))}
        </div>
      </SectionShell>
    </>
  );
}
