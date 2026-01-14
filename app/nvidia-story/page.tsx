import { NvidiaStory } from "@/components/nvidia-story";
import { JsonLd } from "@/components/json-ld";
import { siteConfig, nvidiaStoryData } from "@/lib/content";

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "The $600B Drop: How a Blog Post Moved Markets",
  datePublished: nvidiaStoryData.stats.publishDate,
  dateModified: "2025-01-27",
  description: nvidiaStoryData.hero.subheadline,
  author: {
    "@type": "Person",
    name: siteConfig.name,
    url: "https://jeffreyemanuel.com",
  },
  publisher: {
    "@type": "Organization",
    name: siteConfig.name,
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
