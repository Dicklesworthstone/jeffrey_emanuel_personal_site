import { NvidiaStory } from "@/components/nvidia-story";
import { JsonLd } from "@/components/json-ld";

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "The $600B Drop: How a Blog Post Moved Markets",
  datePublished: "2025-01-27",
  dateModified: "2025-01-27",
  description:
    "How a 12,000-word blog post from a Brooklyn apartment contributed to the largest single-day market cap drop in stock market history.",
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
    "@id": "https://jeffreyemanuel.com/nvidia-story",
  },
  about: {
    "@type": "Corporation",
    name: "NVIDIA Corporation",
    tickerSymbol: "NVDA",
  },
};

export default function NvidiaStoryPage() {
  return (
    <>
      <JsonLd data={articleSchema} />
      <NvidiaStory />
    </>
  );
}
