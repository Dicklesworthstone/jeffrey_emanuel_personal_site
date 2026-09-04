import type { LucideIcon } from "lucide-react";
import { RevealOnView } from "@/components/animated-grid";
import { cn } from "@/lib/utils";

/*
  Section header ladder. SectionShell below is the canonical eyebrow / icon /
  title / kicker stack; pages that need a piece of it outside a SectionShell
  (a feature banner's eyebrow, a sub-section heading inside a section) use the
  two small components exported here instead of hand-rolling the classes, so
  the sizes and colours stay on one ladder:

    Eyebrow          text-xs bold uppercase tracking-widest, sky (default) or violet
    SectionShell h   clamp(1.875rem, 5vw, 3.75rem)   page / section title
    SectionSubhead   text-xl sm:text-2xl              sub-section heading
*/
const EYEBROW_BASE_CLASSES = "text-xs font-bold uppercase tracking-widest";
const EYEBROW_SKY_CLASSES = "text-sky-400/90 shadow-sky-500/20 drop-shadow-sm";
const EYEBROW_VIOLET_CLASSES = "text-violet-400";

type EyebrowProps = {
  children: React.ReactNode;
  className?: string;
  color?: "sky" | "violet";
};

export function Eyebrow({ children, className, color = "sky" }: EyebrowProps) {
  return (
    <span
      className={cn(
        EYEBROW_BASE_CLASSES,
        color === "sky" ? EYEBROW_SKY_CLASSES : EYEBROW_VIOLET_CLASSES,
        className
      )}
    >
      {children}
    </span>
  );
}

type SectionSubheadProps = {
  children: React.ReactNode;
  className?: string;
  as?: "h2" | "h3" | "h4";
  id?: string;
};

export function SectionSubhead({ children, className, as: Tag = "h2", id }: SectionSubheadProps) {
  return (
    <Tag id={id} className={cn("text-xl font-bold tracking-tight text-white sm:text-2xl", className)}>
      {children}
    </Tag>
  );
}

type Props = {
  id?: string;
  icon?: LucideIcon;
  iconNode?: React.ReactNode;
  eyebrow?: string;
  title: string;
  kicker?: string;
  children: React.ReactNode;
  className?: string;
  /** Use headingLevel={1} for the first section on a page to ensure proper h1 hierarchy */
  headingLevel?: 1 | 2;
};

/*
  Server component. The entrance (slide up from a subtle offset once the
  section scrolls into view, icon glow) is CSS: the `[data-reveal]` rules in
  app/globals.css, keyed off the attribute RevealOnView writes after
  hydration. Content is NEVER hidden — the server markup is the settled
  state (the inline `opacity:1;transform:none` / base box-shadow below are
  exactly what the previous framer-motion wrappers emitted).
*/
export default function SectionShell({
  id,
  icon: Icon,
  iconNode,
  eyebrow,
  title,
  kicker,
  children,
  className,
  headingLevel = 2,
}: Props) {
  const HeadingTag = `h${headingLevel}` as const;

  // Generate a unique heading ID for aria-labelledby
  const headingId = id ? `${id}-heading` : undefined;

  return (
    <section
      data-section
      id={id}
      aria-labelledby={headingId}
      className={cn(
        // Sections stack on most pages; 176px+176px per section at lg produced
        // ~700px of dead space between blocks. Keep the rhythm, trim the excess.
        "relative mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-24 lg:px-8 lg:py-28",
        className
      )}
    >
      <RevealOnView observeParent className="relative z-10" style={{ opacity: 1, transform: "none" }}>
        <div className="mb-12 max-w-3xl md:mb-16">
          {eyebrow && (
            <div className="mb-6 flex items-center gap-3">
              <div className="h-px w-6 bg-gradient-to-r from-sky-500/80 to-transparent" />
              <p className={cn(EYEBROW_BASE_CLASSES, EYEBROW_SKY_CLASSES)}>
                {eyebrow}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-6">
            <div className="flex items-start gap-5 md:items-center">
              {(Icon || iconNode) && (
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/80 to-slate-800/50 text-sky-400 shadow-lg shadow-sky-900/10 backdrop-blur-sm"
                  aria-hidden="true"
                  style={{ boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                >
                  {iconNode || (Icon && <Icon className="h-5 w-5" />)}
                </div>
              )}
              <HeadingTag
                id={headingId}
                className="text-balance-pro font-bold leading-[1.1] tracking-tighter text-white"
                style={{ fontSize: "clamp(1.875rem, 5vw, 3.75rem)" }}
              >
                {title}
              </HeadingTag>
            </div>
            
            {kicker && (
              <p className="text-pretty-pro max-w-2xl text-lg font-normal leading-relaxed text-slate-400/90 md:ml-1 md:text-xl md:leading-relaxed">
                {kicker}
              </p>
            )}
          </div>
        </div>

        <div className="relative" style={{ opacity: 1, transform: "none" }}>
          {children}
        </div>
      </RevealOnView>
    </section>
  );
}
