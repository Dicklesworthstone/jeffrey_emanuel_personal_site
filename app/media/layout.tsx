import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Media | Jeffrey Emanuel",
  description: "Press coverage, podcast appearances, and interviews discussing AI, markets, and the Nvidia short thesis.",
  openGraph: {
    title: "Media | Jeffrey Emanuel",
    description: "Press coverage, podcast appearances, and interviews discussing AI, markets, and the Nvidia short thesis.",
    url: "https://jeffreyemanuel.com/media",
  },
};

export default function MediaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
