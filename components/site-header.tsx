"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Menu, X, Sparkles } from "lucide-react";
import { useState } from "react";
import { navItems, siteConfig } from "@/lib/content";

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-900/80 bg-gradient-to-b from-slate-950/95 via-slate-950/80 to-slate-950/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 via-violet-500 to-emerald-400 shadow-lg shadow-slate-900/70">
            <Sparkles className="h-4 w-4 text-slate-50" />
            <div className="absolute inset-0 rounded-xl bg-white/10 mix-blend-soft-light" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-xs font-medium uppercase tracking-[0.25em] text-slate-400">
              {siteConfig.location}
            </span>
            <span className="text-sm font-semibold text-slate-50 sm:text-base">
              {siteConfig.name}
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-300 md:flex">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className="relative">
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-sky-500/18"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span
                  className={`relative px-3 py-1 transition-colors ${
                    active
                      ? "text-slate-50"
                      : "text-slate-300 hover:text-slate-100"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <Link
          href="/contact"
          className="inline-flex items-center justify-center rounded-lg border border-slate-700/80 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-100 shadow-sm shadow-slate-900/70 hover:border-slate-500 hover:bg-slate-900 md:text-sm"
        >
          Let&apos;s talk
        </Link>

        <button
          className="ml-3 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700/80 bg-slate-900/80 text-slate-200 hover:border-slate-500 hover:bg-slate-900 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle navigation"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-900/80 bg-slate-950/95 md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col px-4 py-3 text-sm">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-2 ${
                    active
                      ? "bg-slate-900 text-slate-50"
                      : "text-slate-300 hover:bg-slate-900 hover:text-slate-50"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
