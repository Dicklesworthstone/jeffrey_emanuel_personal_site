"use client";

import SectionShell from "@/components/section-shell";
import ProjectCard from "@/components/project-card";
import { projects } from "@/lib/content";
import { GitBranch } from "lucide-react";

export default function ProjectsPage() {
  const productProjects = projects.filter((p) => p.kind === "product");
  const ossProjects = projects.filter((p) => p.kind === "oss");

  return (
    <>
      <SectionShell
        id="projects-all"
        icon={GitBranch}
        eyebrow="Projects"
        title="Products, protocols, and open source"
        kicker="A sampling of the things I maintain or am actively building."
      >
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Protocol & products
        </h3>
        <div className="mt-3 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {productProjects.map((project) => (
            <ProjectCard key={project.name} project={project} />
          ))}
        </div>

        <h3 className="mt-10 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Open-source tooling
        </h3>
        <div className="mt-3 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {ossProjects.map((project) => (
            <ProjectCard key={project.name} project={project} />
          ))}
        </div>

        <p className="mt-6 text-xs text-slate-400">
          For the full constellation of experiments, research repos, and niche
          utilities, see my GitHub profile.
        </p>
      </SectionShell>
    </>
  );
}
