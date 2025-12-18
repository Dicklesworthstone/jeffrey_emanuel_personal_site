import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The $600B Drop | Jeffrey Emanuel",
  description:
    "How a 12,000-word blog post from a Brooklyn apartment contributed to the largest single-day market cap drop in stock market history. The story of 'The Short Case for Nvidia Stock.'",
  alternates: {
    canonical: "/nvidia-story",
  },
  openGraph: {
    title: "The $600B Drop | Jeffrey Emanuel",
    description:
      "How a 12,000-word blog post contributed to the largest single-day market cap drop in stock market history.",
    url: "https://jeffreyemanuel.com/nvidia-story",
    type: "article",
    publishedTime: "2025-01-27",
    authors: ["Jeffrey Emanuel"],
  },
  twitter: {
    card: "summary_large_image",
    title: "The $600B Drop",
    description:
      "How a 12,000-word blog post contributed to the largest single-day market cap drop in stock market history.",
  },
};

export default function NvidiaStoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
