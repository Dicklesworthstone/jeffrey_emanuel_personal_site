import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects | Jeffrey Emanuel",
  description: "A catalog of experiments, open source tools, and products. The Agentic Coding Tooling Flywheel, Lumera Network, and more.",
  openGraph: {
    title: "Projects | Jeffrey Emanuel",
    description: "A catalog of experiments, open source tools, and products. The Agentic Coding Tooling Flywheel, Lumera Network, and more.",
    url: "https://jeffreyemanuel.com/projects",
  },
};

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
