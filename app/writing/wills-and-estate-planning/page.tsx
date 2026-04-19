import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { WillsEstateArticle } from "@/components/wills-estate-article";
import { writingHighlights } from "@/lib/content";

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

export const metadata: Metadata = {
  title: `${ARTICLE_TITLE} | Jeffrey Emanuel`,
  description: ARTICLE_DESCRIPTION,
  alternates: {
    canonical: ARTICLE_CANONICAL,
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
      <div className="bg-[#020204] border-b border-white/6">
        <div className="mx-auto flex max-w-[800px] flex-wrap items-center gap-x-3 gap-y-1 px-4 py-4 text-[11px] uppercase tracking-[0.24em] text-slate-400 md:px-6 md:text-[12px]">
          <span>By Jeffrey Emanuel</span>
          <span aria-hidden="true" className="text-slate-600">
            /
          </span>
          <time dateTime={ARTICLE_PUBLISHED_AT}>
            Published {ARTICLE_PUBLISHED_LABEL}
          </time>
        </div>
      </div>
      <WillsEstateArticle />
    </>
  );
}
