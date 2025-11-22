"use client";

import SectionShell from "@/components/section-shell";
import { writingHighlights } from "@/lib/content";
import { PenSquare } from "lucide-react";

export default function WritingPage() {
  const nvda = writingHighlights.find(
    (w) => w.title === "The Short Case for Nvidia Stock",
  );
  const others = writingHighlights.filter(
    (w) => w.title !== "The Short Case for Nvidia Stock",
  );

  return (
    <>
      <SectionShell
        id="writing-main"
        icon={PenSquare}
        eyebrow="Writing"
        title="Essays, blog posts, and GitHub-native research"
        kicker="I like to write in formats that reward patience: deep dives with a lot of structure and as few hand‑wavy claims as possible."
      >
        {nvda && (
            <a
              href={nvda.href}
              target="_blank"
              rel="noreferrer noopener"
              className="group flex flex-col rounded-2xl border border-sky-500/60 bg-gradient-to-br from-sky-950 via-slate-950 to-slate-950 p-5 shadow-[0_40px_120px_rgba(15,23,42,0.95)] transition hover:-translate-y-1"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">
              Featured • {nvda.source} • {nvda.category}
            </p>
            <h2 className="mt-2 text-lg font-semibold text-slate-50 group-hover:text-sky-100">
              {nvda.title}
            </h2>
            <p className="mt-2 text-sm text-slate-200">{nvda.blurb}</p>
            <p className="mt-3 text-xs text-slate-400">
              This essay helped re‑price Nvidia and other AI names, and led to a
              wave of media coverage and consulting work with funds and family
              offices.
            </p>
            <span className="mt-3 text-xs font-semibold text-sky-300 group-hover:text-sky-200">
              Read the full essay →
            </span>
          </a>
        )}

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {others.map((item) => (
            <a
              key={item.title}
              href={item.href}
              target="_blank"
              rel="noreferrer noopener"
              className="group flex flex-col rounded-2xl border border-slate-800/80 bg-slate-950/80 p-4 text-sm shadow-lg shadow-slate-950/80 transition hover:-translate-y-1 hover:border-sky-500/70"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                {item.source} • {item.category}
              </p>
              <h3 className="mt-2 text-sm font-semibold text-slate-50 group-hover:text-sky-100">
                {item.title}
              </h3>
              <p className="mt-2 flex-1 text-xs text-slate-400">
                {item.blurb}
              </p>
              <span className="mt-3 text-xs font-semibold text-sky-300 group-hover:text-sky-200">
                Read →
              </span>
            </a>
          ))}
        </div>
      </SectionShell>
    </>
  );
}
