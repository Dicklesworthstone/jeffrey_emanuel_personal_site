"use client";

import SectionShell from "@/components/section-shell";
import { siteConfig } from "@/lib/content";
import { Mail, MessageCircle } from "lucide-react";
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
            <div className="space-y-4 text-sm text-slate-300">
              <p>
                When you reach out, a concise note with context is helpful: who
                you are, what you’re working on, and how you think I might be
                useful. Bullet points are welcome.
              </p>
              <p>
                For funds and allocators, including a short description of mandate
                and current AI exposure makes the initial conversation much more
                productive.
              </p>
              <div className="mt-4 rounded-2xl border border-slate-800/80 bg-slate-950/80 p-4 text-sm">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Primary contact
                </p>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-sky-300 hover:text-sky-200"
                >
                  <Mail className="h-4 w-4" />
                  {siteConfig.email}
                </a>
                <p className="mt-2 text-xs text-slate-400">
                  Please avoid sending sensitive or confidential information in
                  the first email.
                </p>
              </div>
            </div>

            {/* Newsletter Section added here */}
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
              <ul className="mt-3 space-y-2 text-sm">
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
