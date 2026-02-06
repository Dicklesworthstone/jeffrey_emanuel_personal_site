"use client";

import SectionShell from "@/components/section-shell";
import { siteConfig } from "@/lib/content";
import { Mail, MessageCircle, Github, Linkedin } from "lucide-react";
import NewsletterSignup from "@/components/newsletter-signup";

export default function ContactPage() {
  return (
    <>
      <SectionShell
        id="contact"
        iconNode={<Mail className="h-5 w-5" />}
        eyebrow="Contact"
        title="Get in touch"
        kicker="For consulting, collaborations, or media, email is best. I read everything, though my response time depends on what I'm building that week."
        headingLevel={1}
      >
        <div className="grid gap-8 md:grid-cols-[2fr,1fr]">
          <div className="space-y-8">
            <div className="prose text-sm text-slate-300">
              <p>
                When you reach out, a concise note with context is helpful: who
                you are, what you&apos;re working on, and how you think I might be
                useful. Bullet points are welcome.
              </p>
              <p>
                For funds and allocators, including a short description of mandate
                and current AI exposure makes the initial conversation much more
                productive.
              </p>
            </div>

            {/* Primary contact card with gradient border */}
            <div className="relative rounded-2xl p-px bg-gradient-to-br from-sky-500/30 via-violet-500/20 to-sky-500/30">
              <div className="rounded-2xl bg-slate-950/90 p-6 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Primary contact
                </p>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="mt-3 inline-flex items-center gap-3 text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-violet-400 hover:from-sky-300 hover:to-violet-300 transition-all md:text-xl"
                >
                  <Mail className="h-5 w-5 text-sky-400 shrink-0" />
                  <span>{siteConfig.email}</span>
                </a>
                <p className="mt-3 text-xs text-slate-400">
                  Please avoid sending sensitive or confidential information in
                  the first email.
                </p>
                {/* Mobile: prominent tappable button */}
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-sky-500/10 py-3 text-sm font-bold text-sky-300 ring-1 ring-sky-500/30 transition-all active:scale-95 active:ring-sky-500/50 hover:bg-sky-500/20 md:hidden"
                >
                  <Mail className="h-4 w-4" />
                  Send an email
                </a>
              </div>
            </div>

            {/* Newsletter Section */}
            <div className="rounded-2xl border border-slate-800/80 bg-slate-950/50 p-1">
              <NewsletterSignup
                compact
                heading="Or just follow along"
                description="Get notified about new essays and tools."
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-4 text-sm text-slate-300">
            <div className="rounded-2xl border border-slate-800/80 bg-slate-950/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Social
              </p>
              {/* Mobile: horizontal icon row; Desktop: vertical list */}
              <div className="mt-3 flex gap-3 md:hidden">
                {[
                  { href: siteConfig.social.x, icon: MessageCircle, label: "X" },
                  { href: siteConfig.social.github, icon: Github, label: "GitHub" },
                  { href: siteConfig.social.linkedin, icon: Linkedin, label: "LinkedIn" },
                ].map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/5 bg-white/5 text-sky-300 transition-all active:ring-2 active:ring-sky-500/30 hover:bg-white/10"
                    aria-label={s.label}
                  >
                    <s.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
              <ul className="mt-3 hidden space-y-2 text-sm md:block">
                <li>
                  <a
                    href={siteConfig.social.x}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-2 text-sky-300 hover:text-sky-200"
                  >
                    <MessageCircle className="h-4 w-4" />
                    X / @doodlestein
                  </a>
                </li>
                <li>
                  <a
                    href={siteConfig.social.github}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-2 text-sky-300 hover:text-sky-200"
                  >
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    GitHub – Dicklesworthstone
                  </a>
                </li>
                <li>
                  <a
                    href={siteConfig.social.linkedin}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-2 text-sky-300 hover:text-sky-200"
                  >
                    <span className="h-2 w-2 rounded-full bg-sky-400" />
                    LinkedIn – Jeffrey Emanuel
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </SectionShell>
    </>
  );
}
