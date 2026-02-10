import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { RaptorQArticle } from "@/components/raptorq-article";

export const metadata: Metadata = {
  title: "RaptorQ: The Black Magic of Liquid Data | Jeffrey Emanuel",
  description:
    "A deep dive into RaptorQ (RFC 6330), the fountain code that turns any file into an infinite stream of interchangeable packets with 0.02% overhead. Interactive visualizations of peeling decoders, precode repair, and the linear algebra that makes it work.",
  alternates: {
    canonical: "/writing/raptorq",
  },
  openGraph: {
    title: "RaptorQ: The Black Magic of Liquid Data",
    description:
      "How RaptorQ turns files into mathematical liquid — collect any K packets in any order and recover the original. The overhead: 0.02%.",
    url: "https://jeffreyemanuel.com/writing/raptorq",
    type: "article",
    publishedTime: "2025-06-15",
    authors: ["Jeffrey Emanuel"],
    images: [
      {
        url: "/writing/raptorq/opengraph-image",
        width: 1200,
        height: 630,
        alt: "RaptorQ: The Black Magic of Liquid Data",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RaptorQ: The Black Magic of Liquid Data",
    description:
      "How RaptorQ turns files into mathematical liquid — collect any K packets in any order and recover the original.",
    images: ["/writing/raptorq/opengraph-image"],
  },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "RaptorQ: The Black Magic of Liquid Data",
  datePublished: "2025-06-15",
  dateModified: "2025-06-15",
  description:
    "A deep dive into RaptorQ (RFC 6330), the fountain code that achieves near-optimal erasure coding with 0.02% overhead and linear-time decoding.",
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
