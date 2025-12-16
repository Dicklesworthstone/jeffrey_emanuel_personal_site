"use client";

import { motion, useReducedMotion } from "framer-motion";
import WritingCard from "@/components/writing-card";
import { Sparkles, BookOpen } from "lucide-react";
import type { WritingItem } from "@/lib/content";

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

interface WritingGridProps {
  featured: WritingItem[];
  archive: WritingItem[];
}

export default function WritingGrid({ featured, archive }: WritingGridProps) {
  const prefersReducedMotion = useReducedMotion();
  const item = prefersReducedMotion ? reducedItemVariants : itemVariants;

  return (
    <>
      {/* Featured Section */}
      {featured.length > 0 && (
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
      )}

      {/* Archive Grid */}
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
          {archive.map((post) => (
            <motion.div key={post.title} variants={item} className="h-full">
              <WritingCard item={post} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </>
  );
}
