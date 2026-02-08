import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Star,
  GitFork,
  Box,
  Beaker,
  Check,
  Terminal,
  BookOpen,
  Link as LinkIcon,
  Users,
  Repeat,
} from "lucide-react";
import { getProjectBySlug, getProjectSlugs, type Project } from "@/lib/content";
import { JsonLd } from "@/components/json-ld";
import SectionShell from "@/components/section-shell";
import { cn } from "@/lib/utils";
import NotableStargazersWrapper from "@/components/notable-stargazers-wrapper";

// Map project slugs to GitHub repo names used in stargazer-intelligence.json
const SLUG_TO_REPO: Record<string, string> = {
  "mcp-agent-mail": "mcp_agent_mail",
  "beads-viewer": "beads_viewer",
  "named-tmux-manager": "ntm",
  "simultaneous-launch-button": "simultaneous_launch_button",
  "cass-memory-system": "cass_memory_system",
  "cass": "coding_agent_session_search",
  "ultimate-bug-scanner": "ultimate_bug_scanner",
};

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return getProjectSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return {
      title: "Project Not Found | Jeffrey Emanuel",
    };
  }

  return {
    title: `${project.name} | Jeffrey Emanuel`,
    description: project.description,
    alternates: {
      canonical: `/projects/${slug}`,
    },
    openGraph: {
      title: `${project.name} | Jeffrey Emanuel`,
      description: project.description,
      url: `https://jeffreyemanuel.com/projects/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.name} | Jeffrey Emanuel`,
      description: project.description,
    },
  };
}

// Render icon node based on project kind
function getKindIconNode(kind: Project["kind"], className = "h-5 w-5") {
  switch (kind) {
    case "product":
      return <Box className={className} />;
    case "oss":
      return <GitFork className={className} />;
    case "research":
      return <Beaker className={className} />;
    case "rust-port":
      return <Repeat className={className} />;
  }
}

// Extract star count from badge
function extractStarCount(badge?: string): string | null {
  if (!badge) return null;
  const match = badge.match(/^([\d,]+\.?\d*[KkMm]?\+?)\s+stars?$/);
  return match ? match[1] : null;
}

export default async function ProjectDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const starCount = extractStarCount(project.badge);
  const displayBadge = starCount ? null : project.badge;
  const details = project.details;

  // Get related projects
  const relatedProjects = details?.relatedProjects
    ?.map((relSlug) => getProjectBySlug(relSlug))
    .filter((p): p is Project => p !== undefined) ?? [];

  // Determine accent colors based on kind
  let accentColor = "text-emerald-400";
  let accentBg = "bg-emerald-500/10";
  let accentRing = "ring-emerald-500/20";

  if (project.kind === "product") {
    accentColor = "text-sky-400";
    accentBg = "bg-sky-500/10";
    accentRing = "ring-sky-500/20";
  } else if (project.kind === "research") {
    accentColor = "text-purple-400";
    accentBg = "bg-purple-500/10";
    accentRing = "ring-purple-500/20";
  } else if (project.kind === "rust-port") {
    accentColor = "text-orange-400";
    accentBg = "bg-orange-500/10";
    accentRing = "ring-orange-500/20";
  }

  // Schema.org structured data
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: project.name,
    description: project.description,
    url: project.href,
    applicationCategory: "DeveloperApplication",
    author: {
      "@type": "Person",
      name: "Jeffrey Emanuel",
      url: "https://jeffreyemanuel.com",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <>
      <JsonLd data={schemaData} />
      <SectionShell
        id="project-detail"
        iconNode={getKindIconNode(project.kind)}
        eyebrow={project.kind.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
        title={project.name}
        kicker={project.short}
        headingLevel={1}
      >
        {/* Back navigation */}
        <div className="mb-8">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Link>
        </div>

        {/* Header with badges */}
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider ring-1 ring-inset",
              accentBg,
              accentRing,
              accentColor
            )}
          >
            {getKindIconNode(project.kind, "h-4 w-4")}
            {project.kind.replace("-", " ")}
          </span>
          {starCount && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-200 ring-1 ring-inset ring-amber-500/20">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {starCount} stars
            </span>
          )}
          {displayBadge && (
            <span className="inline-flex items-center rounded-full bg-slate-800/50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-300 ring-1 ring-inset ring-slate-700/50">
              {displayBadge}
            </span>
          )}
        </div>

        {/* Description */}
        <div className="mb-12 rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
          <p className="text-lg leading-relaxed text-slate-300">{project.description}</p>
        </div>

        {/* Notable Stargazers - only show for projects with stargazer data */}
        {slug && SLUG_TO_REPO[slug] && (
          <div className="mb-12">
            <h2 className="mb-6 flex items-center gap-3 text-xl font-bold text-white">
              <Users className={cn("h-5 w-5", accentColor)} />
              Notable Developers Using This
            </h2>
            <NotableStargazersWrapper
              variant="project"
              repoSlug={SLUG_TO_REPO[slug]}
              maxItems={5}
              showStats={false}
            />
          </div>
        )}

        {/* Features */}
        {details?.features && details.features.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-6 flex items-center gap-3 text-xl font-bold text-white">
              <Check className={cn("h-5 w-5", accentColor)} />
              Features
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {details.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-4"
                >
                  <Check className={cn("mt-0.5 h-4 w-4 flex-shrink-0", accentColor)} aria-hidden="true" />
                  <span className="text-sm text-slate-300">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Installation */}
        {details?.installation && (
          <div className="mb-12">
            <h2 className="mb-6 flex items-center gap-3 text-xl font-bold text-white">
              <Terminal className={cn("h-5 w-5", accentColor)} />
              Installation
            </h2>
            <div className="overflow-hidden rounded-xl border border-white/10 bg-black/40">
              <div className="border-b border-white/10 bg-white/5 px-4 py-2">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Terminal
                </span>
              </div>
              <div className="p-4 md:p-6">
                <pre className="overflow-x-auto text-sm text-slate-300">
                  <code>{details.installation.replace(/```bash\n?|```\n?/g, "").trim()}</code>
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Usage */}
        {details?.usage && (
          <div className="mb-12">
            <h2 className="mb-6 flex items-center gap-3 text-xl font-bold text-white">
              <BookOpen className={cn("h-5 w-5", accentColor)} />
              Usage
            </h2>
            <div className="overflow-hidden rounded-xl border border-white/10 bg-black/40">
              <div className="border-b border-white/10 bg-white/5 px-4 py-2">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Example
                </span>
              </div>
              <div className="p-4 md:p-6">
                <pre className="overflow-x-auto whitespace-pre-wrap text-sm text-slate-300">
                  <code>{details.usage.replace(/```(?:bash|json)?\n?|```\n?/g, "").trim()}</code>
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Tags */}
        <div className="mb-12">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-md bg-white/5 px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-slate-400 ring-1 ring-inset ring-white/10"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Related Projects */}
        {relatedProjects.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-6 flex items-center gap-3 text-xl font-bold text-white">
              <LinkIcon className={cn("h-5 w-5", accentColor)} />
              Related Projects
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProjects.map((related) => (
                <Link
                  key={related.slug}
                  href={`/projects/${related.slug}`}
                  className="group rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-colors hover:border-white/20 hover:bg-white/5"
                >
                  <h3 className="font-semibold text-white transition-colors group-hover:text-violet-300">
                    {related.name}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-400">{related.short}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTA to GitHub */}
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-8 text-center sm:flex-row sm:text-left">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white">View on GitHub</h3>
            <p className="mt-1 text-sm text-slate-400">
              Explore the source code, documentation, and contribute to the project.
            </p>
          </div>
          <a
            href={project.href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition-all",
              "bg-white text-black hover:bg-slate-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            )}
          >
            View Repository
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </SectionShell>
    </>
  );
}
