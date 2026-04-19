import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { WillsEstateArticle } from "@/components/wills-estate-article";
import { writingHighlights } from "@/lib/content";

const ARTICLE_TITLE = "An AI Skill for Wills & Estate Planning";
const ARTICLE_DESCRIPTION =
  "A Claude Code / Codex skill that conducts a structured estate-planning intake — twelve axioms, nine phases, seventy-six jargon tooltips — and produces an attorney-ready handoff package.";
const ARTICLE_CANONICAL = "/writing/wills-and-estate-planning";
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
  datePublished: "2026-04-19",
  dateModified: "2026-04-19",
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
      <WillsEstateArticle />
    </>
  );
}
