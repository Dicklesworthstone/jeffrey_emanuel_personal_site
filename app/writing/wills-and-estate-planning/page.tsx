import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { WillsEstateArticle } from "@/components/wills-estate-article";
import { writingHighlights } from "@/lib/content";

const DRAFT =
  writingHighlights.find(
    (item) => item.href === "/writing/wills-and-estate-planning",
  )?.draft ?? false;

export const metadata: Metadata = {
  title:
    "An AI Skill for Wills & Estate Planning | Jeffrey Emanuel",
  description:
    "A Claude Code / Codex skill that conducts a structured estate-planning intake — twelve axioms, nine phases, seventy-six jargon tooltips — and produces an attorney-ready handoff package.",
  alternates: {
    canonical: "/writing/wills-and-estate-planning",
  },
  ...(DRAFT && {
    robots: { index: false, follow: false },
  }),
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "An AI Skill for Wills & Estate Planning",
  datePublished: "2026-04-19",
  dateModified: "2026-04-19",
  description:
    "A Claude Code / Codex skill that conducts a structured estate-planning intake — twelve axioms, nine phases, seventy-six jargon tooltips — and produces an attorney-ready handoff package.",
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
  about: [
    { "@type": "Thing", name: "Estate Planning" },
    { "@type": "Thing", name: "Wills and Trusts" },
    { "@type": "Thing", name: "AI Agents" },
    { "@type": "Thing", name: "Agent Skills" },
    { "@type": "Thing", name: "Claude Code" },
    { "@type": "Thing", name: "Codex" },
    { "@type": "Thing", name: "Beneficiary Designations" },
  ],
};

export default function WillsEstatePlanningPage() {
  return (
    <>
      <JsonLd data={articleSchema} />
      <WillsEstateArticle />
    </>
  );
}
