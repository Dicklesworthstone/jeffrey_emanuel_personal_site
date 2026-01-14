"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion, useInView } from "framer-motion";
import {
  TrendingUp,
  Brain,
  LineChart,
  Cpu,
  Scale,
  Workflow,
  Target,
  Zap,
  Building2,
  GitBranch,
  ArrowRight,
  Layers,
  Network,
  BarChart3,
  Bot,
} from "lucide-react";

interface TransferPoint {
  financeSkill: string;
  financeIcon: React.ReactNode;
  aiApplication: string;
  aiIcon: React.ReactNode;
  insight: string;
}

const skillTransfers: TransferPoint[] = [
  {
    financeSkill: "Complex System Analysis",
    financeIcon: <LineChart className="h-5 w-5" />,
    aiApplication: "Model Architecture Design",
    aiIcon: <Network className="h-5 w-5" />,
    insight: "Understanding how interconnected systems behave under stress",
  },
  {
    financeSkill: "Risk-Adjusted Positioning",
    financeIcon: <Scale className="h-5 w-5" />,
    aiApplication: "Robustness Engineering",
    aiIcon: <Layers className="h-5 w-5" />,
    insight: "Building systems that fail gracefully and recover quickly",
  },
  {
    financeSkill: "Multi-Sector Due Diligence",
    financeIcon: <BarChart3 className="h-5 w-5" />,
    aiApplication: "Cross-Domain Integration",
    aiIcon: <Workflow className="h-5 w-5" />,
    insight: "Connecting disparate tools into cohesive workflows",
  },
  {
    financeSkill: "Quantitative Modeling",
    financeIcon: <TrendingUp className="h-5 w-5" />,
    aiApplication: "Agent Orchestration",
    aiIcon: <Bot className="h-5 w-5" />,
    insight: "Optimizing multi-agent collaboration patterns",
  },
];

// Individual skill transfer card
function SkillTransferCard({ transfer, index }: { transfer: TransferPoint; index: number }) {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="group relative"
    >
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-amber-500/20 via-transparent to-violet-500/20 opacity-0 blur-sm transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative grid grid-cols-[1fr,auto,1fr] items-center gap-2 rounded-2xl border border-white/[0.06] bg-slate-900/40 p-4 backdrop-blur-md transition-all duration-500 hover:border-white/[0.1] hover:bg-slate-900/60 sm:gap-4 sm:p-6">
        {/* Finance Side */}
        <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:items-start sm:gap-4 sm:text-left">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-amber-600/5 text-amber-400 shadow-lg shadow-amber-500/5 sm:h-12 sm:w-12">
            {transfer.financeIcon}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-200 sm:text-base">{transfer.financeSkill}</p>
            <p className="mt-0.5 hidden text-xs text-amber-400/60 sm:block">Finance</p>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-white/5 sm:h-8 sm:w-8">
          <ArrowRight className="h-3 w-3 text-white/50 sm:h-4 sm:w-4" />
        </div>

        {/* AI Side */}
        <div className="flex flex-col items-center gap-2 text-center sm:flex-row-reverse sm:items-start sm:gap-4 sm:text-right">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-violet-600/5 text-violet-400 shadow-lg shadow-violet-500/5 sm:h-12 sm:w-12">
            {transfer.aiIcon}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-200 sm:text-base">{transfer.aiApplication}</p>
            <p className="mt-0.5 hidden text-xs text-violet-400/60 sm:block">AI Infrastructure</p>
          </div>
        </div>
      </div>

      {/* Insight */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.4, delay: index * 0.1 + 0.3 }}
        className="mt-2 text-center text-xs font-medium text-slate-500 sm:text-sm"
      >
        {transfer.insight}
      </motion.p>
    </motion.div>
  );
}

// Main component
export default function TwoWorlds() {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Parallax effects for background elements
  const financeY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const aiY = useTransform(scrollYProgress, [0, 1], ["0%", "-15%"]);
  const centerGlow = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 1, 0.3]);

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden bg-slate-950 py-24 sm:py-32 lg:py-40"
    >
      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-0">
        {/* Finance world gradient - left side */}
        <motion.div
          style={prefersReducedMotion ? {} : { y: financeY }}
          className="absolute -left-[20%] top-0 h-[150%] w-[60%] bg-gradient-to-br from-amber-500/[0.07] via-amber-600/[0.02] to-transparent blur-3xl"
        />

        {/* AI world gradient - right side */}
        <motion.div
          style={prefersReducedMotion ? {} : { y: aiY }}
          className="absolute -right-[20%] top-0 h-[150%] w-[60%] bg-gradient-to-bl from-violet-500/[0.07] via-violet-600/[0.02] to-transparent blur-3xl"
        />

        {/* Center convergence glow */}
        <motion.div
          style={prefersReducedMotion ? {} : { opacity: centerGlow }}
          className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-amber-500/10 via-white/5 to-violet-500/10 blur-[100px]"
        />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6 }}
            className="mb-6 flex items-center justify-center gap-3"
          >
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-amber-500/60" />
            <p className="text-xs font-bold uppercase tracking-widest text-amber-400/80">
              Two Worlds, One Vision
            </p>
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-violet-500/60" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, delay: 0.1 }}
            className="text-balance-pro text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl"
          >
            From{" "}
            <span className="bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">
              Wall Street
            </span>{" "}
            to{" "}
            <span className="bg-gradient-to-r from-violet-400 to-violet-500 bg-clip-text text-transparent">
              AI Infrastructure
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, delay: 0.2 }}
            className="mt-6 text-pretty text-base leading-relaxed text-slate-400 sm:text-lg"
          >
            A decade of analyzing complex systems and managing risk at hedge funds
            taught me how to see around corners. Now I apply those same frameworks
            to build AI infrastructure that scales.
          </motion.p>
        </div>

        {/* Visual World Split */}
        <div className="mt-16 grid gap-8 lg:mt-20 lg:grid-cols-2 lg:gap-12">
          {/* Finance World */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="group relative"
          >
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-amber-500/20 via-amber-600/5 to-transparent opacity-60 blur-xl transition-opacity duration-500 group-hover:opacity-80" />

            <div className="relative overflow-hidden rounded-2xl border border-amber-500/10 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-amber-950/20 p-6 backdrop-blur-md sm:p-8">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/20 to-amber-600/10 shadow-lg shadow-amber-500/10">
                  <Building2 className="h-6 w-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white sm:text-2xl">Finance</h3>
                  <p className="text-sm font-medium text-amber-400/80">2010 – 2024</p>
                </div>
              </div>

              <ul className="space-y-4">
                {[
                  { icon: <TrendingUp className="h-4 w-4" />, text: "Long/short equity analyst" },
                  { icon: <Target className="h-4 w-4" />, text: "Principal investor at multi-strat fund" },
                  { icon: <LineChart className="h-4 w-4" />, text: "Cross-sector fundamental analysis" },
                  { icon: <Scale className="h-4 w-4" />, text: "Risk-adjusted position sizing" },
                ].map((item, index) => (
                  <motion.li
                    key={item.text}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.4, delay: 0.3 + index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-500/10 bg-amber-500/5 text-amber-400" aria-hidden="true">
                      {item.icon}
                    </span>
                    <span className="text-sm font-medium text-slate-300">{item.text}</span>
                  </motion.li>
                ))}
              </ul>

              {/* Decorative financial chart pattern */}
              <div className="absolute -bottom-10 -right-10 h-40 w-40 opacity-[0.03]">
                <svg viewBox="0 0 100 100" fill="none" className="h-full w-full">
                  <path d="M0 80 L20 60 L40 70 L60 30 L80 45 L100 20" stroke="currentColor" strokeWidth="2" className="text-amber-400" />
                  <path d="M0 90 L30 85 L50 75 L70 80 L100 70" stroke="currentColor" strokeWidth="1" className="text-amber-400" />
                </svg>
              </div>
            </div>
          </motion.div>

          {/* AI World */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="group relative"
          >
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-violet-500/20 via-violet-600/5 to-transparent opacity-60 blur-xl transition-opacity duration-500 group-hover:opacity-80" />

            <div className="relative overflow-hidden rounded-2xl border border-violet-500/10 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-violet-950/20 p-6 backdrop-blur-md sm:p-8">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/20 to-violet-600/10 shadow-lg shadow-violet-500/10">
                  <Cpu className="h-6 w-6 text-violet-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white sm:text-2xl">AI Infrastructure</h3>
                  <p className="text-sm font-medium text-violet-400/80">2024 – Present</p>
                </div>
              </div>

              <ul className="space-y-4">
                {[
                  { icon: <Workflow className="h-4 w-4" />, text: "Multi-agent orchestration systems" },
                  { icon: <GitBranch className="h-4 w-4" />, text: "6K+ GitHub stars across tools" },
                  { icon: <Brain className="h-4 w-4" />, text: "Context management & memory" },
                  { icon: <Zap className="h-4 w-4" />, text: "Flywheel effect in AI tooling" },
                ].map((item, index) => (
                  <motion.li
                    key={item.text}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.4, delay: 0.3 + index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-violet-500/10 bg-violet-500/5 text-violet-400" aria-hidden="true">
                      {item.icon}
                    </span>
                    <span className="text-sm font-medium text-slate-300">{item.text}</span>
                  </motion.li>
                ))}
              </ul>

              {/* Decorative network pattern */}
              <div className="absolute -bottom-10 -right-10 h-40 w-40 opacity-[0.03]">
                <svg viewBox="0 0 100 100" fill="none" className="h-full w-full">
                  <circle cx="20" cy="20" r="5" className="fill-violet-400" />
                  <circle cx="80" cy="30" r="5" className="fill-violet-400" />
                  <circle cx="50" cy="60" r="5" className="fill-violet-400" />
                  <circle cx="30" cy="80" r="5" className="fill-violet-400" />
                  <circle cx="70" cy="70" r="5" className="fill-violet-400" />
                  <path d="M20 20 L80 30 M20 20 L50 60 M80 30 L50 60 M50 60 L30 80 M50 60 L70 70 M30 80 L70 70" stroke="currentColor" strokeWidth="1" className="text-violet-400" />
                </svg>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Skill Transfer Section */}
        <div className="mt-20 lg:mt-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6 }}
            className="mb-12 text-center"
          >
            <h3 className="text-xl font-bold text-white sm:text-2xl">
              Skills That Transfer
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              The same mental models that predict market behavior help architect reliable systems
            </p>
          </motion.div>

          <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
            {skillTransfers.map((transfer, index) => (
              <SkillTransferCard key={transfer.financeSkill} transfer={transfer} index={index} />
            ))}
          </div>
        </div>

        {/* Convergence Quote */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.7, delay: 0.2 }}
          className="mt-20 lg:mt-28"
        >
          <div className="relative mx-auto max-w-3xl">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-amber-500/10 via-white/5 to-violet-500/10 blur-2xl" />

            <blockquote className="relative rounded-2xl border border-white/[0.06] bg-slate-900/60 p-8 text-center backdrop-blur-lg sm:p-12">
              <div className="absolute left-1/2 top-0 h-px w-32 -translate-x-1/2 -translate-y-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              <p className="text-lg font-medium leading-relaxed text-slate-300 sm:text-xl">
                &ldquo;Take complicated systems, understand them at a mechanistic level,
                then build things that make that understanding actionable for others.&rdquo;
              </p>

              <div className="mt-6 flex items-center justify-center gap-3">
                <div className="h-px w-8 bg-gradient-to-r from-transparent to-amber-500/40" />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  The Through Line
                </span>
                <div className="h-px w-8 bg-gradient-to-l from-transparent to-violet-500/40" />
              </div>
            </blockquote>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
