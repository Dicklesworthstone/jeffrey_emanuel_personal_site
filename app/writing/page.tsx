"use client";

import { motion, useReducedMotion } from "framer-motion";
import SectionShell from "@/components/section-shell";
import WritingCard from "@/components/writing-card";
import { writingHighlights } from "@/lib/content";
import { PenSquare, Sparkles, BookOpen } from "lucide-react";

// Scroll-triggered stagger container
const containerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

// Individual item animation
const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.21, 0.47, 0.32, 0.98],
    },
  },
};

// Reduced motion - instant, no animation
const reducedItemVariants = {
  hidden: { opacity: 1, y: 0 },
  visible: { opacity: 1, y: 0 },
};

export default function WritingPage() {
  const prefersReducedMotion = useReducedMotion();
  const item = prefersReducedMotion ? reducedItemVariants : itemVariants;

  // Separate featured items from the rest
  const featured = writingHighlights.filter((w) => w.featured);
  const standard = writingHighlights.filter((w) => !w.featured);

  return (
    <div>
      <SectionShell
        id="writing-main"
        icon={PenSquare}
        eyebrow="The Library"
        title="Essays, research notes, and deep dives"
        kicker="I write to think. This is a collection of my technical essays on AI architecture, market mechanics, and software engineering. No fluff, just density."
      >

        {/* Featured Section */}
        <motion.div
          className="mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <motion.div variants={item} className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>Featured Essays</span>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2">
            {featured.map((post) => (
              <motion.div key={post.title} variants={item} className={post.featured ? "md:col-span-2" : ""}>
                <WritingCard item={post} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Standard Grid - separate scroll trigger */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <motion.div variants={item} className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
            <BookOpen className="h-4 w-4 text-slate-500" />
            <span>Archive</span>
          </motion.div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {standard.map((post) => (
              <motion.div key={post.title} variants={item} className="h-full">
                <WritingCard item={post} />
              </motion.div>
            ))}
          </div>
        </motion.div>

      </SectionShell>
    </div>
  );
}