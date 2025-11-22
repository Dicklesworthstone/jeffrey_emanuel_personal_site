import { Github, Twitter, Mail } from "lucide-react";
import { siteConfig } from "@/lib/content";

export default function SiteFooter() {
  return (
    <footer className="border-top-muted mt-16 bg-slate-950/90">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <p className="text-sm font-medium text-slate-100">
            {siteConfig.name}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Infrastructure and tools for AI agents, investors, and serious
            research workflows.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <a
            href={`mailto:${siteConfig.email}`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-700/80 bg-slate-950/90 text-slate-200 hover:border-slate-500 hover:text-slate-50"
            aria-label="Email"
          >
            <Mail className="h-4 w-4" />
          </a>
          <a
            href={siteConfig.social.github}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-700/80 bg-slate-950/90 text-slate-200 hover:border-slate-500 hover:text-slate-50"
            aria-label="GitHub"
          >
            <Github className="h-4 w-4" />
          </a>
          <a
            href={siteConfig.social.x}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-700/80 bg-slate-950/90 text-slate-200 hover:border-slate-500 hover:text-slate-50"
            aria-label="X profile"
          >
            <Twitter className="h-4 w-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}
