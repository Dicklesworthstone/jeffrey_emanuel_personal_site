import Hero from "@/components/hero";
import Link from "next/link";
import SectionShell from "@/components/section-shell";
import ProjectCard from "@/components/project-card";
import Timeline from "@/components/timeline";
import AnimatedGrid, { LazySection, TimelineSkeleton } from "@/components/animated-grid";
import { Cpu, GitBranch, PenSquare, Workflow, Zap, ArrowRight, Quote, Play, Mail, Activity, Globe } from "lucide-react";
import { careerTimeline, projects, threads, writingHighlights, flywheelTools, heroStats, featuredSites } from "@/lib/content";
import FeaturedSites from "@/components/featured-sites";
import { cn } from "@/lib/utils";
import { HapticLink, HapticExternalLink } from "@/components/haptic-link";
import { fetchGitHubStats, formatStarsDisplay } from "@/lib/github-stats";
import { JsonLd } from "@/components/json-ld";
import { siteConfig } from "@/lib/content";
import EndorsementShowcase from "@/components/endorsement-showcase";
import DemoShowcase from "@/components/demo-showcase";
import NewsletterSignup from "@/components/newsletter-signup";
import NotableStargazers from "@/components/notable-stargazers-wrapper";
import GitHubHeartbeat from "@/components/github-heartbeat-wrapper";

export default async function HomePage() {
  const featuredProjects = projects.slice(0, 6);
  const featuredWriting = writingHighlights.slice(0, 6);
  const featuredThreads = threads.slice(0, 6);
  
  // Fetch live stats
  const githubStats = await fetchGitHubStats();
  const liveStats = heroStats.map((stat) => {
    if (stat.label === "GitHub Stars") {
      return { ...stat, value: formatStarsDisplay(githubStats.totalStars) };
    }
    return stat;
  });

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.name,
    jobTitle: "Founder & CEO",
    worksFor: {
      "@type": "Organization",
      name: "Lumera Network",
    },
    url: "https://jeffreyemanuel.com",
    sameAs: [
      siteConfig.social.x,
      siteConfig.social.github,
      siteConfig.social.linkedin,
    ],
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: "Reed College",
    },
    knowsAbout: ["AI Agents", "Markets", "Software Engineering", "Mathematics", "Finance"],
  };

  return (
    <>
      <JsonLd data={personSchema} />
      <Hero stats={liveStats} />

      <SectionShell
        id="snapshot"
        iconNode={<Cpu className="h-5 w-5" />}
        eyebrow="Snapshot"
        title="Where I sit in the AI stack"
        kicker="Three overlapping threads: an ecosystem of agent tools I use to run 10+ agents simultaneously, research that moves markets, and protocol infrastructure."
      >
        <AnimatedGrid
          className="flex -mx-4 px-4 gap-4 overflow-x-auto pb-8 snap-x snap-mandatory md:grid md:grid-cols-3 md:gap-6 lg:gap-8 md:mx-0 md:px-0 md:pb-0 md:overflow-visible no-scrollbar"
          staggerDelay={0.12}
        >
          <div className="snap-center shrink-0 w-[85vw] sm:w-[60vw] md:w-auto glass-card rounded-3xl p-8 border border-violet-500/20 bg-gradient-to-br from-violet-950/20 to-transparent">
            <p className="text-xs font-bold uppercase tracking-widest text-violet-400 shadow-violet-500/20 drop-shadow-sm">
              The Flywheel
            </p>
            <h3 className="mt-4 text-xl font-bold leading-tight text-slate-50 md:text-2xl">
              13 Tools That Amplify Each Other
            </h3>
            <p className="mt-4 text-base leading-relaxed text-slate-400">
              MCP Agent Mail, Beads Viewer, CASS Memory, and 10 more tools that let
              coding agents coordinate, remember, and work safely together. Each
              tool makes the others more powerful.
            </p>
            <Link
              href="/projects"
              className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-violet-400 transition-colors hover:text-violet-300"
            >
              Explore the ecosystem
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="snap-center shrink-0 w-[85vw] sm:w-[60vw] md:w-auto glass-card rounded-3xl p-8">
            <p className="text-xs font-bold uppercase tracking-widest text-fuchsia-400 shadow-fuchsia-500/20 drop-shadow-sm">
              Markets & research
            </p>
            <h3 className="mt-4 text-xl font-bold leading-tight text-slate-50 md:text-2xl">
              Essays that move numbers
            </h3>
            <p className="mt-4 text-base leading-relaxed text-slate-400">
              Long-form work that connects model internals and infrastructure
              economics all the way back to cash flows and valuations.
            </p>
            <Link
              href="/writing"
              className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-fuchsia-400 transition-colors hover:text-fuchsia-300"
            >
              Read essays
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="snap-center shrink-0 w-[85vw] sm:w-[60vw] md:w-auto glass-card rounded-3xl p-8">
            <p className="text-xs font-bold uppercase tracking-widest text-sky-400 shadow-sky-500/20 drop-shadow-sm">
              Infrastructure
            </p>
            <h3 className="mt-4 text-xl font-bold leading-tight text-slate-50 md:text-2xl">
              Lumera Network
            </h3>
            <p className="mt-4 text-base leading-relaxed text-slate-400">
              A Cosmos-based L1 for durable storage and AI verification, aimed
              at the world where agents talk to chains as fluently as to APIs.
            </p>
            <a
              href="https://pastel.network"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-sky-400 transition-colors hover:text-sky-300"
            >
              Visit Lumera
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </AnimatedGrid>
      </SectionShell>

      {/* Flywheel Preview Banner */}
      <section className="relative overflow-hidden py-20 sm:py-28 lg:py-32">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-violet-950/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.08),transparent_70%)]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <HapticLink
            href="/tldr"
            className="group block"
          >
            <div className="relative rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-950/30 via-black/40 to-black/20 p-8 sm:p-12 backdrop-blur-sm transition-all duration-300 hover:border-violet-500/40 hover:shadow-2xl hover:shadow-violet-500/10">
              {/* Decorative elements */}
              <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-violet-500/10 blur-3xl" />
              <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-fuchsia-500/10 blur-3xl" />

              <div className="relative flex flex-col items-center text-center lg:flex-row lg:items-start lg:text-left lg:justify-between lg:gap-12">
                <div className="max-w-2xl">
                  <div className="mb-4 flex items-center justify-center lg:justify-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-lg shadow-violet-500/30">
                      <Workflow className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-violet-400">
                      Featured Ecosystem
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                    The Agentic Coding Tooling Flywheel
                  </h2>

                  <p className="mt-4 text-base leading-relaxed text-slate-400 sm:text-lg">
                    Thirteen interconnected tools that transform how AI coding agents work together.
                    Coordination, memory, task tracking, safety, and search. I use these to run
                    10+ agents simultaneously. My GitHub squares get darker green each month because
                    each tool amplifies the others.
                  </p>

                  {/* Notable Stargazers - avatar strip showing influential developers */}
                  <div className="mt-6">
                    <NotableStargazers variant="compact" maxItems={6} />
                  </div>
                </div>

                {/* Mini flywheel preview */}
                <div className="mt-8 lg:mt-0 flex flex-col items-center">
                  <div className="relative flex h-32 w-32 sm:h-40 sm:w-40 items-center justify-center">
                    {/* Animated dashed ring - Use CSS animation instead of Framer Motion for Server Component */}
                    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="48"
                        fill="none"
                        stroke="rgba(139, 92, 246, 0.3)"
                        strokeWidth="1"
                        strokeDasharray="8 4"
                        className="animate-[spin_20s_linear_infinite] origin-center"
                      />
                    </svg>
                    {/* Tool dots - positioned using percentages for responsive scaling */}
                    {flywheelTools.map((tool, i) => {
                      const angle = ((i / flywheelTools.length) * 2 * Math.PI) - (Math.PI / 2);
                      // Use 38% of container size as radius (leaves room for dot size)
                      const radiusPercent = 38;
                      const xPercent = Math.cos(angle) * radiusPercent;
                      const yPercent = Math.sin(angle) * radiusPercent;
                      return (
                        <div
                          key={tool.id}
                          className={cn(
                            "absolute h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-gradient-to-br shadow-lg animate-[pulse_3s_ease-in-out_infinite]",
                            tool.color
                          )}
                          style={{
                            left: `calc(50% + ${xPercent}%)`,
                            top: `calc(50% + ${yPercent}%)`,
                            transform: "translate(-50%, -50%)",
                            animationDelay: `${i * 0.1}s`
                          }}
                        />
                      );
                    })}
                    {/* Center icon */}
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-500/20 ring-1 ring-violet-500/40">
                      <Zap className="h-6 w-6 text-violet-400" />
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-2 text-sm font-bold text-violet-400 transition-colors group-hover:text-violet-300">
                    Explore the TLDR
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </div>
          </HapticLink>
        </div>
      </section>

      {/* Featured Sites */}
      <SectionShell
        id="sites"
        iconNode={<Globe className="h-5 w-5" />}
        eyebrow="Explore"
        title="More from the flywheel"
        kicker="A prompt library and an interactive setup wizard for getting started fast."
      >
        <FeaturedSites sites={featuredSites} />
      </SectionShell>

      <SectionShell
        id="projects"
        iconNode={<GitBranch className="h-5 w-5" />}
        eyebrow="Projects"
        title="Products and open source"
        kicker="A comprehensive collection of the tools, protocols, and experiments I'm building."
      >
        <LazySection minHeight="500px" skeletonCards={6}>
          <AnimatedGrid
            className="flex -mx-4 px-4 gap-4 overflow-x-auto pb-8 snap-x snap-mandatory md:grid md:grid-cols-2 md:gap-6 lg:gap-8 lg:grid-cols-3 md:mx-0 md:px-0 md:pb-0 md:overflow-visible no-scrollbar"
            staggerDelay={0.08}
          >
            {featuredProjects.map((project) => (
               <div key={project.name} className="snap-center shrink-0 w-[85vw] sm:w-[60vw] md:w-auto h-full">
                  <ProjectCard project={project} />
               </div>
            ))}
          </AnimatedGrid>
        </LazySection>
      </SectionShell>

      {/* Endorsements - Social proof after projects */}
      <SectionShell
        id="endorsements"
        iconNode={<Quote className="h-5 w-5" />}
        eyebrow="Recognition"
        title="What people are saying"
        kicker="From industry leaders, investors, and fellow engineers."
      >
        <EndorsementShowcase
          layout="featured"
          featuredOnly
          maxItems={5}
          heading=""
          className="mt-2"
        />
        {/* Subtle link to Nvidia story - understated but findable */}
        <div className="mt-8 text-center">
          <HapticLink
            href="/nvidia-story"
            className="inline-flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-300"
          >
            <span>See the story behind the $600B drop</span>
            <ArrowRight className="h-3 w-3" />
          </HapticLink>
        </div>
      </SectionShell>

      <SectionShell
        id="writing"
        iconNode={<PenSquare className="h-5 w-5" />}
        eyebrow="Writing"
        title="Essays, memos, and research notes"
        kicker="A mix of public writing and GitHub-native research artifacts."
      >
        <LazySection minHeight="400px" skeletonCards={6}>
          <AnimatedGrid
            className="flex -mx-4 px-4 gap-4 overflow-x-auto pb-8 snap-x snap-mandatory md:grid md:grid-cols-3 md:gap-6 lg:gap-8 md:mx-0 md:px-0 md:pb-0 md:overflow-visible no-scrollbar"
            staggerDelay={0.1}
          >
            {featuredWriting.map((item) => (
              <HapticLink
                key={item.title}
                href={item.href}
                className="snap-center shrink-0 w-[85vw] sm:w-[60vw] md:w-auto glass-card group flex flex-col rounded-3xl p-8 hover:border-sky-500/30"
              >
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                  <span>{item.source}</span>
                  <span className="h-0.5 w-0.5 rounded-full bg-slate-500" />
                  <span>{item.category}</span>
                </div>

                <h3 className="mt-4 text-xl font-bold leading-tight text-slate-50 transition-colors group-hover:text-sky-200">
                  {item.title}
                </h3>

                <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-400">
                  {item.blurb}
                </p>

                <div className="mt-8 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400 transition-colors group-hover:text-sky-300">
                  Read the essay
                  <span className="text-lg leading-none">→</span>
                </div>
              </HapticLink>
            ))}
          </AnimatedGrid>
        </LazySection>
      </SectionShell>

      <SectionShell
        id="timeline"
        iconNode={<Cpu className="h-5 w-5" />}
        eyebrow="Background"
        title="From hedge funds to agents and chains"
        kicker="A condensed view of the path that got me here."
      >
        <LazySection minHeight="800px" skeleton={<TimelineSkeleton itemCount={careerTimeline.length} />}>
          <Timeline items={careerTimeline} />
        </LazySection>
      </SectionShell>

      {/* Try It - Live Demos */}
      <SectionShell
        id="demos"
        iconNode={<Play className="h-5 w-5" />}
        eyebrow="Try It"
        title="Live demos you can explore"
        kicker="Interactive projects running in your browser right now."
      >
        <DemoShowcase
          heading=""
          className="mt-2"
        />
      </SectionShell>

      {/* GitHub Heartbeat - Live Activity */}
      <SectionShell
        id="activity"
        iconNode={<Activity className="h-5 w-5" />}
        eyebrow="Live Activity"
        title="GitHub Heartbeat"
        kicker="Real-time pulse of my open-source work. The flywheel spins faster every week."
      >
        <div className="mx-auto max-w-2xl">
          <GitHubHeartbeat />
        </div>
      </SectionShell>

      {featuredThreads.length > 0 && (
        <SectionShell
          id="threads"
          iconNode={<PenSquare className="h-5 w-5" />}
          eyebrow="Threads"
          title="Selected X posts"
          kicker="I write a lot more informally on X. Here are a few good entry points."
        >
          <LazySection minHeight="400px" skeletonCards={3}>
            <AnimatedGrid
              className="flex -mx-4 px-4 gap-4 overflow-x-auto pb-8 snap-x snap-mandatory md:grid md:grid-cols-3 md:gap-6 lg:gap-8 md:mx-0 md:px-0 md:pb-0 md:overflow-visible no-scrollbar"
              staggerDelay={0.1}
            >
              {featuredThreads.map((thread) => (
                <HapticExternalLink
                  key={thread.href}
                  href={thread.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="snap-center shrink-0 w-[85vw] sm:w-[60vw] md:w-auto glass-card group flex flex-col rounded-3xl p-8 hover:border-sky-500/30"
                >
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    Thread on X
                  </p>
                  <h3 className="mt-4 text-lg font-bold leading-snug text-slate-50 transition-colors group-hover:text-sky-200">
                    {thread.title}
                  </h3>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-400">
                    {thread.blurb}
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400 transition-colors group-hover:text-sky-300">
                    Open thread
                    <span className="text-lg leading-none">→</span>
                  </div>
                </HapticExternalLink>
              ))}
            </AnimatedGrid>
          </LazySection>
        </SectionShell>
      )}

      {/* Newsletter Signup - hidden until siteConfig.features.newsletter is true */}
      {siteConfig.features.newsletter && (
        <SectionShell
          id="newsletter"
          iconNode={<Mail className="h-5 w-5" />}
          eyebrow="Newsletter"
          title="Stay updated"
          kicker="New essays, tools, and insights delivered to your inbox."
        >
          <div className="mx-auto max-w-2xl">
            <NewsletterSignup
              heading="Join the mailing list"
              description="Get notified when I publish new essays, release tools, or share research. No spam, just signal. Unsubscribe anytime."
            />
          </div>
        </SectionShell>
      )}
    </>
  );
}
