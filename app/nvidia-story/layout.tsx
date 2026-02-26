import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The $600B Drop | Jeffrey Emanuel",
  description:
    "How a 12,000-word blog post from a Brooklyn apartment contributed to the largest single-day market cap drop in stock market history. The story of 'The Short Case for Nvidia Stock.'",
  alternates: {
    canonical: "/nvidia-story",
  },
};

export default function NvidiaStoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
