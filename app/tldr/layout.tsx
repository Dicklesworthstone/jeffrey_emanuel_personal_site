import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Agentic Coding Flywheel - TL;DR | Jeffrey Emanuel",
  description:
    "A comprehensive overview of 14 open-source tools that work together to supercharge multi-agent AI coding workflows. NTM, SLB, Agent Mail, Beads Viewer, UBS, CASS Memory, CASS Search, and more.",
  alternates: {
    canonical: "/tldr",
  },
  openGraph: {
    title: "The Agentic Coding Flywheel - TL;DR | Jeffrey Emanuel",
    description:
      "14 open-source tools that work together to supercharge multi-agent AI coding workflows.",
    url: "https://jeffreyemanuel.com/tldr",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Agentic Coding Flywheel - TL;DR",
    description:
      "14 open-source tools that work together to supercharge multi-agent AI coding workflows.",
  },
};

export default function TldrLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
