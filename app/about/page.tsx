"use client";

import SectionShell from "@/components/section-shell";
import Timeline from "@/components/timeline";
import TwoWorlds from "@/components/two-worlds";
import Link from "next/link";
import { careerTimeline } from "@/lib/content";
import { User, ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <>
      <SectionShell
        id="about"
        icon={User}
        eyebrow="About"
        title="From hedge funds to AI agent infrastructure"
        kicker="A decade underwriting businesses, now building the tools that let AI coding agents work together at scale."
        headingLevel={1}
      >
        <p>
          I studied mathematics at Reed College and then spent roughly a decade
          as a long/short equity analyst and principal investor. The mandate was
          almost always the same: work across sectors, understand complex
          systems deeply enough to see around corners, and express that view in
          risk-adjusted positions.
        </p>
        <p>
          Starting around 2010 I got pulled into deep learning, back when
          handwritten digit datasets and Restricted Boltzmann Machines were
          still a big deal. That background ended up being unusually helpful:
          you can&apos;t really evaluate the claims around AI infrastructure without
          understanding, at least qualitatively, how the models actually work.
        </p>
        <p>
          In late 2025, I started building what became the{" "}
          <Link href="/tldr" className="font-semibold text-violet-400 hover:text-violet-300 transition-colors">
            Agentic Coding Tooling Flywheel
          </Link>
          : thirteen interconnected tools that transform how AI coding agents collaborate.
          Agent Mail is critical to my workflow - it lets multiple Claude Code instances
          coordinate without stepping on each other. Beads Viewer uses PageRank to surface
          which tasks unblock the most other work. CASS provides sub-millisecond search
          across all my past agent sessions. The ecosystem includes safety tools like
          Destructive Command Guard and the two-person rule CLI, plus Repo Updater for
          keeping everything in sync. Each tool amplifies the others.
        </p>
        <p>
          The cadence of my GitHub commits increases more and more each passing week because the flywheel keeps
          spinning faster. I make sure to make forward progress on every active
          project each day, even when I&apos;m too busy to spend real mental bandwidth
          on all of them. I&apos;ve developed prompts that keep the agents always
          moving things forward.
        </p>
        <p>
          I also founded Lumera Network (formerly Pastel Network), a Cosmos-based L1
          for storage and AI verification. These days I mostly focus on AI automation
          consulting for PE funds and hedge funds, plus building my own hedge fund
          research tool powered by agents.
        </p>
        <p>
          The through line is simple: take complicated systems, understand them
          at a mechanistic level, and then build things that make that
          understanding actionable for other people.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 rounded-full bg-violet-500/10 px-5 py-2.5 text-sm font-semibold text-violet-400 ring-1 ring-inset ring-violet-500/30 transition-all hover:bg-violet-500/20 hover:text-violet-300"
          >
            Explore the Flywheel
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/consulting"
            className="inline-flex items-center gap-2 rounded-full bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-300 ring-1 ring-inset ring-white/10 transition-all hover:bg-white/10 hover:text-white"
          >
            Work with me
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </SectionShell>

      {/* Two Worlds Section - Visually striking transition narrative */}
      <TwoWorlds />

      <SectionShell
        id="career"
        icon={User}
        eyebrow="Timeline"
        title="Career and background"
        kicker="A mix of hedge funds, independent research, and protocol building."
      >
        <Timeline items={careerTimeline} />
      </SectionShell>
    </>
  );
}
