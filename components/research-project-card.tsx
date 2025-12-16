"use client";

import Link from "next/link";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { ArrowRight, BrainCircuit, FlaskConical, ExternalLink } from "lucide-react";
import { Project } from "@/lib/content";
import { cn } from "@/lib/utils";
import { useHapticFeedback } from "@/hooks/use-haptic-feedback";

export default function ResearchProjectCard({ project }: { project: Project }) {
  const { lightTap } = useHapticFeedback();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const isBio = project.name.toLowerCase().includes("bio");
  const Icon = isBio ? BrainCircuit : FlaskConical;

  return (
    <Link
      href={project.href}
      target="_blank"
      rel="noopener noreferrer"
      onTouchStart={lightTap}
      className="group relative block w-full"
    >
      <div
        onMouseMove={handleMouseMove}
        className={cn(
          "relative flex min-h-[300px] flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/50 md:flex-row",
          "transition-all duration-300 ease-out",
          "hover:border-white/20 hover:scale-[1.01] hover:shadow-2xl hover:shadow-purple-900/20",
          "focus-within:scale-[1.01] focus-within:shadow-2xl focus-within:shadow-purple-900/20",
          "will-change-transform"
        )}
      >
        {/* Animated Spotlight Background */}
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-[2rem] opacity-0 transition duration-300 group-hover:opacity-100"
          style={{
            background: useMotionTemplate`
              radial-gradient(
                650px circle at ${mouseX}px ${mouseY}px,
                rgba(147, 51, 234, 0.15),
                transparent 80%
              )
            `,
          }}
        />

        {/* Content Section */}
        <div className="relative z-10 flex flex-1 flex-col p-8 md:p-10">
          {/* Header */}
          <div className="mb-6 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10 ring-1 ring-purple-500/50">
                <Icon className="h-5 w-5 text-purple-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400">
                  Frontier Research
                </span>
                {project.badge && (
                  <span className="text-[10px] font-medium text-slate-500">
                    {project.badge}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Title & Desc */}
          <h3 className="mb-3 text-3xl font-bold leading-tight text-slate-100 md:text-4xl">
            {project.name}
          </h3>
          <p className="mb-6 text-lg font-medium leading-relaxed text-slate-300">
            {project.short}
          </p>
          <p className="mb-8 max-w-2xl text-sm leading-relaxed text-slate-400">
            {project.description}
          </p>

          {/* Tags & Action */}
          <div className="mt-auto flex flex-wrap items-center justify-between gap-6">
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/5 bg-white/5 px-3 py-1 text-[11px] font-medium text-slate-400 transition-colors group-hover:border-white/10 group-hover:text-slate-300"
                >
                  {tag}
                </span>
              ))}
            </div>
            
            <div className="flex items-center gap-2 text-sm font-bold text-purple-400 transition-all group-hover:text-purple-300">
              View Research
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>

        {/* Visual/Abstract Side (Desktop only visual flair) */}
        <div className="relative hidden w-1/3 overflow-hidden md:block">
           {/* Abstract geometric patterns */}
           <div className="absolute inset-0 bg-gradient-to-l from-purple-900/20 to-transparent" />
           <div className="absolute -right-20 -top-20 h-[400px] w-[400px] rounded-full border-[1px] border-white/5 opacity-20" />
           <div className="absolute -right-10 top-10 h-[300px] w-[300px] rounded-full border-[1px] border-white/5 opacity-20" />
           <div className="absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full border-[1px] border-purple-500/10 opacity-30 blur-3xl" />
           
           {/* Interactive elements that could go here in V2: 3D canvas or WebGL */}
           <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              <ExternalLink className="h-12 w-12 text-white/10" />
           </div>
        </div>
      </div>
    </Link>
  );
}
