import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { OverpromptingArticle } from "@/components/overprompting-article";

const OG_TITLE = "The Overprompting Trap | Jeffrey Emanuel";
const OG_DESCRIPTION =
  "Why giving AI models too many constraints degrades output quality, the chef analogy, the face-in-hole effect, and a two-phase approach to prompting: be open during planning, precise during execution.";

export const metadata: Metadata = {
  title: OG_TITLE,
  description: OG_DESCRIPTION,
  alternates: {
    canonical: "/writing/overprompting",
  },
  // See /writing/wills-and-estate-planning/page.tsx for rationale — static
  // JPEGs under /public/og bypass the slow dynamic route for crawlers.
  // Regenerate with `bun run prerender:og`.
  openGraph: {
    title: OG_TITLE,
    description: OG_DESCRIPTION,
    type: "article",
    url: "/writing/overprompting",
    images: [
      {
        url: "/og/overprompting-opengraph.jpg",
        width: 1200,
        height: 630,
        alt: OG_TITLE,
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: OG_TITLE,
    description: OG_DESCRIPTION,
    images: [
      {
        url: "/og/overprompting-twitter.jpg",
        width: 1200,
        height: 600,
        alt: OG_TITLE,
      },
    ],
  },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "The Overprompting Trap",
  datePublished: "2026-02-12",
  dateModified: "2026-02-12",
  description:
    "Why giving AI models too many constraints degrades output quality, the chef analogy, the face-in-hole effect, and a two-phase approach to prompting: be open during planning, precise during execution.",
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
    "@id": "https://jeffreyemanuel.com/writing/overprompting",
  },
  about: [
    { "@type": "Thing", name: "AI Prompting" },
    { "@type": "Thing", name: "Large Language Models" },
    { "@type": "Thing", name: "Prompt Engineering" },
    { "@type": "Thing", name: "AI Workflow" },
  ],
};

export default function OverpromptingPage() {
  return (
    <>
      <JsonLd data={articleSchema} />
      <OverpromptingArticle />
    </>
  );
}
