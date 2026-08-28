import type { CSSProperties } from "react";
import WritingCard from "@/components/writing-card";
import { Sparkles, BookOpen } from "lucide-react";
import type { WritingItem } from "@/lib/content";

/**
 * Entrance animation is pure CSS (`@starting-style` + transition), so the
 * cards are fully visible in the server HTML and for browsers without
 * support; nothing is hidden waiting on JS. Only the first few cards animate
 * and the stagger is capped so a long grid never fades in for seconds.
 */
const ANIMATED_ITEM_LIMIT = 12;
const MAX_STAGGER_SECONDS = 0.08;
const MAX_TOTAL_STAGGER_SECONDS = 0.6;

const ENTRANCE_CLASS =
  "h-full motion-safe:transition-[opacity,translate] motion-safe:duration-500 motion-safe:ease-out motion-safe:starting:opacity-0 motion-safe:starting:translate-y-6";

function entranceProps(index: number, total: number): { className: string; style?: CSSProperties } {
  if (index >= ANIMATED_ITEM_LIMIT) return { className: "h-full" };
  const stagger = Math.min(MAX_STAGGER_SECONDS, MAX_TOTAL_STAGGER_SECONDS / Math.max(total, 1));
  return {
    className: ENTRANCE_CLASS,
    style: { transitionDelay: `${(index * stagger).toFixed(3)}s` },
  };
}

interface WritingGridProps {
  featured: WritingItem[];
  archive: WritingItem[];
}

export default function WritingGrid({ featured, archive }: WritingGridProps) {
  return (
    <>
      {/* Featured Section */}
      {featured.length > 0 && (
        <div className="mb-16">
          <div className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
            <Sparkles className="h-4 w-4 text-amber-400" aria-hidden="true" />
            <span>Featured Essays</span>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {featured.map((post, index) => {
              const entrance = entranceProps(index, featured.length);
              return (
                <div key={post.href} className={post.featured ? "md:col-span-2" : ""}>
                  <div className={entrance.className} style={entrance.style}>
                    <WritingCard item={post} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Archive Grid */}
      <div>
        <div className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
          <BookOpen className="h-4 w-4 text-slate-500" aria-hidden="true" />
          <span>Archive</span>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {archive.map((post, index) => {
            const entrance = entranceProps(index, archive.length);
            return (
              <div key={post.href} className={entrance.className} style={entrance.style}>
                <WritingCard item={post} />
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
