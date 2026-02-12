import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { BarraArticle } from "@/components/barra-article";

export const metadata: Metadata = {
  title: "Factor Risk Models and the Hedge Fund Business | Jeffrey Emanuel",
  description:
    "An insider's look at how factor risk models like Barra define the multi-manager hedge fund industry. Interactive visualizations of return decomposition, style factor exposures, and the mechanics of pod-shop risk management.",
  alternates: {
    canonical: "/writing/barra-factor-model",
  },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Factor Risk Models and the Hedge Fund Business",
  datePublished: "2025-09-23",
  dateModified: "2025-09-23",
  description:
    "An insider's look at how 'smart' risk models like Barra often unknowingly distort incentives, encourage crowding, and create hidden systemic risks within multi-manager platforms.",
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
    "@id": "https://jeffreyemanuel.com/writing/barra-factor-model",
  },
  about: [
    { "@type": "Thing", name: "Barra Factor Model" },
    { "@type": "Thing", name: "Hedge Funds" },
    { "@type": "Thing", name: "Risk Management" },
    { "@type": "Thing", name: "Portfolio Construction" },
  ],
};

export default function BarraFactorModelPage() {
  return (
    <>
      <JsonLd data={articleSchema} />
      <BarraArticle />
    </>
  );
}
