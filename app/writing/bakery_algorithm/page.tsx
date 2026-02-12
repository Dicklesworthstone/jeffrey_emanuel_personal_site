import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { BakeryArticle } from "@/components/bakery-article";

export const metadata: Metadata = {
  title: "Lamport's Bakery Algorithm: Concurrency without Atomicity | Jeffrey Emanuel",
  description:
    "A deep dive into Leslie Lamport's classic solution to the mutual exclusion problem. Explore how fair concurrency can be achieved using a simple numbering system without relying on atomic hardware primitives.",
  alternates: {
    canonical: "/writing/bakery_algorithm",
  },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Lamport's Bakery Algorithm: Concurrency without Atomicity",
  datePublished: "2025-11-22",
  dateModified: "2026-02-12",
  description:
    "A deep dive into Leslie Lamport's classic solution to the mutual exclusion problem. Explore how fair concurrency can be achieved using a simple numbering system without relying on atomic hardware primitives.",
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
    "@id": "https://jeffreyemanuel.com/writing/bakery_algorithm",
  },
  about: [
    { "@type": "Thing", name: "Bakery Algorithm" },
    { "@type": "Thing", name: "Concurrency" },
    { "@type": "Thing", name: "Mutual Exclusion" },
    { "@type": "Thing", name: "Distributed Systems" },
  ],
};

export default function BakeryPage() {
  return (
    <>
      <JsonLd data={articleSchema} />
      <BakeryArticle />
    </>
  );
}
