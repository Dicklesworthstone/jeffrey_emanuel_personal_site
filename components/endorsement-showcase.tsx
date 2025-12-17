"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  EndorsementCard,
  type EndorsementCardProps,
} from "@/components/endorsement-card";
import {
  endorsements,
  getFeaturedEndorsements,
  type Endorsement,
} from "@/lib/content";

// Convert Endorsement data to EndorsementCardProps
function toCardProps(e: Endorsement): EndorsementCardProps {
  return {
    quote: e.quote,
    author: e.author.name,
    authorTitle: e.author.title,
    authorCompany: e.author.company,
    authorAvatar: e.author.avatar,
    source: e.source.type,
    sourceUrl: e.source.url,
    date: e.date,
  };
}

// Layout options for the showcase
type ShowcaseLayout = "grid" | "carousel" | "featured";

interface EndorsementShowcaseProps {
  /** Layout style - grid shows all, carousel is swipeable, featured highlights one */
  layout?: ShowcaseLayout;
  /** Filter to specific tags (e.g., ["nvidia"]) */
  filterTags?: string[];
  /** Show tag filter UI */
  showFilters?: boolean;
  /** Maximum items to show (0 = all) */
  maxItems?: number;
  /** Show only featured endorsements */
  featuredOnly?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Heading text */
  heading?: string;
  /** Subheading text */
  subheading?: string;
}

export function EndorsementShowcase({
  layout = "featured",
  filterTags,
  showFilters = false,
  maxItems = 0,
  featuredOnly = false,
  className,
  heading = "What People Are Saying",
  subheading,
}: EndorsementShowcaseProps) {
  const prefersReducedMotion = useReducedMotion();
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Get all unique tags for filtering
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    endorsements.forEach((e) => e.tags.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  }, []);

  // Filter endorsements based on props and active filter
  const filteredEndorsements = useMemo(() => {
    let items = featuredOnly ? getFeaturedEndorsements() : [...endorsements];

    // Apply tag filter from props
    if (filterTags && filterTags.length > 0) {
      items = items.filter((e) =>
        filterTags.some((tag) => e.tags.includes(tag))
      );
    }

    // Apply active UI filter
    if (activeTag) {
      items = items.filter((e) => e.tags.includes(activeTag));
    }

    // Apply max items limit
    if (maxItems > 0) {
      items = items.slice(0, maxItems);
    }

    return items;
  }, [featuredOnly, filterTags, activeTag, maxItems]);

  // Separate featured item from others for "featured" layout
  const featuredItem = useMemo(() => {
    return filteredEndorsements.find((e) => e.featured) || filteredEndorsements[0];
  }, [filteredEndorsements]);

  const otherItems = useMemo(() => {
    if (!featuredItem) return filteredEndorsements;
    return filteredEndorsements.filter((e) => e.id !== featuredItem.id);
  }, [filteredEndorsements, featuredItem]);

  // Compute safe carousel index that's always within bounds
  // This handles the case where filters shrink the array while carouselIndex is high
  const safeCarouselIndex = useMemo(() => {
    if (layout === "carousel") {
      // For carousel layout, clamp to filteredEndorsements length
      if (filteredEndorsements.length === 0) return 0;
      return Math.min(carouselIndex, filteredEndorsements.length - 1);
    }
    // For featured layout, clamp to otherItems length
    if (otherItems.length === 0) return 0;
    return Math.min(carouselIndex, otherItems.length - 1);
  }, [layout, carouselIndex, filteredEndorsements.length, otherItems.length]);

  // Carousel navigation
  const canGoPrev = safeCarouselIndex > 0;
  const canGoNext = safeCarouselIndex < otherItems.length - 1;

  const goToPrev = useCallback(() => {
    if (canGoPrev) {
      setCarouselIndex((i) => i - 1);
    }
  }, [canGoPrev]);

  const goToNext = useCallback(() => {
    if (canGoNext) {
      setCarouselIndex((i) => i + 1);
    }
  }, [canGoNext]);

  // Keyboard navigation for carousel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (layout !== "carousel" && layout !== "featured") return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goToNext();
      }
    };

    const container = carouselRef.current;
    if (!container) return;

    container.addEventListener("keydown", handleKeyDown);
    return () => container.removeEventListener("keydown", handleKeyDown);
  }, [layout, goToPrev, goToNext]);

  // Touch/swipe support
  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX.current === null) return;

      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartX.current - touchEndX;

      // Require minimum swipe distance
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          goToNext();
        } else {
          goToPrev();
        }
      }

      touchStartX.current = null;
    },
    [goToNext, goToPrev]
  );

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: prefersReducedMotion ? 0 : 0.4 },
    },
  };

  // Render tag filter buttons
  const renderFilters = () => {
    if (!showFilters) return null;

    return (
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-slate-500" aria-hidden="true" />
        <button
          onClick={() => setActiveTag(null)}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition-colors",
            activeTag === null
              ? "bg-sky-500/20 text-sky-300"
              : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300"
          )}
          aria-pressed={activeTag === null}
        >
          All
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors",
              activeTag === tag
                ? "bg-sky-500/20 text-sky-300"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300"
            )}
            aria-pressed={activeTag === tag}
          >
            {tag}
          </button>
        ))}
      </div>
    );
  };

  // Render carousel navigation
  const renderCarouselNav = () => {
    if (otherItems.length <= 1) return null;

    return (
      <div className="mt-4 flex items-center justify-center gap-4">
        <button
          onClick={goToPrev}
          disabled={!canGoPrev}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-800/50 transition-all",
            canGoPrev
              ? "text-slate-300 hover:border-slate-600 hover:bg-slate-700"
              : "cursor-not-allowed text-slate-600"
          )}
          aria-label="Previous endorsement"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Dots indicator */}
        <div className="flex gap-2" role="tablist" aria-label="Endorsement navigation">
          {otherItems.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCarouselIndex(idx)}
              className={cn(
                "h-2 w-2 rounded-full transition-all",
                idx === safeCarouselIndex
                  ? "w-6 bg-sky-400"
                  : "bg-slate-600 hover:bg-slate-500"
              )}
              role="tab"
              aria-selected={idx === safeCarouselIndex}
              aria-label={`Go to endorsement ${idx + 1}`}
            />
          ))}
        </div>

        <button
          onClick={goToNext}
          disabled={!canGoNext}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-800/50 transition-all",
            canGoNext
              ? "text-slate-300 hover:border-slate-600 hover:bg-slate-700"
              : "cursor-not-allowed text-slate-600"
          )}
          aria-label="Next endorsement"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    );
  };

  // Empty state
  if (filteredEndorsements.length === 0) {
    return (
      <div className={cn("py-12 text-center", className)}>
        <p className="text-slate-500">No endorsements found for the selected filter.</p>
        {activeTag && (
          <button
            onClick={() => setActiveTag(null)}
            className="mt-2 text-sm text-sky-400 hover:text-sky-300"
          >
            Clear filter
          </button>
        )}
      </div>
    );
  }

  // Grid layout - show all in responsive grid
  if (layout === "grid") {
    return (
      <section className={cn("", className)} aria-label="Endorsements">
        {(heading || subheading) && (
          <div className="mb-8 text-center">
            {heading && (
              <h2 className="text-2xl font-bold text-slate-100 md:text-3xl">
                {heading}
              </h2>
            )}
            {subheading && (
              <p className="mt-2 text-slate-400">{subheading}</p>
            )}
          </div>
        )}

        {renderFilters()}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {filteredEndorsements.map((endorsement) => (
              <motion.div
                key={endorsement.id}
                variants={itemVariants}
                layout={!prefersReducedMotion}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <EndorsementCard
                  {...toCardProps(endorsement)}
                  highlight={endorsement.featured}
                  variant={endorsement.featured ? "standard" : "compact"}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </section>
    );
  }

  // Carousel layout - single item visible with navigation
  if (layout === "carousel") {
    const currentItem = filteredEndorsements[safeCarouselIndex];

    return (
      <section className={cn("", className)} aria-label="Endorsements carousel">
        {(heading || subheading) && (
          <div className="mb-8 text-center">
            {heading && (
              <h2 className="text-2xl font-bold text-slate-100 md:text-3xl">
                {heading}
              </h2>
            )}
            {subheading && (
              <p className="mt-2 text-slate-400">{subheading}</p>
            )}
          </div>
        )}

        {renderFilters()}

        <div
          ref={carouselRef}
          className="relative overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          tabIndex={0}
          role="region"
          aria-label="Endorsements carousel"
        >
          <AnimatePresence mode="wait">
            {currentItem && (
              <motion.div
                key={currentItem.id}
                initial={{ opacity: 0, x: prefersReducedMotion ? 0 : 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: prefersReducedMotion ? 0 : -50 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
                className="mx-auto max-w-2xl"
              >
                <EndorsementCard
                  {...toCardProps(currentItem)}
                  variant="featured"
                  highlight={currentItem.featured}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {filteredEndorsements.length > 1 && (
          <div className="mt-4 flex items-center justify-center gap-4">
            <button
              onClick={() =>
                setCarouselIndex((i) =>
                  i === 0 ? filteredEndorsements.length - 1 : i - 1
                )
              }
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-800/50 text-slate-300 transition-all hover:border-slate-600 hover:bg-slate-700"
              aria-label="Previous endorsement"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex gap-2" role="tablist">
              {filteredEndorsements.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCarouselIndex(idx)}
                  className={cn(
                    "h-2 w-2 rounded-full transition-all",
                    idx === safeCarouselIndex
                      ? "w-6 bg-sky-400"
                      : "bg-slate-600 hover:bg-slate-500"
                  )}
                  role="tab"
                  aria-selected={idx === safeCarouselIndex}
                  aria-label={`Go to endorsement ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() =>
                setCarouselIndex((i) =>
                  i === filteredEndorsements.length - 1 ? 0 : i + 1
                )
              }
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-800/50 text-slate-300 transition-all hover:border-slate-600 hover:bg-slate-700"
              aria-label="Next endorsement"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </section>
    );
  }

  // Featured layout (default) - prominent featured item with carousel of others below
  return (
    <section className={cn("", className)} aria-label="Endorsements">
      {(heading || subheading) && (
        <div className="mb-8 text-center">
          {heading && (
            <h2 className="text-2xl font-bold text-slate-100 md:text-3xl">
              {heading}
            </h2>
          )}
          {subheading && (
            <p className="mt-2 text-slate-400">{subheading}</p>
          )}
        </div>
      )}

      {renderFilters()}

      {/* Featured endorsement */}
      {featuredItem && (
        <motion.div
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
          className="mb-8"
        >
          <EndorsementCard
            {...toCardProps(featuredItem)}
            variant="featured"
            highlight
          />
        </motion.div>
      )}

      {/* Other endorsements in carousel */}
      {otherItems.length > 0 && (
        <div
          ref={carouselRef}
          className="relative"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          tabIndex={0}
          role="region"
          aria-label="More endorsements"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              More Endorsements
            </h3>
            <span className="text-xs text-slate-600">
              {safeCarouselIndex + 1} of {otherItems.length}
            </span>
          </div>

          <AnimatePresence mode="wait">
            {otherItems[safeCarouselIndex] && (
              <motion.div
                key={otherItems[safeCarouselIndex].id}
                initial={{ opacity: 0, x: prefersReducedMotion ? 0 : 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: prefersReducedMotion ? 0 : -30 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.25 }}
              >
                <EndorsementCard
                  {...toCardProps(otherItems[safeCarouselIndex])}
                  variant="standard"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {renderCarouselNav()}
        </div>
      )}
    </section>
  );
}

export default EndorsementShowcase;
