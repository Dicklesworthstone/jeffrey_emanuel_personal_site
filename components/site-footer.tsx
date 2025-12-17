import { Github, Twitter, Mail, Linkedin } from "lucide-react";
import { siteConfig } from "@/lib/content";

export default function SiteFooter() {
  return (
    <footer
      className="relative mt-32 border-t border-white/5 bg-slate-950/30 backdrop-blur-lg"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-16">
        <div className="max-w-md space-y-2">
          <p className="text-lg font-bold tracking-tight text-slate-100">
            {siteConfig.name}
          </p>
          <p className="text-sm leading-relaxed text-slate-500">
            Building durable infrastructure for the agentic future.
            <br />
            &copy; {new Date().getFullYear()} Jeffrey Emanuel. All rights reserved.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {[
            { href: `mailto:${siteConfig.email}`, icon: Mail, label: "Email" },
            { href: siteConfig.social.github, icon: Github, label: "GitHub" },
            { href: siteConfig.social.x, icon: Twitter, label: "X (Twitter)" },
            { href: siteConfig.social.linkedin, icon: Linkedin, label: "LinkedIn" },
          ].map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noreferrer noopener"
              className="group relative flex h-12 w-12 items-center justify-center rounded-full border border-white/5 bg-white/5 text-slate-400 transition-all hover:border-white/10 hover:bg-white/10 hover:text-white hover:scale-110"
              aria-label={social.label}
            >
              <social.icon className="h-5 w-5 transition-transform group-hover:rotate-12" aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
