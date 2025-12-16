"use client";

import SectionShell from "@/components/section-shell";
import { MediaItem, mediaItems } from "@/lib/content";
import { Newspaper, Podcast } from "lucide-react";

function MediaRow({ item }: { item: MediaItem }) {
  const isAudio = item.kind === "Podcast";
  const Icon = isAudio ? Podcast : Newspaper;
  return (
    <a
      href={item.href}
      target="_blank"
      rel="noreferrer noopener"
      className="group flex flex-col rounded-2xl border border-slate-800/80 bg-slate-950/80 p-4 text-sm shadow-lg shadow-slate-950/80 transition hover:-translate-y-1 hover:border-sky-500/70"
    >
      <div className="flex items-center gap-3">
        <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900/80 text-sky-300">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            {item.outlet} • {item.kind}
          </p>
          <h3 className="mt-1 text-sm font-semibold text-slate-50 group-hover:text-sky-100">
            {item.title}
          </h3>
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-400">{item.blurb}</p>
      <span className="mt-3 text-xs font-semibold text-sky-300 group-hover:text-sky-200">
        Open →
      </span>
    </a>
  );
}

export default function MediaPage() {
  return (
    <>
      <SectionShell
        id="media"
        icon={Newspaper}
        eyebrow="Media"
        title="Press, podcasts, and long-form conversations"
        kicker="Some of the public coverage around the Nvidia essay, Lumera, and how AI is reshaping markets."
      >
        {mediaItems.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2">
            {mediaItems.map((item) => (
              <MediaRow key={item.title} item={item} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-white/5 py-12 text-center">
            <p className="text-sm font-medium text-slate-400">
              No media appearances to show yet.
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Check back soon for updates.
            </p>
          </div>
        )}
      </SectionShell>
    </>
  );
}
