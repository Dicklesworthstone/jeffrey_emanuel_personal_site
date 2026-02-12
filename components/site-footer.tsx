"use client";

import { Github, Twitter, Mail, Linkedin, ArrowUp } from "lucide-react";
import Link from "next/link";
import { siteConfig, navItems } from "@/lib/content";
import { useState, useEffect } from "react";
import Magnetic from "@/components/magnetic";

const socialLinks = [
  { href: `mailto:${siteConfig.email}`, icon: Mail, label: "Email" },
  { href: siteConfig.social.github, icon: Github, label: "GitHub" },
  { href: siteConfig.social.x, icon: Twitter, label: "X" },
  { href: siteConfig.social.linkedin, icon: Linkedin, label: "LinkedIn" },
];

export default function SiteFooter() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Hydration-safe: server renders null, client sets real year
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer
      className="relative mt-16 md:mt-24 lg:mt-32"
      role="contentinfo"
      aria-label="Site footer"
    >
      {/* Gradient divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-sky-500/20 to-transparent" aria-hidden="true" />

      {/* Ambient glow */}
      <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.04),transparent_70%)] pointer-events-none" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        {/* Desktop: 3-column layout */}
        <div className="hidden lg:grid lg:grid-cols-3 lg:gap-12">
          {/* Column 1: Brand & copyright */}
          <div className="space-y-3">
            <p className="text-lg font-bold tracking-tight text-slate-100">
              {siteConfig.name}
            </p>
            <p className="text-sm leading-relaxed text-slate-500">
              Building durable infrastructure for the agentic future.
              <br />
              &copy; {year || 2026} Jeffrey Emanuel. All rights reserved.
            </p>
          </div>

          {/* Column 2: Site map (2 sub-columns) */}
          <nav aria-label="Footer navigation" className="grid grid-cols-2 gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-slate-500 transition-colors hover:text-slate-200"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Column 3: Social + back-to-top */}
          <div className="flex flex-col items-end gap-6">
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <Magnetic key={social.label} strength={0.2}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="group relative flex h-10 w-10 items-center justify-center rounded-full border border-white/5 bg-white/5 text-slate-400 transition-all hover:border-white/10 hover:bg-white/10 hover:text-white hover:scale-110"
                    aria-label={social.label}
                  >
                    <social.icon className="h-4 w-4 transition-transform group-hover:rotate-12" aria-hidden="true" />
                  </a>
                </Magnetic>
              ))}
            </div>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 transition-colors hover:text-slate-300"
              aria-label="Back to top"
            >
              Back to top
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Mobile layout: stacked */}
        <div className="flex flex-col gap-10 lg:hidden">
          {/* Brand */}
          <div className="space-y-2">
            <p className="text-lg font-bold tracking-tight text-slate-100">
              {siteConfig.name}
            </p>
            <p className="text-sm leading-relaxed text-slate-500">
              Building durable infrastructure for the agentic future.
            </p>
          </div>

          {/* Site map - 2-column grid */}
          <nav aria-label="Footer navigation" className="grid grid-cols-2 gap-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-slate-500 transition-colors hover:text-slate-200"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Social icons with text labels */}
          <div className="flex items-center gap-5">
            {socialLinks.map((social) => (
              <Magnetic key={social.label} strength={0.15}>
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="group flex flex-col items-center gap-1.5"
                  aria-label={social.label}
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/5 bg-white/5 text-slate-400 transition-all active:ring-2 active:ring-sky-500/30 group-hover:border-white/10 group-hover:bg-white/10 group-hover:text-white">
                    <social.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:hidden">
                    {social.label}
                  </span>
                </a>
              </Magnetic>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-xs text-slate-600">
            &copy; {year || 2026} Jeffrey Emanuel. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
