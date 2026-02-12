import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { OverpromptingArticle } from "@/components/overprompting-article";

export const metadata: Metadata = {
  title: "The Overprompting Trap | Jeffrey Emanuel",
  description:
    "Why giving AI models too many constraints degrades output quality, the chef analogy, the face-in-hole effect, and a two-phase approach to prompting: be open during planning, precise during execution.",
  alternates: {
    canonical: "/writing/overprompting",
  },
  openGraph: {
    title: "The Overprompting Trap",
    description:
      "Why giving AI models too many constraints degrades output quality, the chef analogy, the face-in-hole effect, and a two-phase approach to prompting: be open during planning, precise during execution.",
    type: "article",
    publishedTime: "2026-02-12",
    url: "https://jeffreyemanuel.com/writing/overprompting",
    images: [
      {
        url: "/writing/overprompting/opengraph-image",
        width: 1200,
        height: 630,
        alt: "The Overprompting Trap | Jeffrey Emanuel",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Overprompting Trap",
    description:
      "Why giving AI models too many constraints degrades output quality, the chef analogy, the face-in-hole effect, and a two-phase approach to prompting.",
    images: ["/writing/overprompting/twitter-image"],
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
