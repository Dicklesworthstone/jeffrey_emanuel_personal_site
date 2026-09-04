// Site chrome config (identity + nav). lib/content.ts re-exports everything
// here, so `import { siteConfig, navItems } from "@/lib/content"` still works
// and AGENTS.md's "content lives in lib/content.ts" holds. The split exists as
// a bundle boundary: the root-layout chrome (site-header, site-footer,
// use-keyboard-shortcuts) imports from THIS module so every route no longer
// pulls the ~43 KB gz content chunk. Keep this file dependency-free (no imports
// from ./content) to avoid a cycle that would re-merge the chunks.

export const siteConfig = {
  name: "Jeffrey Emanuel",
  title: "Jeffrey Emanuel: Agentic Coding Tooling, AI Infrastructure & Markets",
  description:
    "Founder & CEO of Lumera Network. Creator of the Agentic Coding Tooling Flywheel, a self-reinforcing ecosystem of 14 core tools (MCP Agent Mail, Beads Viewer, CASS, and more) that transform how AI coding agents collaborate. Builder of the FrankenSuite: clean-room Rust reimplementations of foundational software (SQLite, Redis, NumPy, SciPy, PyTorch, and more). 198 open-source projects with 31,430+ GitHub stars.",
  email: "jeffreyemanuel@gmail.com",
  location: "",
  social: {
    x: "https://x.com/doodlestein",
    github: "https://github.com/Dicklesworthstone",
    linkedin: "https://www.linkedin.com/in/jeffreyemanuel",
  },
  features: {
    // Buttondown list 'jeffreyemanuel' returned 404 on 2026-08-28; re-enable once a real list exists
    newsletter: false,
  },
} satisfies {
  name: string;
  title: string;
  description: string;
  email: string;
  location: string;
  social: { x: string; github: string; linkedin: string };
  features: { newsletter: boolean };
};

export type NavItem = { href: string; label: string };

export const navItems: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/consulting", label: "Consulting" },
  { href: "/projects", label: "Projects" },
  { href: "/tldr", label: "Flywheel" },
  { href: "/writing", label: "Writing" },
  { href: "/media", label: "Media" },
  { href: "/contact", label: "Contact" },
];
