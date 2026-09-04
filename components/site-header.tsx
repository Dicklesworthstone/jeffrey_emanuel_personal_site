"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence, useReducedMotion, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, X, Sparkles, Search } from "lucide-react";
import { useState, useEffect, useRef, useSyncExternalStore } from "react";
// Root-layout chrome: import from the small site-config module, not lib/content,
// so every route doesn't ship the full content chunk (see lib/site-config.ts).
import { navItems, siteConfig } from "@/lib/site-config";
import { useHapticFeedback } from "@/hooks/use-haptic-feedback";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";
import { cn } from "@/lib/utils";
import { NOISE_SVG_DATA_URI } from "@/lib/constants";
import NavItem from "@/components/nav-item";
import Magnetic from "@/components/magnetic";
import { HapticLink } from "@/components/haptic-link";
import ThemeToggle from "@/components/theme-toggle";

// The static brand icon (the pre-3D Sparkles tile). It is what the server
// renders, the dynamic loader's placeholder, and the permanent icon on touch
// and reduced-motion devices — one definition, deliberately identical to
// header-icon-3d's private StaticFallback, so it lives here without importing
// that module (which pulls three.js in at its top level).
export function StaticHeaderIcon() {
  return (
    <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 via-violet-500 to-emerald-400 shadow-lg shadow-sky-500/20">
      <Sparkles className="h-5 w-5 text-white" />
      <div className="absolute inset-0 rounded-xl bg-white/20 mix-blend-overlay" />
    </div>
  );
}

// Dynamically import 3D header icon to avoid SSR issues
const HeaderIcon3D = dynamic(() => import("@/components/header-icon-3d"), {
  ssr: false,
  loading: () => <StaticHeaderIcon />,
});

// "Use the static icon" as an external store over the two media queries on
// which header-icon-3d bails out to its fallback anyway. Deciding here, before
// <HeaderIcon3D /> is ever rendered, is what keeps the three.js chunk (~155 KB
// raw) off phones: next/dynamic only requests its chunk once the lazy
// component renders, and React client-renders an `ssr: false` boundary
// during the hydration pass itself, so the server snapshot must already say
// "static" (true) — the server always rendered the static icon. Fine-pointer
// clients see the snapshot differ right after hydration and re-render once
// into the 3D icon, as before; header-icon-3d keeps its WebGL probe and its
// own identical bail-outs.
const STATIC_ICON_QUERIES = ["(pointer: coarse)", "(prefers-reduced-motion: reduce)"];
function subscribeStaticIconPreference(onChange: () => void) {
  const lists = STATIC_ICON_QUERIES.map((query) => window.matchMedia(query));
  lists.forEach((mq) => mq.addEventListener?.("change", onChange));
  return () => lists.forEach((mq) => mq.removeEventListener?.("change", onChange));
}
function getStaticIconPreferenceSnapshot() {
  return STATIC_ICON_QUERIES.some((query) => window.matchMedia(query).matches);
}
function getStaticIconServerSnapshot() {
  return true;
}

interface SiteHeaderProps {
  onOpenCommandPalette?: () => void;
}

export default function SiteHeader({ onOpenCommandPalette }: SiteHeaderProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // Initialize with Mac default to match SSR, update after hydration
  const [shortcutModifier, setShortcutModifier] = useState<"Cmd" | "Ctrl">("Cmd");
  const { lightTap } = useHapticFeedback();
  const prefersReducedMotion = useReducedMotion();
  // Touch / reduced-motion visitors get the static icon without ever
  // rendering (and therefore downloading) the 3D module.
  const wantsStaticIcon = useSyncExternalStore(
    subscribeStaticIconPreference,
    getStaticIconPreferenceSnapshot,
    getStaticIconServerSnapshot
  );
  const resolvedPath = pathname ?? "";
  const shortcutDisplayKey = shortcutModifier === "Cmd" ? "⌘" : "Ctrl+";
  const shortcutAriaLabel = `Search site (${shortcutModifier}+K)`;

  const { scrollY } = useScroll();

  // One coarse boolean drives the compact/expanded header through CSS
  // transitions. The previous five scroll-driven springs re-laid-out the
  // header (padding) and re-rasterised a viewport-wide backdrop blur at a
  // changing radius on every frame for a 4px/1% visual delta.
  const [scrolled, setScrolled] = useState(false);
  useMotionValueEvent(scrollY, "change", (v) => {
    const next = v > 40;
    setScrolled((prev) => (prev === next ? prev : next));
  });

  // Detect OS for meta key - must run after hydration to avoid mismatch
  useEffect(() => {
    const isMac = typeof navigator !== "undefined" && 
      (/Mac|iPod|iPhone|iPad/.test(navigator.platform) || 
       /Macintosh|Mac OS X/i.test(navigator.userAgent));
    
    if (!isMac) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Required for SSR hydration safety
      setShortcutModifier("Ctrl");
    }
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return resolvedPath === "/";
    return resolvedPath.startsWith(href);
  };

  // Lock body scroll when menu is open
  useBodyScrollLock(open);

  const menuRef = useRef<HTMLDivElement>(null);
  const menuToggleRef = useRef<HTMLButtonElement>(null);

  // Modal semantics for the mobile menu: Escape closes, Tab cycles within,
  // and focus returns to the toggle after dismissal.
  useEffect(() => {
    if (!open) return;

    const menu = menuRef.current;
    const toggle = menuToggleRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const focusables = () =>
      Array.from(
        menu?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ) ?? []
      );

    focusables()[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !menu?.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !menu?.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      (toggle ?? previouslyFocused)?.focus();
    };
  }, [open]);

  return (
    <>
      <header
        data-scrolled={scrolled ? "true" : "false"}
        className={cn(
          "fixed top-0 left-0 right-0 z-[90] border-b transition-[padding,background-color,border-color] duration-300 ease-out",
          // The viewport-wide blur is re-sampled on every scroll frame; the bar
          // is 98%+ opaque anyway, so touch devices get the flat tint instead.
          "pointer-fine:backdrop-blur-[22px] pointer-fine:backdrop-saturate-125",
          scrolled ? "border-white/30 bg-slate-950/[0.995]" : "border-white/[0.22] bg-slate-950/[0.985]"
        )}
        style={{
          paddingTop: `calc(${scrolled ? 8 : 12}px + env(safe-area-inset-top, 0px))`,
          paddingBottom: scrolled ? 8 : 12,
          boxShadow: "0 12px 36px -26px rgba(2, 6, 23, 0.95)",
          paddingRight: "var(--scrollbar-width, 0px)",
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Magnetic strength={0.1}>
            <Link
              href="/"
              className="group flex items-center gap-3"
              onClick={() => setOpen(false)}
            >
              <div className="transition-transform group-hover:scale-105">
                {wantsStaticIcon ? <StaticHeaderIcon /> : <HeaderIcon3D />}
              </div>
              <div className="flex flex-col leading-none">
                {siteConfig.location && (
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400 transition-colors group-hover:text-sky-400 light:group-hover:text-sky-600">
                    {siteConfig.location.split(",")[0]}
                  </span>
                )}
                <span className="mt-0.5 whitespace-nowrap text-lg font-bold tracking-tight text-slate-100">
                  {siteConfig.name}
                </span>
              </div>
            </Link>
          </Magnetic>

          {/* Desktop Nav.
              Budget: the container is max-w-7xl (1280px) minus 2x32px padding
              = 1216px of content, and the brand block occupies ~186px of it.
              Eight items + search + theme toggle + CTA need ~980px at
              gap-4/px-3, so the full bar only fits from 1280px up (xl).
              Tablet-landscape and small laptops (lg, 1024-1279px) get a
              compact tier instead of the phone drawer: gap-2, px-2 pills, no
              kbd hint, and no CTA (Contact is already a nav item). That is
              ~745px of a ~774px budget at 1024px — measured, not guessed. */}
          <nav
            className="hidden items-center gap-2 lg:flex xl:gap-4"
            aria-label="Main navigation"
          >
            {navItems.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                label={item.label}
                active={isActive(item.href)}
                prefersReducedMotion={prefersReducedMotion ?? false}
              />
            ))}

            {/* Search Button */}
            <button
              type="button"
              onClick={onOpenCommandPalette}
              className="group flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-sm font-medium text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
              aria-label={shortcutAriaLabel}
            >
              <Search className="h-4 w-4" />
              <span className="hidden 2xl:inline">Search</span>
              <kbd
                className="hidden rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 text-xs font-bold text-slate-300 xl:inline-block"
                suppressHydrationWarning
              >
                {shortcutDisplayKey}K
              </kbd>
            </button>

            {/* Theme Toggle (Light / Dark) */}
            <ThemeToggle variant="compact" />

            <Magnetic strength={0.15}>
              <HapticLink
                href="/contact"
                className="ml-1 hidden shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-4 2xl:px-5 py-2 text-sm font-semibold text-white backdrop-blur-md transition-[background-color,transform] hover:bg-white/10 hover:scale-105 active:scale-95 xl:inline-flex"
              >
                Let&apos;s talk
              </HapticLink>
            </Magnetic>
          </nav>

          {/* Mobile Menu Toggle, Theme Toggle & Search — mirrors the desktop
              nav's lg gate. The links collapse into the full-screen menu below
              lg, but the primary CTA stays in the bar from md up (it fits with
              ~250px to spare at 768px), so tablet-portrait visitors don't have
              to open a menu to find it. Phones keep theme toggle, search and
              menu toggle only. */}
          <div className="flex items-center gap-2.5 sm:gap-3 lg:hidden">
            {!open && (
              <HapticLink
                href="/contact"
                className="hidden md:inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/10"
              >
                Let&apos;s talk
              </HapticLink>
            )}

            <ThemeToggle variant="compact" />

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onOpenCommandPalette?.();
              }}
              className="flex h-11 w-11 items-center justify-center text-slate-400 hover:text-white"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              type="button"
              ref={menuToggleRef}
              className="relative z-[95] inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition-transform active:scale-95"
              onClick={() => setOpen((v) => !v)}
              onTouchStart={lightTap}
              aria-label={open ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={open}
            >
               {/* Simple crossfade to avoid animation glitches */}
              <span className="relative h-5 w-5">
                <X
                  className={cn(
                    "absolute inset-0 h-5 w-5 transition-opacity duration-200",
                    open ? "opacity-100" : "opacity-0"
                  )}
                />
                <Menu
                  className={cn(
                    "absolute inset-0 h-5 w-5 transition-opacity duration-200",
                    open ? "opacity-0" : "opacity-100"
                  )}
                />
              </span>
          </button>
        </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={menuRef}
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3, ease: "easeOut" }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[70] flex flex-col bg-slate-950/98 backdrop-blur-lg xl:hidden overflow-y-auto will-change-[opacity]"
            style={{ transform: "translateZ(0)" }}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
          >
            {/* Background Noise */}
            <div className="absolute inset-0 pointer-events-none opacity-20" 
                 style={{ backgroundImage: `url("${NOISE_SVG_DATA_URI}")` }} 
            />

            {/* The header's own toggle (z-95, crossfaded to an X) stays on top of
                this overlay and closes it for pointer users — a second close
                button at the same pixels was unreachable by touch and stole
                initial focus. It sits outside this dialog subtree, though, so
                aria-modal hides it from assistive tech: the "Close menu" button
                at the foot of the list is the in-dialog close control. */}
            {/* Phones keep the full-bleed column. From sm up the menu is
                constrained and centred so tablet widths get a deliberate
                composition instead of a phone layout stretched across 800px
                with two-thirds of the overlay empty. */}
            <nav
              className="relative flex flex-1 flex-col justify-center px-8 sm:mx-auto sm:w-full sm:max-w-md"
              onClick={(event) => event.stopPropagation()}
            >
              <motion.div
                className="flex flex-col gap-8"
                initial="hidden"
                animate="visible"
                variants={prefersReducedMotion ? undefined : {
                  hidden: { opacity: 1 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
                  },
                }}
              >
                {navItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <motion.div
                      key={item.href}
                      variants={prefersReducedMotion ? undefined : {
                        hidden: { opacity: 0, x: -20 },
                        visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.33, 1, 0.68, 1] } },
                      }}
                    >
                      <HapticLink
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "text-4xl font-bold tracking-tight transition-colors",
                          active ? "text-white" : "text-slate-500 active:text-slate-300"
                        )}
                        onClick={() => setOpen(false)}
                      >
                        {item.label}
                      </HapticLink>
                    </motion.div>
                  );
                })}
              </motion.div>

              <motion.div
                className="mt-12 flex flex-col gap-4"
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3, ease: [0.33, 1, 0.68, 1], delay: 0.1 + navItems.length * 0.06 }}
              >
                <ThemeToggle variant="labeled" />

                <Link
                  href="/contact"
                  className="flex w-full items-center justify-center rounded-full bg-white py-4 text-lg font-bold text-slate-950 shadow-lg shadow-white/10 transition-transform active:scale-95"
                  onClick={() => setOpen(false)}
                >
                  Get in touch
                </Link>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="mx-auto inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold text-slate-400 transition-colors hover:text-white"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                  Close menu
                </button>
              </motion.div>
            </nav>

            {/* Footer info in menu */}
            {siteConfig.location && (
              <div className="relative p-8 text-xs font-medium uppercase tracking-widest text-slate-500">
                {siteConfig.location}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
