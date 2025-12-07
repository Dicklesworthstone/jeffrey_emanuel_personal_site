"use client";

import SectionShell from "@/components/section-shell";
import Timeline from "@/components/timeline";
import { careerTimeline } from "@/lib/content";
import { User } from "lucide-react";

export default function AboutPage() {
  return (
    <>
      <SectionShell
        id="about"
        icon={User}
        eyebrow="About"
        title="A generalist investor who never stopped caring about models"
        kicker="Most of my career was spent underwriting businesses; now I mostly underwrite infrastructure for AI and build tools I wish I’d had on the buyside."
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
          you can’t really evaluate the claims around AI infrastructure without
          understanding, at least qualitatively, how the models actually work.
        </p>
        <p>
          Over time those threads converged. Lumera Network is my attempt to
          build infrastructure where storage, compute, and interoperability are
          open and verifiable. SmartEdgar and my other tools are designed for a
          world in which analysts have fleets of agents working alongside them,
          not just spreadsheets and search engines.
        </p>
        <p>
          The through line is simple: take complicated systems, understand them
          at a mechanistic level, and then build things that make that
          understanding actionable for other people.
        </p>
      </SectionShell>

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
