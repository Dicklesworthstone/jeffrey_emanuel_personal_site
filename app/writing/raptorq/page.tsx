import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { RaptorQArticle } from "@/components/raptorq-article";

export const metadata: Metadata = {
  title: "RaptorQ: The Black Magic of Liquid Data | Jeffrey Emanuel",
  description:
    "A deep dive into RaptorQ (RFC 6330), the fountain code that turns any file into an infinite stream of interchangeable packets with under 5% total overhead. Interactive visualizations of peeling decoders, precode repair, and the linear algebra that makes it work.",
  alternates: {
    canonical: "/writing/raptorq",
  },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "RaptorQ: The Black Magic of Liquid Data",
  datePublished: "2025-06-15",
  dateModified: "2025-06-15",
  description:
    "A deep dive into RaptorQ (RFC 6330), the fountain code that achieves near-optimal erasure coding with under 5% total overhead and linear-time decoding.",
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
    "@id": "https://jeffreyemanuel.com/writing/raptorq",
  },
  about: [
    { "@type": "Thing", name: "RaptorQ" },
    { "@type": "Thing", name: "Fountain Codes" },
    { "@type": "Thing", name: "Erasure Coding" },
    { "@type": "Thing", name: "RFC 6330" },
  ],
};

export default function RaptorQPage() {
  return (
    <>
      <JsonLd data={articleSchema} />
      <RaptorQArticle />
    </>
  );
}
