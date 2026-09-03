import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import TableOfContents from "@/components/table-of-contents";
import { WillsEstateArticle } from "@/components/wills-estate-article";
import { writingHighlights } from "@/lib/content";
import type { TocHeading } from "@/lib/extract-headings";

// The nine top-level sections of the article. The ids match the `<section id>`
// anchors in `WillsEstateArticle` (and the inline TOC / URL hashes), so the
// floating scroll-spy TOC and the inline contents list agree.
const ARTICLE_TOC_HEADINGS: TocHeading[] = [
  { id: "cost", text: "One weekend, roughly $120, instead of $3,000 to $20,000", level: 2 },
  { id: "what-is-it", text: "What is an AI agent, and what is a skill?", level: 2 },
  { id: "setup", text: "What you need (twenty minutes of setup)", level: 2 },
  { id: "folder", text: "Using the skill: your working folder", level: 2 },
  { id: "tips", text: "How to get the most out of it", level: 2 },
  { id: "showcase", text: "What the skill actually does for you", level: 2 },
  { id: "attorney", text: "When (and whether) to involve an attorney", level: 2 },
  { id: "faq", text: "Questions you are about to ask", level: 2 },
  { id: "pattern", text: "A pattern, not a product", level: 2 },
];

const ARTICLE_TITLE = "An AI Skill for Wills & Estate Planning";
const ARTICLE_DESCRIPTION =
  "A Claude Code / Codex skill that handles the expensive intake portion of estate planning: four steps to install, one weekend of work, roughly $120, and a structured document package for attorney review.";
const ARTICLE_CANONICAL = "/writing/wills-and-estate-planning";
const ARTICLE_PUBLISHED_AT = "2026-04-19";
const ARTICLE_PUBLISHED_LABEL = "April 19, 2026";
const ARTICLE_ABOUT = [
  "Estate Planning",
  "Wills",
  "Trusts",
  "Probate",
  "Incapacity Planning",
  "AI Agents",
  "Agent Skills",
  "Claude Code",
  "Codex",
  "Beneficiary Designations",
] as const;

const DRAFT =
  writingHighlights.find(
    (item) => item.href === ARTICLE_CANONICAL,
  )?.draft ?? false;

const OG_IMAGE_ALT =
  "An AI Skill for Wills & Estate Planning | Jeffrey Emanuel";

export const metadata: Metadata = {
  title: `${ARTICLE_TITLE} | Jeffrey Emanuel`,
  description: ARTICLE_DESCRIPTION,
  alternates: {
    canonical: ARTICLE_CANONICAL,
  },
  // Override the file-convention opengraph-image / twitter-image routes
  // with pre-rendered static JPEGs under /public/og. The dynamic routes
  // are ~700KB PNGs rendered in ~4-5s; X's Twitterbot times out on those
  // and silently drops the card. Static ~100KB JPEGs served from the CDN
  // are fetched in milliseconds. Regenerate with `bun run prerender:og`
  // after editing the dynamic route's JSX.
  openGraph: {
    title: `${ARTICLE_TITLE} | Jeffrey Emanuel`,
    description: ARTICLE_DESCRIPTION,
    type: "article",
    url: ARTICLE_CANONICAL,
    images: [
      {
        url: "/og/wills-and-estate-planning-opengraph.jpg",
        width: 1200,
        height: 630,
        alt: OG_IMAGE_ALT,
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${ARTICLE_TITLE} | Jeffrey Emanuel`,
    description: ARTICLE_DESCRIPTION,
    images: [
      {
        url: "/og/wills-and-estate-planning-twitter.jpg",
        width: 1200,
        height: 600,
        alt: OG_IMAGE_ALT,
      },
    ],
  },
  ...(DRAFT && {
    robots: { index: false, follow: false },
  }),
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: ARTICLE_TITLE,
  datePublished: ARTICLE_PUBLISHED_AT,
  dateModified: ARTICLE_PUBLISHED_AT,
  description: ARTICLE_DESCRIPTION,
  author: {
    "@type": "Person",
    name: "Jeffrey Emanuel",
    url: "https://jeffreyemanuel.com",
  },
  publisher: {
    "@type": "Organization",
    name: "Jeffrey Emanuel",
    logo: {
      "@type": "ImageObject",
      url: "https://jeffreyemanuel.com/icon-192.png",
    },
  },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": "https://jeffreyemanuel.com/writing/wills-and-estate-planning",
  },
  about: ARTICLE_ABOUT.map((name) => ({ "@type": "Thing", name })),
};

export default function WillsEstatePlanningPage() {
  return (
    <>
      <JsonLd data={articleSchema} />
      <div className="dark bg-[#020204] border-b border-white/6">
        <div className="mx-auto flex max-w-[800px] flex-wrap items-center gap-x-3 gap-y-1 px-4 py-4 text-xs uppercase tracking-[0.24em] text-slate-400 md:px-6">
          <span>By Jeffrey Emanuel</span>
          <span aria-hidden="true" className="text-slate-600">
            /
          </span>
          <time dateTime={ARTICLE_PUBLISHED_AT}>
            Published {ARTICLE_PUBLISHED_LABEL}
          </time>
        </div>
      </div>
      <TableOfContents headings={ARTICLE_TOC_HEADINGS} />
      <WillsEstateArticle />
    </>
  );
}
