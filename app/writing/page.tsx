"use client";

import { motion } from "framer-motion";
import SectionShell from "@/components/section-shell";
import WritingCard from "@/components/writing-card";
import { writingHighlights } from "@/lib/content";
import { PenSquare, Sparkles, BookOpen } from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function WritingPage() {
  // Separate featured items from the rest
  const featured = writingHighlights.filter((w) => w.featured);
  const standard = writingHighlights.filter((w) => !w.featured);

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <SectionShell
        id="writing-main"
        icon={PenSquare}
        eyebrow="The Library"
        title="Essays, research notes, and deep dives"
        kicker="I write to think. This is a collection of my technical essays on AI architecture, market mechanics, and software engineering. No fluff, just density."
      >
        
        {/* Featured Section */}
        <div className="mb-16">
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
        </div>

        {/* Standard Grid */}
        <motion.div variants={item}>
          <div className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
            <BookOpen className="h-4 w-4 text-slate-500" />
            <span>Archive</span>
          </div>
          
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {standard.map((post) => (
              <motion.div key={post.title} variants={item} className="h-full">
                <WritingCard item={post} />
              </motion.div>
            ))}
          </div>
        </motion.div>

      </SectionShell>
    </motion.div>
  );
}