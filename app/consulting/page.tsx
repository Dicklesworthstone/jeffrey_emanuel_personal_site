"use client";

import SectionShell from "@/components/section-shell";
import { Cpu, LineChart, Users } from "lucide-react";

export default function ConsultingPage() {
  return (
    <>
      <SectionShell
        id="consulting-hero"
        icon={Cpu}
        eyebrow="Consulting"
        title="AI, workflows, and markets for people who live inside risk limits"
        kicker="I work with hedge funds, multi‑manager platforms, PE firms, and large allocators who need to reason clearly about AI and compute."
        headingLevel={1}
      >
        <p>
          Most AI conversations aimed at investors are either thinly disguised
          vendor pitches or abstract futurism. Useful work lives in the space
          between: understanding what models can do today, what is plausible in
          the next few years, and how that maps to positions, risk, and
          portfolio company strategy.
        </p>
        <p>
          I have sat on your side of the table. I know what it feels like when
          there are too many names, not enough time, and an IC that needs crisp
          answers by Friday. My consulting work is built around that reality.
        </p>
      </SectionShell>

      <SectionShell
        id="consulting-modules"
        icon={LineChart}
        eyebrow="Offerings"
        title="How I typically help funds"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/80 p-4">
            <h3 className="text-sm font-semibold text-slate-50">
              Market & risk analysis
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li>Deep dives on AI‑sensitive names across the stack.</li>
              <li>
                Scenario work around shifts like DeepSeek, cheaper inference,
                and new architectures.
              </li>
              <li>
                Identifying where Nvidia‑style over‑earning risk might show up
                next.
              </li>
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/80 p-4">
            <h3 className="text-sm font-semibold text-slate-50">
              Workflow & automation design
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li>
                Mapping where LLMs and agents can safely sit in your process.
              </li>
              <li>
                Designing agentic pipelines around SmartEdgar, MCP Agent Mail,
                Ultimate Bug Scanner, and bespoke tools.
              </li>
              <li>
                Building guardrails so humans stay in the loop on the decisions
                that matter.
              </li>
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/80 p-4">
            <h3 className="text-sm font-semibold text-slate-50">
              Staff enablement
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li>
                Playbooks for analysts and PMs using frontier models and coding
                agents effectively.
              </li>
              <li>
                Concrete examples of using AI tools to refactor large codebases,
                explore alternative data, and compress research timelines.
              </li>
              <li>
                Pragmatic guidance on where AI is genuinely accretive vs.
                distracting.
              </li>
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/80 p-4">
            <h3 className="text-sm font-semibold text-slate-50">
              IC and boardroom sessions
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li>
                One‑off or recurring briefings on the state of AI and what
                matters for your universe.
              </li>
              <li>
                Sector‑specific sessions for PMs or PE deal teams who need to
                underwrite AI risk and opportunity.
              </li>
              <li>
                Written memos that can be circulated to LPs and internal
                stakeholders.
              </li>
            </ul>
          </div>
        </div>
      </SectionShell>

      <SectionShell
        id="consulting-process"
        icon={Users}
        eyebrow="Process"
        title="What an engagement looks like"
      >
        <ol className="space-y-3 text-sm text-slate-300">
          <li>
            <span className="font-semibold text-slate-100">1. Intro call.</span>{" "}
            We talk through mandate, style, and what you are trying to
            accomplish over the next 6–18 months.
          </li>
          <li>
            <span className="font-semibold text-slate-100">
              2. Scope & proposal.
            </span>{" "}
            I send a sharp, concrete proposal with clear deliverables and
            timeline.
          </li>
          <li>
            <span className="font-semibold text-slate-100">
              3. Deep work phase.
            </span>{" "}
            Mix of calls, async memos, and hands‑on buildout where appropriate.
          </li>
          <li>
            <span className="font-semibold text-slate-100">
              4. Delivery & follow‑up.
            </span>{" "}
            Final deliverables plus optional quarterly check‑ins if the mandate
            benefits from ongoing updates.
          </li>
        </ol>
        <p className="mt-4 text-sm text-slate-400">
          If you want to explore working together, send a short note with some
          context about your fund, your current AI exposure, and where you feel
          most uncertain.
        </p>
      </SectionShell>
    </>
  );
}
