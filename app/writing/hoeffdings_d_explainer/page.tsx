import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { HoeffdingArticle } from "@/components/hoeffding-article";

export const metadata: Metadata = {
  title: "My Favorite Statistical Measure: Hoeffding's D | Jeffrey Emanuel",
  description:
    "Standard correlation misses non-linear relationships. This guide explains Hoeffding's D, a powerful non-parametric measure that detects complex, non-linear dependencies where Pearson and Spearman fail.",
  alternates: {
    canonical: "/writing/hoeffdings_d_explainer",
  },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "My Favorite Statistical Measure: Hoeffding's D",
  datePublished: "2025-11-22",
  dateModified: "2026-02-12",
  description:
    "A deep dive into Hoeffding's D, a powerful non-parametric measure of association that detects complex, non-linear relationships and is robust to outliers.",
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
    "@id": "https://jeffreyemanuel.com/writing/hoeffdings_d_explainer",
  },
  about: [
    { "@type": "Thing", name: "Hoeffding's D" },
    { "@type": "Thing", name: "Statistics" },
    { "@type": "Thing", name: "Correlation" },
    { "@type": "Thing", name: "Data Science" },
  ],
};

export default function HoeffdingPage() {
  return (
    <>
      <JsonLd data={articleSchema} />
      <HoeffdingArticle />
    </>
  );
}
