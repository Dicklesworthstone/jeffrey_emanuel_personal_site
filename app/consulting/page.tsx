"use client";

import SectionShell from "@/components/section-shell";
import ConsultingIntakeForm from "@/components/consulting-intake-form";
import AnimatedGrid from "@/components/animated-grid";
import { Cpu, LineChart, Users, MessageSquare, CheckCircle2 } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function ConsultingPage() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <>
      <SectionShell
        id="consulting-hero"
        icon={Cpu}
        eyebrow="Consulting"
        title="AI, workflows, and markets for people who live inside risk limits"
        kicker="I work with hedge funds, multi-manager platforms, PE firms, and large allocators who need to reason clearly about AI and compute."
        headingLevel={1}
      >
        <div className="space-y-6">
          <p className="text-pretty-pro text-lg leading-relaxed text-slate-300 md:text-xl">
            Most AI conversations aimed at investors are either thinly disguised
            vendor pitches or abstract futurism. Useful work lives in the space
            between: understanding what models can do today, what is plausible in
            the next few years, and how that maps to positions, risk, and
            portfolio company strategy.
          </p>
          <p className="text-pretty-pro text-lg leading-relaxed text-slate-300 md:text-xl">
            I have sat on your side of the table. I know what it feels like when
            there are too many names, not enough time, and an IC that needs crisp
            answers by Friday. My consulting work is built around that reality.
          </p>
        </div>
      </SectionShell>

      <SectionShell
        id="consulting-modules"
        icon={LineChart}
        eyebrow="Offerings"
        title="How I typically help funds"
      >
        <AnimatedGrid
          className="grid gap-6 md:grid-cols-2"
          staggerDelay={0.12}
        >
          <motion.div 
            whileHover={{ y: -4 }}
            className="group relative rounded-3xl border border-slate-800/80 bg-slate-900/40 p-8 backdrop-blur-sm transition-colors hover:bg-slate-900/60 hover:border-sky-500/20"
          >
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400 group-hover:scale-110 transition-transform">
              <LineChart className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-50">
              Market & risk analysis
            </h3>
            <ul className="mt-6 space-y-4">
              {[
                "Deep dives on AI-sensitive names across the stack.",
                "Scenario work around shifts like DeepSeek, cheaper inference, and new architectures.",
                "Identifying where Nvidia-style over-earning risk might show up next."
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-base text-slate-400">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-sky-500/60" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div 
            whileHover={{ y: -4 }}
            className="group relative rounded-3xl border border-slate-800/80 bg-slate-900/40 p-8 backdrop-blur-sm transition-colors hover:bg-slate-900/60 hover:border-violet-500/20"
          >
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400 group-hover:scale-110 transition-transform">
              <Cpu className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-50">
              Workflow & automation design
            </h3>
            <ul className="mt-6 space-y-4">
              {[
                "Mapping where LLMs and agents can safely sit in your process.",
                "Designing agentic pipelines around SmartEdgar, MCP Agent Mail, and bespoke tools.",
                "Building guardrails so humans stay in the loop on the decisions that matter."
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-base text-slate-400">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-violet-500/60" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div 
            whileHover={{ y: -4 }}
            className="group relative rounded-3xl border border-slate-800/80 bg-slate-900/40 p-8 backdrop-blur-sm transition-colors hover:bg-slate-900/60 hover:border-emerald-500/20"
          >
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-50">
              Staff enablement
            </h3>
            <ul className="mt-6 space-y-4">
              {[
                "Playbooks for analysts and PMs using frontier models and coding agents effectively.",
                "Concrete examples of using AI tools to refactor large codebases.",
                "Pragmatic guidance on where AI is genuinely accretive vs. distracting."
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-base text-slate-400">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-500/60" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div 
            whileHover={{ y: -4 }}
            className="group relative rounded-3xl border border-slate-800/80 bg-slate-900/40 p-8 backdrop-blur-sm transition-colors hover:bg-slate-900/60 hover:border-fuchsia-500/20"
          >
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-fuchsia-500/10 text-fuchsia-400 group-hover:scale-110 transition-transform">
              <MessageSquare className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-50">
              IC and boardroom sessions
            </h3>
            <ul className="mt-6 space-y-4">
              {[
                "One-off or recurring briefings on the state of AI.",
                "Sector-specific sessions for PMs or PE deal teams.",
                "Written memos that can be circulated to LPs and internal stakeholders."
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-base text-slate-400">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-fuchsia-500/60" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </AnimatedGrid>
      </SectionShell>

      <SectionShell
        id="consulting-process"
        icon={Users}
        eyebrow="Process"
        title="What an engagement looks like"
      >
        <div className="relative space-y-12 pl-6 md:pl-0">
          <div className="absolute left-[7px] top-4 bottom-4 w-px bg-gradient-to-b from-sky-500/50 via-violet-500/50 to-transparent md:hidden" />
          
          {[
            {
              step: "1",
              title: "Intro call",
              desc: "We talk through mandate, style, and what you are trying to accomplish over the next 6–18 months.",
              color: "bg-sky-500"
            },
            {
              step: "2",
              title: "Scope & proposal",
              desc: "I send a sharp, concrete proposal with clear deliverables and timeline.",
              color: "bg-violet-500"
            },
            {
              step: "3",
              title: "Deep work phase",
              desc: "Mix of calls, async memos, and hands-on buildout where appropriate.",
              color: "bg-fuchsia-500"
            },
            {
              step: "4",
              title: "Delivery & follow-up",
              desc: "Final deliverables plus optional quarterly check-ins if the mandate benefits from ongoing updates.",
              color: "bg-emerald-500"
            }
          ].map((p, i) => (
            <motion.div 
              key={p.step}
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="relative md:flex md:gap-12 md:items-start"
            >
              <div className={cn(
                "absolute -left-[23px] top-1 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white shadow-lg md:relative md:left-0 md:h-12 md:w-12 md:shrink-0 md:text-base",
                p.color
              )}>
                {p.step}
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-100">{p.title}</h3>
                <p className="text-lg leading-relaxed text-slate-400 md:max-w-2xl">{p.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
        
        <p className="mt-16 text-pretty-pro text-lg text-slate-400 md:text-xl">
          If you want to explore working together, fill out the form below or send a short note with some
          context about your fund, your current AI exposure, and where you feel
          most uncertain.
        </p>
      </SectionShell>

      {/* Intake Form */}
      <SectionShell
        id="consulting-inquiry"
        icon={MessageSquare}
        eyebrow="Get in Touch"
        title="Start a conversation"
        kicker="Tell me about your fund and what you're trying to accomplish. I'll get back to you within a few days."
      >
        <div className="mx-auto max-w-3xl">
          <motion.div 
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-[2rem] border border-slate-800/60 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-950/95 p-6 backdrop-blur-xl sm:p-10 shadow-2xl"
          >
            {/* Background effects */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-violet-500/[0.08] blur-3xl" />
              <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-fuchsia-500/[0.08] blur-3xl" />
            </div>

            <div className="relative">
              <ConsultingIntakeForm />
            </div>
          </motion.div>
        </div>
      </SectionShell>
    </>
  );
}
