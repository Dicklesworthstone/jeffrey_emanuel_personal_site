import { Metadata } from "next";
import { CMAESArticle } from "@/components/cmaes-article";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

export const metadata: Metadata = {
  title: "The Incredible Magic of CMA-ES | Jeffrey Emanuel",
  description: "A visual, interactive explanation of CMA-ES, the gold standard for black-box optimization.",
  openGraph: {
    title: "The Incredible Magic of CMA-ES",
    description: "A visual, interactive explanation of CMA-ES for black-box optimization.",
    type: "article",
    url: "https://www.jeffreyemanuel.com/writing/cmaes_explainer",
    images: [
      {
        url: "/api/og?title=CMA-ES%20Explainer&category=Algorithms",
        width: 1200,
        height: 630,
        alt: "The Incredible Magic of CMA-ES",
      },
    ],
  },
};

export default function CMAESPage() {
  return (
    <main className="min-h-screen bg-[#020204]">
      <SiteHeader />
      <CMAESArticle />
      <SiteFooter />
    </main>
  );
}
