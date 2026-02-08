"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { NOISE_SVG_DATA_URI } from "@/lib/constants";

export function SnapshotCard({
  eyebrow,
  title,
  description,
  href,
  linkText,
  accentColor,
  hoverBorder,
}: {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  linkText: string;
  accentColor: string;
  hoverBorder: string;
}) {
  const isExternal = href.startsWith("http");

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.015 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`snap-center shrink-0 w-[85vw] sm:w-[60vw] md:w-auto h-full glass-card group relative overflow-hidden rounded-3xl p-8 border border-white/5 bg-slate-900/40 backdrop-blur-sm transition-colors hover:bg-slate-900/60 ${hoverBorder}`}
    >
      {/* Noise Overlay */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-overlay transition-opacity duration-500 group-hover:opacity-[0.05]"
        style={{ backgroundImage: `url("${NOISE_SVG_DATA_URI}")` }}
      />

      {/* Subtle highlight gradient */}
      <div className="pointer-events-none absolute -inset-px bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <p className={`relative z-10 text-xs font-bold uppercase tracking-widest ${accentColor} drop-shadow-sm`}>
        {eyebrow}
      </p>
      <h3 className="relative z-10 mt-4 text-xl font-bold leading-tight text-slate-50 md:text-2xl transition-colors group-hover:text-white">
        {title}
      </h3>
      <p className="relative z-10 mt-4 text-base leading-relaxed text-slate-400 transition-colors group-hover:text-slate-300">
        {description}
      </p>
      <div className="relative z-10 mt-auto pt-6">
        {isExternal ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 text-sm font-bold ${accentColor} transition-colors hover:brightness-110 group/link`}
          >
            {linkText}
            <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
          </a>
        ) : (
          <Link
            href={href}
            className={`inline-flex items-center gap-2 text-sm font-bold ${accentColor} transition-colors hover:brightness-110 group/link`}
          >
            {linkText}
            <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
          </Link>
        )}
      </div>
    </motion.div>
  );
}
