import { Metadata } from "next";
import { CMAESArticle } from "@/components/cmaes-article";

export const metadata: Metadata = {
  title: "The Incredible Magic of CMA-ES | Jeffrey Emanuel",
  description: "A visual, interactive explanation of CMA-ES, the gold standard for black-box optimization.",
  alternates: {
    canonical: "/writing/cmaes_explainer",
  },
};

export default function CMAESPage() {
  return (
    <>
      <CMAESArticle />
    </>
  );
}
